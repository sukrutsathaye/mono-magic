import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type CheckBoxLabelPosition = 'before' | 'after';

export interface CheckBoxTask {
  id?: string;
  name: string;
  checked?: boolean;
  disabled?: boolean;
  subtasks?: readonly CheckBoxTask[];
}

export interface CheckBoxAtomProps extends BaseAtomProps {
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  required?: boolean;
  labelPosition?: CheckBoxLabelPosition;
  disableRipple?: boolean;
  disabledInteractive?: boolean;
  color?: ColorIntent;
  size?: AtomicSize;
  name?: string;
  checkboxValue?: string;
  tasks?: readonly CheckBoxTask[];
}
