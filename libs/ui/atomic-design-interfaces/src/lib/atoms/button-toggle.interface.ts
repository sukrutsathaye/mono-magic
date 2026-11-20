import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type ButtonToggleSelectionMode = 'single' | 'multiple';
export type ButtonToggleAppearance = 'standard' | 'legacy';

export interface ButtonToggleOption<T = string> {
  value: T;
  label: string;
  icon?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface ButtonToggleAtomProps<T = string> extends BaseAtomProps {
  options: readonly ButtonToggleOption<T>[];
  value?: T | readonly T[];
  selectionMode?: ButtonToggleSelectionMode;
  vertical?: boolean;
  appearance?: ButtonToggleAppearance;
  hideSelectionIndicator?: boolean;
  disabledInteractive?: boolean;
  size?: AtomicSize;
  color?: ColorIntent;
  name?: string;
  required?: boolean;
}
