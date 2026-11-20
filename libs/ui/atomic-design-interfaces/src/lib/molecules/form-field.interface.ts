import type { AtomicSize, BaseMoleculeProps } from '../common/atomic.interface.js';

export type FormFieldAppearance = 'outlined' | 'filled';
export type FormFieldFloatLabel = 'auto' | 'always';
export type FormFieldSubscriptSizing = 'fixed' | 'dynamic';

/** Label, hint and error shell around a single form-control atom. */
export interface FormFieldMoleculeProps extends BaseMoleculeProps {
  label?: string;
  hint?: string;
  /** When set, replaces the hint and puts the field in an error presentation. */
  errorText?: string;
  appearance?: FormFieldAppearance;
  size?: AtomicSize;
  floatLabel?: FormFieldFloatLabel;
  subscriptSizing?: FormFieldSubscriptSizing;
  hideRequiredMarker?: boolean;
}
