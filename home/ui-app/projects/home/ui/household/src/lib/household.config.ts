import { InjectionToken } from '@angular/core';

export interface HouseholdConfig {
  /**
   * Names this app's saved household choice. Every app shares one origin and so one
   * localStorage, so each needs its own key, e.g. `'budget'`.
   */
  appId: string;
  /** household-api's base URL. Default `/household-api/api/v1`. */
  apiUrl?: string;
  /** The Home app, where households are created and managed. Default `/`. */
  homeUrl?: string;
}

export const HOUSEHOLD_CONFIG = new InjectionToken<Required<HouseholdConfig>>('home.household');

/** The header every request to the app's own API carries; home-household-spring checks it. */
export const HOUSEHOLD_HEADER = 'X-Household-Id';
