import { DOCUMENT, Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * What browsers throw when a lazy route's chunk can't be loaded: Chrome and Edge, Firefox,
 * Safari, then a chunk answered with HTML instead of a 404.
 */
const STALE_BUILD_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|is not a valid JavaScript MIME type/i;

/** True for an error from loading a lazy route's chunk, rather than from the app's own code. */
export function isStaleBuildError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? '');
  return STALE_BUILD_ERROR.test(message);
}

const STORAGE_KEY = 'home.ui.stale-build-reload';
/** A second failure for the same page this soon after reloading means the build itself is broken. */
const RETRY_WINDOW_MS = 60_000;

/**
 * Reloads the page when a navigation fails because its lazy chunk is gone.
 *
 * Every deploy deletes the previous build's files, so a tab opened before it still runs the old
 * code and asks for chunks that no longer exist. The router then drops the navigation without a
 * word, and tapping a tab does nothing. A full load of the page the person was going to fetches
 * the current build and gets them there.
 *
 * `provideHomeTheme()` starts it; apps don't need to do anything.
 */
@Injectable({ providedIn: 'root' })
export class StaleBuildRecovery {
  private readonly router = inject(Router, { optional: true });
  private readonly location = inject(Location, { optional: true });
  private readonly document = inject(DOCUMENT);
  private started = false;

  start(): void {
    if (this.started || !this.router) return;
    this.started = true;
    this.router.events
      .pipe(filter((event): event is NavigationError => event instanceof NavigationError))
      .subscribe((event) => this.recover(event));
  }

  /** Reloads at the navigation's URL when its chunk failed to load. True when it reloaded. */
  recover(event: NavigationError): boolean {
    if (!isStaleBuildError(event.error)) return false;
    const target = this.location ? this.location.prepareExternalUrl(event.url) : event.url;

    const last = readLastReload();
    if (last && last.url === target && Date.now() - last.at < RETRY_WINDOW_MS) {
      console.error(`@home/ui: ${target} still fails to load after a reload; not reloading again.`, event.error);
      return false;
    }
    writeLastReload({ url: target, at: Date.now() });
    this.reload(target);
    return true;
  }

  /** A full page load, so the browser fetches the current index.html and its chunks. */
  protected reload(url: string): void {
    this.document.location.assign(url);
  }
}

interface LastReload {
  url: string;
  at: number;
}

function readLastReload(): LastReload | null {
  try {
    const raw = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object' && 'url' in parsed && 'at' in parsed) {
      const { url, at } = parsed as Record<string, unknown>;
      if (typeof url === 'string' && typeof at === 'number') return { url, at };
    }
  } catch {
    // Storage blocked or the value is garbage: behave as if there was no earlier reload.
  }
  return null;
}

function writeLastReload(value: LastReload): void {
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Without storage the guard can't remember, but one reload is still better than nothing.
  }
}
