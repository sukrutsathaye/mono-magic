import type { AtomicSize, BaseAtomProps } from '../common/atomic.interface.js';

export type TextInputVariant = 'outlined' | 'filled';

/**
 * Legacy composite text input (label + hint + error + control in one atom).
 * Kept for `react-mui` / `rn-paper`. Strict atomic libraries should use
 * {@link TextInputControlProps} together with the `form-field` molecule.
 */
export interface TextInputAtomProps extends BaseAtomProps {
  label: string;
  value?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  variant?: TextInputVariant;
  size?: AtomicSize;
  required?: boolean;
  readOnly?: boolean;
}

export type TextInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'number';

/**
 * A bare, single-element text input control. Label, hint and error are the
 * responsibility of the `form-field` molecule that wraps it.
 */
export interface TextInputControlProps extends BaseAtomProps {
  type?: TextInputType;
  name?: string;
  value?: string;
  placeholder?: string;
  size?: AtomicSize;
  required?: boolean;
  readOnly?: boolean;
  autocomplete?: string;
  minLength?: number;
  maxLength?: number;
}
