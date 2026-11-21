import {
  useCallback,
  useEffect,
  useState,
  type Ref,
} from 'react';
import {
  Platform,
  StyleSheet,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps as RNTextInputProps,
  type TextStyle,
} from 'react-native';
import type {
  TextInputControlProps,
  TextInputType,
} from '@mono-magic/atomic-design-interfaces';
import { useMagicFormFieldContext } from '../../core/form-field-context';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_PAPER_SIZE_METRICS,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export interface MagicTextInputProps extends TextInputControlProps {
  /** Initial value used when the input is uncontrolled (`value` is omitted). */
  defaultValue?: string;
  /** Explicit invalid state override (merged with enclosing `MagicFormField` error state). */
  invalid?: boolean;
  /** Called with the updated string whenever the input text changes. */
  onChange?: (value: string) => void;
  /** React Native ergonomic alias for `onChange`. */
  onChangeText?: (value: string) => void;
  /** Called with the current string when the user submits the input (e.g. Enter/Done). */
  onSubmit?: (value: string) => void;
  /** Called when the input loses focus. */
  onBlur?: () => void;
  /** Called when the input receives focus. */
  onFocus?: () => void;
  /** Style override applied to the underlying `TextInput`. */
  style?: StyleProp<TextStyle>;
  /** React 19 ref forwarded directly to the underlying `TextInput`. */
  ref?: Ref<RNTextInput>;
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    paddingVertical: 4,
  },
  inField: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  webFramelessFocus: {
    // Suppress default browser focus ring inside MagicFormField, which renders the M3 focus border.
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
      default: {},
    }),
  },
});

function mapInputTypeProps(type: TextInputType): Partial<RNTextInputProps> {
  switch (type) {
    case 'email':
      return {
        keyboardType: 'email-address',
        inputMode: 'email',
        autoCapitalize: 'none',
      };
    case 'tel':
      return {
        keyboardType: 'phone-pad',
        inputMode: 'tel',
      };
    case 'url':
      return {
        keyboardType: 'url',
        inputMode: 'url',
        autoCapitalize: 'none',
      };
    case 'number':
      return {
        keyboardType: 'numeric',
        inputMode: 'numeric',
      };
    case 'password':
      return {
        secureTextEntry: true,
        autoCapitalize: 'none',
      };
    case 'search':
      return {
        inputMode: 'search',
        returnKeyType: 'search',
      };
    case 'text':
    default:
      return {
        keyboardType: 'default',
        inputMode: 'text',
      };
  }
}

/**
 * Bare, single-element text input atom implementing `TextInputControlProps`.
 *
 * Renders a frameless input flush inside `MagicFormField` (inheriting IDs,
 * size, disabled, required, and error states from `MagicFormFieldContext`), or
 * a clean bordered standalone `TextInput` when rendered on its own.
 */
export function MagicTextInput({
  id,
  testId,
  ariaLabel,
  disabled,
  type = 'text',
  name: _name,
  value,
  defaultValue,
  placeholder,
  size,
  required,
  readOnly = false,
  autocomplete,
  minLength: _minLength,
  maxLength,
  invalid = false,
  onChange,
  onChangeText,
  onSubmit,
  onBlur,
  onFocus,
  style,
  ref,
}: MagicTextInputProps) {
  const field = useMagicFormFieldContext();
  const { theme, colors } = useMagicPaperColors();
  const [standaloneFocused, setStandaloneFocused] = useState(false);

  const handleValueChange = useCallback(
    (next: string) => {
      onChange?.(next);
      onChangeText?.(next);
    },
    [onChange, onChangeText]
  );

  const [currentValue, setCurrentValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: handleValueChange,
  });

  const isInsideField = field !== null;
  const effectiveId = id ?? field?.controlId;
  const effectiveSize = size ?? field?.size ?? 'md';
  const isDisabled = Boolean(disabled ?? field?.disabled ?? false);
  const isRequired = Boolean(required ?? field?.required ?? false);
  const isInvalid = Boolean(invalid || field?.hasError);
  const metrics = MAGIC_PAPER_SIZE_METRICS[effectiveSize];

  const hasDisplayValue = Boolean(currentValue || placeholder);
  const setFieldHasValue = field?.setHasValue;
  const setFieldFocused = field?.setFocused;

  useEffect(() => {
    setFieldHasValue?.(hasDisplayValue);
  }, [setFieldHasValue, hasDisplayValue]);

  useEffect(() => {
    return () => {
      setFieldFocused?.(false);
    };
  }, [setFieldFocused]);

  const handleChangeText = useCallback(
    (next: string) => {
      if (isDisabled || readOnly) {
        return;
      }
      setCurrentValue(next);
    },
    [isDisabled, readOnly, setCurrentValue]
  );

  const handleFocus = useCallback(() => {
    setStandaloneFocused(true);
    setFieldFocused?.(true);
    onFocus?.();
  }, [setFieldFocused, onFocus]);

  const handleBlur = useCallback(() => {
    setStandaloneFocused(false);
    setFieldFocused?.(false);
    onBlur?.();
  }, [setFieldFocused, onBlur]);

  const handleSubmitEditing = useCallback(() => {
    if (!isDisabled) {
      onSubmit?.(currentValue);
    }
  }, [currentValue, isDisabled, onSubmit]);

  const typeProps = mapInputTypeProps(type);
  const effectiveAriaLabel = ariaLabel ?? field?.label;
  const effectiveLabelledBy =
    !ariaLabel && field?.label ? field.labelId : undefined;

  const standaloneBorderColor = isDisabled
    ? colors.surfaceDisabled
    : isInvalid
      ? colors.error
      : standaloneFocused
        ? colors.primary
        : colors.outline;

  const horizontalPadding = Math.max(
    10,
    Math.round(metrics.paddingHorizontal * 0.5)
  );

  const webExtraProps: Partial<RNTextInputProps> =
    Platform.OS === 'web'
      ? ({
          disabled: isDisabled,
          'aria-describedby': field?.describedBy,
          'aria-invalid': isInvalid ? true : undefined,
          'aria-required': isRequired ? true : undefined,
          'aria-readonly': readOnly ? true : undefined,
        } as Partial<RNTextInputProps>)
      : {};

  return (
    <RNTextInput
      ref={ref}
      nativeID={effectiveId}
      testID={testId}
      value={currentValue}
      placeholder={placeholder}
      placeholderTextColor={
        isDisabled ? colors.onSurfaceDisabled : colors.onSurfaceVariant
      }
      editable={!isDisabled && !readOnly}
      readOnly={readOnly}
      maxLength={maxLength}
      autoComplete={autocomplete as RNTextInputProps['autoComplete']}
      accessibilityLabel={effectiveAriaLabel}
      aria-labelledby={effectiveLabelledBy}
      accessibilityState={{ disabled: isDisabled }}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSubmitEditing={handleSubmitEditing}
      {...typeProps}
      {...webExtraProps}
      style={[
        styles.base,
        {
          fontSize: metrics.fontSize,
          color: isDisabled ? colors.onSurfaceDisabled : colors.onSurface,
        },
        isInsideField
          ? [
              styles.inField,
              styles.webFramelessFocus,
              { minHeight: Math.max(24, metrics.height - 8) },
            ]
          : {
              minHeight: metrics.height,
              paddingHorizontal: horizontalPadding,
              borderRadius: theme.roundness,
              borderWidth: standaloneFocused || isInvalid ? 2 : 1,
              borderColor: standaloneBorderColor,
              backgroundColor: isDisabled
                ? colors.surfaceDisabled
                : colors.surface,
            },
        style,
      ]}
    />
  );
}
