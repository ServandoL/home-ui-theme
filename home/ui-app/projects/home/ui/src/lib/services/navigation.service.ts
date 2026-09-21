import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { NavigationRoutes } from '../models/routes.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, merge } from 'rxjs';
import { ComponentPortal } from '@angular/cdk/portal';
import { MobileSidenavContentComponent } from '../components/side-nav/mobile-sidenav-content.component';
import { NavExpandType } from '../models/bottom-nav';

const MAIN_ROUTE_COUNT = 3;

@Service()
export class NavigationService {
  private readonly overlay = inject(Overlay);
  private readonly overlayRef = this.overlay.create({
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-dark-backdrop',
    positionStrategy: this.overlay.position().global().right('0').top('0').bottom('0'),
  });
  private readonly _navExpandType = signal<NavExpandType>('bottom-drawer');
  private readonly _isMenuOpen = signal(false);
  private readonly _routes = signal<NavigationRoutes[]>([]);

  readonly isMenuOpen = this._isMenuOpen.asReadonly();
  readonly mainRoutes = computed(() => this._routes().slice(0, MAIN_ROUTE_COUNT));
  readonly additionalRoutes = computed(() => this._routes().slice(MAIN_ROUTE_COUNT));
  readonly navExpandtype = this._navExpandType.asReadonly();
  readonly showSideMenu = computed(
    () => this._navExpandType() === 'sidenav' && this.additionalRoutes().length > 0,
  );
  readonly showAppDrawer = computed(
    () => this._navExpandType() === 'bottom-drawer' && this.additionalRoutes().length > 0,
  );

  constructor() {
    this.overlayRef
      .attachments()
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._isMenuOpen.set(true));

    this.overlayRef
      .detachments()
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._isMenuOpen.set(false));

    merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.keydownEvents().pipe(filter((e) => e.key === 'Escape')),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.closeSidenav());

    inject(DestroyRef).onDestroy(() => this.overlayRef.dispose());
  }

  openMenu() {
    if (this._navExpandType() === 'sidenav') {
      this.openSidenav();
    } else {
      this._isMenuOpen.set(true);
    }
  }

  closeMenu() {
    if (this._navExpandType() === 'sidenav') {
      this.closeSidenav();
    } else {
      this._isMenuOpen.set(false);
    }
  }

  setNavExpandType(value: NavExpandType): void {
    this._navExpandType.set(value);
  }

  setRoutes(routes: NavigationRoutes[]) {
    this._routes.set(routes);
  }

  private openSidenav() {
    if (this.overlayRef.hasAttached()) return;
    this.overlayRef.attach(new ComponentPortal(MobileSidenavContentComponent));
  }

  private closeSidenav() {
    this.overlayRef.detach(); // no-op when nothing is attached
  }

  toggleMenu() {
    this._isMenuOpen.update(curr => !curr);
  }

  toggleSidenav() {
    this.overlayRef.hasAttached() ? this.closeSidenav() : this.openSidenav();
  }
}
