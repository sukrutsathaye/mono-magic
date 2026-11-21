import { useEffect, type Ref } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ActivityIndicator as PaperActivityIndicator } from 'react-native-paper';
import type {
  AtomicSize,
  ProgressIndicatorAtomProps,
} from '@mono-magic/atomic-design-interfaces';
import {
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export interface MagicProgressIndicatorProps
  extends ProgressIndicatorAtomProps {
  /** Optional callback fired when progress reaches 100% in determinate mode. */
  onAnimationEnd?: () => void;
  /** Optional style override applied to the root indicator container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the root indicator container. */
  ref?: Ref<View>;
}

const SPINNER_DIAMETERS: Record<AtomicSize, number> = {
  xs: 18,
  sm: 24,
  md: 36,
  lg: 48,
  xl: 64,
};

const BAR_HEIGHTS: Record<AtomicSize, number> = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
};

const styles = StyleSheet.create({
  barTrack: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  barBuffer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.35,
  },
  barQueryFill: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
  },
  barIndeterminateFill: {
    position: 'absolute',
    left: '20%',
    top: 0,
    bottom: 0,
    width: '45%',
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  spinnerRingTrack: {
    position: 'absolute',
    inset: 0,
    opacity: 0.25,
  },
  spinnerRingArc: {
    position: 'absolute',
    inset: 0,
  },
});

function clampPercent(raw: number | undefined): number {
  if (typeof raw !== 'number' || Number.isNaN(raw)) {
    return 0;
  }
  return Math.min(100, Math.max(0, raw));
}

/**
 * Material 3 progress indicator atom unifying linear progress bars (`determinate`,
 * `indeterminate`, `buffer`, `query`) and circular spinners (`determinate`,
 * `indeterminate`) behind `@mono-magic/atomic-design-interfaces`.
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
  style,
  ref,
}: MagicProgressIndicatorProps) {
  const { theme, colors, semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);

  const clampedValue = clampPercent(value);
  const clampedBuffer = clampPercent(bufferValue);
  const activeColor = disabled ? colors.onSurfaceDisabled : intent.main;
  const trackColor = disabled
    ? colors.surfaceDisabled
    : intent.container;

  const isDeterminate = mode === 'determinate' || mode === 'buffer';

  useEffect(() => {
    if (isDeterminate && clampedValue >= 100) {
      onAnimationEnd?.();
    }
  }, [clampedValue, isDeterminate, onAnimationEnd]);

  if (type === 'spinner') {
    const resolvedDiameter = diameter ?? SPINNER_DIAMETERS[size];
    const resolvedStroke =
      strokeWidth ?? Math.max(2, Math.round(resolvedDiameter / 10));

    if (mode === 'determinate') {
      const roundedValue = Math.round(clampedValue);
      return (
        <View
          ref={ref}
          nativeID={id}
          testID={testId}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={ariaLabel ?? 'Progress'}
          accessibilityState={{ disabled, busy: clampedValue < 100 }}
          accessibilityValue={{
            min: 0,
            max: 100,
            now: roundedValue,
          }}
          aria-disabled={disabled ? true : undefined}
          aria-busy={clampedValue < 100 ? true : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundedValue}
          style={[
            styles.spinnerContainer,
            {
              width: resolvedDiameter,
              height: resolvedDiameter,
              opacity: disabled ? 0.5 : 1,
            },
            style,
          ]}
        >
          <View
            style={[
              styles.spinnerRingTrack,
              {
                borderRadius: resolvedDiameter / 2,
                borderWidth: resolvedStroke,
                borderColor: activeColor,
              },
            ]}
          />
          <View
            style={[
              styles.spinnerRingArc,
              {
                borderRadius: resolvedDiameter / 2,
                borderWidth: resolvedStroke,
                borderColor: 'transparent',
                borderTopColor: activeColor,
                borderRightColor:
                  clampedValue >= 25 ? activeColor : 'transparent',
                borderBottomColor:
                  clampedValue >= 50 ? activeColor : 'transparent',
                borderLeftColor:
                  clampedValue >= 75 ? activeColor : 'transparent',
              },
            ]}
          />
        </View>
      );
    }

    return (
      <View
        ref={ref}
        nativeID={id}
        testID={testId}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={ariaLabel ?? 'Loading'}
        accessibilityState={{ disabled, busy: !disabled }}
        aria-disabled={disabled ? true : undefined}
        aria-busy={!disabled ? true : undefined}
        style={[
          styles.spinnerContainer,
          {
            width: resolvedDiameter,
            height: resolvedDiameter,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        <PaperActivityIndicator
          animating={!disabled}
          hidesWhenStopped={false}
          color={activeColor}
          size={resolvedDiameter}
        />
      </View>
    );
  }

  const barHeight = strokeWidth ?? BAR_HEIGHTS[size];
  const roundedBarValue = Math.round(clampedValue);
  const isBusy = !disabled && (!isDeterminate || clampedValue < 100);

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={ariaLabel ?? 'Progress'}
      accessibilityState={{
        disabled,
        busy: isBusy,
      }}
      accessibilityValue={
        isDeterminate
          ? {
              min: 0,
              max: 100,
              now: roundedBarValue,
            }
          : undefined
      }
      aria-disabled={disabled ? true : undefined}
      aria-busy={isBusy ? true : undefined}
      aria-valuemin={isDeterminate ? 0 : undefined}
      aria-valuemax={isDeterminate ? 100 : undefined}
      aria-valuenow={isDeterminate ? roundedBarValue : undefined}
      style={[
        styles.barTrack,
        {
          height: barHeight,
          borderRadius: barHeight / 2,
          backgroundColor: trackColor,
        },
        style,
      ]}
    >
      {mode === 'buffer' ? (
        <View
          testID={testId ? `${testId}-buffer` : undefined}
          style={[
            styles.barBuffer,
            {
              width: `${clampedBuffer}%`,
              backgroundColor: activeColor,
              borderRadius: barHeight / 2,
            },
          ]}
        />
      ) : null}

      {mode === 'indeterminate' ? (
        <View
          testID={testId ? `${testId}-fill` : undefined}
          style={[
            styles.barIndeterminateFill,
            {
              backgroundColor: activeColor,
              borderRadius: barHeight / 2,
            },
          ]}
        />
      ) : mode === 'query' ? (
        <View
          testID={testId ? `${testId}-fill` : undefined}
          style={[
            styles.barQueryFill,
            {
              backgroundColor: activeColor,
              borderRadius: barHeight / 2,
            },
          ]}
        />
      ) : (
        <View
          testID={testId ? `${testId}-fill` : undefined}
          style={[
            styles.barFill,
            {
              width: `${clampedValue}%`,
              backgroundColor: activeColor,
              borderRadius: barHeight / 2,
            },
          ]}
        />
      )}
    </View>
  );
}
