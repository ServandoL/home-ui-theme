import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HOUSEHOLD_CONFIG } from './household.config';
import { HouseholdSummary, Me } from './models';

/**
 * - `loading`: fetching `/me`.
 * - `ready`: a household is chosen; the app can load its data.
 * - `choose`: the person must pick one of several households.
 * - `none`: they have no household yet; Home's welcome page sets one up.
 * - `error`: `/me` failed.
 */
export type HouseholdStatus = 'loading' | 'ready' | 'choose' | 'none' | 'error';

/**
 * Which household this app is working in. Loads `GET /me` from household-api, picks the saved
 * choice for this app (or the only household), and otherwise asks. The choice is saved per app,
 * so switching in Budget doesn't change Recipes.
 */
@Injectable({ providedIn: 'root' })
export class HouseholdContext {
  private readonly http = inject(HttpClient);
  private readonly config = inject(HOUSEHOLD_CONFIG);
  private readonly storageKey = `home.household.${this.config.appId}`;

  private readonly _me = signal<Me | null>(null);
  private readonly _status = signal<HouseholdStatus>('loading');
  private readonly _currentId = signal<string | null>(null);
  private loading: Promise<void> | null = null;
  /** The household the app first rendered with; any other one needs a fresh page. */
  private enteredId: string | null = null;

  readonly me = this._me.asReadonly();
  readonly status = this._status.asReadonly();
  /** The chosen household's id, which the interceptor sends as `X-Household-Id`. */
  readonly currentId = this._currentId.asReadonly();
  readonly households = computed(() => this._me()?.households ?? []);
  readonly invites = computed(() => this._me()?.invites ?? []);
  readonly current = computed<HouseholdSummary | null>(
    () => this.households().find((h) => h.id === this._currentId()) ?? null,
  );

  /** Overridable for tests; switching households reloads so no data from the last one stays on screen. */
  reloadPage: () => void = () => location.reload();

  /** Loads `/me` once; later calls wait for the same request. */
  ensureLoaded(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  /** Loads `/me` again, e.g. after the app's API said the saved household is no longer valid. */
  async reload(): Promise<void> {
    this.loading = this.load();
    return this.loading;
  }

  /**
   * Chooses a household. The first choice just continues; any other household than the one the
   * app already rendered with saves the choice and reloads the page.
   */
  select(id: string): void {
    if (this.households().some((h) => h.id === id)) this.enter(id);
  }

  /** Shows the picker again, from the badge's Switch button. */
  chooseAgain(): void {
    if (this.households().length > 1) this._status.set('choose');
  }

  /** Closes the picker without switching, when a household is already chosen. */
  cancelChoose(): void {
    if (this.current()) this._status.set('ready');
  }

  /**
   * Forgets the saved household and loads `/me` again, for when the app's API answers
   * `403 NOT_A_MEMBER` or `428 HOUSEHOLD_REQUIRED`.
   */
  forget(): Promise<void> {
    this.remove();
    this._currentId.set(null);
    return this.reload();
  }

  /** Home's welcome page, which comes back here once a household is set up. */
  welcomeUrl(): string {
    return `${this.config.homeUrl}household/welcome?returnUrl=${encodeURIComponent(location.href)}`;
  }

  /** Home's household management page. */
  manageUrl(): string {
    return `${this.config.homeUrl}household`;
  }

  private async load(): Promise<void> {
    this._status.set('loading');
    let me: Me;
    try {
      me = await firstValueFrom(this.http.get<Me>(`${this.config.apiUrl}/me`));
    } catch {
      this._status.set('error');
      return;
    }
    this._me.set(me);
    this.resolve(me.households);
  }

  private resolve(households: HouseholdSummary[]): void {
    if (households.length === 0) {
      this.remove();
      this._currentId.set(null);
      this._status.set('none');
      return;
    }
    const saved = this.read();
    const pick = households.find((h) => h.id === saved) ?? (households.length === 1 ? households[0] : null);
    if (!pick) {
      this.remove();
      this._currentId.set(null);
      this._status.set('choose');
      return;
    }
    this.enter(pick.id);
  }

  private enter(id: string): void {
    this.save(id);
    if (this.enteredId !== null && this.enteredId !== id) {
      this.reloadPage();
      return;
    }
    this.enteredId = id;
    this._currentId.set(id);
    this._status.set('ready');
  }

  // Storage can be missing or throw (private windows, blocked site data); the app then asks each visit.
  private read(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  private save(id: string): void {
    try {
      localStorage.setItem(this.storageKey, id);
    } catch {
      // Not remembered; nothing else depends on it.
    }
  }

  private remove(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Nothing saved to remove.
    }
  }
}
