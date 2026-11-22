import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHomeTheme, ThemeConfig } from '../../providers/provider';
import {
  SHELL_ACCOUNT_COMPACT_COMPONENT,
  SHELL_ACCOUNT_COMPONENT,
} from '../../providers/shell-account';
import { ShellComponent } from './shell.component';

@Component({ template: '' })
class Page {}

@Component({ selector: 'app-test-account', template: 'Account' })
class Account {}

@Component({ selector: 'app-test-compact', template: '<span class="compact">{{ variant() }}</span>' })
class CompactAccount {
  readonly variant = input('');
}

const routes: Routes = [
  { path: 'list', component: Page },
  { path: 'editor', component: Page, data: { shellLayout: 'fill', shellCollapsed: true } },
];

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal('localStorage', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  async function render(url: string, config: Partial<ThemeConfig> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHomeTheme({
          appName: 'Filet Crochet',
          routes: [{ name: 'Patterns', url: '/list' }],
          ...config,
        }),
        { provide: SHELL_ACCOUNT_COMPONENT, useValue: Account },
        { provide: SHELL_ACCOUNT_COMPACT_COMPONENT, useValue: CompactAccount },
      ],
    });
    await TestBed.inject(Router).navigateByUrl(url);
    fixture = TestBed.createComponent(ShellComponent);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  const main = () => el.querySelector('main')!;
  const nav = () => el.querySelector<HTMLElement>('#mobile-bottom-nav')!;
  const button = (label: string) => el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);

  it('starts collapsed, with the controls, on a first visit', async () => {
    await render('/list');

    expect(main().className).toContain('overflow-y-auto');
    expect(main().className).toContain('pb-16');
    expect(button('Show household')!.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('#shell-header-account')!.hasAttribute('hidden')).toBe(true);
    expect(nav().hasAttribute('inert')).toBe(true);
    expect(button('Show navigation')).not.toBeNull();
    expect(el.querySelector('#desktop-sidenav')!.className).toContain('w-16');
    expect(el.querySelector('#desktop-sidenav a[title="Patterns"]')).not.toBeNull();
  });

  it('links back to Home from the header and the sidebar', async () => {
    await render('/list');
    const homeLinks = () => el.querySelectorAll('a[href="/"]');

    expect(homeLinks().length).toBe(2);
    button('Expand sidebar')!.click();
    await fixture.whenStable();
    expect(homeLinks().length).toBe(2);
  });

  it('drops the Home link when the app is Home', async () => {
    await render('/list', { homeLink: false });

    expect(el.querySelectorAll('a[href="/"]').length).toBe(0);
  });

  it('keeps the account visible while collapsed: in the header and the rail', async () => {
    await render('/list');
    const compact = [...el.querySelectorAll('.compact')].map((c) => c.textContent);

    expect(compact).toEqual(['rail', 'header']);
  });

  it('drops the compact account once the header and sidebar expand', async () => {
    await render('/list');
    button('Show household')!.click();
    button('Expand sidebar')!.click();
    await fixture.whenStable();

    expect(el.querySelectorAll('.compact').length).toBe(0);
    expect(el.textContent).toContain('Account');
  });

  it('keeps the expanded layout and no controls when the app opts out', async () => {
    await render('/list', { collapsibleShell: false });

    expect(main().className).toContain('pb-24');
    expect(button('Show household')).toBeNull();
    expect(button('Hide navigation')).toBeNull();
    expect(button('Expand sidebar')).toBeNull();
    expect(el.querySelector('#shell-header-account')!.hasAttribute('hidden')).toBe(false);
    expect(nav().hasAttribute('inert')).toBe(false);
  });

  it('fills on a fill route and starts collapsed', async () => {
    await render('/editor');

    expect(main().className).toContain('overflow-hidden');
    expect(main().className).not.toContain('overflow-y-auto');
    expect(main().className).not.toContain('pb-18');
    expect(nav().hasAttribute('inert')).toBe(true);
    expect(nav().classList).toContain('translate-y-full');
    expect(el.querySelector('#shell-header-account')!.hasAttribute('hidden')).toBe(true);
    expect(el.querySelector('#desktop-sidenav')!.className).toContain('w-16');
  });

  it('shows the bottom nav again and pads for it', async () => {
    await render('/editor');
    button('Show navigation')!.click();
    await fixture.whenStable();

    expect(nav().hasAttribute('inert')).toBe(false);
    expect(main().className).toContain('pb-18');
    expect(button('Show navigation')).toBeNull();
    expect(button('Hide navigation')).not.toBeNull();
  });

  it('toggles the header and reports it', async () => {
    await render('/list');
    button('Show household')!.click();
    await fixture.whenStable();

    expect(button('Hide household')!.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('#shell-header-account')!.hasAttribute('hidden')).toBe(false);
  });

  it('expands the desktop sidebar from the rail', async () => {
    await render('/list');
    button('Expand sidebar')!.click();
    await fixture.whenStable();

    expect(el.querySelector('#desktop-sidenav')!.className).toContain('w-64');
    expect(el.querySelector('main')!.parentElement!.className).toContain('lg:pl-64');
    expect(button('Collapse sidebar')!.getAttribute('aria-expanded')).toBe('true');
  });
});
