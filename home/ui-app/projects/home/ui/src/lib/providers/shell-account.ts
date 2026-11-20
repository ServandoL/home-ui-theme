import { InjectionToken, Type } from '@angular/core';

/**
 * A component the shell renders in its account area: under the app name in the desktop
 * sidenav and in the mobile header. `provideHousehold()` from `@home/ui/household` sets it to
 * the household badge; without it the area is empty.
 */
export const SHELL_ACCOUNT_COMPONENT = new InjectionToken<Type<unknown>>('home.shell-account');
