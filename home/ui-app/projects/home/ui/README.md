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
pnpm build:lib          # builds dist/home/ui and runs `npm pack` inside it
```

Then, in the consuming app:

```bash
npm install /path/to/home-ui-<version>.tgz
```

Previously packed versions are kept in `builds/`.

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
| Mobile header | Sticky header (hidden at `lg`+) with `config.appName` and a light / dark / party theme toggle. |
| `<router-outlet>` | Your routed content, inside a scrollable `<main>` with bottom padding to clear the tab bar. |
| `<app-mobile-bottom-nav>` | Fixed bottom tab bar (hidden at `lg`+). |
| `<app-toast-container>` | Global toast stack driven by `ToastService`. |

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

> The shell is currently mobile-first: the header and bottom nav are hidden
> at the `lg` breakpoint and the content area reserves `lg:pl-64` for a
> desktop sidebar, which the consuming app must provide.

---

## Components

All components are standalone. Import them directly into your component's
`imports` array.

### `ShellComponent` — `<app-shell>`

See [App shell](#app-shell).

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

### `SeasonIconService`

| Member | Description |
| ------ | ----------- |
| `getSeason()` | Current `Season` based on the equinox/solstice dates (Mar 20, Jun 21, Sep 22, Dec 21). |
| `getIcons(season)` | Icon names used for that season. |
| `setIcons(record)` | Override the icon set. Icons you supply must be registered with `provideIcons`. |

### `BaseCrudService<T>`

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
```

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
`--theme-warning`, `--theme-warning-soft`, `--theme-info`,
`--theme-info-soft`, `--theme-success`, `--theme-success-soft`,
`--theme-input-bg`, `--theme-overlay`.

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

---

## Development

From the workspace root (`home/ui-app`):

```bash
ng build @home/ui        # build the library to dist/home/ui
pnpm build:lib           # clean build + npm pack (produces a .tgz)
ng test @home/ui         # run library unit tests (Vitest)
pnpm start               # serve the demo app
```

The demo app resolves `@home/ui` through the `paths` mapping in the root
`tsconfig.json`, which points at `dist/home/ui` — build the library first.
