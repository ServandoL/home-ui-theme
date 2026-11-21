import { InjectionToken, Type } from '@angular/core';

/**
 * A component the shell renders in its account area: under the app name in the desktop
 * sidenav and in the mobile header. `provideHousehold()` from `@home/ui/household` sets it to
 * the household badge; without it the area is empty.
 */
export const SHELL_ACCOUNT_COMPONENT = new InjectionToken<Type<unknown>>('home.shell-account');

/**
 * A compact account component the shell renders while collapsed, so the account stays visible: as
 * an icon in the desktop rail, and beside the app name in the collapsed mobile header. It gets a
 * `variant` input, `'rail'` or `'header'`. `provideHousehold()` sets it to the compact household
 * badge.
 */
export const SHELL_ACCOUNT_COMPACT_COMPONENT = new InjectionToken<Type<unknown>>(
  'home.shell-account-compact',
);

export type ShellAccountVariant = 'rail' | 'header';
