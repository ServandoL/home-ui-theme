# @home/ui

Reusable Angular theme system, app shell, navigation, generic services, and
shared UI components for the "home" family of apps.

- Angular 22 standalone components, signal-based inputs/outputs
- Tailwind CSS 4 for layout + a shipped `theme.css` for colors and `.app-*` utility classes
- Light / dark / "party" (random palette) theme modes
- Mobile-first shell with a bottom tab bar that overflows into an app drawer or side nav

---

## Contents

- [Installation](#installation)
- [Setup](#setup)
- [App shell](#app-shell)
- [Components](#components)
- [Services](#services)
- [Validators](#validators)
- [Models & tokens](#models--tokens)
- [Households (`@home/ui/household`)](#households-homeuihousehold)
- [Real-time updates (`@home/ui/realtime`)](#real-time-updates-homeuirealtime)
- [Theme CSS](#theme-css)
- [Development](#development)

---

## Installation

### Peer dependencies

```bash
npm install @angular/cdk @ng-icons/core @ng-icons/heroicons @ng-icons/phosphor-icons
```

| Package                    | Version   |
| -------------------------- | --------- |
| `@angular/core` / `common` / `forms` | `^22.1.0` |
| `@angular/cdk`             | `^22.1.7` |
| `@ng-icons/core`           | `^35.0.1` |
| `@ng-icons/heroicons`      | `^35.0.1` |
| `@ng-icons/phosphor-icons` | `^36.0.0` |

`@angular/router` is also required (the shell and nav components use
`RouterOutlet` / `RouterLink`), as is Tailwind CSS 4 in the consuming app.

### Installing the package

The library is distributed as a packed tarball. From the workspace root:

```bash
pnpm build:lib          # builds dist/home/ui, runs `npm pack`, moves the .tgz to builds/
```

Then, in the consuming app:

```bash
npm install /path/to/ui-app/builds/home-ui-<version>.tgz
```

Every packed version is kept in `builds/` (git-ignored).

---

## Setup

### 1. Register the providers

`provideHomeTheme()` wires up everything the library needs: it initializes
`ThemeService`, registers your navigation routes, sets the nav overflow
style, registers the icons used internally, and provides the
`HOME_THEME_TOKEN` config.

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { heroHomeSolid, heroBanknotesSolid, heroChartBarSolid, heroCogSolid } from '@ng-icons/heroicons/solid';
import { provideHomeTheme } from '@home/ui';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIcons({ heroHomeSolid, heroBanknotesSolid, heroChartBarSolid, heroCogSolid }),
    provideHomeTheme({
      appName: 'Home Budget',
      navExpandType: 'bottom-drawer', // or 'sidenav' (default: 'bottom-drawer')
      routes: [
        { name: 'Home', url: '/home', icon: { name: 'heroHomeSolid' } },
        { name: 'Expenses', url: '/expenses', icon: { name: 'heroBanknotesSolid' } },
        { name: 'Reports', url: '/reports', icon: { name: 'heroChartBarSolid' } },
        { name: 'Settings', url: '/settings', icon: { name: 'heroCogSolid' } },
      ],
    }),
  ],
};
```

> Icons referenced by your routes (and by `EmptyStateComponent`) must be
> registered by **your app** with `provideIcons(...)`. The library only
> registers the icons it uses internally (theme toggle, nav, season icons).

### 2. Import the styles

```css
/* styles.css */
@import 'tailwindcss';
@import '@home/ui/theme.css';

/* Let Tailwind see the class names used in the library's templates */
@source '../node_modules/@home/ui';
```

### 3. Render the shell

```ts
// app.ts
import { Component } from '@angular/core';
import { ShellComponent } from '@home/ui';

@Component({
  selector: 'app-root',
  imports: [ShellComponent],
  template: `<app-shell />`,
})
export class App {}
```

That's it — your routed pages render inside the shell's `<router-outlet>`.

---

## App shell

`ShellComponent` (`<app-shell>`) is the top-level layout for the app. It
takes **no inputs**; everything is configured through `provideHomeTheme()`.

It renders:

| Part | Description |
| ---- | ----------- |
| Mobile header | Sticky header (hidden at `lg`+) with `config.appName` and the account slot. |
| `<router-outlet>` | Your routed content, inside a scrollable `<main>` with bottom padding to clear the tab bar. |
| `<app-mobile-bottom-nav>` | Fixed bottom tab bar (hidden at `lg`+). |
| `<app-toast-container>` | Global toast stack driven by `ToastService`. |

The shell has no theme switch; it's on each app's settings page (see
[Settings and theme](#settings-and-theme)).

### Navigation behaviour

The `routes` array passed to `provideHomeTheme()` is split by
`NavigationService`:

- **First 3 routes** → shown as tabs in the bottom bar (`mainRoutes`).
- **Remaining routes** → shown in an overflow menu (`additionalRoutes`),
  opened with a 4th "More" tab. The More tab only appears when there are
  more than 3 routes.

How the overflow menu opens depends on `navExpandType`:

| `navExpandType` | Behaviour |
| --------------- | --------- |
| `'bottom-drawer'` (default) | The bottom bar expands upward into a 4-column grid of the extra routes, with a dimmed backdrop. The tab toggles between "More" and "Close". |
| `'sidenav'` | A panel (`MobileSidenavContentComponent`) slides in from the right via a CDK overlay. Closes on backdrop click, <kbd>Escape</kbd>, or navigating. |

You can also drive the menu yourself:

```ts
const nav = inject(NavigationService);
nav.openMenu();
nav.closeMenu();
nav.setRoutes([...]);              // replace routes at runtime
nav.setNavExpandType('sidenav');   // switch overflow style at runtime
```

At the `lg` breakpoint the mobile header and bottom nav hide and
`DesktopSidenavComponent` shows every route in a 256px sidebar.

### Shell layout

Two keys in a route's `data` change the shell for that route. A parent route's
data applies to its children.

```ts
import { ShellRouteData } from '@home/ui';

{
  path: 'patterns/:id',
  loadComponent: () => import('./editor').then((m) => m.Editor),
  data: { shellLayout: 'fill', shellCollapsed: true } satisfies ShellRouteData,
}
```

| Key | Effect |
| --- | ------ |
| `shellLayout: 'fill'` | `<main>` becomes a flex column that doesn't scroll, so the page can fill the space and scroll itself (an editor with its own sticky headers). Give the page's host `flex-1 min-h-0`. It only pads for the bottom nav while the nav shows. Default `'scroll'`. |
| `shellCollapsed: true` | The mobile header, bottom nav and desktop sidebar start collapsed. Expanding one lasts until the person leaves the route; then their saved choice comes back. |

To let people collapse the shell on every route, pass `collapsibleShell: true`
to `provideHomeTheme()`. Then:

- the mobile header hides the household badge behind a chevron,
- the bottom nav gets a **Hide** tab and comes back from a floating button at
  the bottom right,
- the desktop sidebar collapses to a 64px rail of icons (routes without an
  icon show their first letter).

Choices are saved per app on the device (`home.shell.<app-name>` in
localStorage). Without `collapsibleShell` or `shellCollapsed` the shell shows no
collapse controls and looks as it did before 2.7.0.

People can turn the controls on or off themselves with the **Layout** switch on
the settings page (`<app-shell-settings>`, see [Settings and theme](#settings-and-theme)).
`collapsibleShell` is only the default until they do. Turned off, nothing
collapses, not even on a `shellCollapsed` route.

---

## Components

All components are standalone. Import them directly into your component's
`imports` array.

### `ShellComponent` — `<app-shell>`

See [App shell](#app-shell).

### Settings and theme

The light / dark / party switch lives on a settings page, not in the shell.

- An app **without** a settings page uses the library's: add `SETTINGS_ROUTE`
  to the routes under the shell and `SETTINGS_NAV_ROUTE` to `provideHomeTheme`'s
  `routes`. The page is `SettingsPageComponent` (`<app-settings-page>`): a
  "Settings" heading and the Appearance and Layout sections.

  ```ts
  // app.routes.ts
  import { SETTINGS_ROUTE } from '@home/ui';
  { path: '', component: ShellComponent, children: [/* … */, SETTINGS_ROUTE] }

  // app.config.ts
  provideHomeTheme({ appName: 'Recipe book', routes: [/* … */, SETTINGS_NAV_ROUTE] })
  ```

- An app **with** its own settings page adds `ThemeSettingsComponent`
  (`<app-theme-settings>`), the Appearance section as a card, and
  `ShellSettingsComponent` (`<app-shell-settings>`), the Layout section: a switch
  for the shell's collapse controls (see [Shell layout](#shell-layout)).
  `SettingsPageComponent` shows both.

`ThemeToggleComponent` (`<app-theme-toggle>`) is the switch itself; `[labels]="true"`
shows each mode's name beside its icon. Each button sets `aria-pressed`.

### `MobileBottomNavComponent` — `<app-mobile-bottom-nav>`

Fixed bottom tab bar driven by `NavigationService`. Already included in the
shell; use it directly only if you build your own layout. No inputs.

### `MobileSidenavContentComponent` — `<app-mobile-sidenav-content>`

Right-hand overflow panel listing `additionalRoutes`. Attached automatically
by `NavigationService` when `navExpandType` is `'sidenav'`; you should not
need to render it yourself.

### `ToastContainerComponent` — `<app-toast-container>`

Renders toasts from `ToastService` in the top-right corner. Already included
in the shell. No inputs.

### `BottomSheetComponent` — `<app-bottom-sheet>`

Mobile modal sheet that slides up from the bottom (hidden at `lg`+).

| Input / Output | Type | Default | Description |
| -------------- | ---- | ------- | ----------- |
| `open` | `boolean` (required) | — | Whether the sheet is visible. |
| `title` | `string` | `''` | Header title. |
| `(closeRequested)` | `void` | — | Emitted on backdrop click or the close button. |

```html
<app-bottom-sheet [open]="sheetOpen()" title="New expense" (closeRequested)="sheetOpen.set(false)">
  <form>…</form>
</app-bottom-sheet>
```

### `ConfirmDeleteActionsComponent` — `<app-confirm-delete-actions>`

Inline "Delete? Yes / No" confirmation row.

| Input / Output | Type | Default |
| -------------- | ---- | ------- |
| `message` | `string` | `'Delete?'` |
| `confirmText` | `string` | `'Yes'` |
| `cancelText` | `string` | `'No'` |
| `(confirmed)` | `void` | — |
| `(cancelled)` | `void` | — |

```html
<div class="flex items-center gap-2">
  <app-confirm-delete-actions (confirmed)="remove(item)" (cancelled)="deleting.set(null)" />
</div>
```

### `MobileRecordCardComponent` — `<app-mobile-record-card>`

Card for list items on mobile, with built-in Edit / Delete buttons and an
inline delete confirmation. Content is projected into two slots:
`[card-header]` and `[card-body]`.

| Input / Output | Type | Default | Description |
| -------------- | ---- | ------- | ----------- |
| `deleting` | `boolean` | `false` | Shows the confirm-delete row instead of Edit/Delete. |
| `deleteMessage` | `string` | `'Delete this item?'` | Confirmation message. |
| `(edit)` | `void` | — | Edit clicked. |
| `(requestDelete)` | `void` | — | Delete clicked — set `deleting` to `true`. |
| `(confirmDelete)` | `void` | — | Deletion confirmed. |
| `(cancelDelete)` | `void` | — | Deletion cancelled — set `deleting` back to `false`. |

```html
@for (item of items(); track item.id) {
  <app-mobile-record-card
    [deleting]="deletingId() === item.id"
    (edit)="edit(item)"
    (requestDelete)="deletingId.set(item.id)"
    (confirmDelete)="remove(item)"
    (cancelDelete)="deletingId.set(null)"
  >
    <h4 card-header class="font-semibold app-text">{{ item.name }}</h4>
    <p card-body class="text-sm app-text-muted">{{ item.amount | currency }}</p>
  </app-mobile-record-card>
}
```

### `EmptyStateComponent` — `<app-empty-state>`

Centered icon + message for empty lists.

| Input | Type | Default |
| ----- | ---- | ------- |
| `icon` | `string` (required) — an `ng-icon` name registered by your app | — |
| `title` | `string` (required) | — |
| `subtitle` | `string` | `''` |

```html
<app-empty-state icon="heroInboxSolid" title="No expenses yet" subtitle="Add one to get started." />
```

### `CurrencyInputComponent` — `<app-currency-input>`

Numeric input with a `$` prefix, label, and validation message, bound to a
reactive `FormControl<number | null>`.

| Input | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `control` | `FormControl<number \| null> \| FormControl<number>` (required) | — | Bound control. |
| `label` | `string` | `''` | Label text (no label rendered if empty). |
| `required` | `boolean` | `false` | Shows a `*` after the label (does not add a validator). |
| `optionalLabel` | `string` | `''` | Muted suffix after the label, e.g. `'(optional)'`. |
| `placeholder` | `string` | `'0.00'` | |
| `min` | `string` | `'0.01'` | |
| `step` | `string` | `'0.01'` | |
| `containerClass` | `string` | `''` | Extra classes on the wrapper. |
| `inputClass` | `string` | `''` | Extra classes on the `<input>`. |
| `errorText` | `string` | `''` | Shown when the control is invalid and touched. |

```html
<app-currency-input
  [control]="form.controls.amount"
  label="Amount"
  [required]="true"
  errorText="Enter an amount greater than 0"
/>
```

### `SeasonBackgroundComponent` — `<app-season-background>`

Decorative layer of randomly placed, rotated, semi-transparent seasonal
icons. Positions itself `absolute inset-0`, so place it inside a
`relative` container.

| Input | Type | Default |
| ----- | ---- | ------- |
| `season` | `Season` (`'fall' \| 'winter' \| 'spring' \| 'summer'`) (required) | — |
| `count` | `number` | `10` |

```ts
readonly season = inject(SeasonIconService).getSeason();
```

```html
<section class="relative">
  <app-season-background [season]="season" [count]="12" />
  …
</section>
```

---

## Services

### `ThemeService`

Manages the `data-theme` attribute on `<html>` and persists the choice to
`localStorage`. Initialized automatically by `provideHomeTheme()`.

| Member | Description |
| ------ | ----------- |
| `mode` | `Signal<ThemeMode>` — current mode. |
| `themeModes` | List of `{ value, label, icon }` for building a theme picker. |
| `initialize()` | Restores the stored mode, or falls back to the OS `prefers-color-scheme`. |
| `setMode(mode)` | Switches mode. `'party'` generates a random accessible palette (re-used if already in party mode). |
| `isActive(mode)` | `true` if `mode` is current. |

### `ToastService`

```ts
const toast = inject(ToastService);
toast.success('Saved!');
toast.error('Something went wrong');
```

Toasts auto-dismiss after 3.5s. `toasts` is a readonly signal; `dismiss(id)`
removes one manually.

### `NavigationService`

Holds routes and menu state for the shell. See
[Navigation behaviour](#navigation-behaviour).

| Member | Description |
| ------ | ----------- |
| `mainRoutes` / `additionalRoutes` | Computed: first 3 routes / the rest. |
| `isMenuOpen` | Signal: overflow menu open state. |
| `navExpandtype` | Signal: current `NavExpandType`. |
| `showSideMenu` / `showAppDrawer` | Computed: which overflow style is active (and has routes). |
| `openMenu()` / `closeMenu()` / `toggleMenu()` / `toggleSidenav()` | Control the overflow menu. |
| `setRoutes(routes)` / `setNavExpandType(type)` | Reconfigure at runtime. |

### `ShellLayoutService`

The shell's layout for the current route. See [Shell layout](#shell-layout).

| Member | Description |
| ------ | ----------- |
| `fill` | Computed: the route set `shellLayout: 'fill'`. |
| `enabled` | Computed: the Settings switch — the person's choice, or `collapsibleShell` until they make one. |
| `collapsible` | Computed: the controls show. The person's choice when they've made one; otherwise `collapsibleShell` or the route's `shellCollapsed`. |
| `setEnabled(enabled)` | Turn the controls on or off for this app; saved on the device. |
| `headerCollapsed` / `navCollapsed` / `sidenavCollapsed` | Computed: which parts are collapsed. Always `false` when not `collapsible`. |
| `toggleHeader()` / `toggleNav()` / `toggleSidenav()` | Collapse or expand a part. |

### `SeasonIconService`

| Member | Description |
| ------ | ----------- |
| `getSeason()` | Current `Season` based on the equinox/solstice dates (Mar 20, Jun 21, Sep 22, Dec 21). |
| `getIcons(season)` | Icon names used for that season. |
| `setIcons(record)` | Override the icon set. Icons you supply must be registered with `provideIcons`. |

### `BaseCrudService<T, TCreate, TUpdate>`

Abstract base for HTTP CRUD services with `data`, `loading`, and `error`
signals. It has no knowledge of your environment config — pass a fully
resolved base URL:

```ts
@Injectable({ providedIn: 'root' })
export class WidgetsService extends BaseCrudService<Widget> {
  private readonly http = inject(HttpClient);

  constructor() {
    super(`${environment.apiBaseUrl}/api/v1/widgets`);
  }

  getData() {
    this._loading.set(true);
    return this.http.get<Widget[]>(this.base).pipe(
      tap((d) => this._data.set(d)),
      finalize(() => this._loading.set(false)),
    );
  }
  // create / update / delete …
}
```

Abstract methods: `getData()`, `create(data)`, `update(id, data)`, `delete(id)`.

The full signature is `BaseCrudService<T, TCreate = Omit<T, 'id'>, TUpdate = TCreate>`.
When the server sets fields such as `createdAt` or `createdBy`, pass narrower
input types so callers don't have to supply them:

```ts
type WidgetInput = Pick<Widget, 'name' | 'color'>;

export class WidgetsService extends BaseCrudService<Widget, WidgetInput, Partial<WidgetInput>> {
  create(data: WidgetInput) { /* … */ }
  update(id: string, data: Partial<WidgetInput>) { /* … */ }
}
```

---

## Validators

### `dateYMDValidator()`

Reactive-forms validator for `YYYY/MM/DD` strings. Returns
`{ invalidFormat: true }` for a bad format or `{ invalidDate: true }` for an
impossible date (e.g. `2026/02/30`). Empty values pass.

```ts
date = new FormControl('', [dateYMDValidator()]);
```

---

## Models & tokens

```ts
interface ThemeConfig {
  appName: string;
  routes: NavigationRoutes[];
  navExpandType?: NavExpandType; // default 'bottom-drawer'
  collapsibleShell?: boolean; // default false
}

interface ShellRouteData {
  shellLayout?: 'scroll' | 'fill'; // default 'scroll'
  shellCollapsed?: boolean;
}

interface NavigationRoutes {
  name: string;
  url: string;
  icon?: { name: string; config?: NgIconConfig };
}

type NavExpandType = 'sidenav' | 'bottom-drawer';
type ThemeMode = 'light' | 'dark' | 'party';
type Season = 'fall' | 'winter' | 'spring' | 'summer';
interface Toast { id: number; message: string; type: 'success' | 'error'; }

const HOME_THEME_TOKEN: InjectionToken<ThemeConfig>; // inject to read the config
// A component the shell renders in its account area (sidenav and mobile header).
// provideHousehold() sets it to the household badge.
const SHELL_ACCOUNT_COMPONENT: InjectionToken<Type<unknown>>;
```

---

## Households (`@home/ui/household`)

A separate entry point, so apps that only want the theme don't load it. Households live in
household-api (`/household-api/`); each app's backend checks membership with
`home-household-spring`, which reads the `X-Household-Id` header this sends.

### Setup

```ts
// app.config.ts
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { householdInterceptor, provideHousehold, sessionInterceptor } from '@home/ui/household';

providers: [
  provideHttpClient(withFetch(), withInterceptors([sessionInterceptor, householdInterceptor])),
  provideHousehold({ appId: 'budget' }), // also puts the household badge in the shell
  provideHomeTheme({ ... }),
]
```

```ts
// app.ts
@Component({
  selector: 'app-root',
  imports: [HouseholdGateComponent, ShellComponent],
  template: `
    <app-household-gate>
      <ng-template><app-shell /></ng-template>
    </app-household-gate>
  `,
})
export class App {}
```

The `<ng-template>` matters: the gate creates the app only once a household is chosen, so no
request leaves without `X-Household-Id`. Start loading app data from components inside it, not
from `App`'s constructor.

| `provideHousehold` option | Default | |
| --- | --- | --- |
| `appId` | required | Keys the saved choice (`home.household.<appId>` in localStorage). Every app shares one origin, so each needs its own. |
| `apiUrl` | `/household-api/api/v1` | household-api's base URL |
| `homeUrl` | `/` | The Home app, which hosts `household/welcome` and `household` |

### What the gate does

| `HouseholdContext.status()` | Shown |
| --- | --- |
| `loading` | A spinner while `GET /me` loads |
| `ready` | The app. One household is picked automatically; otherwise the saved choice for this app |
| `choose` | `HouseholdPickerComponent`: households by name and address, role, waiting invitations |
| `none` | Redirects to Home's `household/welcome?returnUrl=…` to accept an invitation or create a household |
| `error` | A retry button |

It also shows the "You've been signed out" banner when `sessionInterceptor` sees an expired
Cloudflare Access session.

Switching households (the badge's **Switch** button) reloads the page so no data from the
previous household stays on screen. If the app's API answers `403 NOT_A_MEMBER` or
`428 HOUSEHOLD_REQUIRED`, `householdInterceptor` forgets the saved choice and the gate asks again.
The header is only sent to URLs on the page's own origin, relative or absolute (so
`new URL(path, location.origin)` works too), other than household-api's.

### Exports

| Export | |
| --- | --- |
| `provideHousehold(config)` | Config and the shell badge |
| `householdInterceptor`, `sessionInterceptor` | Register with `withInterceptors` |
| `HouseholdGateComponent` | `<app-household-gate>` |
| `HouseholdPickerComponent`, `HouseholdBadgeComponent` | Used by the gate and the shell; usable on their own |
| `HouseholdContext` | `status`, `me`, `households`, `invites`, `current`, `currentId`, `select(id)`, `chooseAgain()`, `forget()`, `welcomeUrl()`, `manageUrl()` |
| `SessionService`, `apiErrorMessage(err)` | Signed-out state; a message for a failed call |
| `Me`, `HouseholdSummary`, `HouseholdInvite`, `Address`, `formatAddress(address)` | `/me`'s shapes |

---

## Real-time updates (`@home/ui/realtime`)

Keeps every device viewing a household up to date. The app's backend serves the stream with
home-household-spring 0.3.0 or later (`household.events.enabled: true`); this entry point reads it
and tells the app what to refetch. It builds on `@home/ui/household`.

```ts
provideHttpClient(withFetch(), withInterceptors([sessionInterceptor, householdInterceptor, clientIdInterceptor])),
provideHousehold({ appId: 'pet-qol' }),
provideRealtime({ apiUrl: '/pet-qol-api' }),
```

Then subscribe where the app keeps its data:

```ts
const events = inject(HouseholdEvents);
events.resync.subscribe(() => this.load());
events.on('pets').subscribe(() => this.reloadPets());
events.on('diary-entries').subscribe((change) => this.reloadDiary(change.parentId!));
```

| Export | What it does |
| --- | --- |
| `provideRealtime({ apiUrl, eventsPath?, hiddenGraceMs? })` | `apiUrl` is the app's API base. The stream is at `apiUrl + eventsPath` (default `/api/v1/events`). |
| `HouseholdEvents` | Connects once a household is chosen and reconnects with backoff (1 s doubling to 30 s). `changes` and `on(resource)` emit other tabs' and devices' changes; `resync` fires on every (re)connect; `connected` is a signal. |
| `clientIdInterceptor` | Adds `X-Client-Id` to writes to `apiUrl`, so a tab skips the events its own writes cause. |
| `CLIENT_ID` | This tab's id, new on every page load. |

Events carry ids only (`resource`, `action`, `id`, `parentId`), never data, so the app refetches
through its API. Reload everything on `resync`: the server ends each stream after 15 minutes, and
changes made while the stream was down aren't replayed. A tab hidden for `hiddenGraceMs` (default
60 s) closes its stream and resyncs when it's shown again.

The stream is read with `fetch` because `EventSource` can't send `X-Household-Id`. A
`403 NOT_A_MEMBER` or `428 HOUSEHOLD_REQUIRED` forgets the household, like `householdInterceptor`.

---

## Theme CSS

`@home/ui/theme.css` defines CSS custom properties per theme on
`html[data-theme='light' | 'dark' | 'party']` plus `.app-*` utility classes.
Use the classes for color, and Tailwind for layout and spacing.

**Variables:** `--theme-bg`, `--theme-surface`, `--theme-surface-muted`,
`--theme-surface-strong`, `--theme-border`, `--theme-border-subtle`,
`--theme-text`, `--theme-text-muted`, `--theme-text-subtle`,
`--theme-accent`, `--theme-accent-hover`, `--theme-accent-pressed`,
`--theme-accent-soft`, `--theme-accent-soft-strong`, `--theme-on-accent`,
`--theme-danger`, `--theme-danger-hover`, `--theme-danger-soft`,
`--theme-on-danger`, `--theme-warning`, `--theme-warning-soft`, `--theme-info`,
`--theme-info-soft`, `--theme-success`, `--theme-success-soft`,
`--theme-on-success`, `--theme-input-bg`, `--theme-overlay`, `--theme-select-chevron`.

Every text color reaches WCAG AA (4.5:1) on the backgrounds it's used with, in
light, dark and every party palette: `--theme-on-*` on its fill, the soft tints
under their color, and `--theme-text*` on the surfaces. Party colors are
lightened (and yellow tints darkened) per hue until they do.

**Utility classes:**

| Group | Classes |
| ----- | ------- |
| Surfaces | `app-shell-bg`, `app-surface`, `app-surface-muted`, `app-surface-strong`, `app-card` |
| Borders | `app-border`, `app-border-subtle`, `app-divide` |
| Text | `app-text`, `app-text-muted`, `app-text-subtle`, `app-text-accent`, `app-text-danger`, `app-text-success`, `app-text-warning`, `app-link` |
| Buttons | `app-button-primary`, `app-button-secondary`, `app-button-accent-soft`, `app-button-danger`, `app-button-danger-soft`, `app-icon-button` |
| Forms | `app-input`, `app-select`, `app-input-invalid` |
| Tags | `app-tag-info`, `app-tag-success`, `app-tag-warning`, `app-tag-danger` |
| Panels / tints | `app-accent-panel`, `app-danger-panel`, `app-highlight`, `app-highlight-soft`, `app-info-soft`, `app-success-soft`, `app-warning-soft`, `app-danger-soft` |
| Tables / rows | `app-table-head`, `app-row-hover`, `app-edit-row` |
| Navigation | `app-nav-link`, `app-nav-link-active`, `app-tab-link`, `app-tab-link-active` |
| Theme picker | `app-theme-group`, `app-theme-option`, `app-theme-option-active` |
| Misc | `app-empty-state`, `app-spinner`, `app-success-toast`, `app-toast-dismiss` |

```html
<button class="app-button-primary px-4 py-2 rounded-lg">Save</button>
<span class="app-tag-success px-2 py-0.5 rounded-full text-xs">Paid</span>
```

`app-select` replaces the browser's dropdown arrow with a themed chevron
(`appearance: none`) placed `0.75rem` from the right edge. `theme.css` doesn't
set padding, so leave room for the chevron yourself — `pr-9` fits it:

```html
<select class="app-select border rounded-lg pl-3 pr-9 py-2">…</select>
```

The chevron is skipped for `<select multiple>` and list boxes (`size` > 1), and
the native arrow returns in forced-colors (high-contrast) mode.

---

## Development

From the workspace root (`home/ui-app`):

```bash
ng build @home/ui        # build the library to dist/home/ui
pnpm build:lib           # clean build + npm pack (.tgz lands in builds/)
ng test @home/ui         # run library unit tests (Vitest)
pnpm start               # serve the demo app
```

The demo app resolves `@home/ui` through the `paths` mapping in the root
`tsconfig.json`, which points at `dist/home/ui` — build the library first.
