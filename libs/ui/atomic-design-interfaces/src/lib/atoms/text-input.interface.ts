import type { AtomicSize, BaseAtomProps } from '../common/atomic.interface.js';

export type TextInputVariant = 'outlined' | 'filled';

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
