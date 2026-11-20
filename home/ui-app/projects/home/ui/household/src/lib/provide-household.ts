import { Provider } from '@angular/core';
import { SHELL_ACCOUNT_COMPONENT } from '@home/ui';
import { HouseholdBadgeComponent } from './household-badge.component';
import { HOUSEHOLD_CONFIG, HouseholdConfig } from './household.config';

/**
 * Sets up households for an app and puts the household badge in the shell. Register the
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
  ];
}
