import {computed, Service, signal} from '@angular/core';
import {NavigationRoutes} from '../models/routes.model';

@Service()
export class NavigationService {
  private readonly _isSideNavOpen = signal<boolean>(false);
  private readonly _routes = signal<NavigationRoutes[]>([]);
  public isSideNavOpen = this._isSideNavOpen.asReadonly();

  public mainRoutes = computed(() => {
    const routes = this._routes();
    return routes.length > 3 ? routes.slice(0, 3) : routes;
  });
  public sideNavRoutes = computed(() => {
    const routes = this._routes();
    return routes.length > 3 ? routes.slice(3) : [];
  })


  public setRoutes(routes: NavigationRoutes[]) {
    this._routes.set(routes);
  }

  openSideNav() {
    this._isSideNavOpen.set(true);
  }

  closeSideNav() {
    this._isSideNavOpen.set(false);
  }
}
