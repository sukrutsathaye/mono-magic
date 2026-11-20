import MuiTextField, {
  type TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import type {
  AtomicSize,
  TextInputAtomProps,
  TextInputVariant,
} from '@mono-magic/atomic-design-interfaces';

export interface MagicTextInputProps extends TextInputAtomProps {
  onChange?: (value: string) => void;
  onSubmit?: () => void;
}

const VARIANT_MAP: Record<TextInputVariant, MuiTextFieldProps['variant']> = {
  outlined: 'outlined',
  filled: 'filled',
};

const SIZE_MAP: Record<AtomicSize, MuiTextFieldProps['size']> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'medium',
  xl: 'medium',
};

export function MagicTextInput({
  id,
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
  onChange,
  onSubmit,
}: MagicTextInputProps) {
  const hasError = Boolean(errorText);

  return (
    <MuiTextField
      id={id}
      label={label}
      value={value}
      placeholder={placeholder}
      variant={VARIANT_MAP[variant]}
      size={SIZE_MAP[size]}
      disabled={disabled}
      required={required}
      error={hasError}
      helperText={errorText ?? helperText}
      fullWidth
      slotProps={{
        input: { readOnly },
        htmlInput: {
          'data-testid': testId,
          'aria-label': ariaLabel ?? label,
        },
      }}
      onChange={(event) => onChange?.(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onSubmit?.();
        }
      }}
    />
  );
}
