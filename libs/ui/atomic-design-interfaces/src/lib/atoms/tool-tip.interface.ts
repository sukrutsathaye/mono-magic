import type { BaseAtomProps } from '../common/atomic.interface.js';

export type ToolTipPosition =
  | 'above'
  | 'below'
  | 'left'
  | 'right'
  | 'before'
  | 'after';

export type ToolTipTouchGestures = 'auto' | 'on' | 'off';

export interface ToolTipAtomProps extends BaseAtomProps {
  message: string;
  label?: string;
  position?: ToolTipPosition;
  showDelay?: number;
  hideDelay?: number;
  touchGestures?: ToolTipTouchGestures;
}
