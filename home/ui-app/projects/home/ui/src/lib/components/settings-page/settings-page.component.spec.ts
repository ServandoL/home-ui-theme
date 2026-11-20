import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHomeTheme } from '../../providers/provider';
import { ThemeService } from '../../services/theme.service';
import { ShellComponent } from '../shell/shell.component';
import { SettingsPageComponent } from './settings-page.component';

@Component({ template: '' })
class Blank {}

describe('Theme switch', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Blank }]), provideHomeTheme({ appName: 'Test', routes: [] })],
    });
  });

  it('is not in the shell', async () => {
    const fixture = TestBed.createComponent(ShellComponent);
    await fixture.whenStable();
    const shell = fixture.nativeElement as HTMLElement;

    expect(shell.querySelector('[aria-label="Theme"]')).toBeNull();
    expect(shell.textContent).not.toContain('Appearance');
  });

  it('is on the settings page, labelled, and changes the theme', async () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const buttons = [...page.querySelectorAll<HTMLButtonElement>('[aria-label="Theme"] button')];

    expect(page.querySelector('h2')?.textContent).toContain('Appearance');
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(['Light', 'Dark', 'Party']);

    buttons[1].click();
    await fixture.whenStable();
    expect(TestBed.inject(ThemeService).mode()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
  });
});
