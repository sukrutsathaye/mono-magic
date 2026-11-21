import { type FocusEventHandler, type Ref } from 'react';
import MuiSlider from '@mui/material/Slider';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  ColorIntent,
  SliderAtomProps,
} from '@mono-magic/atomic-design-interfaces';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_SIZE_METRICS,
  resolveMagicIntentColors,
} from '../../theme/mui-theme';

/**
 * Default value label formatter matching `ng-mat` (`1000 -> 1k`, `1000000 -> 1M`, `1000000000 -> 1B`).
 */
export function defaultSliderDisplayWith(value: number): string {
  if (value >= 1_000_000_000) {
    return `${Math.round(value / 1_000_000_000)}B`;
  }
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return `${value}`;
}

export interface MagicSliderRangeValue {
  start: number;
  end: number;
}

/**
 * Props for {@link MagicSlider}, extending {@link SliderAtomProps} with React 19 / MUI v9
 * ergonomics (`defaultValue`, `defaultStartValue`, `defaultEndValue`, `onChange`,
 * `onRangeChange`, `onBlur`, `sx`, `className`, and direct `ref` prop).
 */
export interface MagicSliderProps extends SliderAtomProps {
  /** Initial value in uncontrolled single-thumb mode. Defaults to `0`. */
  defaultValue?: number;
  /** Initial start value in uncontrolled range mode. Defaults to `min`. */
  defaultStartValue?: number;
  /** Initial end value in uncontrolled range mode. Defaults to `max`. */
  defaultEndValue?: number;
  /** Called with the numeric value whenever the single-thumb slider changes. */
  onChange?: (value: number) => void;
  /** Called with `{ start, end }` whenever either thumb changes in `range` mode. */
  onRangeChange?: (range: MagicSliderRangeValue) => void;
  /** Native blur event handler forwarded from the slider root. */
  onBlur?: FocusEventHandler<HTMLSpanElement>;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded to the underlying `<span class="MuiSlider-root">` element. */
  ref?: Ref<HTMLSpanElement>;
}

const SLIDER_TRACK_HEIGHT: Record<AtomicSize, number> = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
};

const SLIDER_THUMB_SIZE: Record<AtomicSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

/**
 * Material 3 slider atom wrapping MUI's `<Slider>` for both single-thumb (`range === false`)
 * and dual-thumb range (`range === true`) selection.
 *
 * Supports `min`, `max`, `step`, `discrete` value labels (`valueLabelDisplay="auto"`),
 * `showTickMarks` (`marks`), custom `displayWith` value label formatting, all 5 `AtomicSize`s
 * (`xs`..`xl`), and all 7 `ColorIntent`s.
 */
export function MagicSlider({
  id,
  testId,
  ariaLabel,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 0,
  range = false,
  startValue,
  endValue,
  defaultStartValue,
  defaultEndValue,
  discrete = false,
  showTickMarks = false,
  disableRipple = false,
  disabled = false,
  color = 'primary',
  size = 'md',
  displayWith = defaultSliderDisplayWith,
  onChange,
  onRangeChange,
  onBlur,
  sx,
  className,
  ref,
}: MagicSliderProps) {
  const theme = useTheme();
  const metrics = MAGIC_SIZE_METRICS[size];
  const intent = resolveMagicIntentColors(theme, color);
  const trackHeight = SLIDER_TRACK_HEIGHT[size];
  const thumbSize = SLIDER_THUMB_SIZE[size];
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const [singleValue, setSingleValue] = useControllableState<number>({
    value,
    defaultValue,
    onChange,
  });

  const isRangeControlled = startValue !== undefined || endValue !== undefined;
  const controlledRangeTuple: [number, number] | undefined = isRangeControlled
    ? [startValue ?? defaultStartValue ?? min, endValue ?? defaultEndValue ?? max]
    : undefined;

  const [rangeTuple, setRangeTuple] = useControllableState<[number, number]>({
    value: controlledRangeTuple,
    defaultValue: [defaultStartValue ?? min, defaultEndValue ?? max],
    onChange: (nextTuple) => {
      onRangeChange?.({ start: nextTuple[0], end: nextTuple[1] });
    },
  });

  const resolvedAriaLabel = ariaLabel ?? 'Slider';

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    if (disabled) {
      return;
    }
    if (range && Array.isArray(newValue)) {
      const nextStart = newValue[0] ?? min;
      const nextEnd = newValue[1] ?? max;
      setRangeTuple([nextStart, nextEnd]);
    } else if (!range && typeof newValue === 'number') {
      setSingleValue(newValue);
    }
  };

  return (
    <MuiSlider
      ref={ref}
      id={id}
      data-testid={testId}
      aria-label={range ? undefined : resolvedAriaLabel}
      getAriaLabel={
        range
          ? (index) =>
              `${resolvedAriaLabel} ${index === 0 ? 'start' : 'end'}`
          : undefined
      }
      color={color as ColorIntent}
      size={size === 'xs' || size === 'sm' ? 'small' : 'medium'}
      min={min}
      max={max}
      step={step}
      value={range ? rangeTuple : singleValue}
      marks={showTickMarks}
      valueLabelDisplay={discrete ? 'auto' : 'off'}
      valueLabelFormat={displayWith}
      disabled={disabled}
      disableSwap={false}
      className={className}
      onChange={handleSliderChange}
      onBlur={onBlur}
      sx={[
        {
          color: intent.main,
          height: trackHeight,
          '& .MuiSlider-track': {
            height: trackHeight,
            border: 'none',
          },
          '& .MuiSlider-rail': {
            height: trackHeight,
            opacity: 0.32,
          },
          '& .MuiSlider-thumb': {
            width: thumbSize,
            height: thumbSize,
            backgroundColor: intent.main,
            ...(disableRipple
              ? {
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: 'none',
                  },
                }
              : {}),
          },
          '& .MuiSlider-valueLabel': {
            fontSize: metrics.fontSize - 1,
            backgroundColor: intent.main,
            color: intent.contrastText,
            borderRadius: '6px',
          },
        },
        ...extraSx,
      ]}
    />
  );
}
