import {Component, inject} from '@angular/core';
import {NgIcon} from '@ng-icons/core';
import {RouterLink} from '@angular/router';
import {NavigationService} from '../../services/navigation.service';

@Component({
  imports: [
    NgIcon,
    RouterLink
  ],
  selector: 'app-mobile-sidenav-content',
  templateUrl: './mobile-sidenav-content.component.html',
})
export class MobileSidenavContentComponent {
  protected readonly navigationService = inject(NavigationService);

}
