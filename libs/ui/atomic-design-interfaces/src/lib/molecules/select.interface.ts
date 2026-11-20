import type { FormFieldMoleculeProps } from './form-field.interface.js';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup<T = string | number> {
  label: string;
  disabled?: boolean;
  options: readonly SelectOption<T>[];
}

export interface SelectMoleculeProps<T = string | number>
  extends FormFieldMoleculeProps {
  options?: readonly SelectOption<T>[];
  optionGroups?: readonly SelectOptionGroup<T>[];
  value?: T | readonly T[] | null;
  placeholder?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  disableRipple?: boolean;
  customTriggerSummary?: boolean;
  panelClass?: string;
}
