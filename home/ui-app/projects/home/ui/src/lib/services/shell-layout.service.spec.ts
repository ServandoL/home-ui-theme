import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HOME_THEME_TOKEN, ThemeConfig } from '../providers/provider';
import { ShellLayoutService } from './shell-layout.service';

@Component({ template: '' })
class Page {}

const routes: Routes = [
  { path: 'list', component: Page },
  { path: 'editor', component: Page, data: { shellLayout: 'fill', shellCollapsed: true } },
  { path: 'other-editor', component: Page, data: { shellCollapsed: true } },
  { path: 'parent', data: { shellLayout: 'fill' }, children: [{ path: 'child', component: Page }] },
];

const STORAGE_KEY = 'home.shell.filet-crochet';

describe('ShellLayoutService', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  function setup(config: Partial<ThemeConfig> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        {
          provide: HOME_THEME_TOKEN,
          useValue: { appName: 'Filet Crochet', routes: [], collapsibleShell: true, ...config },
        },
      ],
    });
    return { router: TestBed.inject(Router), service: () => TestBed.inject(ShellLayoutService) };
  }

  it('scrolls and starts with every part collapsed on a first visit', async () => {
    const { router, service } = setup();
    await router.navigateByUrl('/list');

    expect(service().fill()).toBe(false);
    expect(service().headerCollapsed()).toBe(true);
    expect(service().navCollapsed()).toBe(true);
    expect(service().sidenavCollapsed()).toBe(true);
  });

  it('turns the controls on when the app doesn’t set collapsibleShell', async () => {
    const { router, service } = setup({ collapsibleShell: undefined });
    await router.navigateByUrl('/list');

    expect(service().enabled()).toBe(true);
    expect(service().collapsible()).toBe(true);
    expect(service().navCollapsed()).toBe(true);
  });

  it('reads the route that was open before the service was created', async () => {
    const { router, service } = setup();
    await router.navigateByUrl('/editor');

    expect(service().fill()).toBe(true);
    expect(service().navCollapsed()).toBe(true);
  });

  it('applies a parent route’s data to its children', async () => {
    const { router, service } = setup();
    await router.navigateByUrl('/parent/child');

    expect(service().fill()).toBe(true);
  });

  it('saves toggles made on an ordinary route', async () => {
    const { router, service } = setup();
    await router.navigateByUrl('/list');
    service().toggleNav();

    expect(service().navCollapsed()).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      header: true,
      nav: false,
      sidenav: true,
      enabled: null,
    });
  });

  it('restores saved choices on load', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sidenav: false }));
    const { router, service } = setup();
    await router.navigateByUrl('/list');

    expect(service().sidenavCollapsed()).toBe(false);
    // Parts with nothing saved keep the collapsed default.
    expect(service().headerCollapsed()).toBe(true);
  });

  it('keeps expansions on a collapsed route for that visit only', async () => {
    const { router, service } = setup();
    await router.navigateByUrl('/editor');
    service().toggleHeader();
    expect(service().headerCollapsed()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Same route, new query params: still expanded.
    await router.navigateByUrl('/editor?mode=view');
    expect(service().headerCollapsed()).toBe(false);

    // Leaving brings back the saved choice: collapsed, the default.
    await router.navigateByUrl('/list');
    expect(service().headerCollapsed()).toBe(true);

    await router.navigateByUrl('/editor');
    expect(service().headerCollapsed()).toBe(true);
  });

  it('starts each collapsed route collapsed', async () => {
    const { router, service } = setup();
    await router.navigateByUrl('/editor');
    service().toggleNav();

    await router.navigateByUrl('/other-editor');
    expect(service().navCollapsed()).toBe(true);
  });

  it('never collapses when the app opts out and the route doesn’t ask', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ header: true, nav: true, sidenav: true }));
    const { router, service } = setup({ collapsibleShell: false });
    await router.navigateByUrl('/list');

    expect(service().collapsible()).toBe(false);
    expect(service().navCollapsed()).toBe(false);
  });

  it('shows the controls on a collapsed route even without collapsibleShell', async () => {
    const { router, service } = setup({ collapsibleShell: false });
    await router.navigateByUrl('/editor');

    expect(service().collapsible()).toBe(true);
    expect(service().navCollapsed()).toBe(true);
  });

  it('starts the Settings switch at the app’s default', async () => {
    const on = setup();
    await on.router.navigateByUrl('/list');
    expect(on.service().enabled()).toBe(true);

    TestBed.resetTestingModule();
    const off = setup({ collapsibleShell: false });
    await off.router.navigateByUrl('/list');
    expect(off.service().enabled()).toBe(false);
  });

  it('turns the controls off everywhere, even on a collapsed route, and saves it', async () => {
    const { router, service } = setup();
    await router.navigateByUrl('/editor');
    service().setEnabled(false);

    expect(service().enabled()).toBe(false);
    expect(service().collapsible()).toBe(false);
    expect(service().headerCollapsed()).toBe(false);
    expect(service().navCollapsed()).toBe(false);
    expect(service().sidenavCollapsed()).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).enabled).toBe(false);
  });

  it('turns the controls on for an app that opts out, starting collapsed', async () => {
    const { router, service } = setup({ collapsibleShell: false });
    await router.navigateByUrl('/list');
    service().setEnabled(true);

    expect(service().collapsible()).toBe(true);
    expect(service().sidenavCollapsed()).toBe(true);
    service().toggleSidenav();
    expect(service().sidenavCollapsed()).toBe(false);
  });

  it('remembers the switch and the collapsed parts once turned back on', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nav: true, enabled: false }));
    const { router, service } = setup();
    await router.navigateByUrl('/list');
    expect(service().navCollapsed()).toBe(false);

    service().setEnabled(true);
    expect(service().navCollapsed()).toBe(true);
  });

  it('works when localStorage is unavailable', async () => {
    vi.stubGlobal('localStorage', undefined);
    const { router, service } = setup();
    await router.navigateByUrl('/list');

    expect(() => service().toggleNav()).not.toThrow();
    expect(service().navCollapsed()).toBe(false);
  });

  it('works when localStorage throws or holds something else', async () => {
    const throwing = createStorageMock();
    throwing.setItem = () => {
      throw new Error('blocked');
    };
    throwing.getItem = () => '{not json';
    vi.stubGlobal('localStorage', throwing);
    const { router, service } = setup();
    await router.navigateByUrl('/list');

    expect(service().navCollapsed()).toBe(true);
    expect(() => service().toggleNav()).not.toThrow();
    expect(service().navCollapsed()).toBe(false);
  });
});

function createStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}
