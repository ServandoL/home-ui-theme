import { Component, computed, inject } from '@angular/core';
import { describeWindow, HOLIDAYS, SEASONAL_LOOKS, SeasonalChoice, SeasonalLook, SEASONS } from './seasonal-looks';
import { SeasonalThemeService } from './seasonal-theme.service';

/**
 * The seasonal look's choices, with their description: follow the date, turn it off, or keep one
 * look. `<app-seasonal-settings>` puts them in a card; a settings page with its own section style
 * puts them under its own heading.
 */
@Component({
  selector: 'app-seasonal-look-picker',
  host: { class: 'block' },
  template: `
      <p class="text-sm app-text-muted mb-3">
        Colors and decorations for the season, and for holidays around them. Saved on this device,
        for every home app.
      </p>

      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Seasonal look">
        <button type="button" [class]="optionClass('auto')" [attr.aria-pressed]="choice() === 'auto'" (click)="choose('auto')">
          <span class="font-semibold">Automatic</span>
          <span class="text-xs app-text-muted">Follows the date. Now: {{ automaticName() }}</span>
        </button>
        <button type="button" [class]="optionClass('off')" [attr.aria-pressed]="choice() === 'off'" (click)="choose('off')">
          <span class="font-semibold">Off</span>
          <span class="text-xs app-text-muted">The usual colors, no decorations</span>
        </button>
      </div>

      <p class="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide app-text-subtle">Or keep one</p>
      @for (group of groups; track group.label) {
        <div class="mb-3">
          <p class="mb-1.5 text-xs app-text-muted">{{ group.label }}</p>
          <div class="flex flex-wrap gap-2">
            @for (look of group.looks; track look) {
              <button
                type="button"
                class="inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3 text-sm transition-colors"
                [class]="choice() === look ? 'app-highlight-soft app-text font-semibold border-[var(--theme-accent)]' : 'app-surface app-border app-row-hover app-text'"
                [attr.aria-pressed]="choice() === look"
                [title]="windowOf(look)"
                (click)="choose(look)"
              >
                <span class="h-3 w-3 shrink-0 rounded-full" [style.background]="looks[look].swatch" aria-hidden="true"></span>
                {{ looks[look].name }}
              </button>
            }
          </div>
        </div>
      }

      @if (pinned(); as look) {
        <p class="text-xs app-text-subtle" aria-live="polite">
          Showing {{ looks[look].name }} every day. Usually {{ windowOf(look) }}.
        </p>
      }
  `,
})
export class SeasonalLookPickerComponent {
  private readonly seasonal = inject(SeasonalThemeService);

  protected readonly looks = SEASONAL_LOOKS;
  protected readonly choice = this.seasonal.choice;
  protected readonly automaticName = computed(() => SEASONAL_LOOKS[this.seasonal.automatic()].name);
  /** The one look kept, when the person picked one. */
  protected readonly pinned = computed<SeasonalLook | null>(() => {
    const choice = this.choice();
    return choice === 'auto' || choice === 'off' ? null : choice;
  });
  protected readonly groups = [
    { label: 'Seasons', looks: SEASONS },
    { label: 'Holidays', looks: HOLIDAYS },
  ];
  private readonly year = new Date().getFullYear();

  protected choose(choice: SeasonalChoice): void {
    this.seasonal.setChoice(choice);
  }

  protected windowOf(look: SeasonalLook): string {
    return describeWindow(look, this.year);
  }

  protected optionClass(choice: SeasonalChoice): string {
    const base = 'flex min-h-[44px] flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left text-sm transition-colors';
    return this.choice() === choice ? `${base} app-highlight-soft app-text border-[var(--theme-accent)]` : `${base} app-surface app-border app-row-hover app-text`;
  }
}

/**
 * The Seasonal look section of a settings page, as a card. `SettingsPageComponent` shows it; apps
 * with their own settings page add it beside `<app-theme-settings>`.
 */
@Component({
  selector: 'app-seasonal-settings',
  imports: [SeasonalLookPickerComponent],
  template: `
    <section class="app-card rounded-2xl p-4 shadow-sm" aria-labelledby="seasonal-settings-heading">
      <h2 id="seasonal-settings-heading" class="text-sm font-semibold app-text-muted mb-1">Seasonal look</h2>
      <app-seasonal-look-picker />
    </section>
  `,
})
export class SeasonalSettingsComponent {}
