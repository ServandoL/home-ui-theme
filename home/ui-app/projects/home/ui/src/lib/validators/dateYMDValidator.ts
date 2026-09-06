import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateYMDValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    // Strict YYYY/MM/DD format
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;

    if (!regex.test(value)) {
      return { invalidFormat: true };
    }

    // Validate actual date
    const [year, month, day] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    const isValid =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

    return isValid ? null : { invalidDate: true };
  };
}
