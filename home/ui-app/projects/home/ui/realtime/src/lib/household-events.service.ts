import { DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { ApiErrorBody, HOUSEHOLD_HEADER, HouseholdContext } from '@home/ui/household';
import { filter, Observable, Subject } from 'rxjs';
import { CLIENT_ID } from './client-id';
import { REALTIME_CONFIG } from './realtime.config';
import { SseParser } from './sse-parser';

/** A change another device made, as home-household-spring sends it. Ids only: refetch the data. */
export interface HouseholdChange {
  /** What changed, named like the API path, e.g. `pets` or `diary-entries`. */
  resource: string;
  action: 'created' | 'updated' | 'deleted';
  /** The record; absent for one-per-household documents such as settings. */
  id?: string;
  /** The record it belongs to, e.g. its pet, so only that parent's records need reloading. */
  parentId?: string;
  clientId?: string;
}

/** Reconnect delays: 1 s doubling to 30 s, each with up to half again of random jitter. */
const FIRST_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

/**
 * Keeps this tab subscribed to the current household's changes, from the app API's
 * `GET /api/v1/events`. It connects once a household is chosen, reconnects with backoff, and
 * closes while the tab has been hidden for `hiddenGraceMs`. Changes this tab made itself are
 * skipped.
 *
 * Reload what an event names, and reload everything on `resync`, which fires each time the
 * stream connects: anything that changed while it was down is otherwise missed.
 *
 * ```ts
 * events.on('pets').subscribe(() => store.reloadPets());
 * events.resync.subscribe(() => store.load());
 * ```
 *
 * The stream is read with `fetch`, not `EventSource`, because it has to send `X-Household-Id`.
 */
@Injectable({ providedIn: 'root' })
export class HouseholdEvents {
  private readonly config = inject(REALTIME_CONFIG);
  private readonly context = inject(HouseholdContext);
  private readonly clientId = inject(CLIENT_ID);

  private readonly _changes = new Subject<HouseholdChange>();
  private readonly _resync = new Subject<void>();
  private readonly _connected = signal(false);
  private readonly visible = signal(isVisible());

  /** Changes made by other tabs and devices in this household. */
  readonly changes: Observable<HouseholdChange> = this._changes.asObservable();
  /** Fires each time the stream (re)connects; reload everything the page shows. */
  readonly resync: Observable<void> = this._resync.asObservable();
  /** Whether the stream is open now. */
  readonly connected = this._connected.asReadonly();

  /** Overridable for tests. */
  fetchFn: typeof fetch = (input, init) => fetch(input, init);

  private connection: { householdId: string; abort: AbortController } | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private hiddenTimer: ReturnType<typeof setTimeout> | null = null;
  private failures = 0;

  constructor() {
    effect(() => {
      const id = this.context.status() === 'ready' ? this.context.currentId() : null;
      const wanted = this.visible() ? id : null;
      untracked(() => (wanted ? this.connect(wanted) : this.disconnect()));
    });

    const onVisibility = () => this.visibilityChanged();
    document.addEventListener('visibilitychange', onVisibility);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (this.hiddenTimer) clearTimeout(this.hiddenTimer);
      this.disconnect();
    });
  }

  /** Changes to one resource, e.g. `on('diary-entries')`. */
  on(resource: string): Observable<HouseholdChange> {
    return this.changes.pipe(filter((change) => change.resource === resource));
  }

  private visibilityChanged(): void {
    if (this.hiddenTimer) {
      clearTimeout(this.hiddenTimer);
      this.hiddenTimer = null;
    }
    if (isVisible()) {
      this.visible.set(true);
      return;
    }
    this.hiddenTimer = setTimeout(() => {
      this.hiddenTimer = null;
      this.visible.set(false);
    }, this.config.hiddenGraceMs);
  }

  private connect(householdId: string): void {
    if (this.connection?.householdId === householdId) return;
    this.disconnect();
    this.open(householdId);
  }

  private open(householdId: string): void {
    const abort = new AbortController();
    this.connection = { householdId, abort };
    void this.read(householdId, abort);
  }

  private disconnect(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.connection?.abort.abort();
    this.connection = null;
    this.failures = 0;
    this._connected.set(false);
  }

  private async read(householdId: string, abort: AbortController): Promise<void> {
    let endedCleanly = false;
    try {
      const response = await this.fetchFn(`${this.config.apiUrl}${this.config.eventsPath}`, {
        headers: { Accept: 'text/event-stream', [HOUSEHOLD_HEADER]: householdId },
        credentials: 'same-origin',
        cache: 'no-store',
        signal: abort.signal,
      });
      if (await isHouseholdRejection(response)) {
        // Same as householdInterceptor: the picker comes back, and the effect reconnects once
        // a household is chosen.
        this.connection = null;
        void this.context.forget();
        return;
      }
      if (!response.ok || !response.body) throw new Error(`Event stream answered ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const parser = new SseParser();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const message of parser.push(decoder.decode(value, { stream: true }))) {
          this.handle(message.event, message.data);
        }
      }
      // The server ends every stream after its timeout; that's not a failure.
      endedCleanly = true;
    } catch {
      // A network error, the API down or restarting, or an expired Access session.
    }
    if (abort.signal.aborted || this.connection?.abort !== abort) return;
    this._connected.set(false);
    this.failures = endedCleanly ? 0 : this.failures + 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.connection?.abort === abort) this.open(householdId);
    }, this.retryDelay());
  }

  private handle(event: string, data: string): void {
    if (event === 'ready') {
      this.failures = 0;
      this._connected.set(true);
      this._resync.next();
      return;
    }
    if (event !== 'change') return;
    let change: HouseholdChange;
    try {
      change = JSON.parse(data) as HouseholdChange;
    } catch {
      return;
    }
    if (change.clientId && change.clientId === this.clientId) return;
    this._changes.next(change);
  }

  /** Right away after a clean end (with a little jitter); backing off after failures. */
  private retryDelay(): number {
    if (this.failures === 0) return Math.random() * FIRST_RETRY_MS;
    const base = Math.min(MAX_RETRY_MS, FIRST_RETRY_MS * 2 ** (this.failures - 1));
    return base + Math.random() * base * 0.5;
  }
}

function isVisible(): boolean {
  return typeof document === 'undefined' || document.visibilityState !== 'hidden';
}

/** home-household-spring's `428 HOUSEHOLD_REQUIRED` or `403 NOT_A_MEMBER`. */
async function isHouseholdRejection(response: Response): Promise<boolean> {
  if (response.status !== 428 && response.status !== 403) return false;
  let code: string | undefined;
  try {
    code = ((await response.clone().json()) as ApiErrorBody | null)?.error?.code;
  } catch {
    return false;
  }
  return (
    (response.status === 428 && code === 'HOUSEHOLD_REQUIRED') || (response.status === 403 && code === 'NOT_A_MEMBER')
  );
}
