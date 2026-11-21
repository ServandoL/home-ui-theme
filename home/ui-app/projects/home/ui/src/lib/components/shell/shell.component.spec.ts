import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHomeTheme, ThemeConfig } from '../../providers/provider';
import { SHELL_ACCOUNT_COMPONENT } from '../../providers/shell-account';
import { ShellComponent } from './shell.component';

@Component({ template: '' })
class Page {}

@Component({ selector: 'app-test-account', template: 'Account' })
class Account {}

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

  it('keeps the scrolling layout and no collapse controls by default', async () => {
    await render('/list');

    expect(main().className).toContain('overflow-y-auto');
    expect(main().className).toContain('pb-24');
    expect(button('Hide household')).toBeNull();
    expect(button('Hide navigation')).toBeNull();
    expect(button('Collapse sidebar')).toBeNull();
    expect(el.querySelector('#shell-header-account')!.hasAttribute('hidden')).toBe(false);
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
    await render('/list', { collapsibleShell: true });
    const toggle = button('Hide household')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    await fixture.whenStable();

    expect(button('Show household')!.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('#shell-header-account')!.hasAttribute('hidden')).toBe(true);
  });

  it('collapses the desktop sidebar to a rail', async () => {
    await render('/list', { collapsibleShell: true });
    button('Collapse sidebar')!.click();
    await fixture.whenStable();

    expect(el.querySelector('#desktop-sidenav')!.className).toContain('w-16');
    expect(el.querySelector('main')!.parentElement!.className).toContain('lg:pl-16');
    expect(el.querySelector('#desktop-sidenav a[title="Patterns"]')).not.toBeNull();
  });
});
