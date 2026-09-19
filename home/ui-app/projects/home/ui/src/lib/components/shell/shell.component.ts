import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NgIcon} from '@ng-icons/core';
import {MobileBottomNavComponent} from '../mobile-bottom-nav/mobile-bottom-nav.component';
import {ToastContainerComponent} from '../toast-container/toast-container.component';
import {ThemeMode, ThemeService} from '../../services/theme.service';
import {HOME_THEME_TOKEN} from '../../providers/provider';
import {NavigationService} from '../../services/navigation.service';
import {MobileSidenavContentComponent} from '../side-nav/mobile-sidenav-content.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastContainerComponent,
    NgIcon,
    MobileBottomNavComponent,
    MobileSidenavContentComponent,

  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly themeService = inject(ThemeService);
  readonly navigationService = inject(NavigationService);
  readonly config = inject(HOME_THEME_TOKEN);

  setMode(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }
}
