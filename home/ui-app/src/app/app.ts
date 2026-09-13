import { Component, signal } from '@angular/core';
import {ShellComponent} from '../../projects/home/ui/src/lib/components/shell/shell.component';

@Component({
  imports: [ShellComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('@home/ui-app');
}
