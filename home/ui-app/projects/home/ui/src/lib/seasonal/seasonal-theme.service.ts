import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, effect, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { isSeasonalChoice, lookOn, SEASONAL_LOOKS, SeasonalChoice, SeasonalLook, SeasonalLookInfo } from './seasonal-looks';

/** The clock the seasonal look reads. Tests provide a fixed date. */
export const SEASONAL_CLOCK = new InjectionToken<() => Date>('SEASONAL_CLOCK', {
  providedIn: 'root',
  factory: () => () => new Date(),
});

/** Shared by every home app (they're on one origin), so a choice made in one shows in all. */
const STORAGE_KEY = 'home-ui.seasonal-look';
/** How often to check whether the date has moved on, for a tab left open overnight. */
const CHECK_EVERY_MS = 60_000;

/**
 * The seasonal look: by default it follows the date (a holiday's look around the holiday, the
 * season's otherwise), and anyone can turn it off or keep one look in Settings, on this device.
 * Sets `data-look` on `<html>`, which theme.css styles; nothing is set while it's off.
 */
@Injectable({ providedIn: 'root' })
export class SeasonalThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly clock = inject(SEASONAL_CLOCK);

  private readonly today = signal(dayKey(this.clock()));
  private readonly stored = signal<SeasonalChoice>(readChoice());

  /** What the person picked: `auto` unless they changed it. */
  readonly choice = this.stored.asReadonly();
  /** What `auto` shows today. */
  readonly automatic = computed<SeasonalLook>(() => lookOn(parseDayKey(this.today())));
  /** The look on screen now, or null when it's off. */
  readonly look = computed<SeasonalLook | null>(() => {
    const choice = this.stored();
    if (choice === 'off') return null;
    return choice === 'auto' ? this.automatic() : choice;
  });
  readonly info = computed<SeasonalLookInfo | null>(() => {
    const look = this.look();
    return look ? SEASONAL_LOOKS[look] : null;
  });

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      const look = this.look();
      if (look) root.dataset['look'] = look;
      else delete root.dataset['look'];
    });

    const timer = setInterval(() => this.refresh(), CHECK_EVERY_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  setChoice(choice: SeasonalChoice): void {
    this.stored.set(choice);
    writeChoice(choice);
  }

  /** Re-reads the clock; the look changes once the date has. */
  refresh(): void {
    this.today.set(dayKey(this.clock()));
  }
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function readChoice(): SeasonalChoice {
  try {
    const value = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isSeasonalChoice(value) ? value : 'auto';
  } catch {
    return 'auto';
  }
}

function writeChoice(choice: SeasonalChoice): void {
  try {
    if (choice === 'auto') globalThis.localStorage?.removeItem(STORAGE_KEY);
    else globalThis.localStorage?.setItem(STORAGE_KEY, choice);
  } catch {
    // Best-effort, like the theme mode: the look still applies for this visit.
  }
}
