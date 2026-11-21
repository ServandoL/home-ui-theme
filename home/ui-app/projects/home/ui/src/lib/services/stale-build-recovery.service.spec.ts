import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { provideRouter, Router, Routes } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { isStaleBuildError, StaleBuildRecovery } from './stale-build-recovery.service';

@Component({ template: '' })
class Page {}

const chromeError = () =>
  new TypeError('Failed to fetch dynamically imported module: https://home.example/chunk-rcA_oFOD.js');

const routes: Routes = [
  { path: 'home', component: Page },
  { path: 'household', loadComponent: () => Promise.reject(chromeError()) },
  { path: 'broken', loadComponent: () => Promise.reject(new Error('Cannot read properties of undefined')) },
];

describe('isStaleBuildError', () => {
  it.each([
    ['Chrome and Edge', chromeError()],
    ['Firefox', new TypeError('error loading dynamically imported module: https://home.example/chunk-x.js')],
    ['Safari', new TypeError('Importing a module script failed.')],
    [
      'a chunk answered with HTML',
      new TypeError(
        "Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of \"text/html\". Strict MIME type checking is enforced for module scripts per HTML spec. 'text/html' is not a valid JavaScript MIME type.",
      ),
    ],
  ])('recognises %s', (_browser, error) => {
    expect(isStaleBuildError(error)).toBe(true);
  });

  it('ignores errors from the app itself', () => {
    expect(isStaleBuildError(new Error('Cannot read properties of undefined'))).toBe(false);
    expect(isStaleBuildError(undefined)).toBe(false);
  });
});

describe('StaleBuildRecovery', () => {
  let reload: Mock<(url: string) => void>;

  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function setup(baseHref = '/') {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: APP_BASE_HREF, useValue: baseHref }],
    });
    const recovery = TestBed.inject(StaleBuildRecovery);
    reload = vi.fn<(url: string) => void>();
    (recovery as unknown as { reload: (url: string) => void }).reload = reload;
    recovery.start();
    return TestBed.inject(Router);
  }

  async function navigate(router: Router, url: string) {
    await router.navigateByUrl(url).catch(() => undefined);
  }

  it('reloads at the page the person was going to when its chunk is gone', async () => {
    const router = setup();
    await navigate(router, '/home');
    await navigate(router, '/household');
    expect(reload).toHaveBeenCalledExactlyOnceWith('/household');
  });

  it('keeps the base href, for apps served under a path', async () => {
    const router = setup('/budget/');
    await navigate(router, '/household');
    expect(reload).toHaveBeenCalledExactlyOnceWith('/budget/household');
  });

  it("doesn't reload for an error in the app's own code", async () => {
    const router = setup();
    await navigate(router, '/broken');
    expect(reload).not.toHaveBeenCalled();
  });

  it("doesn't loop when the page still fails right after a reload", async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const router = setup();
    await navigate(router, '/household');
    // The reloaded page fails the same way: the build itself is broken.
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await navigate(router, '/household');
    expect(reload).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();

    // A minute later it's worth another try (say, after the next deploy).
    vi.setSystemTime(Date.now() + 61_000);
    await navigate(router, '/household');
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('still reloads once when storage is blocked', async () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('SecurityError');
      },
    });
    const router = setup();
    await navigate(router, '/household');
    expect(reload).toHaveBeenCalledOnce();
  });

  it('subscribes once however often it is started', async () => {
    const router = setup();
    TestBed.inject(StaleBuildRecovery).start();
    await navigate(router, '/household');
    expect(reload).toHaveBeenCalledOnce();
  });
});

function createStorageMock(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, String(value)),
  };
}
