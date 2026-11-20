import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type RadioLabelPosition = 'before' | 'after';

export interface RadioOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  labelPosition?: RadioLabelPosition;
  required?: boolean;
}

export interface RadioButtonAtomProps<T = string> extends BaseAtomProps {
  options: readonly RadioOption<T>[];
  value?: T;
  name?: string;
  labelPosition?: RadioLabelPosition;
  required?: boolean;
  disabledInteractive?: boolean;
  disableRipple?: boolean;
  vertical?: boolean;
  color?: ColorIntent;
  size?: AtomicSize;
}
