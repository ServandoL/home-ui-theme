import {Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NgIcon} from '@ng-icons/core';
import {NavigationService} from '../../services/navigation.service';

@Component({
  imports: [RouterLink, RouterLinkActive, NgIcon],
  selector: 'app-mobile-bottom-nav',
  templateUrl: './mobile-bottom-nav.component.html',
})
export class MobileBottomNavComponent {
  readonly navService = inject(NavigationService);

  openMoreMenu() {
    this.navService.openSideNav();
  }
}
