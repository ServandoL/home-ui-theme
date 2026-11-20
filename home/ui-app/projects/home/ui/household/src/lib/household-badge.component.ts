import { Component, inject } from '@angular/core';
import { HouseholdContext } from './household-context.service';

/**
 * The current household, shown in the shell's account area. `provideHousehold()` puts it there;
 * Switch appears when the person has more than one household.
 */
@Component({
  selector: 'app-household-badge',
  standalone: true,
  templateUrl: './household-badge.component.html',
})
export class HouseholdBadgeComponent {
  protected readonly context = inject(HouseholdContext);
}
