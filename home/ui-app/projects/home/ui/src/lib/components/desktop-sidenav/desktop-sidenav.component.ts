import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { NavigationService } from '../../services/navigation.service';
import { HOME_THEME_TOKEN } from '../../providers/provider';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  imports: [RouterLink, RouterLinkActive, NgIcon, ThemeToggleComponent],
  selector: 'app-desktop-sidenav',
  templateUrl: './desktop-sidenav.component.html',
})
export class DesktopSidenavComponent {
  protected readonly navService = inject(NavigationService);
  protected readonly config = inject(HOME_THEME_TOKEN);
}
