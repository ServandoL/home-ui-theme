import { InjectionToken, Provider } from '@angular/core';

export interface RealtimeConfig {
  /** The app's own API base, e.g. `'/pet-qol-api'`. Writes under it carry `X-Client-Id`. */
  apiUrl: string;
  /** The stream's path under `apiUrl`, as home-household-spring serves it. Default `/api/v1/events`. */
  eventsPath?: string;
  /**
   * How long a hidden tab keeps its stream open, in ms. Phones then don't hold a connection
   * in the background, and `resync` covers what changed meanwhile. Default 60 000.
   */
  hiddenGraceMs?: number;
}

export const REALTIME_CONFIG = new InjectionToken<Required<RealtimeConfig>>('home.realtime');

/** Sent on writes so the event that comes back can be skipped by the tab that made it. */
export const CLIENT_HEADER = 'X-Client-Id';

/**
 * Sets up the household event stream for an app. Needs `provideHousehold`, and the client id
 * interceptor registered with `HttpClient`:
 *
 * ```ts
 * provideHttpClient(withFetch(), withInterceptors([sessionInterceptor, householdInterceptor, clientIdInterceptor])),
 * provideHousehold({ appId: 'pet-qol' }),
 * provideRealtime({ apiUrl: '/pet-qol-api' }),
 * ```
 */
export function provideRealtime(config: RealtimeConfig): Provider[] {
  return [
    {
      provide: REALTIME_CONFIG,
      useValue: { eventsPath: '/api/v1/events', hiddenGraceMs: 60_000, ...config },
    },
  ];
}
