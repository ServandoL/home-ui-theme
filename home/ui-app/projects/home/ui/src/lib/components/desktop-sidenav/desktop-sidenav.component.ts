import { Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { NavigationService } from '../../services/navigation.service';
import { HOME_THEME_TOKEN } from '../../providers/provider';
import { SHELL_ACCOUNT_COMPONENT } from '../../providers/shell-account';

@Component({
  imports: [RouterLink, RouterLinkActive, NgIcon, NgComponentOutlet],
  selector: 'app-desktop-sidenav',
  templateUrl: './desktop-sidenav.component.html',
})
export class DesktopSidenavComponent {
  protected readonly navService = inject(NavigationService);
  protected readonly config = inject(HOME_THEME_TOKEN);
  protected readonly account = inject(SHELL_ACCOUNT_COMPONENT, { optional: true });
}
