import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, effect, inject, TemplateRef } from '@angular/core';
import { HouseholdContext } from './household-context.service';
import { HouseholdPickerComponent } from './household-picker.component';
import { SessionService } from './session';

/**
 * Renders the app only once a household is chosen, so no request to the app's API goes out
 * without `X-Household-Id`. Wrap the app in an `<ng-template>` so it isn't created early:
 *
 * ```html
 * <app-household-gate>
 *   <ng-template><app-shell /></ng-template>
 * </app-household-gate>
 * ```
 *
 * Someone with no household is sent to Home's welcome page; someone with several sees the
 * picker. It also shows the "signed out" banner when the Access session expires.
 */
@Component({
  selector: 'app-household-gate',
  standalone: true,
  imports: [NgTemplateOutlet, HouseholdPickerComponent],
  templateUrl: './household-gate.component.html',
})
export class HouseholdGateComponent {
  protected readonly context = inject(HouseholdContext);
  protected readonly session = inject(SessionService);
  protected readonly app = contentChild.required(TemplateRef);

  /** Overridable for tests. */
  navigate: (url: string) => void = (url) => location.assign(url);

  constructor() {
    void this.context.ensureLoaded();
    effect(() => {
      if (this.context.status() === 'none') this.navigate(this.context.welcomeUrl());
    });
  }
}
