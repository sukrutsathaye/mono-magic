import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export interface SliderAtomProps extends BaseAtomProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  range?: boolean;
  startValue?: number;
  endValue?: number;
  discrete?: boolean;
  showTickMarks?: boolean;
  disableRipple?: boolean;
  color?: ColorIntent;
  size?: AtomicSize;
  displayWith?: (value: number) => string;
}
