import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type BadgePosition =
  | 'above after'
  | 'above before'
  | 'below after'
  | 'below before'
  | 'above'
  | 'below'
  | 'before'
  | 'after';

export interface BadgeAtomProps extends BaseAtomProps {
  /** Text or number displayed inside the badge. */
  content?: string | number;
  color?: ColorIntent;
  size?: AtomicSize;
  position?: BadgePosition;
  overlap?: boolean;
  hidden?: boolean;
  /** Accessible description for screen readers. */
  description?: string;
  /** Fallback text when no content is projected. */
  label?: string;
  /** Fallback icon name when no content is projected. */
  icon?: string;
}
