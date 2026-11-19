import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type SlideToggleLabelPosition = 'before' | 'after';

export interface SlideToggleAtomProps extends BaseAtomProps {
  label?: string;
  checked?: boolean;
  required?: boolean;
  hideIcon?: boolean;
  labelPosition?: SlideToggleLabelPosition;
  disableRipple?: boolean;
  disabledInteractive?: boolean;
  color?: ColorIntent;
  size?: AtomicSize;
  name?: string;
}
