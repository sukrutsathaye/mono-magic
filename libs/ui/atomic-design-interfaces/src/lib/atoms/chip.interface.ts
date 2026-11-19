import type {
  AtomicSize,
  BaseAtomProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type ChipVariant = 'basic' | 'selectable' | 'input' | 'draggable';
export type ChipOrientation = 'horizontal' | 'vertical';

export interface ChipItem {
  id?: string;
  label: string;
  removable?: boolean;
  disabled?: boolean;
  editable?: boolean;
  selectable?: boolean;
  selected?: boolean;
  avatarSrc?: string;
  avatarAlt?: string;
  leadingIcon?: string;
}

export interface ChipAtomProps extends BaseAtomProps {
  chips?: readonly ChipItem[];
  label?: string;
  variant?: ChipVariant;
  color?: ColorIntent;
  size?: AtomicSize;
  removable?: boolean;
  editable?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  hideSelectionIndicator?: boolean;
  orientation?: ChipOrientation;
  disableRipple?: boolean;
  inputPlaceholder?: string;
}
