import type { ReactNode, Ref } from 'react';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AlertMoleculeProps,
  AlertSeverity,
  AlertVariant,
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicIcon } from '../../core/icon';
import { resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicAlert}, extending {@link AlertMoleculeProps} while
 * preserving strict {@link AlertSeverity} typing and adding React 19 / MUI v9
 * action, dismiss, slot, and styling props.
 */
export interface MagicAlertProps extends Omit<AlertMoleculeProps, 'severity'> {
  /** Semantic severity controlling icon and color intent (`info`, `success`, `warning`, `error`). */
  severity?: AlertSeverity;
  /** Invoked when the user clicks the dismiss icon button. */
  onDismiss?: () => void;
  /** Invoked when the user clicks the inline action button (`actionLabel`). */
  onAction?: () => void;
  /** Optional custom React icon node taking precedence over `icon` string when provided. */
  iconSlot?: ReactNode;
  /** Optional custom body content rendered beneath `message`. */
  children?: ReactNode;
  /** Accessible label for the dismiss icon button. Defaults to `'Dismiss alert'`. */
  dismissAriaLabel?: string;
  /** Optional MUI `sx` overrides applied to the root `Alert`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the root `Alert`. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `Alert` root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const SEVERITY_ICON_MAP: Record<AlertSeverity, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

const SEVERITY_INTENT_MAP: Record<AlertSeverity, ColorIntent> = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

const ALERT_SIZE_STYLES: Record<
  AtomicSize,
  { py: number; px: number; fontSize: number; titleSize: number; iconSize: AtomicSize }
> = {
  xs: { py: 0.5, px: 1.25, fontSize: 12, titleSize: 13, iconSize: 'xs' },
  sm: { py: 0.75, px: 1.5, fontSize: 13, titleSize: 14, iconSize: 'sm' },
  md: { py: 1, px: 2, fontSize: 14, titleSize: 15, iconSize: 'md' },
  lg: { py: 1.25, px: 2.25, fontSize: 15, titleSize: 16, iconSize: 'lg' },
  xl: { py: 1.5, px: 2.5, fontSize: 16, titleSize: 18, iconSize: 'xl' },
};

function resolveAlertColors(
  theme: Theme,
  severity: AlertSeverity,
  variant: AlertVariant,
) {
  const intent = resolveMagicIntentColors(theme, SEVERITY_INTENT_MAP[severity]);

  if (variant === 'filled') {
    return {
      backgroundColor: intent.main,
      color: intent.contrastText,
      border: `1px solid ${intent.main}`,
      iconColor: intent.contrastText,
      actionColor: intent.contrastText,
    };
  }

  if (variant === 'outlined') {
    return {
      backgroundColor: alpha(intent.container, 0.25),
      color: theme.palette.text.primary,
      border: `1px solid ${intent.main}`,
      iconColor: intent.main,
      actionColor: intent.main,
    };
  }

  return {
    backgroundColor: intent.container,
    color: intent.onContainer,
    border: `1px solid ${alpha(intent.main, 0.25)}`,
    iconColor: intent.main,
    actionColor: intent.onContainer,
  };
}

/**
 * Material 3 inline alert banner molecule composing MUI v9 `Alert`,
 * `AlertTitle`, {@link MagicIcon}, and {@link MagicButton} action/dismiss controls.
 *
 * Strictly types `severity` as {@link AlertSeverity} (`info`, `success`, `warning`,
 * `error`) and renders Material 3 semantic tones for `standard`, `filled`, and
 * `outlined` variants across all 5 atomic sizes (`xs`..`xl`).
 */
export function MagicAlert({
  id,
  testId,
  ariaLabel,
  severity = 'info',
  variant = 'standard',
  title,
  message,
  icon,
  hideIcon = false,
  dismissible = false,
  actionLabel,
  size = 'md',
  onDismiss,
  onAction,
  iconSlot,
  children,
  dismissAriaLabel = 'Dismiss alert',
  sx,
  className,
  ref,
}: MagicAlertProps) {
  const theme = useTheme();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const sizeStyle = ALERT_SIZE_STYLES[size];
  const tone = resolveAlertColors(theme, severity, variant);
  const iconName = icon ?? SEVERITY_ICON_MAP[severity];

  const resolvedIcon = hideIcon
    ? false
    : (iconSlot ?? <MagicIcon icon={iconName} size={sizeStyle.iconSize} />);

  const actionNode =
    actionLabel || dismissible ? (
      <Stack
        direction="row"
        spacing={0.5}
        data-testid={testId ? `${testId}-actions` : undefined}
        sx={{ alignItems: 'center' }}
      >
        {actionLabel ? (
          <MagicButton
            kind="default"
            variant="text"
            size="xs"
            label={actionLabel}
            testId={testId ? `${testId}-action` : undefined}
            onClick={() => onAction?.()}
            sx={{ color: tone.actionColor, fontWeight: 700 }}
          />
        ) : null}
        {dismissible ? (
          <MagicButton
            kind="icon"
            variant="text"
            size="xs"
            leadingIcon="close"
            ariaLabel={dismissAriaLabel}
            testId={testId ? `${testId}-dismiss` : undefined}
            onClick={() => onDismiss?.()}
            sx={{ color: tone.actionColor }}
          />
        ) : null}
      </Stack>
    ) : undefined;

  return (
    <MuiAlert
      ref={ref}
      id={id}
      data-testid={testId}
      data-severity={severity}
      data-variant={variant}
      data-size={size}
      role="alert"
      aria-label={ariaLabel}
      severity={severity}
      variant={variant}
      icon={resolvedIcon}
      action={actionNode}
      className={className}
      sx={[
        {
          alignItems: title ? 'flex-start' : 'center',
          py: sizeStyle.py,
          px: sizeStyle.px,
          backgroundColor: tone.backgroundColor,
          color: tone.color,
          border: tone.border,
          '& .MuiAlert-icon': {
            color: tone.iconColor,
            py: title ? 0.25 : 0,
            mr: 1.5,
          },
          '& .MuiAlert-message': {
            py: 0,
            fontSize: sizeStyle.fontSize,
            flex: 1,
          },
          '& .MuiAlert-action': {
            pt: title ? 0 : undefined,
            pl: 1.5,
            mr: 0,
            alignItems: 'center',
          },
        },
        ...extraSx,
      ]}
    >
      {title ? (
        <AlertTitle
          data-testid={testId ? `${testId}-title` : undefined}
          sx={{
            fontSize: sizeStyle.titleSize,
            fontWeight: 700,
            mb: 0.25,
            color: 'inherit',
          }}
        >
          {title}
        </AlertTitle>
      ) : null}
      <Box component="span" data-testid={testId ? `${testId}-message` : undefined}>
        <Typography
          component="span"
          variant="body2"
          sx={{ fontSize: 'inherit', color: 'inherit', display: 'block' }}
        >
          {message}
        </Typography>
      </Box>
      {children}
    </MuiAlert>
  );
}
