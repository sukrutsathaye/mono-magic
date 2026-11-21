import type { ReactNode, Ref } from 'react';
import MuiBadge, {
  type BadgeOrigin,
  type BadgeProps as MuiBadgeProps,
} from '@mui/material/Badge';
import Box from '@mui/material/Box';
import {
  useTheme,
  type CSSObject,
  type SxProps,
  type Theme,
} from '@mui/material/styles';
import type {
  AtomicSize,
  BadgeAtomProps,
  BadgePosition,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicBadge}, extending {@link BadgeAtomProps} with
 * React 19 / MUI v9 ergonomics (`children`, ReactNode `icon`, `sx`,
 * `slotProps`, `className`, and direct `ref` prop).
 */
export interface MagicBadgeProps extends Omit<BadgeAtomProps, 'icon'> {
  /** Fallback Material Icons name or custom React node when `children` is omitted. */
  icon?: string | ReactNode;
  /** Content wrapped by the badge; takes precedence over `icon` and `label`. */
  children?: ReactNode;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional MUI `slotProps` forwarded to the underlying `<Badge>`. */
  slotProps?: MuiBadgeProps['slotProps'];
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded directly to the root `<span>` element. */
  ref?: Ref<HTMLSpanElement>;
}

interface BadgeSizeMetric {
  minWidth: number;
  height: number;
  fontSize: number;
  paddingX: number;
  dotSize: number;
}

const BADGE_SIZE_METRICS: Record<AtomicSize, BadgeSizeMetric> = {
  xs: { minWidth: 14, height: 14, fontSize: 9, paddingX: 3, dotSize: 6 },
  sm: { minWidth: 16, height: 16, fontSize: 10, paddingX: 4, dotSize: 7 },
  md: { minWidth: 20, height: 20, fontSize: 11, paddingX: 6, dotSize: 8 },
  lg: { minWidth: 24, height: 24, fontSize: 13, paddingX: 7, dotSize: 10 },
  xl: { minWidth: 28, height: 28, fontSize: 15, paddingX: 8, dotSize: 12 },
};

const POSITION_MAP: Record<BadgePosition, BadgeOrigin> = {
  'above after': { vertical: 'top', horizontal: 'right' },
  'above before': { vertical: 'top', horizontal: 'left' },
  'below after': { vertical: 'bottom', horizontal: 'right' },
  'below before': { vertical: 'bottom', horizontal: 'left' },
  above: { vertical: 'top', horizontal: 'right' },
  below: { vertical: 'bottom', horizontal: 'right' },
  before: { vertical: 'top', horizontal: 'left' },
  after: { vertical: 'top', horizontal: 'right' },
};

function resolveBadgeSx(
  theme: Theme,
  color: ColorIntent,
  size: AtomicSize,
  overlap: boolean,
  isDot: boolean,
): CSSObject {
  const intent = resolveMagicIntentColors(theme, color);
  const metric = BADGE_SIZE_METRICS[size];
  const sizeDim = isDot ? metric.dotSize : metric.height;
  const minW = isDot ? metric.dotSize : metric.minWidth;

  return {
    backgroundColor: intent.main,
    color: intent.contrastText,
    minWidth: minW,
    height: sizeDim,
    fontSize: metric.fontSize,
    fontWeight: 600,
    lineHeight: `${sizeDim}px`,
    padding: isDot ? 0 : `0 ${metric.paddingX}px`,
    borderRadius: 9999,
    ...(overlap
      ? {}
      : {
          position: 'relative',
          transform: 'none',
          top: 'auto',
          right: 'auto',
          bottom: 'auto',
          left: 'auto',
        }),
  };
}

/**
 * Material 3 badge atom wrapping MUI's `Badge` around projected children,
 * with `icon` and `label` fallbacks, all 5 atomic sizes, all 7 semantic color
 * intents, 8 directional positions, and `overlap` / `hidden` / `disabled` states.
 */
export function MagicBadge({
  id,
  testId,
  ariaLabel,
  content,
  color = 'primary',
  size = 'md',
  position = 'above after',
  overlap = true,
  hidden = false,
  disabled = false,
  description,
  label = 'Notifications',
  icon,
  children,
  sx,
  slotProps,
  className,
  ref,
}: MagicBadgeProps) {
  const theme = useTheme();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const anchorOrigin = POSITION_MAP[position] ?? POSITION_MAP['above after'];
  const isDot = content === undefined || content === '';
  const isInvisible = hidden || disabled;

  const badgeSlotProps = slotProps?.badge;
  const badgeExtraSx =
    badgeSlotProps &&
    typeof badgeSlotProps === 'object' &&
    'sx' in badgeSlotProps &&
    badgeSlotProps.sx
      ? Array.isArray(badgeSlotProps.sx)
        ? badgeSlotProps.sx
        : [badgeSlotProps.sx]
      : [];

  const rootSlotProps = slotProps?.root;

  const fallbackTarget =
    icon !== undefined ? (
      <MagicIcon icon={icon} size={size} />
    ) : (
      <Box component="span" sx={{ display: 'inline-block' }}>
        {label}
      </Box>
    );

  const target = children !== undefined ? children : fallbackTarget;

  return (
    <MuiBadge
      ref={ref}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel ?? description}
      badgeContent={content}
      variant={isDot ? 'dot' : 'standard'}
      showZero
      invisible={isInvisible}
      overlap={overlap ? 'circular' : 'rectangular'}
      anchorOrigin={anchorOrigin}
      className={className}
      slotProps={{
        ...slotProps,
        root: {
          ...rootSlotProps,
        },
        badge: {
          ...(typeof badgeSlotProps === 'object' ? badgeSlotProps : {}),
          'aria-label': description,
          sx: [
            resolveBadgeSx(theme, color, size, overlap, isDot),
            ...badgeExtraSx,
          ],
        },
      }}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: overlap ? 0 : 0.75,
          opacity: disabled ? 0.5 : 1,
          ...(overlap
            ? {}
            : {
                flexDirection:
                  anchorOrigin.horizontal === 'left' ? 'row-reverse' : 'row',
              }),
        },
        ...extraSx,
      ]}
    >
      {target}
    </MuiBadge>
  );
}
