import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, throwError } from 'rxjs';

/** `{ "error": { code, message } }`, the shape household-api and the app APIs share. */
export interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

/** Tracks whether the Cloudflare Access session has likely expired. */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _expired = signal(false);
  readonly expired = this._expired.asReadonly();

  markExpired(): void {
    this._expired.set(true);
  }

  /** Reloading sends the browser through Cloudflare Access sign-in again. */
  signInAgain(): void {
    location.reload();
  }
}

/**
 * When the Access session expires, Access answers API calls with a redirect to its sign-in
 * page, which the browser blocks for fetch. That surfaces as a network error (status 0), not
 * a 401.
 */
export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 0) session.markExpired();
      return throwError(() => err);
    }),
  );
};

/** The message to show for a failed API call. */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'You’ve been signed out. Sign in again to keep going.';
    const message = (err.error as ApiErrorBody | null)?.error?.message;
    if (message) return message;
  }
  return 'Couldn’t save. Try again.';
}
