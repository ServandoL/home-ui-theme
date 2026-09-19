import {computed, DestroyRef, inject, Service, signal} from '@angular/core';
import {Overlay} from '@angular/cdk/overlay';
import {NavigationRoutes} from '../models/routes.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter, merge} from 'rxjs';
import {ComponentPortal} from '@angular/cdk/portal';
import { MobileSidenavContentComponent } from "../components/side-nav/mobile-sidenav-content.component";


const MAIN_ROUTE_COUNT = 3;

@Service()
export class NavigationService {
  private readonly overlay = inject(Overlay);
  private readonly overlayRef = this.overlay.create({
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-dark-backdrop',
    positionStrategy: this.overlay.position().global().right('0').top('0').bottom('0'),
  });

  private readonly _isSideNavOpen = signal(false);
  private readonly _routes = signal<NavigationRoutes[]>([]);

  readonly isSideNavOpen = this._isSideNavOpen.asReadonly();
  readonly mainRoutes = computed(() => this._routes().slice(0, MAIN_ROUTE_COUNT));
  readonly sideNavRoutes = computed(() => this._routes().slice(MAIN_ROUTE_COUNT));

  constructor() {
    this.overlayRef.attachments()
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._isSideNavOpen.set(true));

    this.overlayRef.detachments()
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._isSideNavOpen.set(false));

    merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.keydownEvents().pipe(filter(e => e.key === 'Escape')),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.closeSidenav());

    inject(DestroyRef).onDestroy(() => this.overlayRef.dispose());
  }

  setRoutes(routes: NavigationRoutes[]) {
    this._routes.set(routes);
  }

  openSidenav() {
    if (this.overlayRef.hasAttached()) return;
    this.overlayRef.attach(new ComponentPortal(MobileSidenavContentComponent));
  }

  closeSidenav() {
    this.overlayRef.detach(); // no-op when nothing is attached
  }

  toggleSidenav() {
    this.overlayRef.hasAttached() ? this.closeSidenav() : this.openSidenav();
  }
}
