import { Provider } from '@angular/core';
import { SHELL_ACCOUNT_COMPACT_COMPONENT, SHELL_ACCOUNT_COMPONENT } from '@home/ui';
import { HouseholdBadgeComponent } from './household-badge.component';
import { HouseholdBadgeCompactComponent } from './household-badge-compact.component';
import { HOUSEHOLD_CONFIG, HouseholdConfig } from './household.config';

/**
 * Sets up households for an app and puts the household badge in the shell, with a compact one for
 * when the shell is collapsed. Register the
 * interceptors with `HttpClient` yourself:
 *
 * ```ts
 * provideHttpClient(withFetch(), withInterceptors([sessionInterceptor, householdInterceptor])),
 * provideHousehold({ appId: 'budget' }),
 * ```
 */
export function provideHousehold(config: HouseholdConfig): Provider[] {
  return [
    {
      provide: HOUSEHOLD_CONFIG,
      useValue: { apiUrl: '/household-api/api/v1', homeUrl: '/', ...config },
    },
    { provide: SHELL_ACCOUNT_COMPONENT, useValue: HouseholdBadgeComponent },
    { provide: SHELL_ACCOUNT_COMPACT_COMPONENT, useValue: HouseholdBadgeCompactComponent },
  ];
}
