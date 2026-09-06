import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

type NumericControl = FormControl<number | null> | FormControl<number>;

@Component({
  selector: 'app-currency-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: 'currency-input.component.html',
})
export class CurrencyInputComponent {
  readonly control = input.required<NumericControl>();
  readonly label = input('');
  readonly required = input(false);
  readonly optionalLabel = input('');
  readonly placeholder = input('0.00');
  readonly min = input('0.01');
  readonly step = input('0.01');
  readonly containerClass = input('');
  readonly inputClass = input('');
  readonly errorText = input('');

  readonly invalid = computed(() => {
    const control = this.control();
    return control.invalid && control.touched;
  });

  readonly inputClasses = computed(() => {
    const classes = [
      'app-input w-full pl-8 pr-4 py-3 border rounded-xl text-base min-h-[44px]',
      this.inputClass(),
    ].filter(Boolean);

    if (this.invalid()) {
      classes.push('app-input-invalid');
    }

    return classes.join(' ');
  });
}
