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
];

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
    globalThis.localStorage.setItem(
      'ngx-shared-ui.party-palette',
      JSON.stringify({
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
      }),
    );
    const service = TestBed.inject(ThemeService);

    service.initialize();

    expect(service.mode()).toBe('party');
    expect(document.documentElement.dataset['theme']).toBe('party');
    expect(document.documentElement.style.getPropertyValue('--theme-accent')).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--theme-on-accent')).toBe('#f8fafc');
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
});

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
