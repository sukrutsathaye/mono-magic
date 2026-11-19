import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type ProgressIndicatorType = 'bar' | 'spinner';
export type ProgressIndicatorMode =
  | 'determinate'
  | 'indeterminate'
  | 'buffer'
  | 'query';

export interface ProgressIndicatorAtomProps extends BaseAtomProps {
  type?: ProgressIndicatorType;
  mode?: ProgressIndicatorMode;
  value?: number;
  bufferValue?: number;
  diameter?: number;
  strokeWidth?: number;
  color?: ColorIntent;
  size?: AtomicSize;
}
