import { Component, input, output } from '@angular/core';
import { ConfirmDeleteActionsComponent } from '../confirm-delete-actions/confirm-delete-actions.component';

@Component({
  selector: 'app-mobile-record-card',
  standalone: true,
  imports: [ConfirmDeleteActionsComponent],
  templateUrl: 'mobile-record-card.component.html',
  host: { class: 'block mb-3 last:mb-0' },
})
export class MobileRecordCardComponent {
  readonly deleting = input(false);
  readonly deleteMessage = input('Delete this item?');

  readonly edit = output<void>();
  readonly requestDelete = output<void>();
  readonly confirmDelete = output<void>();
  readonly cancelDelete = output<void>();
}
