/**
 * The seasonal looks: one per season, and one per popular US holiday. A holiday's look replaces
 * the season's for a few days around it. Colors live in theme.css (`html[data-look='…']`); this
 * file holds the dates, the words and the decorations.
 */

import { Season } from '../services/season-icon.service';


export type Holiday =
  | 'newyear'
  | 'valentines'
  | 'stpatricks'
  | 'easter'
  | 'july4'
  | 'halloween'
  | 'thanksgiving'
  | 'christmas';
export type SeasonalLook = Season | Holiday;

/** What a person picks in Settings: follow the date, turn it off, or keep one look. */
export type SeasonalChoice = 'auto' | 'off' | SeasonalLook;

/** A decoration shape, drawn by `<app-seasonal-background>`. */
export type DecorShape =
  | 'leaf'
  | 'maple'
  | 'acorn'
  | 'snow'
  | 'dot'
  | 'blossom'
  | 'petal'
  | 'tulip'
  | 'sun'
  | 'wave'
  | 'ball'
  | 'star'
  | 'sparkle'
  | 'confetti'
  | 'heart'
  | 'shamrock'
  | 'coin'
  | 'egg'
  | 'bat'
  | 'pumpkin'
  | 'wheat'
  | 'ornament'
  | 'tree';

export type DecorMotion = 'fall' | 'rise' | 'drift' | 'twinkle';

export interface SeasonalLookInfo {
  name: string;
  kind: 'season' | 'holiday';
  /** Shown under the date on Home during a holiday. */
  greeting?: string;
  /** Replaces "home server · tended with care" on Home. */
  tagline: string;
  /** A color for the look's swatch in Settings. */
  swatch: string;
  decor: {
    shapes: DecorShape[];
    colors: string[];
    /** Used instead of `colors` in dark mode, when the light ones vanish on a dark page. */
    darkColors?: string[];
    count: number;
    /** Smallest and largest shape, in px. */
    size: [number, number];
    motion: DecorMotion;
    /** Seconds for one pass, shortest and longest. */
    speed: [number, number];
    opacity: number;
  };
  /** Extras some holidays draw on top of the shapes. */
  lights?: boolean;
  fireworks?: string[];
  moon?: boolean;
}

export const SEASONS: readonly Season[] = ['spring', 'summer', 'fall', 'winter'];
export const HOLIDAYS: readonly Holiday[] = [
  'newyear',
  'valentines',
  'stpatricks',
  'easter',
  'july4',
  'halloween',
  'thanksgiving',
  'christmas',
];

export const SEASONAL_LOOKS: Record<SeasonalLook, SeasonalLookInfo> = {
  spring: {
    name: 'Spring',
    kind: 'season',
    tagline: 'in bloom',
    swatch: '#e879a6',
    decor: {
      shapes: ['blossom', 'petal', 'petal', 'tulip'],
      colors: ['#f4a6c0', '#f9c9d8', '#e879a6', '#fbd5e2'],
      count: 30,
      size: [12, 26],
      motion: 'fall',
      speed: [14, 24],
      opacity: 0.8,
    },
  },
  summer: {
    name: 'Summer',
    kind: 'season',
    tagline: 'sun’s out',
    swatch: '#f6c445',
    decor: {
      shapes: ['sun', 'wave', 'wave', 'ball'],
      colors: ['#f6c445', '#38bdf8', '#7dd3fc', '#fb7185'],
      count: 18,
      size: [18, 34],
      motion: 'drift',
      speed: [6, 10],
      opacity: 0.7,
    },
  },
  fall: {
    name: 'Fall',
    kind: 'season',
    tagline: 'cozy season',
    swatch: '#d9622b',
    decor: {
      shapes: ['leaf', 'maple', 'maple', 'acorn'],
      colors: ['#d9622b', '#e0a030', '#a3471f', '#c97a2a', '#8a5a2b'],
      count: 28,
      size: [16, 30],
      motion: 'fall',
      speed: [12, 22],
      opacity: 0.85,
    },
  },
  winter: {
    name: 'Winter',
    kind: 'season',
    tagline: 'warm inside',
    swatch: '#93c5fd',
    decor: {
      shapes: ['snow', 'snow', 'dot', 'dot'],
      colors: ['#93c5fd', '#bfdbfe', '#c7d2fe', '#e0ecff'],
      count: 46,
      size: [6, 22],
      motion: 'fall',
      speed: [10, 20],
      opacity: 0.9,
    },
  },
  newyear: {
    name: 'New Year’s',
    kind: 'holiday',
    greeting: 'Happy New Year',
    tagline: 'here’s to a new year',
    swatch: '#eab308',
    fireworks: ['#facc15', '#e5e7eb', '#a78bfa'],
    decor: {
      shapes: ['confetti', 'confetti', 'sparkle', 'star'],
      colors: ['#facc15', '#e5e7eb', '#a78bfa', '#f472b6', '#fde68a'],
      count: 44,
      size: [6, 16],
      motion: 'fall',
      speed: [6, 12],
      opacity: 0.9,
    },
  },
  valentines: {
    name: 'Valentine’s Day',
    kind: 'holiday',
    greeting: 'Happy Valentine’s Day',
    tagline: 'with love',
    swatch: '#ec4899',
    decor: {
      shapes: ['heart', 'heart', 'heart', 'dot'],
      colors: ['#f472b6', '#fb7185', '#f9a8d4', '#e11d48'],
      count: 26,
      size: [10, 26],
      motion: 'rise',
      speed: [12, 22],
      opacity: 0.75,
    },
  },
  stpatricks: {
    name: 'St. Patrick’s Day',
    kind: 'holiday',
    greeting: 'Happy St. Patrick’s Day',
    tagline: 'feeling lucky',
    swatch: '#16a34a',
    decor: {
      shapes: ['shamrock', 'shamrock', 'shamrock', 'coin'],
      colors: ['#22c55e', '#16a34a', '#4ade80', '#eab308'],
      count: 24,
      size: [14, 28],
      motion: 'fall',
      speed: [14, 22],
      opacity: 0.8,
    },
  },
  easter: {
    name: 'Easter',
    kind: 'holiday',
    greeting: 'Happy Easter',
    tagline: 'spring has sprung',
    swatch: '#a78bfa',
    decor: {
      shapes: ['egg', 'egg', 'tulip', 'blossom'],
      colors: ['#c4b5fd', '#f9a8d4', '#99f6e4', '#fde68a', '#bae6fd'],
      count: 18,
      size: [18, 30],
      motion: 'drift',
      speed: [5, 9],
      opacity: 0.85,
    },
  },
  july4: {
    name: 'Independence Day',
    kind: 'holiday',
    greeting: 'Happy Fourth of July',
    tagline: 'land of the free',
    swatch: '#dc2626',
    fireworks: ['#ef4444', '#f8fafc', '#3b82f6'],
    decor: {
      shapes: ['star', 'star', 'sparkle'],
      colors: ['#ef4444', '#3b82f6', '#cbd5e1'],
      count: 26,
      size: [8, 18],
      motion: 'twinkle',
      speed: [2, 4],
      opacity: 0.85,
    },
  },
  halloween: {
    name: 'Halloween',
    kind: 'holiday',
    greeting: 'Happy Halloween',
    tagline: 'boo',
    swatch: '#f97316',
    moon: true,
    decor: {
      shapes: ['bat', 'bat', 'bat', 'pumpkin'],
      colors: ['#3b0764', '#581c87', '#1f1033', '#f97316'],
      darkColors: ['#c084fc', '#a855f7', '#e9d5ff', '#f97316'],
      count: 20,
      size: [16, 30],
      motion: 'drift',
      speed: [4, 8],
      opacity: 0.8,
    },
  },
  thanksgiving: {
    name: 'Thanksgiving',
    kind: 'holiday',
    greeting: 'Happy Thanksgiving',
    tagline: 'grateful for you',
    swatch: '#b45309',
    decor: {
      shapes: ['maple', 'leaf', 'wheat', 'pumpkin'],
      colors: ['#c2410c', '#d97706', '#a16207', '#ea580c', '#92400e'],
      count: 24,
      size: [16, 30],
      motion: 'fall',
      speed: [14, 24],
      opacity: 0.8,
    },
  },
  christmas: {
    name: 'Christmas',
    kind: 'holiday',
    greeting: 'Merry Christmas',
    tagline: 'merry and bright',
    swatch: '#b91c1c',
    lights: true,
    decor: {
      shapes: ['snow', 'snow', 'dot', 'ornament', 'tree'],
      colors: ['#e5e7eb', '#cbd5e1', '#dc2626', '#16a34a', '#facc15'],
      darkColors: ['#e5e7eb', '#cbd5e1', '#f87171', '#4ade80', '#facc15'],
      count: 34,
      size: [8, 22],
      motion: 'fall',
      speed: [12, 22],
      opacity: 0.85,
    },
  },
};

/** The season on a date: spring from Mar 20, summer from Jun 21, fall from Sep 22, winter from Dec 21. */
export function seasonOn(date: Date): Season {
  const day = startOfDay(date);
  const y = day.getFullYear();
  if (day >= new Date(y, 2, 20) && day < new Date(y, 5, 21)) return 'spring';
  if (day >= new Date(y, 5, 21) && day < new Date(y, 8, 22)) return 'summer';
  if (day >= new Date(y, 8, 22) && day < new Date(y, 11, 21)) return 'fall';
  return 'winter';
}

/** Easter Sunday (Gregorian), by the anonymous algorithm. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Thanksgiving: the fourth Thursday of November. */
export function thanksgivingDay(year: number): Date {
  const first = new Date(year, 10, 1);
  return new Date(year, 10, 1 + ((4 - first.getDay() + 7) % 7) + 21);
}

/**
 * The days a holiday's look shows in a year, first and last included. New Year's is two windows
 * (Dec 31 and Jan 1); this returns the one that starts in `year`'s January.
 */
export function holidayWindow(holiday: Holiday, year: number): { start: Date; end: Date } {
  const on = (month: number, day: number) => new Date(year, month, day);
  switch (holiday) {
    case 'newyear':
      return { start: on(0, 1), end: on(0, 1) };
    case 'valentines':
      return { start: on(1, 10), end: on(1, 14) };
    case 'stpatricks':
      return { start: on(2, 14), end: on(2, 17) };
    case 'easter': {
      const easter = easterSunday(year);
      return { start: addDays(easter, -7), end: easter };
    }
    case 'july4':
      return { start: on(6, 1), end: on(6, 4) };
    case 'halloween':
      return { start: on(9, 20), end: on(9, 31) };
    case 'thanksgiving': {
      // The Sunday before through the Sunday after.
      const thursday = thanksgivingDay(year);
      return { start: addDays(thursday, -4), end: addDays(thursday, 3) };
    }
    case 'christmas':
      return { start: on(11, 1), end: on(11, 26) };
  }
}

/** The holiday whose look shows on a date, if any. Thanksgiving's weekend wins over Dec 1. */
export function holidayOn(date: Date): Holiday | null {
  const day = startOfDay(date);
  if (day.getMonth() === 11 && day.getDate() === 31) return 'newyear';
  for (const holiday of HOLIDAYS) {
    const { start, end } = holidayWindow(holiday, day.getFullYear());
    if (day >= start && day <= end) return holiday;
  }
  return null;
}

/** What "Automatic" shows on a date: the holiday's look, or else the season's. */
export function lookOn(date: Date): SeasonalLook {
  return holidayOn(date) ?? seasonOn(date);
}

/** "Nov 22 – Nov 29", or "Dec 31 – Jan 1" for New Year's. */
export function describeWindow(look: SeasonalLook, year: number): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (look === 'newyear') return 'Dec 31 – Jan 1';
  if (isHoliday(look)) {
    const { start, end } = holidayWindow(look, year);
    return `${fmt(start)} – ${fmt(end)}`;
  }
  return { spring: 'Mar 20 – Jun 20', summer: 'Jun 21 – Sep 21', fall: 'Sep 22 – Dec 20', winter: 'Dec 21 – Mar 19' }[look];
}

export function isHoliday(look: SeasonalLook): look is Holiday {
  return (HOLIDAYS as readonly string[]).includes(look);
}

export function isSeasonalChoice(value: unknown): value is SeasonalChoice {
  return value === 'auto' || value === 'off' || (typeof value === 'string' && value in SEASONAL_LOOKS);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
