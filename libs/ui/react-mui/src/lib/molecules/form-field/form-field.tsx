import { useId, useMemo, useState, type ReactNode, type Ref } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FormFieldMoleculeProps } from '@mono-magic/atomic-design-interfaces';
import {
  MagicFormFieldContext,
  type MagicFormFieldContextValue,
} from '../../core/form-field-context';

/**
 * Props for {@link MagicFormField}, extending {@link FormFieldMoleculeProps}
 * with React 19 / MUI v9 composition and styling ergonomics.
 */
export interface MagicFormFieldProps extends FormFieldMoleculeProps {
  /** Form control child such as `<MagicTextInput />` or `<MagicSelect />`. */
  children?: ReactNode;
  /**
   * Leading adornment slot rendered inside the control container.
   * Pass a Material Icons ligature string (rendered via `MagicIcon`) or any `ReactNode`.
   */
  prefix?: ReactNode;
  /**
   * Trailing adornment slot rendered inside the control container.
   * Pass a Material Icons ligature string (rendered via `MagicIcon`) or any `ReactNode`.
   */
  suffix?: ReactNode;
  /** Whether the form field stretches to fill its container width. Defaults to `true`. */
  fullWidth?: boolean;
  /** Marks the field and its inner control as required. */
  required?: boolean;
  /** Disables the field and its inner control. */
  disabled?: boolean;
  /** Optional MUI `sx` overrides applied to the outer `FormControl`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer `FormControl`. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `FormControl` `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Material 3 form field shell wrapping bare form-control atoms (`MagicTextInput`, `MagicSelect`, etc.).
 *
 * Manages floating labels, helper hints, validation errors (`errorText` takes precedence over `hint`),
 * required markers, subscript spacing, and prefix/suffix adornments via React 19 `MagicFormFieldContext`.
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
  fullWidth = true,
  required,
  disabled,
  children,
  sx,
  className,
  ref,
}: MagicFormFieldProps) {
  const generatedId = useId();
  const controlId = `${generatedId}-control`;
  const labelId = label ? `${generatedId}-label` : undefined;

  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(false);
  const [controlRequired, setControlRequired] = useState(false);
  const [controlDisabled, setControlDisabled] = useState(false);

  const hasError = Boolean(errorText);
  const subscriptText = errorText ?? hint;
  const helperId = subscriptText ? `${generatedId}-helper` : undefined;

  const resolvedRequired = required ?? controlRequired;
  const resolvedDisabled = disabled ?? controlDisabled;
  const showRequiredMarker = resolvedRequired && !hideRequiredMarker;
  const shouldShrink =
    floatLabel === 'always' || focused || filled || Boolean(prefix);
  const muiSize = size === 'xs' || size === 'sm' ? 'small' : 'medium';

  const contextValue = useMemo<MagicFormFieldContextValue>(
    () => ({
      controlId,
      labelId,
      helperId,
      label,
      appearance,
      size,
      floatLabel,
      hideRequiredMarker,
      hasError,
      errorText,
      hint,
      required: resolvedRequired,
      disabled: resolvedDisabled,
      prefix,
      suffix,
      setFocused,
      setFilled,
      setRequired: setControlRequired,
      setDisabled: setControlDisabled,
    }),
    [
      controlId,
      labelId,
      helperId,
      label,
      appearance,
      size,
      floatLabel,
      hideRequiredMarker,
      hasError,
      errorText,
      hint,
      resolvedRequired,
      resolvedDisabled,
      prefix,
      suffix,
    ],
  );

  return (
    <FormControl
      ref={ref}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel}
      variant={appearance}
      size={muiSize}
      error={hasError}
      required={showRequiredMarker}
      disabled={resolvedDisabled}
      fullWidth={fullWidth}
      className={className}
      sx={sx}
    >
      {label ? (
        <InputLabel
          id={labelId}
          htmlFor={controlId}
          shrink={shouldShrink}
          required={showRequiredMarker}
        >
          {label}
        </InputLabel>
      ) : null}

      <MagicFormFieldContext value={contextValue}>
        {children}
      </MagicFormFieldContext>

      {subscriptText ? (
        <FormHelperText
          id={helperId}
          error={hasError}
          role={hasError ? 'alert' : undefined}
          sx={subscriptSizing === 'fixed' ? { minHeight: '1.25em' } : undefined}
        >
          {subscriptText}
        </FormHelperText>
      ) : subscriptSizing === 'fixed' ? (
        <FormHelperText
          aria-hidden="true"
          sx={{ minHeight: '1.25em', visibility: 'hidden' }}
        >
          {'\u00A0'}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}
