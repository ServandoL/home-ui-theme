import { Component } from '@angular/core';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

/** The Appearance section of a settings page. Apps with their own settings page add this to it. */
@Component({
  imports: [ThemeToggleComponent],
  selector: 'app-theme-settings',
  template: `
    <section class="app-card rounded-2xl p-4 shadow-sm" aria-labelledby="theme-settings-heading">
      <h2 id="theme-settings-heading" class="text-sm font-semibold app-text-muted">Appearance</h2>
      <p class="text-sm app-text-muted mt-1 mb-3">Saved on this device. Choose Party again for new colors.</p>
      <div class="inline-flex">
        <app-theme-toggle [labels]="true" />
      </div>
    </section>
  `,
})
export class ThemeSettingsComponent {}
