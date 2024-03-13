import { AbstractControl, ValidatorFn } from "@angular/forms";

export function valueAlreadyUsedValidator(values: string[]): ValidatorFn {
    const lowerCaseValues = values.map(value => value.toLowerCase());

    return (control: AbstractControl): {[key: string]: any} | null => {
          return lowerCaseValues.includes(control.value.toLowerCase()) ? {valueAlreadyUsed: {value: control.value}} : null;
    }
}