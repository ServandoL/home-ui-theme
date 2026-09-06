import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-actions',
  standalone: true,
  templateUrl: 'confirm-delete-actions.component.html',
})
export class ConfirmDeleteActionsComponent {
  readonly message = input('Delete?');
  readonly confirmText = input('Yes');
  readonly cancelText = input('No');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
