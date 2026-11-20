import { Component, inject } from '@angular/core';
import { HouseholdContext } from './household-context.service';
import { formatAddress } from './models';

/** Lists the person's households by name and address; choosing one enters it. */
@Component({
  selector: 'app-household-picker',
  standalone: true,
  templateUrl: './household-picker.component.html',
})
export class HouseholdPickerComponent {
  protected readonly context = inject(HouseholdContext);
  protected readonly formatAddress = formatAddress;
}
