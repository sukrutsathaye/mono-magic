import {
  useId,
  useMemo,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { HelperText } from 'react-native-paper';
import type { FormFieldMoleculeProps } from '@mono-magic/atomic-design-interfaces';
import {
  MagicFormFieldProvider,
  type MagicFormFieldContextValue,
} from '../../core/form-field-context';
import {
  MAGIC_PAPER_SIZE_METRICS,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export interface MagicFormFieldProps extends FormFieldMoleculeProps {
  /** Leading slot rendered before the nested control (e.g. a `MagicIcon` or text affix). */
  prefix?: ReactNode;
  /** Trailing slot rendered after the nested control (e.g. a clear action or unit label). */
  suffix?: ReactNode;
  /** Marks the field as required and appends ` *` to the label unless `hideRequiredMarker` is true. */
  required?: boolean;
  /** Disables the field chrome and propagates disabled state to nested controls. */
  disabled?: boolean;
  /** Single nested form-control atom such as `MagicTextInput` or `MagicSelect`. */
  children?: ReactNode;
  /** Style override applied to the outer field container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer wrapper `View`. */
  ref?: Ref<View>;
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  outlinedWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  filledWrapper: {
    position: 'relative',
    justifyContent: 'center',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  controlSlot: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  affixSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  outlinedFloatingLabel: {
    position: 'absolute',
    top: -9,
    left: 10,
    paddingHorizontal: 4,
    fontSize: 12,
    lineHeight: 16,
    zIndex: 1,
  },
  outlinedRestingLabel: {
    position: 'absolute',
    zIndex: 1,
  },
  filledFloatingLabel: {
    position: 'absolute',
    top: 4,
    left: 12,
    fontSize: 12,
    lineHeight: 14,
    zIndex: 1,
  },
  filledRestingLabel: {
    position: 'absolute',
    zIndex: 1,
  },
  subscript: {
    paddingHorizontal: 12,
    paddingTop: 2,
  },
  subscriptFixed: {
    minHeight: 20,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
  },
});

/**
 * Material 3 form-field molecule providing outlined or filled container chrome,
 * floating label, prefix/suffix slots, and hint or error helper text around a
 * single nested form-control atom (`MagicTextInput`, `MagicSelect`, etc.).
 */
export function MagicFormField({
  id,
  testId,
  ariaLabel,
  label,
  hint,
  errorText,
  appearance = 'outlined',
  size = 'md',
  floatLabel = 'auto',
  subscriptSizing = 'fixed',
  hideRequiredMarker = false,
  prefix,
  suffix,
  required = false,
  disabled = false,
  children,
  style,
  ref,
}: MagicFormFieldProps) {
  const { theme, colors } = useMagicPaperColors();
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const controlId = `${baseId}-control`;
  const labelId = `${baseId}-label`;
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;

  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const hasError = Boolean(errorText);
  const helperMessage = errorText ?? hint;
  const describedBy = hasError ? errorId : hint ? hintId : undefined;
  const isLabelFloating = floatLabel === 'always' || focused || hasValue;
  const showRequiredMarker = Boolean(required && !hideRequiredMarker);
  const formattedLabel = label
    ? showRequiredMarker
      ? `${label} *`
      : label
    : undefined;

  const metrics = MAGIC_PAPER_SIZE_METRICS[size];
  const horizontalPadding = Math.max(
    10,
    Math.round(metrics.paddingHorizontal * 0.5)
  );
  const borderWidth = focused || hasError ? 2 : 1;

  const labelColor = disabled
    ? colors.onSurfaceDisabled
    : hasError
      ? colors.error
      : focused
        ? colors.primary
        : colors.onSurfaceVariant;

  const borderColor = disabled
    ? colors.surfaceDisabled
    : hasError
      ? colors.error
      : focused
        ? colors.primary
        : appearance === 'filled'
          ? colors.onSurfaceVariant
          : colors.outline;

  const contextValue = useMemo<MagicFormFieldContextValue>(
    () => ({
      controlId,
      labelId,
      hintId,
      errorId,
      describedBy,
      label,
      hint,
      errorText,
      hasError,
      appearance,
      size,
      floatLabel,
      subscriptSizing,
      hideRequiredMarker,
      disabled,
      required,
      focused,
      hasValue,
      setFocused,
      setHasValue,
      prefix,
      suffix,
    }),
    [
      controlId,
      labelId,
      hintId,
      errorId,
      describedBy,
      label,
      hint,
      errorText,
      hasError,
      appearance,
      size,
      floatLabel,
      subscriptSizing,
      hideRequiredMarker,
      disabled,
      required,
      focused,
      hasValue,
      prefix,
      suffix,
    ]
  );

  const isFilled = appearance === 'filled';
  const restingLabelLeft = prefix
    ? horizontalPadding + metrics.iconSize + 8
    : horizontalPadding;

  const fieldContainerStyle: StyleProp<ViewStyle> = isFilled
    ? [
        styles.filledWrapper,
        {
          minHeight: metrics.height + (formattedLabel ? 14 : 8),
          paddingHorizontal: horizontalPadding,
          paddingTop: formattedLabel ? 18 : 6,
          paddingBottom: 6,
          backgroundColor: disabled
            ? colors.surfaceDisabled
            : colors.surfaceVariant,
          borderBottomWidth: borderWidth,
          borderBottomColor: borderColor,
        },
      ]
    : [
        styles.outlinedWrapper,
        {
          minHeight: metrics.height + 8,
          marginTop: formattedLabel ? 6 : 0,
          paddingHorizontal: horizontalPadding,
          paddingVertical: 4,
          borderRadius: theme.roundness,
          borderWidth,
          borderColor,
          backgroundColor: 'transparent',
        },
      ];

  return (
    <MagicFormFieldProvider value={contextValue}>
      <View
        ref={ref}
        nativeID={id}
        testID={testId}
        accessibilityLabel={ariaLabel}
        style={[styles.root, style]}
      >
        <View
          testID={testId ? `${testId}-container` : undefined}
          style={fieldContainerStyle}
        >
          {formattedLabel ? (
            <Text
              nativeID={labelId}
              testID={testId ? `${testId}-label` : undefined}
              numberOfLines={1}
              pointerEvents="none"
              style={[
                isFilled
                  ? isLabelFloating
                    ? styles.filledFloatingLabel
                    : [styles.filledRestingLabel, { left: restingLabelLeft }]
                  : isLabelFloating
                    ? [
                        styles.outlinedFloatingLabel,
                        { backgroundColor: colors.background },
                      ]
                    : [styles.outlinedRestingLabel, { left: restingLabelLeft }],
                {
                  color: labelColor,
                  fontSize: isLabelFloating ? 12 : metrics.fontSize,
                },
              ]}
            >
              {formattedLabel}
            </Text>
          ) : null}

          <View style={styles.contentRow}>
            {prefix ? (
              <View
                style={styles.affixSlot}
                testID={testId ? `${testId}-prefix` : undefined}
              >
                {prefix}
              </View>
            ) : null}
            <View style={styles.controlSlot}>{children}</View>
            {suffix ? (
              <View
                style={styles.affixSlot}
                testID={testId ? `${testId}-suffix` : undefined}
              >
                {suffix}
              </View>
            ) : null}
          </View>
        </View>

        {helperMessage ? (
          <View
            style={[
              styles.subscript,
              subscriptSizing === 'fixed' ? styles.subscriptFixed : undefined,
            ]}
          >
            <HelperText
              type={hasError ? 'error' : 'info'}
              visible
              disabled={disabled}
              padding="none"
              nativeID={hasError ? errorId : hintId}
              testID={
                testId ? `${testId}-${hasError ? 'error' : 'hint'}` : undefined
              }
              style={styles.helperText}
            >
              {helperMessage}
            </HelperText>
          </View>
        ) : subscriptSizing === 'fixed' ? (
          <View
            style={[styles.subscript, styles.subscriptFixed]}
            testID={testId ? `${testId}-subscript-spacer` : undefined}
          />
        ) : null}
      </View>
    </MagicFormFieldProvider>
  );
}
