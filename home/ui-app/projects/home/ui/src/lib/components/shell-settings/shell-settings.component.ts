import { Component, inject } from '@angular/core';
import { ShellLayoutService } from '../../services/shell-layout.service';

/**
 * The Layout section of a settings page: a switch for the shell's collapse controls, saved per app
 * on this device. Apps with their own settings page add this beside `<app-theme-settings>`.
 */
@Component({
  selector: 'app-shell-settings',
  template: `
    <section class="app-card rounded-2xl p-4 shadow-sm" aria-labelledby="shell-settings-heading">
      <h2 id="shell-settings-heading" class="text-sm font-semibold app-text-muted">Layout</h2>
      <div class="mt-3 flex items-start justify-between gap-4">
        <div>
          <p id="shell-settings-label" class="text-sm font-medium app-text">
            Collapsible header and navigation
          </p>
          <p id="shell-settings-description" class="text-sm app-text-muted mt-0.5">
            Adds buttons that hide the header, bottom navigation and sidebar. Saved on this device
            for this app.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)]"
          [class]="layout.enabled() ? 'bg-[var(--theme-accent)]' : 'bg-[var(--theme-text-subtle)]'"
          [attr.aria-checked]="layout.enabled()"
          aria-labelledby="shell-settings-label"
          aria-describedby="shell-settings-description"
          (click)="layout.setEnabled(!layout.enabled())"
        >
          <span
            aria-hidden="true"
            class="inline-block h-5 w-5 rounded-full shadow transition-transform"
            [class]="
              layout.enabled()
                ? 'translate-x-6 bg-[var(--theme-on-accent)]'
                : 'translate-x-1 bg-[var(--theme-surface)]'
            "
          ></span>
        </button>
      </div>
    </section>
  `,
})
export class ShellSettingsComponent {
  protected readonly layout = inject(ShellLayoutService);
}
