import { Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MobileBottomNavComponent } from '../mobile-bottom-nav/mobile-bottom-nav.component';
import { ToastContainerComponent } from '../toast-container/toast-container.component';
import { DesktopSidenavComponent } from '../desktop-sidenav/desktop-sidenav.component';
import { HOME_THEME_TOKEN } from '../../providers/provider';
import { SHELL_ACCOUNT_COMPONENT } from '../../providers/shell-account';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastContainerComponent,
    MobileBottomNavComponent,
    DesktopSidenavComponent,
    NgComponentOutlet,
  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly config = inject(HOME_THEME_TOKEN);
  protected readonly account = inject(SHELL_ACCOUNT_COMPONENT, { optional: true });
}
