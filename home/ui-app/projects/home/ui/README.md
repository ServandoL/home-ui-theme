# shared-ui

Reusable Angular theme system, generic services, and shared UI components,
extracted from the `home-budget` app so they can be consumed by other
Angular projects.

## What's included

- **`ThemeService`** — light/dark/"party" theme switching with CSS custom
  properties, persisted to `localStorage`.
- **`theme.css`** (shipped as a library asset) — CSS custom properties for
  the three theme modes plus `.app-*` utility classes (buttons, cards, tags,
  inputs, etc.) that style consuming apps' markup.
- **`ToastService` + `ToastContainerComponent`** — simple success/error toast
  notifications.
- **`BaseCrudService<T>`** — generic abstract HTTP CRUD base class. Extend it
  with a fully-resolved base URL (e.g. `` `${environment.apiBaseUrl}/api/v1/things` ``);
  it does not depend on any app-specific configuration.
- **Shared components**: `BottomSheetComponent`, `ConfirmDeleteActionsComponent`,
  `EmptyStateComponent`, `CurrencyInputComponent`, `MobileRecordCardComponent`.
- **`dateYMDValidator`** — reactive forms validator for `YYYY/MM/DD` date
  strings.

## Usage

### Install / link

Within this workspace the app already resolves the library via the
`shared-ui` TypeScript path mapping (see root `tsconfig.json`), which points
at `dist/shared-ui`. Build the library before building/serving the app:

```bash
ng build shared-ui
```

To consume this library from a different project/repo, publish the built
package (`dist/shared-ui`) to npm or a private registry:

```bash
cd dist/shared-ui
npm publish
```

### Importing

```ts
import {
  ThemeService,
  ToastService,
  ToastContainerComponent,
  BaseCrudService,
  BottomSheetComponent,
  ConfirmDeleteActionsComponent,
  EmptyStateComponent,
  CurrencyInputComponent,
  MobileRecordCardComponent,
  dateYMDValidator,
} from 'shared-ui'; // or '@your-scope/shared-ui' once published
```

### Theme CSS

Import the library's theme stylesheet from your global styles, after
Tailwind (the utility classes rely on Tailwind for layout, but the theme
variables/colors are plain CSS and work without Tailwind too):

```css
@import 'tailwindcss';
@import 'shared-ui/theme.css'; /* adjust path based on how you consume the package */
```

Then set `<html data-theme="light|dark|party">` — `ThemeService.initialize()`
and `ThemeService.setMode()` manage this attribute for you.

### BaseCrudService

`BaseCrudService` intentionally has no knowledge of your app's environment
config. Pass the fully-resolved base URL from your own service:

```ts
@Injectable({ providedIn: 'root' })
export class WidgetsService extends BaseCrudService<Widget> {
  private readonly http = inject(HttpClient);

  constructor() {
    super(`${environment.apiBaseUrl}/api/v1/widgets`);
  }
  // implement getData/create/update/delete using `this.base` and `this.http`
}
```

## Building

```bash
ng build shared-ui
```

Build artifacts (including `theme.css`) are placed in `dist/shared-ui`.

## Running unit tests

```bash
ng test shared-ui
```
