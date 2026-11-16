import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';
import type { ButtonVariant } from '../atoms/button.interface.js';

export interface SearchBarMoleculeProps extends BaseMoleculeProps {
  query?: string;
  placeholder?: string;
  label?: string;
  submitLabel?: string;
  buttonVariant?: ButtonVariant;
  buttonColor?: ColorIntent;
  size?: AtomicSize;
  disabled?: boolean;
  loading?: boolean;
}
