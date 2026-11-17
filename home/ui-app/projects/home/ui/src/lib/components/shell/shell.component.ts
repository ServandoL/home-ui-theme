import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileBottomNavComponent } from '../mobile-bottom-nav/mobile-bottom-nav.component';
import { ToastContainerComponent } from '../toast-container/toast-container.component';
import { DesktopSidenavComponent } from '../desktop-sidenav/desktop-sidenav.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { HOME_THEME_TOKEN } from '../../providers/provider';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastContainerComponent,
    MobileBottomNavComponent,
    DesktopSidenavComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly config = inject(HOME_THEME_TOKEN);
}
