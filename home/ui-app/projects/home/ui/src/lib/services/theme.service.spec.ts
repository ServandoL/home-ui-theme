import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from './theme.service';

const PARTY_CSS_VARIABLES = [
  '--theme-accent',
  '--theme-accent-hover',
  '--theme-accent-pressed',
  '--theme-accent-soft',
  '--theme-accent-soft-strong',
  '--theme-on-accent',
  '--theme-info',
  '--theme-info-soft',
  '--theme-warning',
  '--theme-warning-soft',
  '--theme-success',
  '--theme-success-soft',
  '--theme-on-success',
];

const STORED_PALETTE = {
  accent: '#123456',
  accentHover: '#234567',
  accentPressed: '#345678',
  accentSoft: '#111122',
  accentSoftStrong: '#222233',
  onAccent: '#f8fafc',
  info: '#556677',
  infoSoft: '#101820',
  warning: '#778899',
  warningSoft: '#261806',
  success: '#22aa88',
  successSoft: '#052816',
  onSuccess: '#0f172a',
};

describe('ThemeService', () => {
  beforeEach(() => {
    const storage = createStorageMock();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal('localStorage', storage);
    storage.clear();
    cleanupThemeDom();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    cleanupThemeDom();
    globalThis.localStorage.clear();
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  it('restores the stored dark mode on initialize', () => {
    globalThis.localStorage.setItem('ngx-shared-ui.theme-mode', 'dark');
    const service = TestBed.inject(ThemeService);

    service.initialize();

    expect(service.mode()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('restores a stored party palette on initialize', () => {
    globalThis.localStorage.setItem('ngx-shared-ui.theme-mode', 'party');
    globalThis.localStorage.setItem('ngx-shared-ui.party-palette', JSON.stringify(STORED_PALETTE));
    const service = TestBed.inject(ThemeService);

    service.initialize();

    expect(service.mode()).toBe('party');
    expect(document.documentElement.dataset['theme']).toBe('party');
    expect(document.documentElement.style.getPropertyValue('--theme-accent')).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--theme-on-accent')).toBe('#f8fafc');
    expect(document.documentElement.style.getPropertyValue('--theme-on-success')).toBe('#0f172a');
  });

  it('replaces a palette saved before onSuccess existed', () => {
    const { onSuccess: _, ...old } = STORED_PALETTE;
    globalThis.localStorage.setItem('ngx-shared-ui.theme-mode', 'party');
    globalThis.localStorage.setItem('ngx-shared-ui.party-palette', JSON.stringify(old));
    const service = TestBed.inject(ThemeService);

    service.initialize();

    expect(service.mode()).toBe('party');
    expect(document.documentElement.style.getPropertyValue('--theme-accent')).not.toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--theme-on-success')).toMatch(/^#/);
  });

  it('generates readable party colors for every hue', () => {
    const service = TestBed.inject(ThemeService);
    const style = document.documentElement.style;
    const value = (name: string) => style.getPropertyValue(`--theme-${name}`);
    const failures: string[] = [];

    for (let hue = 0; hue < 360; hue++) {
      // randomInt(0, 359) picks this hue; the offsets for info, warning and success follow.
      vi.spyOn(Math, 'random').mockReturnValue((hue + 0.5) / 360);
      service.setMode('light');
      service.setMode('party');

      const pairs: [string, string][] = [
        ['on-accent', 'accent'],
        ['on-accent', 'accent-hover'],
        ['on-accent', 'accent-pressed'],
        ['accent', 'accent-soft'],
        ['accent', 'accent-soft-strong'],
        ['info', 'info-soft'],
        ['warning', 'warning-soft'],
        ['success', 'success-soft'],
        ['on-success', 'success'],
      ];
      for (const [fg, bg] of pairs) {
        const ratio = contrast(value(fg), value(bg));
        if (ratio < 4.5) failures.push(`hue ${hue}: ${fg} on ${bg} is ${ratio.toFixed(2)}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it('persists manual mode switching', () => {
    const service = TestBed.inject(ThemeService);

    service.initialize();
    service.setMode('dark');

    expect(globalThis.localStorage.getItem('ngx-shared-ui.theme-mode')).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');

    service.setMode('light');

    expect(globalThis.localStorage.getItem('ngx-shared-ui.theme-mode')).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('regenerates the party palette when reactivated', () => {
    const randomValues = [0.1, 0.2, 0.3, 0.75, 0.4, 0.5];
    const mathRandom = vi.spyOn(Math, 'random');
    randomValues.forEach((value) => mathRandom.mockReturnValueOnce(value));

    const service = TestBed.inject(ThemeService);

    service.initialize();
    service.setMode('party');
    const firstAccent = document.documentElement.style.getPropertyValue('--theme-accent');

    service.setMode('light');
    expect(document.documentElement.style.getPropertyValue('--theme-accent')).toBe('');

    service.setMode('party');
    const secondAccent = document.documentElement.style.getPropertyValue('--theme-accent');

    expect(firstAccent).not.toBe(secondAccent);
    expect(globalThis.localStorage.getItem('ngx-shared-ui.theme-mode')).toBe('party');
    expect(document.documentElement.style.getPropertyValue('--theme-on-accent')).toMatch(/^#/);

    mathRandom.mockRestore();
  });

  it('works when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    const service = TestBed.inject(ThemeService);

    expect(() => service.initialize()).not.toThrow();
    expect(() => service.setMode('dark')).not.toThrow();
    expect(document.documentElement.dataset['theme']).toBe('dark');

    vi.stubGlobal('localStorage', createStorageMock());
  });

  it('works when localStorage throws', () => {
    const throwing = createStorageMock();
    throwing.getItem = () => {
      throw new Error('blocked');
    };
    throwing.setItem = () => {
      throw new Error('blocked');
    };
    vi.stubGlobal('localStorage', throwing);
    const service = TestBed.inject(ThemeService);

    expect(() => service.initialize()).not.toThrow();
    expect(() => service.setMode('party')).not.toThrow();
    expect(service.mode()).toBe('party');
  });

  it('falls back to a fresh palette when the stored one is corrupted', () => {
    globalThis.localStorage.setItem('ngx-shared-ui.theme-mode', 'party');
    globalThis.localStorage.setItem('ngx-shared-ui.party-palette', '{not json');
    const service = TestBed.inject(ThemeService);

    service.initialize();

    expect(service.mode()).toBe('party');
    expect(document.documentElement.style.getPropertyValue('--theme-accent')).toMatch(/^#/);
  });
});

function contrast(first: string, second: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const channel = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function cleanupThemeDom(): void {
  delete document.documentElement.dataset['theme'];

  for (const variable of PARTY_CSS_VARIABLES) {
    document.documentElement.style.removeProperty(variable);
  }
}

function createStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}
