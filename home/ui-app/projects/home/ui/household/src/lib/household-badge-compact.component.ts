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
          <ng-container *ngTemplateOutlet="houseIcon" />
        </button>
      } @else {
        <a
          class="app-nav-link flex h-10 w-10 items-center justify-center rounded-xl"
          [href]="context.manageUrl() + '/' + household.id"
          [title]="'Household: ' + household.name"
          [attr.aria-label]="'Household: ' + household.name + ', manage in Home'"
        >
          <ng-container *ngTemplateOutlet="houseIcon" />
        </a>
      }
    }

    <ng-template #houseIcon>
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
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
