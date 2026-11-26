import { Component, inject } from '@angular/core';
import { Route } from '@angular/router';
import { NavigationRoutes } from '../../models/routes.model';
import { ThemeSettingsComponent } from '../theme-settings/theme-settings.component';
import { ShellSettingsComponent } from '../shell-settings/shell-settings.component';
import { SeasonalSettingsComponent } from '../../seasonal/seasonal-settings.component';
import { HOME_THEME_TOKEN } from '../../providers/provider';

/** A settings page for apps that have none of their own. */
@Component({
  imports: [ThemeSettingsComponent, ShellSettingsComponent, SeasonalSettingsComponent],
  selector: 'app-settings-page',
  template: `
    <div class="px-4 py-6 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold app-text mb-5">Settings</h1>
      <app-theme-settings />
      @if (seasonal) {
        <app-seasonal-settings class="block mt-4" />
      }
      <app-shell-settings class="block mt-4" />
    </div>
  `,
})
export class SettingsPageComponent {
  protected readonly seasonal = inject(HOME_THEME_TOKEN, { optional: true })?.seasonal ?? true;
}

/** Add to the app's routes, under the shell, to serve SettingsPageComponent at /settings. */
export const SETTINGS_ROUTE: Route = { path: 'settings', title: 'Settings', component: SettingsPageComponent };

/** The nav item for SETTINGS_ROUTE; provideHomeTheme registers its icon. */
export const SETTINGS_NAV_ROUTE: NavigationRoutes = {
  name: 'Settings',
  url: '/settings',
  icon: { name: 'heroCog6ToothSolid' },
};
