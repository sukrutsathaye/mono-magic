import type { ButtonVariant } from '../atoms/button.interface.js';
import type {
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

/** Responsive width preset for `MagicDialog`. */
export type DialogSize = 'sm' | 'md' | 'lg' | 'fullscreen';

/** Ordered list of supported dialog size presets. */
export const DIALOG_SIZES: readonly DialogSize[] = [
  'sm',
  'md',
  'lg',
  'fullscreen',
] as const;

/** Action button descriptor rendered inside a `MagicDialog` footer. */
export interface DialogActionItem {
  /** Optional unique identifier for the action. */
  id?: string;
  /** Button text label. */
  label: string;
  /** Optional button emphasis variant. */
  variant?: ButtonVariant;
  /** Optional semantic color intent. */
  color?: ColorIntent;
  /** Optional Material icon string name. */
  icon?: string;
  /** Whether the action button is disabled. */
  disabled?: boolean;
}

/** Shared property contract for `MagicDialog` across all UI libraries. */
export interface DialogMoleculeProps extends BaseMoleculeProps {
  /** Whether the dialog is currently visible. */
  open?: boolean;
  /** Primary heading displayed in the dialog header. */
  title?: string;
  /** Optional secondary subtitle displayed beneath `title`. */
  subtitle?: string;
  /** Body message text when custom slot children are not provided. */
  content?: string;
  /** Responsive dialog container size preset. */
  size?: DialogSize;
  /** Whether the dialog can be dismissed by user interaction. */
  dismissible?: boolean;
  /** Whether clicking the backdrop closes the dialog. */
  closeOnBackdropClick?: boolean;
  /** Whether pressing the Escape key closes the dialog. */
  closeOnEscape?: boolean;
  /** Whether to render a close icon button in the dialog header. */
  showCloseButton?: boolean;
  /** Whether long body content scrolls independently inside the dialog. */
  scrollable?: boolean;
  /** Action buttons displayed in the dialog footer. */
  actions?: readonly DialogActionItem[];
  /** Horizontal alignment of the footer action buttons. */
  alignActions?: 'start' | 'end';
}

/** Alias for {@link DialogMoleculeProps} aligned with `MagicDialog` component naming. */
export type MagicDialogProps = DialogMoleculeProps;
