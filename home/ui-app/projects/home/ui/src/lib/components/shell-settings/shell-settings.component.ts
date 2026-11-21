import { Component } from '@angular/core';
import { ShellLayoutSwitchComponent } from './shell-layout-switch.component';

/**
 * The Layout section of a settings page: the collapse-controls switch in a card. Apps with their
 * own settings page add this beside `<app-theme-settings>`, or use `<app-shell-layout-switch>`
 * under their own heading.
 */
@Component({
  imports: [ShellLayoutSwitchComponent],
  selector: 'app-shell-settings',
  template: `
    <section class="app-card rounded-2xl p-4 shadow-sm" aria-labelledby="shell-settings-heading">
      <h2 id="shell-settings-heading" class="text-sm font-semibold app-text-muted mb-3">Layout</h2>
      <app-shell-layout-switch />
    </section>
  `,
})
export class ShellSettingsComponent {}
