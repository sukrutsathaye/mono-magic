import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FocusEventHandler,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput, {
  type OutlinedInputProps,
} from '@mui/material/OutlinedInput';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  TextInputControlProps,
} from '@mono-magic/atomic-design-interfaces';
import { useMagicFormFieldContext } from '../../core/form-field-context';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { MAGIC_SIZE_METRICS } from '../../theme/mui-theme';

/**
 * Props for {@link MagicTextInput}, extending bare {@link TextInputControlProps}
 * without label, hint, error text, or variant props (owned by `MagicFormField`).
 */
export interface MagicTextInputProps extends TextInputControlProps {
  /** Initial text value when used in uncontrolled mode. */
  defaultValue?: string;
  /** Marks the control as invalid (`aria-invalid="true"` and error outline styling). */
  invalid?: boolean;
  /** Whether the input stretches to fill its container width. Defaults to `true`. */
  fullWidth?: boolean;
  /** Standard React camelCase alias for `autocomplete`. */
  autoComplete?: string;
  /** Called with the updated string whenever the user edits the input. */
  onChange?: (value: string) => void;
  /** Called with the current string value when the user presses Enter. */
  onSubmit?: (value: string) => void;
  /** Native blur event handler forwarded from the inner `<input>`. */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /** Native focus event handler forwarded from the inner `<input>`. */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /** Optional MUI `sx` style overrides. */
  sx?: SxProps<Theme>;
  /** Optional MUI v9 `slotProps` overrides (`root` and `input`). */
  slotProps?: OutlinedInputProps['slotProps'];
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `<input>` element. */
  ref?: Ref<HTMLInputElement>;
}

const INPUT_VERTICAL_PADDING: Record<AtomicSize, string> = {
  xs: '4px',
  sm: '6px',
  md: '8.5px',
  lg: '12px',
  xl: '15.5px',
};

function renderAdornment(
  content: ReactNode,
  position: 'start' | 'end',
  size: AtomicSize,
) {
  if (content === null || content === undefined || content === false) {
    return undefined;
  }
  const node =
    typeof content === 'string' ? (
      <MagicIcon icon={content} size={size} />
    ) : (
      content
    );
  return <InputAdornment position={position}>{node}</InputAdornment>;
}

/**
 * A bare, single-control text input atom implementing {@link TextInputControlProps}.
 *
 * Wrap `MagicTextInput` inside `MagicFormField` when a floating label, hint,
 * error text, or prefix/suffix adornment is needed, or render it standalone for
 * compact inline inputs. Supports both controlled (`value` + `onChange`) and
 * uncontrolled (`defaultValue`) usage as well as native `<form>` / `FormData`.
 */
export function MagicTextInput({
  id,
  testId,
  ariaLabel,
  type = 'text',
  name,
  value,
  defaultValue = '',
  placeholder,
  size,
  disabled,
  required,
  readOnly = false,
  autocomplete,
  autoComplete,
  minLength,
  maxLength,
  invalid = false,
  fullWidth = true,
  onChange,
  onSubmit,
  onBlur,
  onFocus,
  sx,
  slotProps,
  className,
  ref,
}: MagicTextInputProps) {
  const fieldCtx = useMagicFormFieldContext();
  const generatedId = useId();
  const [focused, setFocused] = useState(false);

  const [currentValue, setCurrentValue] = useControllableState<string>({
    value,
    defaultValue,
    onChange,
  });

  const resolvedId = id ?? fieldCtx?.controlId ?? `${generatedId}-input`;
  const resolvedSize: AtomicSize = size ?? fieldCtx?.size ?? 'md';
  const resolvedDisabled = disabled ?? fieldCtx?.disabled ?? false;
  const resolvedRequired = required ?? fieldCtx?.required ?? false;
  const resolvedError = Boolean(invalid || fieldCtx?.hasError);
  const resolvedAutoComplete = autoComplete ?? autocomplete;
  const isFilled = currentValue.length > 0;

  const setFieldFilled = fieldCtx?.setFilled;
  const setFieldRequired = fieldCtx?.setRequired;
  const setFieldDisabled = fieldCtx?.setDisabled;
  const setFieldFocused = fieldCtx?.setFocused;

  useEffect(() => {
    setFieldFilled?.(isFilled);
  }, [setFieldFilled, isFilled]);

  useEffect(() => {
    if (required !== undefined) {
      setFieldRequired?.(required);
    }
  }, [setFieldRequired, required]);

  useEffect(() => {
    if (disabled !== undefined) {
      setFieldDisabled?.(disabled);
    }
  }, [setFieldDisabled, disabled]);

  useEffect(() => {
    return () => {
      setFieldFocused?.(false);
    };
  }, [setFieldFocused]);

  const metrics = MAGIC_SIZE_METRICS[resolvedSize];
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(event.target.value);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    setFieldFocused?.(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setFieldFocused?.(false);
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit?.(currentValue);
    }
  };

  const mergedSlotProps: OutlinedInputProps['slotProps'] = {
    ...slotProps,
    input: {
      minLength,
      maxLength,
      'aria-label': ariaLabel,
      'aria-describedby': fieldCtx?.helperId,
      'aria-invalid': resolvedError || undefined,
      ...(testId ? { 'data-testid': testId } : {}),
      ...slotProps?.input,
    },
  };

  const startAdornment = fieldCtx
    ? renderAdornment(fieldCtx.prefix, 'start', resolvedSize)
    : undefined;
  const endAdornment = fieldCtx
    ? renderAdornment(fieldCtx.suffix, 'end', resolvedSize)
    : undefined;

  const commonProps = {
    id: resolvedId,
    name,
    type,
    value: currentValue,
    placeholder,
    disabled: resolvedDisabled,
    required: resolvedRequired,
    readOnly,
    autoComplete: resolvedAutoComplete,
    error: resolvedError,
    fullWidth,
    size: (resolvedSize === 'xs' || resolvedSize === 'sm'
      ? 'small'
      : 'medium') as 'small' | 'medium',
    startAdornment,
    endAdornment,
    inputRef: ref,
    slotProps: mergedSlotProps,
    className,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
  };

  if (fieldCtx?.appearance === 'filled') {
    return (
      <FilledInput
        {...commonProps}
        sx={[
          {
            fontSize: metrics.fontSize,
            minHeight: Math.max(metrics.height, fieldCtx.label ? 48 : metrics.height),
          },
          ...extraSx,
        ]}
      />
    );
  }

  const notched = fieldCtx?.label
    ? fieldCtx.floatLabel === 'always' ||
      focused ||
      isFilled ||
      Boolean(fieldCtx.prefix)
    : undefined;

  return (
    <OutlinedInput
      {...commonProps}
      label={fieldCtx?.label}
      notched={notched}
      sx={[
        {
          minHeight: metrics.height,
          fontSize: metrics.fontSize,
          '& .MuiOutlinedInput-input': {
            py: INPUT_VERTICAL_PADDING[resolvedSize],
          },
        },
        ...extraSx,
      ]}
    />
  );
}
