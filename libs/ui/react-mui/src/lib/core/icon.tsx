import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import MuiIcon from '@mui/material/Icon';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import {
  MAGIC_SIZE_METRICS,
  resolveMagicIntentColors,
} from '../theme/mui-theme';

export interface MagicIconProps {
  /** Material Icons ligature name (e.g. `"search"`, `"home"`) or a custom React node. */
  icon: string | ReactNode;
  /** Icon size token (`xs`..`xl`) or explicit pixel number. Defaults to `'md'`. */
  size?: AtomicSize | number;
  /** Semantic color intent or `'inherit'`. Defaults to `'inherit'`. */
  color?: ColorIntent | 'inherit';
  /** Accessible label for meaningful (non-decorative) icons. */
  ariaLabel?: string;
  /** Explicitly mark the icon as decorative (`aria-hidden`). Defaults to `true` unless `ariaLabel` is provided. */
  ariaHidden?: boolean;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** Optional test identifier rendered as `data-testid`. */
  testId?: string;
}

/**
 * Ergonomic icon helper supporting both Material Icons font ligature names and custom React nodes.
 */
export function MagicIcon({
  icon,
  size = 'md',
  color = 'inherit',
  ariaLabel,
  ariaHidden,
  sx,
  className,
  testId,
}: MagicIconProps) {
  const theme = useTheme();

  if (
    icon === null ||
    icon === undefined ||
    icon === false ||
    (typeof icon === 'string' && icon.trim() === '')
  ) {
    return null;
  }

  const pixelSize =
    typeof size === 'number' ? size : MAGIC_SIZE_METRICS[size].iconSize;
  const resolvedColor =
    color === 'inherit'
      ? 'inherit'
      : resolveMagicIntentColors(theme, color).main;

  const isDecorative = ariaHidden ?? !ariaLabel;
  const a11yProps = isDecorative
    ? { 'aria-hidden': true as const }
    : {
        role: 'img' as const,
        'aria-label': ariaLabel,
        'aria-hidden': undefined,
      };

  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  if (typeof icon === 'string') {
    return (
      <MuiIcon
        className={className}
        data-testid={testId}
        {...a11yProps}
        sx={[
          {
            fontSize: pixelSize,
            lineHeight: 1,
            color: resolvedColor,
            width: 'auto',
            height: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          },
          ...extraSx,
        ]}
      >
        {icon.trim()}
      </MuiIcon>
    );
  }

  return (
    <Box
      component="span"
      className={className}
      data-testid={testId}
      {...a11yProps}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: pixelSize,
          lineHeight: 1,
          color: resolvedColor,
          flexShrink: 0,
          '& > svg': {
            fontSize: 'inherit',
            width: '1em',
            height: '1em',
          },
        },
        ...extraSx,
      ]}
    >
      {icon}
    </Box>
  );
}
