import { useId, type Ref, type SyntheticEvent } from 'react';
import MuiRating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  RatingMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicRating}, extending {@link RatingMoleculeProps}
 * with React 19 / MUI v9 change callbacks, form field name, and styling props.
 */
export interface MagicRatingProps extends RatingMoleculeProps {
  /** Native radio group `name` attribute for accessibility and form submission. */
  name?: string;
  /** Invoked whenever the user selects a new rating value (or clears it to `0`). */
  onChange?: (value: number) => void;
  /** Invoked when the hovered rating preview changes (`-1` when pointer leaves). */
  onHoverChange?: (value: number) => void;
  /** Optional MUI `sx` overrides applied to the outer container `Stack`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer container `Stack`. */
  className?: string;
  /** React 19 ref forwarded directly to the outer container `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const RATING_SIZE_STYLES: Record<
  AtomicSize,
  { iconPx: number; fontSize: number; muiSize: 'small' | 'medium' | 'large' }
> = {
  xs: { iconPx: 16, fontSize: 12, muiSize: 'small' },
  sm: { iconPx: 20, fontSize: 13, muiSize: 'small' },
  md: { iconPx: 24, fontSize: 14, muiSize: 'medium' },
  lg: { iconPx: 30, fontSize: 15, muiSize: 'large' },
  xl: { iconPx: 36, fontSize: 16, muiSize: 'large' },
};

function clampRating(value: number, max: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.min(value, max);
}

/**
 * Material 3 star/icon rating molecule composing MUI v9 `Rating` and {@link MagicIcon}.
 *
 * Supports full (`1`) and half (`0.5`) precision, controlled (`value`) and
 * uncontrolled (`defaultValue`) state via `useControllableState`, custom `max`,
 * custom `icon`/`emptyIcon`, numeric value readout (`showValue`), `reviewCount`,
 * `readOnly`, `disabled`, all 5 atomic sizes, and all 7 semantic `ColorIntent`s.
 */
export function MagicRating({
  id,
  testId,
  ariaLabel,
  name,
  value,
  defaultValue = 0,
  max = 5,
  precision = 1,
  readOnly = false,
  disabled = false,
  showValue = false,
  reviewCount,
  icon = 'star',
  emptyIcon = 'star_border',
  color = 'warning',
  size = 'md',
  label,
  onChange,
  onHoverChange,
  sx,
  className,
  ref,
}: MagicRatingProps) {
  const theme = useTheme();
  const generatedId = useId();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const sizeStyle = RATING_SIZE_STYLES[size];
  const intent = resolveMagicIntentColors(theme, color);
  const safeMax = Math.max(1, Math.round(max));
  const resolvedName = name ?? id ?? `${generatedId}-rating`;

  const [currentValue, setCurrentValue] = useControllableState<number>({
    value: value !== undefined ? clampRating(value, safeMax) : undefined,
    defaultValue: clampRating(defaultValue, safeMax),
    onChange,
  });

  const resolvedValue = clampRating(currentValue, safeMax);

  const handleChange = (
    _event: SyntheticEvent,
    nextValue: number | null,
  ) => {
    if (readOnly || disabled) {
      return;
    }
    setCurrentValue(nextValue ?? 0);
  };

  const handleChangeActive = (_event: SyntheticEvent, hoverValue: number) => {
    onHoverChange?.(hoverValue);
  };

  const formattedValue =
    precision === 0.5 ? resolvedValue.toFixed(1) : String(resolvedValue);

  return (
    <Stack
      ref={ref}
      id={id}
      direction="row"
      spacing={1}
      data-testid={testId}
      data-precision={String(precision)}
      data-size={size}
      data-readonly={readOnly ? 'true' : 'false'}
      className={className}
      sx={[{ display: 'inline-flex', alignItems: 'center' }, ...extraSx]}
    >
      {label ? (
        <Typography
          component="span"
          variant="body2"
          sx={{ fontSize: sizeStyle.fontSize, fontWeight: 500 }}
        >
          {label}
        </Typography>
      ) : null}

      <MuiRating
        name={resolvedName}
        value={resolvedValue}
        max={safeMax}
        precision={precision}
        readOnly={readOnly}
        disabled={disabled}
        size={sizeStyle.muiSize}
        aria-label={ariaLabel ?? label ?? 'Rating'}
        data-testid={testId ? `${testId}-control` : undefined}
        onChange={handleChange}
        onChangeActive={onHoverChange ? handleChangeActive : undefined}
        icon={<MagicIcon icon={icon} size={sizeStyle.iconPx} color="inherit" />}
        emptyIcon={
          <MagicIcon icon={emptyIcon} size={sizeStyle.iconPx} color="inherit" />
        }
        sx={{
          color: intent.main,
          '& .MuiRating-iconEmpty': {
            color: theme.palette.text.disabled,
          },
        }}
      />

      {showValue ? (
        <Typography
          component="span"
          variant="body2"
          data-testid={testId ? `${testId}-value` : undefined}
          sx={{ fontSize: sizeStyle.fontSize, fontWeight: 600 }}
        >
          {formattedValue}
        </Typography>
      ) : null}

      {reviewCount !== undefined ? (
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          data-testid={testId ? `${testId}-reviews` : undefined}
          sx={{ fontSize: sizeStyle.fontSize - 1 }}
        >
          ({reviewCount})
        </Typography>
      ) : null}
    </Stack>
  );
}
