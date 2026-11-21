import { Component, computed, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { MobileBottomNavComponent } from '../mobile-bottom-nav/mobile-bottom-nav.component';
import { ToastContainerComponent } from '../toast-container/toast-container.component';
import { DesktopSidenavComponent } from '../desktop-sidenav/desktop-sidenav.component';
import { HOME_THEME_TOKEN } from '../../providers/provider';
import { SHELL_ACCOUNT_COMPONENT } from '../../providers/shell-account';
import { ShellLayoutService } from '../../services/shell-layout.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastContainerComponent,
    MobileBottomNavComponent,
    DesktopSidenavComponent,
    NgComponentOutlet,
    NgIcon,
  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly config = inject(HOME_THEME_TOKEN);
  protected readonly account = inject(SHELL_ACCOUNT_COMPONENT, { optional: true });
  protected readonly layout = inject(ShellLayoutService);

  // Whole class names, so Tailwind finds them when it scans the library.
  protected readonly contentClass = computed(() =>
    this.layout.sidenavCollapsed() ? 'lg:pl-16' : 'lg:pl-64',
  );
  protected readonly mainClass = computed(() => {
    if (!this.layout.fill()) {
      return this.layout.navCollapsed()
        ? 'overflow-y-auto pb-16 lg:pb-6'
        : 'overflow-y-auto pb-24 lg:pb-6';
    }
    // The page scrolls itself; leave room for the fixed bottom nav while it's showing.
    return this.layout.navCollapsed()
      ? 'flex flex-col min-h-0 overflow-hidden'
      : 'flex flex-col min-h-0 overflow-hidden pb-18 lg:pb-0';
  });
  protected readonly headerClass = computed(() => {
    const position = this.layout.fill() ? 'shrink-0' : 'sticky top-0';
    return this.layout.headerCollapsed() ? `${position} py-2` : `${position} pt-4 pb-3`;
  });
}
