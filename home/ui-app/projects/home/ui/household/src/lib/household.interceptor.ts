import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { HouseholdContext } from './household-context.service';
import { HOUSEHOLD_CONFIG, HOUSEHOLD_HEADER } from './household.config';
import { ApiErrorBody } from './session';

/**
 * Adds `X-Household-Id` to calls to the app's own API: URLs on the page's origin, relative or
 * absolute, other than household-api's. When the API answers that the household is missing or
 * not the person's, forgets the saved choice so the gate shows the picker again.
 */
export const householdInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(HOUSEHOLD_CONFIG);
  const url = resolve(req.url);
  if (!url || url.origin !== location.origin || url.pathname.startsWith(config.apiUrl)) return next(req);

  const context = inject(HouseholdContext);
  const id = context.currentId();
  const request = id ? req.clone({ setHeaders: { [HOUSEHOLD_HEADER]: id } }) : req;
  return next(request).pipe(
    catchError((err: unknown) => {
      if (isHouseholdRejection(err)) void context.forget();
      return throwError(() => err);
    }),
  );
};

/**
 * The request URL resolved against the page, or null if it can't be parsed. Apps build URLs both
 * ways (`/budget-api/...` and `new URL(path, location.origin)`); comparing origins treats them
 * alike, and the household id still never goes to another site.
 */
function resolve(url: string): URL | null {
  try {
    return new URL(url, location.href);
  } catch {
    return null;
  }
}

/** home-household-spring's two answers; other 403s (e.g. an admin-only action) are the app's own. */
function isHouseholdRejection(err: unknown): boolean {
  if (!(err instanceof HttpErrorResponse)) return false;
  const code = (err.error as ApiErrorBody | null)?.error?.code;
  return (err.status === 428 && code === 'HOUSEHOLD_REQUIRED') || (err.status === 403 && code === 'NOT_A_MEMBER');
}
