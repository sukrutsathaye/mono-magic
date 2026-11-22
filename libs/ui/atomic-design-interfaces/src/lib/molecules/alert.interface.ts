import type {
  AtomicSize,
  BaseMoleculeProps,
} from '../common/atomic.interface.js';

/** Semantic severity level for `MagicAlert` and `MagicToast`. */
export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

/** Ordered list of supported alert severity levels. */
export const ALERT_SEVERITIES: readonly AlertSeverity[] = [
  'info',
  'success',
  'warning',
  'error',
] as const;

/** Material 3 visual emphasis variant for `MagicAlert`. */
export type AlertVariant = 'standard' | 'filled' | 'outlined';

/** Ordered list of supported alert visual variants. */
export const ALERT_VARIANTS: readonly AlertVariant[] = [
  'standard',
  'filled',
  'outlined',
] as const;

/** Shared property contract for `MagicAlert` across all UI libraries. */
export interface AlertMoleculeProps extends BaseMoleculeProps {
  /** Semantic severity controlling icon and color intent. */
  severity?: AlertSeverity;
  /** Visual container style (`standard`, `filled`, or `outlined`). */
  variant?: AlertVariant;
  /** Optional bold heading rendered above `message`. */
  title?: string;
  /** Primary alert body message. */
  message: string;
  /** Optional Material icon string name overriding the default severity icon. */
  icon?: string;
  /** Whether to suppress the leading severity icon. */
  hideIcon?: boolean;
  /** Whether a dismiss/close button is rendered. */
  dismissible?: boolean;
  /** Optional label for an inline action button. */
  actionLabel?: string;
  /** Standardized component density/size preset. */
  size?: AtomicSize;
}

/** Alias for {@link AlertMoleculeProps} aligned with `MagicAlert` component naming. */
export type MagicAlertProps = AlertMoleculeProps;
