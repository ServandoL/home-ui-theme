import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ThemeMode, ThemeService } from '../../services/theme.service';

@Component({
  imports: [NgIcon],
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);

  setMode(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }
}
