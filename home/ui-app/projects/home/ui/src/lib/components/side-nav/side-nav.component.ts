import {Component, inject} from '@angular/core';
import {NavigationService} from '../../services/navigation.service';
import {RouterLink} from '@angular/router';
import {NgIcon} from '@ng-icons/core';

@Component({
  selector: 'app-mobile-sidenav',
  imports: [
    RouterLink,
    NgIcon
  ],
  templateUrl: './side-nav.component.html'
})
export class MobileSidenavComponent {
  protected readonly navigationService = inject(NavigationService);

  close() {
    this.navigationService.closeSideNav();
  }
}
