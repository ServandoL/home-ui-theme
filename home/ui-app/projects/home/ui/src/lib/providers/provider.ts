// Create a token for a complex type
import { inject, InjectionToken, provideAppInitializer } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { ThemeService } from '../services/theme.service';
import { ToastService } from '../services/toast.service';
import { NavigationRoutes } from '../models/routes.model';
import { provideIcons } from '@ng-icons/core';
import {
  phosphorAcornDuotone,
  phosphorBeachBallDuotone,
  phosphorCloudSnowDuotone,
  phosphorFlowerDuotone,
  phosphorFlowerLotusDuotone,
  phosphorFlowerTulipDuotone,
  phosphorLeafDuotone,
  phosphorPersonSimpleSnowboardDuotone,
  phosphorSidebarDuotone,
  phosphorSnowflakeDuotone,
  phosphorSunDuotone,
  phosphorThermometerHotDuotone,
  phosphorTrayArrowDownDuotone,
  phosphorTrayArrowUpDuotone,
} from '@ng-icons/phosphor-icons/duotone';
import {
  heroChevronDoubleLeftSolid,
  heroChevronDoubleRightSolid,
  heroChevronDownSolid,
  heroChevronUpSolid,
  heroCog6ToothSolid,
  heroHomeSolid,
  heroMoonSolid,
  heroQuestionMarkCircleSolid,
  heroSparklesSolid,
  heroSunSolid,
} from '@ng-icons/heroicons/solid';
import { SeasonIconService } from '../services/season-icon.service';
import { SeasonalThemeService } from '../seasonal/seasonal-theme.service';
import { StaleBuildRecovery } from '../services/stale-build-recovery.service';
import { NavExpandType } from '../models/bottom-nav';
import { HelpContent } from '../models/help.model';

export interface ThemeConfig {
  appName: string;
  routes: NavigationRoutes[];
  navExpandType?: NavExpandType;
  /**
   * Show buttons that collapse the mobile header, bottom nav and desktop sidebar, which start
   * collapsed. Default true; people can change it in Settings. See ShellLayoutService.
   */
  collapsibleShell?: boolean;
  /**
   * Show a link back to the Home landing page (`/`) in the mobile header and the desktop sidebar.
   * Default true; Home itself turns it off.
   */
  homeLink?: boolean;
  /**
   * The seasonal look: colors and decorations that follow the season and US holidays. Default
   * true; people can turn it off or keep one look in Settings. See SeasonalThemeService.
   */
  seasonal?: boolean;
  /** What the Help page (HELP_ROUTE) says about this app. */
  help?: HelpContent;
}

export const HOME_THEME_TOKEN = new InjectionToken<ThemeConfig>('app.config');

export function provideHomeTheme(config: ThemeConfig) {
  return [
    provideAppInitializer(() => {
      inject(ThemeService).initialize();
      // Sets data-look on <html> before the first paint, so the page doesn't flash plain.
      if (config.seasonal ?? true) inject(SeasonalThemeService);
      const navService = inject(NavigationService);
      navService.setRoutes(config.routes);
      navService.setNavExpandType(config.navExpandType ?? 'bottom-drawer');
      // A tab left open across a deploy reloads instead of silently ignoring navigation.
      inject(StaleBuildRecovery).start();
    }),
    provideIcons({
      heroSunSolid,
      heroMoonSolid,
      heroQuestionMarkCircleSolid,
      heroSparklesSolid,
      heroCog6ToothSolid,
      heroHomeSolid,
      heroChevronUpSolid,
      heroChevronDownSolid,
      heroChevronDoubleLeftSolid,
      heroChevronDoubleRightSolid,
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
      phosphorSidebarDuotone,
      phosphorTrayArrowUpDuotone,
      phosphorTrayArrowDownDuotone,
    }),
    {
      provide: HOME_THEME_TOKEN,
      useValue: config,
    },
    SeasonIconService,
    NavigationService,
    ThemeService,
    ToastService,
  ];
}
