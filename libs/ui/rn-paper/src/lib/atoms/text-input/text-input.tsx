import { useState } from 'react';
import { View } from 'react-native';
import {
  HelperText,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import type { TextInputAtomProps } from '@mono-magic/atomic-design-interfaces';

export interface MagicTextInputProps extends TextInputAtomProps {
  onChangeText?: (value: string) => void;
  onSubmitEditing?: () => void;
}

export function MagicTextInput({
  testId,
  ariaLabel,
  label,
  value,
  placeholder,
  helperText,
  errorText,
  variant = 'outlined',
  size = 'md',
  disabled = false,
  required = false,
  readOnly = false,
  onChangeText,
  onSubmitEditing,
}: MagicTextInputProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');
  const currentValue = value ?? internalValue;
  const hasError = Boolean(errorText);
  const helperMessage = errorText ?? helperText;
  const computedLabel = required ? `${label} *` : label;

  const handleChangeText = (next: string) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onChangeText?.(next);
  };

  return (
    <View>
      <PaperTextInput
        testID={testId}
        accessibilityLabel={ariaLabel ?? label}
        mode={variant === 'filled' ? 'flat' : 'outlined'}
        label={computedLabel}
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        editable={!readOnly && !disabled}
        error={hasError}
        dense={size === 'xs' || size === 'sm'}
        onChangeText={handleChangeText}
        onSubmitEditing={onSubmitEditing}
      />
      {helperMessage ? (
        <HelperText type={hasError ? 'error' : 'info'} visible>
          {helperMessage}
        </HelperText>
      ) : null}
    </View>
  );
}
