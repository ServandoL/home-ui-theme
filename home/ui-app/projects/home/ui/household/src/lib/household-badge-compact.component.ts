import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ShellAccountVariant } from '@home/ui';
import { HouseholdContext } from './household-context.service';

/**
 * The current household while the shell is collapsed. In the desktop rail it's an icon that links
 * to the household in Home, or switches household when there's more than one; in the collapsed
 * mobile header it's the household's name. `provideHousehold()` puts it in the shell.
 */
@Component({
  selector: 'app-household-badge-compact',
  template: `
    @if (context.current(); as household) {
      @if (variant() === 'header') {
        <span class="block truncate text-sm app-text-muted">
          <span class="sr-only">Household: </span>{{ household.name }}
        </span>
      } @else if (context.households().length > 1) {
        <button
          type="button"
          class="app-nav-link flex h-10 w-10 items-center justify-center rounded-xl"
          [title]="'Switch household (now ' + household.name + ')'"
          [attr.aria-label]="'Switch household, now ' + household.name"
          (click)="context.chooseAgain()"
        >
          <ng-container *ngTemplateOutlet="householdIcon" />
        </button>
      } @else {
        <a
          class="app-nav-link flex h-10 w-10 items-center justify-center rounded-xl"
          [href]="context.manageUrl() + '/' + household.id"
          [title]="'Household: ' + household.name"
          [attr.aria-label]="'Household: ' + household.name + ', manage in Home'"
        >
          <ng-container *ngTemplateOutlet="householdIcon" />
        </a>
      }
    }

    <!-- A group of people, not a house: apps often use a house for their Home route. -->
    <ng-template #householdIcon>
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
})
export class HouseholdBadgeCompactComponent {
  protected readonly context = inject(HouseholdContext);
  readonly variant = input<ShellAccountVariant>('rail');
}
