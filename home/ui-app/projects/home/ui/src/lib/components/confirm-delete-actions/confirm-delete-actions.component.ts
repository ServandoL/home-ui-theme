import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-actions',
  standalone: true,
  templateUrl: 'confirm-delete-actions.component.html',
  // The message and buttons render straight into the host, so the host has
  // to be the flex row; a parent's flex/gap can't reach them.
  host: { class: 'flex flex-1 items-center gap-2' },
})
export class ConfirmDeleteActionsComponent {
  readonly message = input('Delete?');
  readonly confirmText = input('Yes');
  readonly cancelText = input('No');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
