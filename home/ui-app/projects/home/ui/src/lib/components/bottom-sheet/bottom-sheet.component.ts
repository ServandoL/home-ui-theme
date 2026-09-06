import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  templateUrl: 'bottom-sheet.component.html',
})
export class BottomSheetComponent {
  readonly open = input.required<boolean>();
  readonly title = input<string>('');
  readonly closeRequested = output<void>();
}
