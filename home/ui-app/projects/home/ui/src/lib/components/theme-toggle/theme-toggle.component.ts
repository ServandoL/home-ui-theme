import { Component, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ThemeMode, ThemeService } from '../../services/theme.service';

@Component({
  imports: [NgIcon],
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);

  /** Show each mode's name beside its icon, where there's room (the settings page). */
  readonly labels = input(false);

  setMode(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }
}
