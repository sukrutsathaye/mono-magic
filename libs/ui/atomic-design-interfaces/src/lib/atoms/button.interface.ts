import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type ButtonVariant =
  | 'filled'
  | 'tonal'
  | 'outlined'
  | 'elevated'
  | 'text';

export interface ButtonAtomProps extends BaseAtomProps {
  label: string;
  variant?: ButtonVariant;
  color?: ColorIntent;
  size?: AtomicSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
}
