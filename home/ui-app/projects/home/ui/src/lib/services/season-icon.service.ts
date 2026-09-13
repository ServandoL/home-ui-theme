// season-icon.service.ts
import {Service, signal} from '@angular/core';

export type Season = 'fall' | 'winter' | 'spring' | 'summer';
const DEFAULT_ICONS: Record<Season, string[]> = {
  fall: [
    'phosphorLeafDuotone', 'phosphorAcornDuotone'
  ],
  winter: [
    'phosphorSnowflakeDuotone', 'phosphorCloudSnowDuotone', 'phosphorPersonSimpleSnowboardDuotone'
  ],
  spring: [
    'phosphorFlowerLotusDuotone',
    'phosphorFlowerTulipDuotone',
    'phosphorFlowerDuotone'
  ],
  summer: [
    'phosphorSunDuotone', 'phosphorThermometerHotDuotone', 'phosphorBeachBallDuotone'
  ]
}

@Service()
export class SeasonIconService {
  private readonly icons = signal<Record<Season, string[]>>(DEFAULT_ICONS);

  // Spring: March 20, 2026 (vernal equinox)
  // Summer: June 21, 2026 (summer solstice)
  // Fall/Autumn: September 22, 2026 (autumnal equinox)
  // Winter: December 21, 2026 (winter solstice)
  public getSeason(): Season {
    const now = new Date();
    const year = now.getFullYear();
    const springStart  = new Date(year, 2, 20); // March 20
    const summerStart  = new Date(year, 5, 21); // June 21
    const fallStart    = new Date(year, 8, 22); // Sept 22
    const winterStart  = new Date(year, 11, 21); // Dec 21
    if (now >= springStart && now < summerStart) {
      return 'spring';
    }
    if (now >= summerStart && now < fallStart) {
      return 'summer';
    }
    if (now >= fallStart && now < winterStart) {
      return 'fall';
    }
    return 'winter';
  }

  public setIcons(icons: Record<Season, string[]>) {
    this.icons.set(icons);
  }

  public getIcons(season: Season): string[] {
    return this.icons()[season];
  }
}
