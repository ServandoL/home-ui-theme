import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHomeTheme } from '../../providers/provider';
import { ShellLayoutService } from '../../services/shell-layout.service';
import { SettingsPageComponent } from '../settings-page/settings-page.component';
import { ShellLayoutSwitchComponent } from './shell-layout-switch.component';
import { ShellSettingsComponent } from './shell-settings.component';

@Component({ template: '' })
class Blank {}

describe('ShellSettingsComponent', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  function setup(collapsibleShell: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: Blank }]),
        provideHomeTheme({ appName: 'Test', routes: [], collapsibleShell }),
      ],
    });
  }

  it('is a labelled switch that shows the app’s default', async () => {
    setup(true);
    const fixture = TestBed.createComponent(ShellSettingsComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector<HTMLButtonElement>('[role="switch"]')!;

    expect(el.querySelector('h2')?.textContent).toContain('Layout');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    const label = el.querySelector(`#${toggle.getAttribute('aria-labelledby')}`);
    expect(label?.textContent).toContain('Collapsible header and navigation');
  });

  it('turns the collapse controls off and on', async () => {
    setup(false);
    const fixture = TestBed.createComponent(ShellSettingsComponent);
    await fixture.whenStable();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[role="switch"]',
    )!;
    const layout = TestBed.inject(ShellLayoutService);
    expect(toggle.getAttribute('aria-checked')).toBe('false');

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(layout.collapsible()).toBe(true);

    toggle.click();
    await fixture.whenStable();
    expect(layout.collapsible()).toBe(false);
  });

  it('comes bare, without the card or heading, for pages with their own sections', async () => {
    setup(true);
    const fixture = TestBed.createComponent(ShellLayoutSwitchComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h2')).toBeNull();
    expect(el.querySelector('.app-card')).toBeNull();
    expect(el.querySelector('[role="switch"]')!.getAttribute('aria-checked')).toBe('true');
  });

  it('is on the library’s settings page, after Appearance and Seasonal look', async () => {
    setup(false);
    const fixture = TestBed.createComponent(SettingsPageComponent);
    await fixture.whenStable();
    const headings = [...(fixture.nativeElement as HTMLElement).querySelectorAll('h2')];

    expect(headings.map((h) => h.textContent?.trim())).toEqual(['Appearance', 'Seasonal look', 'Layout']);
  });
});
