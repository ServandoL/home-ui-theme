import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Route, Router } from '@angular/router';
import { filter } from 'rxjs';
import { HOME_THEME_TOKEN } from '../providers/provider';

/**
 * - `scroll`: `<main>` scrolls and pads for the bottom nav. Every route without `shellLayout`.
 * - `fill`: `<main>` is a flex column that doesn't scroll; the page takes `flex-1 min-h-0` and
 *   scrolls itself. For editors and canvases that keep their own sticky headers.
 */
export type ShellLayout = 'scroll' | 'fill';

/** Keys the shell reads from a route's `data`. Parent routes' data applies to their children. */
export interface ShellRouteData {
  shellLayout?: ShellLayout;
  /**
   * Collapse the mobile header, bottom nav and desktop sidebar while this route is open. Expanding
   * them here lasts until the person leaves the route; then their saved choice comes back.
   */
  shellCollapsed?: boolean;
}

export type ShellPart = 'header' | 'nav' | 'sidenav';

type ShellCollapsed = Record<ShellPart, boolean>;

/** What's saved per app: the collapsed parts, and the Settings switch (`null` until it's used). */
type ShellSaved = ShellCollapsed & { enabled: boolean | null };

const NOTHING_SAVED: ShellSaved = { header: false, nav: false, sidenav: false, enabled: null };

/**
 * Which parts of the shell are collapsed, and whether the current route fills it. The collapse
 * controls show when `provideHomeTheme` sets `collapsibleShell` or the route sets `shellCollapsed`,
 * unless the person turned them off in Settings (`setEnabled`), which also wins over
 * `shellCollapsed`. Choices are saved per app on this device.
 */
@Injectable({ providedIn: 'root' })
export class ShellLayoutService {
  private readonly router = inject(Router);
  private readonly config = inject(HOME_THEME_TOKEN, { optional: true });
  private readonly storageKey = `home.shell.${slug(this.config?.appName ?? 'app')}`;

  private readonly saved = signal<ShellSaved>(readSaved(this.storageKey));
  private readonly routeData = signal<ShellRouteData>({});
  /** Toggles made on a `shellCollapsed` route; cleared when the route changes. */
  private readonly visit = signal<Partial<ShellCollapsed>>({});
  private currentRoute: Route | null = null;

  readonly fill = computed(() => this.routeData().shellLayout === 'fill');
  /** The Settings switch: the person's choice, or the app's `collapsibleShell`. */
  readonly enabled = computed(() => this.saved().enabled ?? !!this.config?.collapsibleShell);
  readonly collapsible = computed(() => {
    const choice = this.saved().enabled;
    if (choice !== null) return choice;
    return !!this.config?.collapsibleShell || this.routeData().shellCollapsed === true;
  });
  readonly headerCollapsed = computed(() => this.isCollapsed('header'));
  readonly navCollapsed = computed(() => this.isCollapsed('nav'));
  readonly sidenavCollapsed = computed(() => this.isCollapsed('sidenav'));

  constructor() {
    // The shell can be created after the first navigation (the household gate waits), so read
    // the current route now as well as on every navigation.
    this.readRoute();
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.readRoute());
  }

  /** Turn the collapse controls on or off for this app, from Settings. */
  setEnabled(enabled: boolean): void {
    this.saved.update((s) => ({ ...s, enabled }));
    this.save();
  }

  toggleHeader(): void {
    this.toggle('header');
  }

  toggleNav(): void {
    this.toggle('nav');
  }

  toggleSidenav(): void {
    this.toggle('sidenav');
  }

  private isCollapsed(part: ShellPart): boolean {
    if (!this.collapsible()) return false;
    if (this.routeData().shellCollapsed) return this.visit()[part] ?? true;
    return this.saved()[part];
  }

  private toggle(part: ShellPart): void {
    const collapsed = !this.isCollapsed(part);
    if (this.routeData().shellCollapsed) {
      this.visit.update((v) => ({ ...v, [part]: collapsed }));
      return;
    }
    this.saved.update((s) => ({ ...s, [part]: collapsed }));
    this.save();
  }

  private save(): void {
    writeStorage(this.storageKey, JSON.stringify(this.saved()));
  }

  private readRoute(): void {
    let snapshot: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let data: ShellRouteData = {};
    let deepest: ActivatedRouteSnapshot = snapshot;
    while (snapshot) {
      data = { ...data, ...(snapshot.data as ShellRouteData) };
      deepest = snapshot;
      snapshot = snapshot.firstChild;
    }
    // A query-param change (the same page) keeps what the person expanded.
    if (deepest.routeConfig !== this.currentRoute) this.visit.set({});
    this.currentRoute = deepest.routeConfig;
    this.routeData.set(data);
  }
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'app';
}

function readSaved(key: string): ShellSaved {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as Partial<ShellSaved>) : {};
    return {
      header: parsed.header === true,
      nav: parsed.nav === true,
      sidenav: parsed.sidenav === true,
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : null,
    };
  } catch {
    // Missing or blocked storage, or a value that isn't ours: start expanded, app default.
    return { ...NOTHING_SAVED };
  }
}

function writeStorage(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  } catch {
    // Persistence is best-effort; the choice still applies for this session.
  }
}
