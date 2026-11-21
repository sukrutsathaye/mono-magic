import type { Ref } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import {
  alpha,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material/styles';
import type {
  AtomicSize,
  ColorIntent,
  ProgressIndicatorAtomProps,
  ProgressIndicatorMode,
} from '@mono-magic/atomic-design-interfaces';
import { resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicProgressIndicator}, extending
 * {@link ProgressIndicatorAtomProps} with React 19 / MUI v9 ergonomics
 * (`onAnimationEnd`, `sx`, `className`, and direct `ref` prop).
 */
export interface MagicProgressIndicatorProps
  extends ProgressIndicatorAtomProps {
  /** Optional callback fired when CSS animation ends on the indicator container. */
  onAnimationEnd?: () => void;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded directly to the root wrapper `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const BAR_HEIGHT_MAP: Record<AtomicSize, number> = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
};

const SPINNER_SIZE_MAP: Record<AtomicSize, number> = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
};

function clampPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

function resolveLinearVariant(
  mode: ProgressIndicatorMode,
): 'determinate' | 'indeterminate' | 'buffer' | 'query' {
  switch (mode) {
    case 'query':
      return 'query';
    case 'buffer':
      return 'buffer';
    case 'indeterminate':
      return 'indeterminate';
    case 'determinate':
    default:
      return 'determinate';
  }
}

function resolveColorSx(
  theme: Theme,
  color: ColorIntent,
  type: 'bar' | 'spinner',
) {
  const intent = resolveMagicIntentColors(theme, color);
  if (type === 'spinner') {
    return {
      color: intent.main,
    };
  }
  return {
    backgroundColor: alpha(intent.main, 0.24),
    '& .MuiLinearProgress-bar': {
      backgroundColor: intent.main,
    },
    '& .MuiLinearProgress-dashed': {
      backgroundImage: `radial-gradient(${alpha(intent.main, 0.35)} 0%, ${alpha(intent.main, 0.35)} 16%, transparent 42%)`,
    },
  };
}

/**
 * Material 3 progress indicator atom unifying MUI's `LinearProgress` (`type='bar'`)
 * and `CircularProgress` (`type='spinner'`) behind one cross-platform atomic API.
 *
 * Clamps `value` and `bufferValue` to `[0, 100]`, scales dimensions across all
 * 5 atomic sizes (`xs`..`xl`), and supports all 7 semantic color intents.
 */
export function MagicProgressIndicator({
  id,
  testId,
  ariaLabel,
  type = 'bar',
  mode = 'determinate',
  value = 0,
  bufferValue = 0,
  diameter,
  strokeWidth,
  color = 'primary',
  size = 'md',
  disabled = false,
  onAnimationEnd,
  sx,
  className,
  ref,
}: MagicProgressIndicatorProps) {
  const theme = useTheme();
  const clampedValue = clampPercent(value);
  const clampedBuffer = clampPercent(bufferValue);
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const isSpinner = type === 'spinner';
  const spinnerSize = diameter ?? SPINNER_SIZE_MAP[size];
  const spinnerThickness = strokeWidth ?? 3.6;
  const barHeight = strokeWidth ?? BAR_HEIGHT_MAP[size];

  return (
    <Box
      ref={ref}
      id={id}
      data-testid={testId}
      className={className}
      onAnimationEnd={onAnimationEnd ? () => onAnimationEnd() : undefined}
      sx={[
        {
          display: isSpinner ? 'inline-flex' : 'block',
          alignItems: 'center',
          justifyContent: 'center',
          width: isSpinner ? 'auto' : '100%',
          opacity: disabled ? 0.38 : 1,
        },
        ...extraSx,
      ]}
    >
      {isSpinner ? (
        <CircularProgress
          aria-label={ariaLabel ?? 'Progress indicator'}
          variant={
            mode === 'determinate' || mode === 'buffer'
              ? 'determinate'
              : 'indeterminate'
          }
          value={clampedValue}
          size={spinnerSize}
          thickness={spinnerThickness}
          color={color}
          sx={resolveColorSx(theme, color, 'spinner')}
        />
      ) : (
        <LinearProgress
          aria-label={ariaLabel ?? 'Progress indicator'}
          variant={resolveLinearVariant(mode)}
          value={clampedValue}
          valueBuffer={clampedBuffer}
          color={color}
          sx={{
            height: barHeight,
            borderRadius: barHeight,
            ...resolveColorSx(theme, color, 'bar'),
          }}
        />
      )}
    </Box>
  );
}
