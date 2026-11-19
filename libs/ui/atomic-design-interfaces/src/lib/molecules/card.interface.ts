import type { ButtonVariant } from '../atoms/button.interface.js';
import type { ChipItem } from '../atoms/chip.interface.js';
import type { BaseMoleculeProps, ColorIntent } from '../common/atomic.interface.js';

export type CardAppearance = 'outlined' | 'raised';
export type CardVariant = 'basic' | 'with-actions' | 'with-chips';
export type CardImageSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'extra-large'
  | 'full';

export interface CardActionItem {
  id?: string;
  label: string;
  variant?: ButtonVariant;
  color?: ColorIntent;
  icon?: string;
  disabled?: boolean;
}

export interface CardMoleculeProps extends BaseMoleculeProps {
  title?: string;
  subtitle?: string;
  content?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageSize?: CardImageSize;
  appearance?: CardAppearance;
  variant?: CardVariant;
  width?: string;
  actions?: readonly CardActionItem[];
  chips?: readonly ChipItem[];
  alignActions?: 'start' | 'end';
}
