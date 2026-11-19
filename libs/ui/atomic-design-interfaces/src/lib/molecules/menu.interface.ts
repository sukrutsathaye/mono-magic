import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

export type MenuTriggerType = 'button' | 'icon';
export type MenuPositionX = 'before' | 'after';
export type MenuPositionY = 'above' | 'below';
export type MenuCloseReason = void | 'click' | 'keydown' | 'tab';

export interface MenuItem {
  id?: string;
  label: string;
  icon?: string;
  link?: string;
  disabled?: boolean;
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
  disableRipple?: boolean;
  children?: readonly MenuItem[];
}

export interface MenuMoleculeProps extends BaseMoleculeProps {
  items: readonly MenuItem[];
  triggerLabel?: string;
  triggerIcon?: string;
  triggerType?: MenuTriggerType;
  xPosition?: MenuPositionX;
  yPosition?: MenuPositionY;
  overlapTrigger?: boolean;
  hasBackdrop?: boolean;
  disabled?: boolean;
  size?: AtomicSize;
  color?: ColorIntent;
}
