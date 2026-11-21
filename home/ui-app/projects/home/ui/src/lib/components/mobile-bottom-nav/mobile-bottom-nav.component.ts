import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { NavigationService } from '../../services/navigation.service';
import { ShellLayoutService } from '../../services/shell-layout.service';

@Component({
  imports: [RouterLink, RouterLinkActive, NgIcon],
  selector: 'app-mobile-bottom-nav',
  templateUrl: './mobile-bottom-nav.component.html',
})
export class MobileBottomNavComponent {
  protected readonly navService = inject(NavigationService);
  protected readonly layout = inject(ShellLayoutService);

  openMoreMenu() {
    this.navService.openMenu();
  }

  toggleNav() {
    // A drawer left open would come back with the bar.
    if (!this.layout.navCollapsed()) this.navService.closeMenu();
    this.layout.toggleNav();
  }
}
