import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HouseholdContext } from './household-context.service';
import { HOUSEHOLD_CONFIG } from './household.config';
import { API, createStorageMock, household, me } from './testing.spec-helpers';

describe('HouseholdContext', () => {
  let context: HouseholdContext;
  let http: HttpTestingController;
  let reloadPage: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HOUSEHOLD_CONFIG, useValue: { appId: 'budget', apiUrl: API, homeUrl: '/' } },
      ],
    });
    context = TestBed.inject(HouseholdContext);
    http = TestBed.inject(HttpTestingController);
    reloadPage = vi.fn<() => void>();
    context.reloadPage = reloadPage;
  });

  afterEach(() => {
    http.verify();
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  async function load(body: ReturnType<typeof me>): Promise<void> {
    const loading = context.ensureLoaded();
    http.expectOne(`${API}/me`).flush(body);
    await loading;
  }

  it('starts loading', () => {
    expect(context.status()).toBe('loading');
  });

  it('is none without households', async () => {
    localStorage.setItem('home.household.budget', 'gone');
    await load(me([]));
    expect(context.status()).toBe('none');
    expect(context.currentId()).toBeNull();
    expect(localStorage.getItem('home.household.budget')).toBeNull();
  });

  it('picks the only household and remembers it', async () => {
    await load(me([household('a')]));
    expect(context.status()).toBe('ready');
    expect(context.current()?.id).toBe('a');
    expect(localStorage.getItem('home.household.budget')).toBe('a');
  });

  it('asks when there are several and nothing is saved', async () => {
    await load(me([household('a'), household('b')]));
    expect(context.status()).toBe('choose');
    expect(context.currentId()).toBeNull();
  });

  it('uses the saved choice for this app only', async () => {
    localStorage.setItem('home.household.budget', 'b');
    localStorage.setItem('home.household.recipes', 'a');
    await load(me([household('a'), household('b')]));
    expect(context.status()).toBe('ready');
    expect(context.currentId()).toBe('b');
  });

  it('forgets a saved household the person is no longer in', async () => {
    localStorage.setItem('home.household.budget', 'gone');
    await load(me([household('a'), household('b')]));
    expect(context.status()).toBe('choose');
    expect(localStorage.getItem('home.household.budget')).toBeNull();
  });

  it('enters the first choice without reloading', async () => {
    await load(me([household('a'), household('b')]));
    context.select('b');
    expect(context.status()).toBe('ready');
    expect(context.currentId()).toBe('b');
    expect(localStorage.getItem('home.household.budget')).toBe('b');
    expect(reloadPage).not.toHaveBeenCalled();
  });

  it('ignores a household the person is not in', async () => {
    await load(me([household('a'), household('b')]));
    context.select('elsewhere');
    expect(context.status()).toBe('choose');
  });

  it('reloads when switching to another household', async () => {
    localStorage.setItem('home.household.budget', 'a');
    await load(me([household('a'), household('b')]));

    context.chooseAgain();
    expect(context.status()).toBe('choose');
    context.select('b');

    expect(reloadPage).toHaveBeenCalledOnce();
    expect(localStorage.getItem('home.household.budget')).toBe('b');
  });

  it('closes the picker without reloading when choosing the same household or cancelling', async () => {
    localStorage.setItem('home.household.budget', 'a');
    await load(me([household('a'), household('b')]));

    context.chooseAgain();
    context.cancelChoose();
    expect(context.status()).toBe('ready');
    context.chooseAgain();
    context.select('a');
    expect(context.status()).toBe('ready');
    expect(reloadPage).not.toHaveBeenCalled();
  });

  it('only offers Switch with more than one household', async () => {
    await load(me([household('a')]));
    context.chooseAgain();
    expect(context.status()).toBe('ready');
  });

  it('reloads when the app was removed from its household and another is picked', async () => {
    await load(me([household('a'), household('b')]));
    context.select('a');

    const forgetting = context.forget();
    http.expectOne(`${API}/me`).flush(me([household('b')]));
    await forgetting;

    // Only b is left, so it's picked, but the page still shows a's data.
    expect(reloadPage).toHaveBeenCalledOnce();
    expect(localStorage.getItem('home.household.budget')).toBe('b');
  });

  it('is error when /me fails', async () => {
    const loading = context.ensureLoaded();
    http.expectOne(`${API}/me`).flush({}, { status: 500, statusText: 'Server Error' });
    await loading;
    expect(context.status()).toBe('error');
  });

  it('loads /me once for every caller', async () => {
    const first = context.ensureLoaded();
    const second = context.ensureLoaded();
    http.expectOne(`${API}/me`).flush(me([household('a')]));
    await Promise.all([first, second]);
    expect(context.status()).toBe('ready');
  });

  it('survives storage that throws', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    });
    await load(me([household('a'), household('b')]));
    expect(context.status()).toBe('choose');
    context.select('a');
    expect(context.status()).toBe('ready');
  });

  it('points at Home for setup and management', () => {
    expect(context.manageUrl()).toBe('/household');
    expect(context.welcomeUrl()).toBe(`/household/welcome?returnUrl=${encodeURIComponent(location.href)}`);
  });
});
