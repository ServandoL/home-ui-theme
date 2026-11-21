import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'party';

interface PartyPalette {
  accent: string;
  accentHover: string;
  accentPressed: string;
  accentSoft: string;
  accentSoftStrong: string;
  onAccent: string;
  info: string;
  infoSoft: string;
  warning: string;
  warningSoft: string;
  success: string;
  successSoft: string;
  onSuccess: string;
}

const THEME_MODE_STORAGE_KEY = 'ngx-shared-ui.theme-mode';
const PARTY_PALETTE_STORAGE_KEY = 'ngx-shared-ui.party-palette';
/** WCAG AA for body text. */
const MIN_CONTRAST = 4.5;
const DARK_FOREGROUND = '#0f172a';
const LIGHT_FOREGROUND = '#f8fafc';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly partyPalette = signal<PartyPalette | null>(null);

  readonly mode = signal<ThemeMode>('light');
  readonly themeModes: ReadonlyArray<{ value: ThemeMode; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: 'light' },
    { value: 'dark', label: 'Dark', icon: 'dark' },
    { value: 'party', label: 'Party', icon: 'party' },
  ];

  initialize(): void {
    const storedMode = this.readStoredMode();

    if (storedMode === 'party') {
      this.applyMode('party', this.readStoredPalette() ?? this.generatePartyPalette(), false);
      return;
    }

    this.applyMode(storedMode ?? this.getPreferredInitialMode(), null, false);
  }

  setMode(mode: ThemeMode): void {
    if (mode === 'party') {
      const palette =
        this.mode() === 'party' && this.partyPalette()
          ? this.partyPalette()!
          : this.generatePartyPalette();
      this.applyMode('party', palette, true);
      return;
    }

    this.applyMode(mode, null, true);
  }

  isActive(mode: ThemeMode): boolean {
    return this.mode() === mode;
  }

  private applyMode(mode: ThemeMode, palette: PartyPalette | null, persist: boolean): void {
    const root = this.document.documentElement;

    root.dataset['theme'] = mode;

    if (mode === 'party' && palette) {
      this.applyPartyPalette(palette);
      this.partyPalette.set(palette);
    } else {
      this.clearPartyPalette();
      this.partyPalette.set(null);
    }

    this.mode.set(mode);

    if (persist) {
      writeStorage(THEME_MODE_STORAGE_KEY, mode);
      writeStorage(PARTY_PALETTE_STORAGE_KEY, mode === 'party' && palette ? JSON.stringify(palette) : null);
    }
  }

  private getPreferredInitialMode(): ThemeMode {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }

    return 'light';
  }

  private readStoredMode(): ThemeMode | null {
    const value = readStorage(THEME_MODE_STORAGE_KEY);

    return value === 'light' || value === 'dark' || value === 'party' ? value : null;
  }

  private readStoredPalette(): PartyPalette | null {
    const raw = readStorage(PARTY_PALETTE_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    let parsed: Partial<PartyPalette> | null;

    try {
      parsed = JSON.parse(raw) as Partial<PartyPalette> | null;
    } catch {
      return null;
    }

    if (
      parsed &&
      parsed.accent &&
      parsed.accentHover &&
      parsed.accentPressed &&
      parsed.accentSoft &&
      parsed.accentSoftStrong &&
      parsed.onAccent &&
      parsed.info &&
      parsed.infoSoft &&
      parsed.warning &&
      parsed.warningSoft &&
      parsed.success &&
      parsed.successSoft &&
      // Palettes saved before 2.7.1 lack it and may be unreadable; they get a new one.
      parsed.onSuccess
    ) {
      return parsed as PartyPalette;
    }

    return null;
  }

  private applyPartyPalette(palette: PartyPalette): void {
    const rootStyle = this.document.documentElement.style;

    rootStyle.setProperty('--theme-accent', palette.accent);
    rootStyle.setProperty('--theme-accent-hover', palette.accentHover);
    rootStyle.setProperty('--theme-accent-pressed', palette.accentPressed);
    rootStyle.setProperty('--theme-accent-soft', palette.accentSoft);
    rootStyle.setProperty('--theme-accent-soft-strong', palette.accentSoftStrong);
    rootStyle.setProperty('--theme-on-accent', palette.onAccent);
    rootStyle.setProperty('--theme-info', palette.info);
    rootStyle.setProperty('--theme-info-soft', palette.infoSoft);
    rootStyle.setProperty('--theme-warning', palette.warning);
    rootStyle.setProperty('--theme-warning-soft', palette.warningSoft);
    rootStyle.setProperty('--theme-success', palette.success);
    rootStyle.setProperty('--theme-success-soft', palette.successSoft);
    rootStyle.setProperty('--theme-on-success', palette.onSuccess);
  }

  private clearPartyPalette(): void {
    const rootStyle = this.document.documentElement.style;

    rootStyle.removeProperty('--theme-accent');
    rootStyle.removeProperty('--theme-accent-hover');
    rootStyle.removeProperty('--theme-accent-pressed');
    rootStyle.removeProperty('--theme-accent-soft');
    rootStyle.removeProperty('--theme-accent-soft-strong');
    rootStyle.removeProperty('--theme-on-accent');
    rootStyle.removeProperty('--theme-info');
    rootStyle.removeProperty('--theme-info-soft');
    rootStyle.removeProperty('--theme-warning');
    rootStyle.removeProperty('--theme-warning-soft');
    rootStyle.removeProperty('--theme-success');
    rootStyle.removeProperty('--theme-success-soft');
    rootStyle.removeProperty('--theme-on-success');
  }

  private generatePartyPalette(): PartyPalette {
    const accentHue = randomInt(0, 359);
    const infoHue = (accentHue + randomInt(55, 120)) % 360;
    const warningHue = (accentHue + randomInt(145, 210)) % 360;
    const successHue = (accentHue + randomInt(220, 320)) % 360;

    // Blues are far darker than yellows at the same lightness, so each color starts at a base
    // lightness and gets lighter until it reads on the tint it sits on.
    const accentLightness = readableLightness(accentHue, 100, 62, hslToHex(accentHue, 78, 28));
    const accent = hslToHex(accentHue, 100, accentLightness);
    // Yellows are bright even as tints, so the tints darken where a lighter accent can't help.
    const softStrongLightness = readableTintLightness(accentHue, 78, 28, accent);
    const accentSoft = hslToHex(accentHue, 70, Math.min(20, softStrongLightness - 8));
    const accentSoftStrong = hslToHex(accentHue, 78, softStrongLightness);
    const onAccent = pickReadableForeground(accent);
    // Hover and press move away from the text color, so the label stays readable.
    const step = onAccent === DARK_FOREGROUND ? 1 : -1;

    const infoSoft = hslToHex(infoHue, 56, 18);
    const warningSoft = hslToHex(warningHue, 56, 18);
    const successSoft = hslToHex(successHue, 54, 18);
    const success = hslToHex(successHue, 100, readableLightness(successHue, 100, 62, successSoft));

    return {
      accent,
      accentHover: hslToHex(accentHue, 100, clampLightness(accentLightness + 6 * step)),
      accentPressed: hslToHex(accentHue, 96, clampLightness(accentLightness + 12 * step)),
      accentSoft,
      accentSoftStrong,
      onAccent,
      info: hslToHex(infoHue, 100, readableLightness(infoHue, 100, 66, infoSoft)),
      infoSoft,
      warning: hslToHex(warningHue, 100, readableLightness(warningHue, 100, 64, warningSoft)),
      warningSoft,
      success,
      successSoft,
      onSuccess: pickReadableForeground(success),
    };
  }
}

// localStorage can be missing (SSR, Node without --localstorage-file) or throw (blocked storage).
function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function readStorage(key: string): string | null {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    const storage = getStorage();

    if (value === null) {
      storage?.removeItem(key);
    } else {
      storage?.setItem(key, value);
    }
  } catch {
    // Persistence is best-effort; the theme still applies for this session.
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = x;
  } else if (huePrime < 2) {
    red = x;
    green = chroma;
  } else if (huePrime < 3) {
    green = chroma;
    blue = x;
  } else if (huePrime < 4) {
    green = x;
    blue = chroma;
  } else if (huePrime < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const matchLightness = l - chroma / 2;

  return rgbToHex(
    Math.round((red + matchLightness) * 255),
    Math.round((green + matchLightness) * 255),
    Math.round((blue + matchLightness) * 255),
  );
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function pickReadableForeground(hex: string): string {
  const { red, green, blue } = parseHex(hex);
  const luminance = relativeLuminance(red, green, blue);

  const contrastWithDark = contrastRatio(luminance, relativeLuminance(15, 23, 42));
  const contrastWithLight = contrastRatio(luminance, relativeLuminance(248, 250, 252));

  return contrastWithDark >= contrastWithLight ? DARK_FOREGROUND : LIGHT_FOREGROUND;
}

/** The lowest lightness from `start` up whose color has MIN_CONTRAST against `background`. */
function readableLightness(hue: number, saturation: number, start: number, background: string): number {
  const { red, green, blue } = parseHex(background);
  const backgroundLuminance = relativeLuminance(red, green, blue);

  for (let lightness = start; lightness < 95; lightness++) {
    const color = parseHex(hslToHex(hue, saturation, lightness));
    const luminance = relativeLuminance(color.red, color.green, color.blue);
    if (contrastRatio(luminance, backgroundLuminance) >= MIN_CONTRAST) return lightness;
  }

  return 95;
}

/** The highest lightness from `start` down whose tint lets `foreground` keep MIN_CONTRAST. */
function readableTintLightness(hue: number, saturation: number, start: number, foreground: string): number {
  const { red, green, blue } = parseHex(foreground);
  const foregroundLuminance = relativeLuminance(red, green, blue);

  for (let lightness = start; lightness > 10; lightness--) {
    const color = parseHex(hslToHex(hue, saturation, lightness));
    const luminance = relativeLuminance(color.red, color.green, color.blue);
    if (contrastRatio(luminance, foregroundLuminance) >= MIN_CONTRAST) return lightness;
  }

  return 10;
}

function clampLightness(lightness: number): number {
  return Math.min(95, Math.max(5, lightness));
}

function parseHex(hex: string): { red: number; green: number; blue: number } {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function relativeLuminance(red: number, green: number, blue: number): number {
  const [r, g, b] = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(first: number, second: number): number {
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}
