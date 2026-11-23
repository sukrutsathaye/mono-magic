import { useCallback, useId, type Ref } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AtomicSize,
  RatingMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  MagicRatingProps as RatingBaseProps,
  RatingMoleculeProps,
  RatingPrecision,
} from '@mono-magic/atomic-design-interfaces';
export { RATING_PRECISIONS } from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicRating` molecule. */
export interface MagicRatingProps extends RatingMoleculeProps {
  /** Fired whenever the rating value changes. */
  onChange?: (value: number) => void;
  /** Style override applied to the outer rating container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer container `View`. */
  ref?: Ref<View>;
}

interface RatingSizeTokens {
  iconSize: number;
  labelFontSize: number;
  metaFontSize: number;
  gap: number;
}

const RATING_SIZE_TOKENS: Record<AtomicSize, RatingSizeTokens> = {
  xs: { iconSize: 16, labelFontSize: 12, metaFontSize: 11, gap: 2 },
  sm: { iconSize: 20, labelFontSize: 13, metaFontSize: 12, gap: 3 },
  md: { iconSize: 24, labelFontSize: 14, metaFontSize: 13, gap: 4 },
  lg: { iconSize: 30, labelFontSize: 15, metaFontSize: 14, gap: 5 },
  xl: { iconSize: 36, labelFontSize: 16, metaFontSize: 15, gap: 6 },
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  label: {
    fontWeight: '600',
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starSlot: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfHitZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 2,
  },
  halfZone: {
    flex: 1,
    height: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontWeight: '600',
  },
  reviewText: {
    fontWeight: '400',
  },
});

function clampRating(value: number, max: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(value, max));
}

/**
 * Material 3 star rating molecule for `@mono-magic/rn-paper`.
 *
 * Supports whole-star (`precision={1}`) and half-star (`precision={0.5}`)
 * selection, controlled/uncontrolled `value`, `max` custom scale, `readOnly`
 * & `disabled` states, `showValue` + `reviewCount` metadata, and custom icon names.
 */
export function MagicRating({
  id,
  testId,
  ariaLabel,
  value: controlledValue,
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
  style,
  ref,
}: MagicRatingProps) {
  const { colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(color);
  const tokens = RATING_SIZE_TOKENS[size];
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const safeMax = Math.max(1, Math.floor(max));

  const [rawValue, setValue] = useControllableState<number>({
    value: controlledValue,
    defaultValue: clampRating(defaultValue, safeMax),
    onChange,
  });

  const currentValue = clampRating(rawValue, safeMax);
  const isInteractive = !readOnly && !disabled;

  const handleSelectValue = useCallback(
    (nextValue: number) => {
      if (!isInteractive) {
        return;
      }
      const clamped = clampRating(nextValue, safeMax);
      // Clicking the already-selected exact rating toggles down to 0 when whole-step, or updates directly.
      const resolved = clamped === currentValue ? 0 : clamped;
      setValue(resolved);
    },
    [currentValue, isInteractive, safeMax, setValue]
  );

  const filledColor = disabled ? colors.onSurfaceDisabled : intent.main;
  const emptyColor = disabled
    ? colors.onSurfaceDisabled
    : colors.onSurfaceVariant;

  const rootAriaLabel =
    ariaLabel ??
    label ??
    `Rating ${currentValue} out of ${safeMax}`;

  return (
    <View
      ref={ref}
      nativeID={baseId}
      testID={testId}
      accessibilityLabel={rootAriaLabel}
      accessibilityState={{ disabled }}
      style={[styles.root, style]}
    >
      {label ? (
        <Text
          testID={testId ? `${testId}-label` : undefined}
          style={[
            styles.label,
            {
              color: disabled ? colors.onSurfaceDisabled : colors.onSurface,
              fontSize: tokens.labelFontSize,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View style={styles.row}>
        <View
          testID={testId ? `${testId}-stars` : undefined}
          accessibilityRole={isInteractive ? 'radiogroup' : 'text'}
          accessibilityLabel={rootAriaLabel}
          style={[styles.starsRow, { gap: tokens.gap }]}
        >
          {Array.from({ length: safeMax }, (_, index) => {
            const unitValue = index + 1;
            const halfValue = index + 0.5;
            const isFull = currentValue >= unitValue;
            const isHalf =
              !isFull && currentValue >= halfValue && precision === 0.5;

            const iconName = isFull
              ? icon
              : isHalf
                ? 'star_half'
                : emptyIcon;
            const iconColor = isFull || isHalf ? filledColor : emptyColor;

            if (precision === 0.5 && isInteractive) {
              return (
                <View
                  key={`unit-${unitValue}`}
                  testID={testId ? `${testId}-unit-${unitValue}` : undefined}
                  style={[
                    styles.starSlot,
                    { width: tokens.iconSize, height: tokens.iconSize },
                  ]}
                >
                  <MagicIcon
                    icon={iconName}
                    size={tokens.iconSize}
                    color={iconColor}
                  />
                  <View style={styles.halfHitZones}>
                    <Pressable
                      testID={
                        testId
                          ? `${testId}-star-${halfValue}`
                          : undefined
                      }
                      accessibilityRole="radio"
                      accessibilityLabel={`${halfValue} stars`}
                      accessibilityState={{
                        checked: currentValue === halfValue,
                        disabled: false,
                      }}
                      onPress={() => handleSelectValue(halfValue)}
                      style={styles.halfZone}
                    />
                    <Pressable
                      testID={
                        testId
                          ? `${testId}-star-${unitValue}`
                          : undefined
                      }
                      accessibilityRole="radio"
                      accessibilityLabel={`${unitValue} stars`}
                      accessibilityState={{
                        checked: currentValue === unitValue,
                        disabled: false,
                      }}
                      onPress={() => handleSelectValue(unitValue)}
                      style={styles.halfZone}
                    />
                  </View>
                </View>
              );
            }

            if (isInteractive) {
              const webAriaProps =
                Platform.OS === 'web'
                  ? ({
                      'aria-checked': currentValue === unitValue,
                    } as Record<string, unknown>)
                  : {};

              return (
                <Pressable
                  key={`unit-${unitValue}`}
                  testID={
                    testId ? `${testId}-star-${unitValue}` : undefined
                  }
                  accessibilityRole="radio"
                  accessibilityLabel={`${unitValue} ${unitValue === 1 ? 'star' : 'stars'}`}
                  accessibilityState={{
                    checked: currentValue === unitValue,
                    disabled: false,
                  }}
                  onPress={() => handleSelectValue(unitValue)}
                  style={[
                    styles.starSlot,
                    { width: tokens.iconSize, height: tokens.iconSize },
                  ]}
                  {...webAriaProps}
                >
                  <MagicIcon
                    icon={iconName}
                    size={tokens.iconSize}
                    color={iconColor}
                  />
                </Pressable>
              );
            }

            return (
              <View
                key={`unit-${unitValue}`}
                testID={testId ? `${testId}-star-${unitValue}` : undefined}
                style={[
                  styles.starSlot,
                  { width: tokens.iconSize, height: tokens.iconSize },
                ]}
              >
                <MagicIcon
                  icon={iconName}
                  size={tokens.iconSize}
                  color={iconColor}
                />
              </View>
            );
          })}
        </View>

        {showValue || reviewCount !== undefined ? (
          <View style={styles.metaRow}>
            {showValue ? (
              <Text
                testID={testId ? `${testId}-value` : undefined}
                style={[
                  styles.valueText,
                  {
                    color: disabled
                      ? colors.onSurfaceDisabled
                      : colors.onSurface,
                    fontSize: tokens.metaFontSize,
                  },
                ]}
              >
                {precision === 0.5
                  ? currentValue.toFixed(1)
                  : String(currentValue)}
              </Text>
            ) : null}

            {reviewCount !== undefined ? (
              <Text
                testID={testId ? `${testId}-reviews` : undefined}
                style={[
                  styles.reviewText,
                  {
                    color: disabled
                      ? colors.onSurfaceDisabled
                      : colors.onSurfaceVariant,
                    fontSize: tokens.metaFontSize,
                  },
                ]}
              >
                {`(${reviewCount})`}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
