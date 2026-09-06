import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIcon],
  templateUrl: 'empty-state.component.html',
})
export class EmptyStateComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
