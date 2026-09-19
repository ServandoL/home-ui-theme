// Create a token for a complex type
import {inject, InjectionToken, provideAppInitializer} from '@angular/core';
import {NavigationService} from '../services/navigation.service';
import {ThemeService} from '../services/theme.service';
import {ToastService} from '../services/toast.service';
import {NavigationRoutes} from '../models/routes.model';
import {provideIcons} from '@ng-icons/core';
import {
  phosphorAcornDuotone,
  phosphorBeachBallDuotone,
  phosphorCloudSnowDuotone,
  phosphorFlowerDuotone,
  phosphorFlowerLotusDuotone,
  phosphorFlowerTulipDuotone,
  phosphorLeafDuotone,
  phosphorPersonSimpleSnowboardDuotone,
  phosphorSnowflakeDuotone,
  phosphorSunDuotone,
  phosphorThermometerHotDuotone,
  phosphorSidebarDuotone
} from '@ng-icons/phosphor-icons/duotone';
import {heroMoonSolid, heroQuestionMarkCircleSolid, heroSunSolid} from '@ng-icons/heroicons/solid';
import {SeasonIconService} from "../services/season-icon.service";

export interface ThemeConfig {
  appName: string;
  routes: NavigationRoutes[]
}

export const HOME_THEME_TOKEN = new InjectionToken<ThemeConfig>('app.config');

export function provideHomeTheme(config: ThemeConfig) {
  return [
    provideAppInitializer(() => {
      inject(ThemeService).initialize();
      inject(NavigationService).setRoutes(config.routes);
    }),
    provideIcons({
      heroSunSolid,
      heroMoonSolid,
      heroQuestionMarkCircleSolid,
      phosphorLeafDuotone,
      phosphorAcornDuotone,
      phosphorFlowerLotusDuotone,
      phosphorFlowerTulipDuotone,
      phosphorFlowerDuotone,
      phosphorSunDuotone,
      phosphorThermometerHotDuotone,
      phosphorBeachBallDuotone,
      phosphorSnowflakeDuotone,
      phosphorCloudSnowDuotone,
      phosphorPersonSimpleSnowboardDuotone,
      phosphorSidebarDuotone
    }),
    {
      provide: HOME_THEME_TOKEN,
      useValue: config
    },
    SeasonIconService,
    NavigationService,
    ThemeService,
    ToastService
  ]
}
