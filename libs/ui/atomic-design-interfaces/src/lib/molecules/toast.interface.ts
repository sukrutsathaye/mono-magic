import type { BaseMoleculeProps } from '../common/atomic.interface.js';
import type { AlertSeverity } from './alert.interface.js';

/** Screen anchor position for transient `MagicToast` notifications. */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Ordered list of supported toast viewport anchor positions. */
export const TOAST_POSITIONS: readonly ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

/** Shared property contract for `MagicToast` across all UI libraries. */
export interface ToastMoleculeProps extends BaseMoleculeProps {
  /** Whether the toast notification is currently visible. */
  open?: boolean;
  /** Semantic severity level mapped from {@link AlertSeverity}. */
  severity?: AlertSeverity;
  /** Optional bold heading rendered above `message`. */
  title?: string;
  /** Primary notification message text. */
  message: string;
  /** Auto-dismiss timeout in milliseconds, or `null` to persist until dismissed. */
  duration?: number | null;
  /** Viewport anchor position for the toast container. */
  position?: ToastPosition;
  /** Whether a manual close button is rendered. */
  dismissible?: boolean;
  /** Optional label for an inline action button (e.g., `Undo`). */
  actionLabel?: string;
}

/** Alias for {@link ToastMoleculeProps} aligned with `MagicToast` component naming. */
export type MagicToastProps = ToastMoleculeProps;
