import { Component, inject } from '@angular/core';
import { ShellLayoutService } from '../../services/shell-layout.service';

/**
 * The switch for the shell's collapse controls, with its label and description, saved per app on
 * this device. `<app-shell-settings>` puts it in a card; a settings page with its own section
 * style puts it under its own heading.
 */
@Component({
  selector: 'app-shell-layout-switch',
  template: `
    <div class="flex items-start justify-between gap-4">
      <div>
        <p id="shell-layout-switch-label" class="text-sm font-medium app-text">
          Collapsible header and navigation
        </p>
        <p id="shell-layout-switch-description" class="text-sm app-text-muted mt-0.5">
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
        aria-labelledby="shell-layout-switch-label"
        aria-describedby="shell-layout-switch-description"
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
  `,
})
export class ShellLayoutSwitchComponent {
  protected readonly layout = inject(ShellLayoutService);
}
