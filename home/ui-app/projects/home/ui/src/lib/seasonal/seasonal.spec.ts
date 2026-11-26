import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { easterSunday, holidayOn, lookOn, seasonOn, thanksgivingDay } from './seasonal-looks';
import { SEASONAL_CLOCK, SeasonalThemeService } from './seasonal-theme.service';
import { SeasonalSettingsComponent } from './seasonal-settings.component';
import { SeasonalBackgroundComponent } from './seasonal-background.component';

const on = (y: number, m: number, d: number) => new Date(y, m - 1, d, 15, 30);

describe('seasonal looks by date', () => {
  it('finds the season, starting on the equinoxes and solstices', () => {
    expect(seasonOn(on(2026, 3, 19))).toBe('winter');
    expect(seasonOn(on(2026, 3, 20))).toBe('spring');
    expect(seasonOn(on(2026, 6, 21))).toBe('summer');
    expect(seasonOn(on(2026, 9, 22))).toBe('fall');
    expect(seasonOn(on(2026, 12, 21))).toBe('winter');
    expect(seasonOn(on(2027, 1, 15))).toBe('winter');
  });

  it('works out Easter and Thanksgiving for the year', () => {
    expect(easterSunday(2026)).toEqual(new Date(2026, 3, 5));
    expect(easterSunday(2027)).toEqual(new Date(2027, 2, 28));
    expect(thanksgivingDay(2026)).toEqual(new Date(2026, 10, 26));
    expect(thanksgivingDay(2025)).toEqual(new Date(2025, 10, 27));
  });

  it('shows each holiday for its window and the season otherwise', () => {
    expect(lookOn(on(2026, 11, 21))).toBe('fall');
    expect(lookOn(on(2026, 11, 22))).toBe('thanksgiving');
    expect(lookOn(on(2026, 11, 29))).toBe('thanksgiving');
    expect(lookOn(on(2026, 11, 30))).toBe('fall');
    expect(lookOn(on(2026, 12, 1))).toBe('christmas');
    expect(lookOn(on(2026, 12, 26))).toBe('christmas');
    expect(lookOn(on(2026, 12, 27))).toBe('winter');
    expect(lookOn(on(2026, 12, 31))).toBe('newyear');
    expect(lookOn(on(2027, 1, 1))).toBe('newyear');
    expect(lookOn(on(2027, 1, 2))).toBe('winter');
    expect(lookOn(on(2026, 2, 14))).toBe('valentines');
    expect(lookOn(on(2026, 3, 17))).toBe('stpatricks');
    expect(lookOn(on(2026, 3, 29))).toBe('easter');
    expect(lookOn(on(2026, 7, 4))).toBe('july4');
    expect(lookOn(on(2026, 10, 31))).toBe('halloween');
  });

  it('keeps Thanksgiving weekend when it runs into December', () => {
    // Thanksgiving 2024 was Nov 28, so its Sunday after is Dec 1.
    expect(holidayOn(on(2024, 12, 1))).toBe('thanksgiving');
    expect(holidayOn(on(2024, 12, 2))).toBe('christmas');
  });
});

describe('SeasonalThemeService', () => {
  const store = new Map<string, string>();
  let now = on(2026, 11, 25);

  beforeEach(() => {
    store.clear();
    now = on(2026, 11, 25);
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, String(v)),
      removeItem: (k: string) => store.delete(k),
    });
    TestBed.configureTestingModule({ providers: [{ provide: SEASONAL_CLOCK, useValue: () => now }] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete document.documentElement.dataset['look'];
  });

  it('follows the date by default and marks <html>', () => {
    const service = TestBed.inject(SeasonalThemeService);
    TestBed.tick();
    expect(service.choice()).toBe('auto');
    expect(service.look()).toBe('thanksgiving');
    expect(document.documentElement.dataset['look']).toBe('thanksgiving');
  });

  it('moves on when the date does', () => {
    const service = TestBed.inject(SeasonalThemeService);
    now = on(2026, 12, 1);
    service.refresh();
    TestBed.tick();
    expect(service.look()).toBe('christmas');
    expect(document.documentElement.dataset['look']).toBe('christmas');
  });

  it('keeps a picked look, or none, and remembers it', () => {
    const service = TestBed.inject(SeasonalThemeService);
    service.setChoice('halloween');
    TestBed.tick();
    expect(service.look()).toBe('halloween');
    expect(store.get('home-ui.seasonal-look')).toBe('halloween');

    service.setChoice('off');
    TestBed.tick();
    expect(service.look()).toBeNull();
    expect(document.documentElement.dataset['look']).toBeUndefined();

    service.setChoice('auto');
    expect(store.has('home-ui.seasonal-look')).toBe(false);
  });

  it('starts from the saved choice, and ignores one it doesn’t know', () => {
    store.set('home-ui.seasonal-look', 'spring');
    expect(TestBed.inject(SeasonalThemeService).look()).toBe('spring');

    TestBed.resetTestingModule();
    store.set('home-ui.seasonal-look', 'mardi-gras');
    TestBed.configureTestingModule({ providers: [{ provide: SEASONAL_CLOCK, useValue: () => now }] });
    expect(TestBed.inject(SeasonalThemeService).choice()).toBe('auto');
  });

  it('lets people choose in Settings', () => {
    const fixture = TestBed.createComponent(SeasonalSettingsComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Now: Thanksgiving');

    const off = [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('Off'))!;
    off.click();
    fixture.detectChanges();
    expect(off.getAttribute('aria-pressed')).toBe('true');
    expect(TestBed.inject(SeasonalThemeService).look()).toBeNull();

    const winter = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Winter')!;
    winter.click();
    fixture.detectChanges();
    expect(TestBed.inject(SeasonalThemeService).look()).toBe('winter');
    expect(el.textContent).toContain('Showing Winter every day');
  });

  it('draws the decorations for the look, and nothing while it’s off', () => {
    const fixture = TestBed.createComponent(SeasonalBackgroundComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('use[href="#hs-wheat"], use[href="#hs-maple"]').length).toBeGreaterThan(0);

    TestBed.inject(SeasonalThemeService).setChoice('christmas');
    fixture.detectChanges();
    expect(el.querySelectorAll('.bulb').length).toBe(16);

    TestBed.inject(SeasonalThemeService).setChoice('off');
    fixture.detectChanges();
    expect(el.querySelectorAll('.p').length).toBe(0);
  });
});
