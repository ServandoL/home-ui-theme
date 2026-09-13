// Create a token for a complex type
import {inject, InjectionToken, provideAppInitializer} from '@angular/core';
import {NavigationService} from '../services/navigation.service';
import {ThemeService} from '../services/theme.service';
import {ToastService} from '../services/toast.service';
import {NavigationRoutes} from '../models/routes.model';

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
    {
      provide: HOME_THEME_TOKEN,
      useValue: config
    },
    NavigationService,
    ThemeService,
    ToastService
  ]
}
