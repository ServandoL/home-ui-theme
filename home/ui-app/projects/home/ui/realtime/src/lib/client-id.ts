import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { CLIENT_HEADER, REALTIME_CONFIG } from './realtime.config';

/** This tab's id: new on every page load, so two tabs on one device are told apart. */
export const CLIENT_ID = new InjectionToken<string>('home.realtime.clientId', {
  providedIn: 'root',
  factory: () =>
    typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2),
});

const READS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Adds `X-Client-Id` to writes to the app's own API, so the change event the API sends back
 * names this tab and `HouseholdEvents` can skip it.
 */
export const clientIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (READS.has(req.method)) return next(req);
  const config = inject(REALTIME_CONFIG);
  const url = resolve(req.url);
  if (!url || url.origin !== location.origin || !url.pathname.startsWith(config.apiUrl)) return next(req);
  return next(req.clone({ setHeaders: { [CLIENT_HEADER]: inject(CLIENT_ID) } }));
};

function resolve(url: string): URL | null {
  try {
    return new URL(url, location.href);
  } catch {
    return null;
  }
}
