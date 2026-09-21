import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { MobileBottomNavComponent } from '../mobile-bottom-nav/mobile-bottom-nav.component';
import { ToastContainerComponent } from '../toast-container/toast-container.component';
import { ThemeMode, ThemeService } from '../../services/theme.service';
import { HOME_THEME_TOKEN } from '../../providers/provider';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, NgIcon, MobileBottomNavComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly themeService = inject(ThemeService);
  readonly config = inject(HOME_THEME_TOKEN);

  setMode(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }
}
