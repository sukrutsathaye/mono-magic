import { useEffect, type Ref } from 'react';
import Snackbar, { type SnackbarOrigin } from '@mui/material/Snackbar';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
  AlertSeverity,
  ToastMoleculeProps,
  ToastPosition,
} from '@mono-magic/atomic-design-interfaces';
import { MagicAlert } from '../alert/alert';

/**
 * Reason emitted when {@link MagicToast} closes.
 */
export type MagicToastCloseReason = 'timeout' | 'dismiss';

/**
 * Props for {@link MagicToast}, extending {@link ToastMoleculeProps} with
 * lifecycle callbacks, inline preview rendering support, and MUI styling.
 */
export interface MagicToastProps extends ToastMoleculeProps {
  /** Invoked when the toast closes via auto-hide timer or dismiss button. */
  onClose?: (reason: MagicToastCloseReason) => void;
  /** Invoked when the user clicks the inline action button (`actionLabel`). */
  onAction?: () => void;
  /** Accessible label for the dismiss button. Defaults to `'Dismiss notification'`. */
  dismissAriaLabel?: string;
  /**
   * Render the toast inline within its parent layout flow instead of fixed
   * viewport positioning (useful for static showcases and snapshots).
   */
  inline?: boolean;
  /** Optional MUI `sx` overrides applied to the outer container/Snackbar. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;
}

const POSITION_MAP: Record<ToastPosition, SnackbarOrigin> = {
  'top-left': { vertical: 'top', horizontal: 'left' },
  'top-center': { vertical: 'top', horizontal: 'center' },
  'top-right': { vertical: 'top', horizontal: 'right' },
  'bottom-left': { vertical: 'bottom', horizontal: 'left' },
  'bottom-center': { vertical: 'bottom', horizontal: 'center' },
  'bottom-right': { vertical: 'bottom', horizontal: 'right' },
};

function resolveLiveRegion(severity: AlertSeverity): {
  role: 'alert' | 'status';
  ariaLive: 'assertive' | 'polite';
} {
  if (severity === 'error' || severity === 'warning') {
    return { role: 'alert', ariaLive: 'assertive' };
  }
  return { role: 'status', ariaLive: 'polite' };
}

/**
 * Material 3 transient toast notification molecule composing MUI v9 `Snackbar`
 * and {@link MagicAlert}.
 *
 * Supports all 6 viewport anchor positions, semantic `severity` tones,
 * auto-dismiss timer via `duration` (`0` or `null` disables auto-dismiss and
 * timers are cleared cleanly on unmount), inline action & dismiss controls,
 * and WCAG live-region semantics.
 */
export function MagicToast({
  id,
  testId,
  ariaLabel,
  open = false,
  severity = 'info',
  title,
  message,
  duration = 4000,
  position = 'bottom-right',
  dismissible = true,
  actionLabel,
  onClose,
  onAction,
  dismissAriaLabel = 'Dismiss notification',
  inline = false,
  sx,
  className,
  ref,
}: MagicToastProps) {
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const anchorOrigin = POSITION_MAP[position];
  const liveRegion = resolveLiveRegion(severity);
  const hasAutoHide =
    open && typeof duration === 'number' && Number.isFinite(duration) && duration > 0;

  useEffect(() => {
    if (!hasAutoHide || duration === null) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      onClose?.('timeout');
    }, duration);
    return () => {
      window.clearTimeout(timer);
    };
  }, [hasAutoHide, duration, onClose]);

  const alertNode = (
    <MagicAlert
      testId={testId ? `${testId}-alert` : undefined}
      ariaLabel={ariaLabel ?? title ?? message}
      severity={severity}
      variant="filled"
      title={title}
      message={message}
      dismissible={dismissible}
      dismissAriaLabel={dismissAriaLabel}
      actionLabel={actionLabel}
      onAction={onAction}
      onDismiss={() => onClose?.('dismiss')}
      sx={{
        minWidth: 280,
        maxWidth: 440,
        boxShadow: 6,
      }}
    />
  );

  if (inline) {
    if (!open) {
      return null;
    }

    return (
      <div
        ref={ref}
        id={id}
        data-testid={testId}
        data-position={position}
        role={liveRegion.role}
        aria-live={liveRegion.ariaLive}
        aria-atomic="true"
        className={className}
      >
        {alertNode}
      </div>
    );
  }

  return (
    <Snackbar
      ref={ref}
      id={id}
      data-testid={testId}
      data-position={position}
      open={open}
      anchorOrigin={anchorOrigin}
      role={liveRegion.role}
      aria-live={liveRegion.ariaLive}
      aria-atomic="true"
      className={className}
      sx={[...extraSx]}
    >
      {alertNode}
    </Snackbar>
  );
}
