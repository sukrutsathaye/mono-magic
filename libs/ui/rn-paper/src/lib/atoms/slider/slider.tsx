import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import type {
  AtomicSize,
  SliderAtomProps,
} from '@mono-magic/atomic-design-interfaces';
import { useControllableState } from '../../core/use-controllable-state';
import {
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export interface MagicSliderProps extends SliderAtomProps {
  /** Initial slider value when rendered in uncontrolled single-thumb mode. */
  defaultValue?: number;
  /** Initial range start value when rendered in uncontrolled dual-thumb mode. */
  defaultStartValue?: number;
  /** Initial range end value when rendered in uncontrolled dual-thumb mode. */
  defaultEndValue?: number;
  /** Emits the updated numeric value in single-thumb mode (`range === false`). */
  onChange?: (value: number) => void;
  /** Emits `{ start, end }` when either thumb moves in dual-thumb range mode (`range === true`). */
  onRangeChange?: (range: { start: number; end: number }) => void;
  /** Optional style override applied to the root slider container. */
  style?: StyleProp<ViewStyle>;
}

interface SliderSizeMetrics {
  trackHeight: number;
  thumbSize: number;
  tickSize: number;
  bubbleFontSize: number;
  containerHeight: number;
}

const SLIDER_SIZE_METRICS: Record<AtomicSize, SliderSizeMetrics> = {
  xs: {
    trackHeight: 4,
    thumbSize: 16,
    tickSize: 2,
    bubbleFontSize: 10,
    containerHeight: 36,
  },
  sm: {
    trackHeight: 6,
    thumbSize: 18,
    tickSize: 3,
    bubbleFontSize: 11,
    containerHeight: 40,
  },
  md: {
    trackHeight: 8,
    thumbSize: 20,
    tickSize: 4,
    bubbleFontSize: 12,
    containerHeight: 48,
  },
  lg: {
    trackHeight: 12,
    thumbSize: 24,
    tickSize: 4,
    bubbleFontSize: 13,
    containerHeight: 56,
  },
  xl: {
    trackHeight: 16,
    thumbSize: 28,
    tickSize: 6,
    bubbleFontSize: 14,
    containerHeight: 64,
  },
};

const FALLBACK_TRACK_WIDTH = 200;

const styles = StyleSheet.create({
  root: {
    width: '100%',
    justifyContent: 'center',
  },
  trackHitArea: {
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  inactiveTrack: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  activeTrack: {
    position: 'absolute',
    borderRadius: 999,
  },
  tickRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tickDot: {
    borderRadius: 999,
  },
  thumbWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    fontWeight: '600',
    includeFontPadding: false,
  },
});

function clampAndSnap(
  rawValue: number,
  min: number,
  max: number,
  step: number
): number {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const effectiveStep = step > 0 ? step : 1;
  const snapped =
    safeMin + Math.round((rawValue - safeMin) / effectiveStep) * effectiveStep;
  const fixed = Number(snapped.toFixed(6));
  return Math.min(safeMax, Math.max(safeMin, fixed));
}

function valueToRatio(value: number, min: number, max: number): number {
  const span = max - min;
  if (span <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, (value - min) / span));
}

/**
 * Pure React Native Material 3 slider atom with zero native binary dependencies.
 *
 * Supports single-thumb (`range === false`) and dual-thumb range (`range === true`)
 * modes, full keyboard accessibility (`ArrowRight`/`ArrowUp`, `ArrowLeft`/`ArrowDown`,
 * `Home`, `End`, `PageUp`, `PageDown`), track press / pointer coordinate calculation
 * (with `200px` fallback in jsdom), discrete value indicator bubbles, step tick marks,
 * 5 size tokens (`xs`..`xl`), and 7 semantic color intents.
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
  defaultStartValue,
  endValue,
  defaultEndValue,
  discrete = false,
  showTickMarks = false,
  disableRipple = false,
  disabled = false,
  color = 'primary',
  size = 'md',
  displayWith,
  onChange,
  onRangeChange,
  style,
}: MagicSliderProps) {
  const theme = useTheme<MD3Theme>();
  const { semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);
  const metrics = SLIDER_SIZE_METRICS[size];

  const safeMin = min;
  const safeMax = max > min ? max : min + 100;
  const safeStep = step > 0 ? step : 1;

  const [singleVal, setSingleVal] = useControllableState<number>({
    value,
    defaultValue: clampAndSnap(defaultValue, safeMin, safeMax, safeStep),
    onChange,
  });

  const [rangeStart, setRangeStart] = useControllableState<number>({
    value: startValue,
    defaultValue: clampAndSnap(
      defaultStartValue ?? safeMin,
      safeMin,
      safeMax,
      safeStep
    ),
  });

  const [rangeEnd, setRangeEnd] = useControllableState<number>({
    value: endValue,
    defaultValue: clampAndSnap(
      defaultEndValue ?? safeMax,
      safeMin,
      safeMax,
      safeStep
    ),
  });

  const [measuredWidth, setMeasuredWidth] = useState<number>(0);

  const clampedSingle = clampAndSnap(singleVal, safeMin, safeMax, safeStep);
  const clampedStart = clampAndSnap(rangeStart, safeMin, safeMax, safeStep);
  const clampedEnd = Math.max(
    clampedStart,
    clampAndSnap(rangeEnd, safeMin, safeMax, safeStep)
  );

  const formatValue = useCallback(
    (val: number): string => (displayWith ? displayWith(val) : String(val)),
    [displayWith]
  );

  const updateSingleValue = useCallback(
    (nextRaw: number) => {
      if (disabled) {
        return;
      }
      const next = clampAndSnap(nextRaw, safeMin, safeMax, safeStep);
      setSingleVal(next);
    },
    [disabled, safeMax, safeMin, safeStep, setSingleVal]
  );

  const updateRangeStart = useCallback(
    (nextRaw: number) => {
      if (disabled) {
        return;
      }
      const next = Math.min(
        clampedEnd,
        clampAndSnap(nextRaw, safeMin, safeMax, safeStep)
      );
      setRangeStart(next);
      onRangeChange?.({ start: next, end: clampedEnd });
    },
    [
      clampedEnd,
      disabled,
      onRangeChange,
      safeMax,
      safeMin,
      safeStep,
      setRangeStart,
    ]
  );

  const updateRangeEnd = useCallback(
    (nextRaw: number) => {
      if (disabled) {
        return;
      }
      const next = Math.max(
        clampedStart,
        clampAndSnap(nextRaw, safeMin, safeMax, safeStep)
      );
      setRangeEnd(next);
      onRangeChange?.({ start: clampedStart, end: next });
    },
    [
      clampedStart,
      disabled,
      onRangeChange,
      safeMax,
      safeMin,
      safeStep,
      setRangeEnd,
    ]
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent?.layout?.width ?? 0;
    if (w > 0) {
      setMeasuredWidth(w);
    }
  }, []);

  const handleTrackPress = useCallback(
    (e: GestureResponderEvent & { clientX?: number; pageX?: number }) => {
      if (disabled) {
        return;
      }
      const effectiveWidth =
        measuredWidth > 0 ? measuredWidth : FALLBACK_TRACK_WIDTH;
      const locationX =
        e.nativeEvent?.locationX ??
        (e as unknown as { clientX?: number }).clientX ??
        e.nativeEvent?.pageX ??
        0;
      const ratio = Math.min(1, Math.max(0, locationX / effectiveWidth));
      const rawValue = safeMin + ratio * (safeMax - safeMin);

      if (!range) {
        updateSingleValue(rawValue);
        return;
      }

      const distStart = Math.abs(rawValue - clampedStart);
      const distEnd = Math.abs(rawValue - clampedEnd);
      if (distStart <= distEnd) {
        updateRangeStart(rawValue);
      } else {
        updateRangeEnd(rawValue);
      }
    },
    [
      clampedEnd,
      clampedStart,
      disabled,
      measuredWidth,
      range,
      safeMax,
      safeMin,
      updateRangeEnd,
      updateRangeStart,
      updateSingleValue,
    ]
  );

  const createThumbKeyHandler = useCallback(
    (currentVal: number, updater: (next: number) => void) =>
      (event: {
        key?: string;
        nativeEvent?: { key?: string };
        preventDefault?: () => void;
      }) => {
        if (disabled) {
          return;
        }
        const key = event.key ?? event.nativeEvent?.key;
        switch (key) {
          case 'ArrowRight':
          case 'ArrowUp':
            event.preventDefault?.();
            updater(currentVal + safeStep);
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            event.preventDefault?.();
            updater(currentVal - safeStep);
            break;
          case 'PageUp':
            event.preventDefault?.();
            updater(currentVal + safeStep * 10);
            break;
          case 'PageDown':
            event.preventDefault?.();
            updater(currentVal - safeStep * 10);
            break;
          case 'Home':
            event.preventDefault?.();
            updater(safeMin);
            break;
          case 'End':
            event.preventDefault?.();
            updater(safeMax);
            break;
        }
      },
    [disabled, safeMax, safeMin, safeStep]
  );

  const tickValues = useMemo(() => {
    if (!showTickMarks || safeStep <= 0) {
      return [];
    }
    const count = Math.floor((safeMax - safeMin) / safeStep);
    // Cap rendered tick marks to avoid excessive DOM nodes for tiny steps
    const maxTicks = Math.min(count, 40);
    const stride = count > 40 ? (safeMax - safeMin) / maxTicks : safeStep;
    const ticks: number[] = [];
    for (let i = 0; i <= maxTicks; i += 1) {
      ticks.push(Number((safeMin + i * stride).toFixed(6)));
    }
    return ticks;
  }, [safeMax, safeMin, safeStep, showTickMarks]);

  const activeTrackColor = disabled
    ? theme.colors.onSurfaceDisabled
    : intent.main;
  const inactiveTrackColor = disabled
    ? theme.colors.surfaceDisabled
    : intent.container;
  const thumbColor = disabled ? theme.colors.onSurfaceDisabled : intent.main;
  const bubbleBg = disabled ? theme.colors.surfaceDisabled : intent.main;
  const bubbleFg = disabled ? theme.colors.onSurfaceDisabled : intent.onMain;

  const startRatio = range ? valueToRatio(clampedStart, safeMin, safeMax) : 0;
  const endRatio = range
    ? valueToRatio(clampedEnd, safeMin, safeMax)
    : valueToRatio(clampedSingle, safeMin, safeMax);

  const renderThumb = (
    thumbValue: number,
    ratio: number,
    thumbLabel: string,
    thumbTestId: string | undefined,
    updater: (next: number) => void
  ) => {
    const formatted = formatValue(thumbValue);
    const keyDownHandler = createThumbKeyHandler(thumbValue, updater);

    const webSliderProps = {
      role: 'slider',
      'aria-label': thumbLabel,
      'aria-valuemin': safeMin,
      'aria-valuemax': safeMax,
      'aria-valuenow': thumbValue,
      'aria-valuetext': formatted,
      'aria-disabled': disabled ? true : undefined,
      tabIndex: disabled ? -1 : 0,
      onKeyDown: keyDownHandler,
    } as Record<string, unknown>;

    return (
      <View
        key={thumbLabel}
        style={[
          styles.thumbWrapper,
          {
            left: `${ratio * 100}%`,
            transform: [{ translateX: -metrics.thumbSize / 2 }],
          },
        ]}
      >
        {discrete ? (
          <View
            testID={thumbTestId ? `${thumbTestId}-bubble` : undefined}
            style={[
              styles.bubble,
              {
                bottom: metrics.thumbSize + 6,
                backgroundColor: bubbleBg,
              },
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                {
                  fontSize: metrics.bubbleFontSize,
                  color: bubbleFg,
                },
              ]}
            >
              {formatted}
            </Text>
          </View>
        ) : null}

        <View
          testID={thumbTestId}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={thumbLabel}
          accessibilityValue={{
            min: safeMin,
            max: safeMax,
            now: thumbValue,
            text: formatted,
          }}
          accessibilityState={{ disabled }}
          style={[
            styles.thumb,
            {
              width: metrics.thumbSize,
              height: metrics.thumbSize,
              backgroundColor: thumbColor,
              borderWidth: disableRipple ? 0 : 2,
              borderColor: theme.colors.surface,
            },
          ]}
          {...webSliderProps}
        />
      </View>
    );
  };

  const baseAriaLabel = ariaLabel || 'Slider';

  return (
    <View
      nativeID={id}
      testID={testId}
      style={[
        styles.root,
        {
          minHeight: discrete
            ? metrics.containerHeight + 20
            : metrics.containerHeight,
        },
        style,
      ]}
    >
      <Pressable
        testID={testId ? `${testId}-track` : undefined}
        disabled={disabled}
        onLayout={handleLayout}
        onPress={handleTrackPress}
        style={[
          styles.trackHitArea,
          {
            height: metrics.containerHeight,
          },
        ]}
      >
        <View
          style={[
            styles.inactiveTrack,
            {
              height: metrics.trackHeight,
              backgroundColor: inactiveTrackColor,
            },
          ]}
        >
          <View
            testID={testId ? `${testId}-active-track` : undefined}
            style={[
              styles.activeTrack,
              {
                height: metrics.trackHeight,
                left: `${startRatio * 100}%`,
                width: `${Math.max(0, (endRatio - startRatio) * 100)}%`,
                backgroundColor: activeTrackColor,
              },
            ]}
          />

          {tickValues.length > 0 ? (
            <View
              testID={testId ? `${testId}-ticks` : undefined}
              style={styles.tickRow}
            >
              {tickValues.map((tv) => {
                const inActiveRange = range
                  ? tv >= clampedStart && tv <= clampedEnd
                  : tv <= clampedSingle;
                return (
                  <View
                    key={tv}
                    style={[
                      styles.tickDot,
                      {
                        width: metrics.tickSize,
                        height: metrics.tickSize,
                        backgroundColor: inActiveRange
                          ? intent.onMain
                          : activeTrackColor,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ) : null}
        </View>

        {range ? (
          <>
            {renderThumb(
              clampedStart,
              startRatio,
              `${baseAriaLabel} start`,
              testId ? `${testId}-thumb-start` : undefined,
              updateRangeStart
            )}
            {renderThumb(
              clampedEnd,
              endRatio,
              `${baseAriaLabel} end`,
              testId ? `${testId}-thumb-end` : undefined,
              updateRangeEnd
            )}
          </>
        ) : (
          renderThumb(
            clampedSingle,
            endRatio,
            baseAriaLabel,
            testId ? `${testId}-thumb` : undefined,
            updateSingleValue
          )
        )}
      </Pressable>
    </View>
  );
}
