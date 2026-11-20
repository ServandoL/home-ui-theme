import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { HouseholdContext } from './household-context.service';
import { HOUSEHOLD_CONFIG, HOUSEHOLD_HEADER } from './household.config';
import { ApiErrorBody } from './session';

/**
 * Adds `X-Household-Id` to calls to the app's own API: same-origin URLs other than
 * household-api's. When the API answers that the household is missing or not the person's,
 * forgets the saved choice so the gate shows the picker again.
 */
export const householdInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(HOUSEHOLD_CONFIG);
  if (!isSameOrigin(req.url) || req.url.startsWith(config.apiUrl)) return next(req);

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

/** Relative URLs only: the household id never goes to another site. */
function isSameOrigin(url: string): boolean {
  return !/^[a-z][a-z\d+.-]*:/i.test(url) && !url.startsWith('//');
}

/** home-household-spring's two answers; other 403s (e.g. an admin-only action) are the app's own. */
function isHouseholdRejection(err: unknown): boolean {
  if (!(err instanceof HttpErrorResponse)) return false;
  const code = (err.error as ApiErrorBody | null)?.error?.code;
  return (err.status === 428 && code === 'HOUSEHOLD_REQUIRED') || (err.status === 403 && code === 'NOT_A_MEMBER');
}
