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

/**
 * Structural kind of a button (optional, additive).
 * - `default`: label button (optionally with leading/trailing icon)
 * - `icon`: icon-only button
 * - `fab` / `mini-fab` / `extended-fab`: floating action buttons
 */
export type ButtonKind =
  | 'default'
  | 'icon'
  | 'fab'
  | 'mini-fab'
  | 'extended-fab';

/** Corner shape of a button. `default` keeps the design-system shape. */
export type ButtonShape = 'default' | 'square' | 'rounded' | 'pill';

export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonAtomProps extends BaseAtomProps {
  label: string;
  variant?: ButtonVariant;
  color?: ColorIntent;
  size?: AtomicSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
  /** Structural kind. Defaults to `default`. */
  kind?: ButtonKind;
  /** Corner shape. Defaults to the design-system shape. */
  shape?: ButtonShape;
  /** Keep the button focusable (and announced) while disabled. */
  disabledInteractive?: boolean;
  disableRipple?: boolean;
}
