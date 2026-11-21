import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HOUSEHOLD_CONFIG, HouseholdContext } from '@home/ui/household';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CLIENT_ID } from './client-id';
import { HouseholdChange, HouseholdEvents } from './household-events.service';
import { provideRealtime } from './realtime.config';

const HOUSEHOLD_API = '/household-api/api/v1';

/** A response whose event-stream body the test writes to. */
function stream() {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({ start: (c) => (controller = c) });
  const encoder = new TextEncoder();
  return {
    response: new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
    send: (text: string) => controller.enqueue(encoder.encode(text)),
    end: () => controller.close(),
  };
}

function rejection(status: number, code: string): Response {
  return new Response(JSON.stringify({ error: { code, message: '' } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function setVisibility(state: 'visible' | 'hidden'): void {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('HouseholdEvents', () => {
  let context: HouseholdContext;
  let events: HouseholdEvents;
  let fetchFn: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
    });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HOUSEHOLD_CONFIG, useValue: { appId: 'pet-qol', apiUrl: HOUSEHOLD_API, homeUrl: '/' } },
        provideRealtime({ apiUrl: '/pet-qol-api', hiddenGraceMs: 1_000 }),
        { provide: CLIENT_ID, useValue: 'tab-1' },
      ],
    });
    context = TestBed.inject(HouseholdContext);
    context.reloadPage = vi.fn();
    const http = TestBed.inject(HttpTestingController);
    const loading = context.ensureLoaded();
    http.expectOne(`${HOUSEHOLD_API}/me`).flush({
      email: 'sam@example.com',
      households: [{ id: 'a', name: 'Home', address: null, role: 'ADMIN', memberCount: 2 }],
      deletedHouseholds: [],
      invites: [],
    });
    await loading;

    events = TestBed.inject(HouseholdEvents);
    fetchFn = vi.fn();
    events.fetchFn = fetchFn as unknown as typeof fetch;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    setVisibility('visible');
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  /** Lets the effect run and the fetch and stream reads settle. */
  async function settle(): Promise<void> {
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(0);
  }

  it('opens the household’s stream and passes on other devices’ changes', async () => {
    const s = stream();
    fetchFn.mockResolvedValue(s.response);
    const changes: HouseholdChange[] = [];
    const pets: HouseholdChange[] = [];
    let resyncs = 0;
    events.changes.subscribe((c) => changes.push(c));
    events.on('pets').subscribe((c) => pets.push(c));
    events.resync.subscribe(() => resyncs++);

    await settle();

    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/pet-qol-api/api/v1/events');
    expect(init.headers).toEqual({ Accept: 'text/event-stream', 'X-Household-Id': 'a' });
    expect(init.credentials).toBe('same-origin');

    s.send('event:ready\ndata:{}\n\n');
    await settle();
    expect(resyncs).toBe(1);
    expect(events.connected()).toBe(true);

    s.send(':ping\n\nevent:change\ndata:{"resource":"pets","action":"created","id":"p1"}\n\n');
    s.send('event:change\ndata:{"resource":"diary-entries","action":"updated","id":"d1","parentId":"p1"}\n\n');
    s.send('event:change\ndata:{"resource":"pets","action":"deleted","id":"p2","clientId":"tab-1"}\n\n');
    await settle();

    expect(changes).toEqual([
      { resource: 'pets', action: 'created', id: 'p1' },
      { resource: 'diary-entries', action: 'updated', id: 'd1', parentId: 'p1' },
    ]);
    expect(pets).toEqual([{ resource: 'pets', action: 'created', id: 'p1' }]);
  });

  it('reconnects right away when the server ends the stream, and resyncs', async () => {
    const first = stream();
    const second = stream();
    fetchFn.mockResolvedValueOnce(first.response).mockResolvedValueOnce(second.response);
    let resyncs = 0;
    events.resync.subscribe(() => resyncs++);

    await settle();
    first.send('event:ready\ndata:{}\n\n');
    first.end();
    await settle();
    expect(events.connected()).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    second.send('event:ready\ndata:{}\n\n');
    await settle();
    expect(resyncs).toBe(2);
  });

  it('backs off after failures, up to 30 seconds', async () => {
    fetchFn.mockRejectedValue(new TypeError('Failed to fetch'));

    await settle();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    for (const [delay, calls] of [
      [1_000, 2],
      [2_000, 3],
      [4_000, 4],
      [8_000, 5],
      [16_000, 6],
      [30_000, 7],
      [30_000, 8],
    ]) {
      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(fetchFn).toHaveBeenCalledTimes(calls - 1);
      await vi.advanceTimersByTimeAsync(1);
      expect(fetchFn).toHaveBeenCalledTimes(calls);
    }
  });

  it('retries a 429 like any other failure', async () => {
    const s = stream();
    fetchFn.mockResolvedValueOnce(rejection(429, 'TOO_MANY_STREAMS')).mockResolvedValueOnce(s.response);

    await settle();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('forgets the household when the API says it isn’t the person’s, like the interceptor', async () => {
    const forget = vi.spyOn(context, 'forget').mockResolvedValue();
    fetchFn.mockResolvedValue(rejection(403, 'NOT_A_MEMBER'));

    await settle();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(forget).toHaveBeenCalledOnce();
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('closes while the tab is hidden, after the grace period', async () => {
    const first = stream();
    const second = stream();
    fetchFn.mockResolvedValueOnce(first.response).mockResolvedValueOnce(second.response);
    await settle();
    const init = fetchFn.mock.calls[0][1] as RequestInit;

    setVisibility('hidden');
    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(2_000);
    await settle();
    expect(init.signal?.aborted).toBe(false);

    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(1_000);
    await settle();
    expect(init.signal?.aborted).toBe(true);
    expect(fetchFn).toHaveBeenCalledOnce();

    setVisibility('visible');
    await settle();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('waits for a household before connecting', async () => {
    vi.spyOn(context, 'status').mockReturnValue('choose');
    await settle();
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
