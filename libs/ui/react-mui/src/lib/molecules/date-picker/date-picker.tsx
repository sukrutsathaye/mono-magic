import { useId, type ChangeEvent, type Ref } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  DatePickerMoleculeProps,
  DateRangeValue,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { MAGIC_SIZE_METRICS, resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicDatePicker}, extending {@link DatePickerMoleculeProps}
 * with single-date and date-range callbacks and React 19 / MUI v9 styling ergonomics.
 */
export interface MagicDatePickerProps extends DatePickerMoleculeProps {
  /** Invoked when the single-date value changes in `mode="single"`. */
  onChange?: (value: string | null) => void;
  /** Invoked when either start or end date changes in `mode="range"`. */
  onRangeChange?: (range: DateRangeValue) => void;
  /** Whether the picker stretches to fill its container width. Defaults to `true`. */
  fullWidth?: boolean;
  /** Optional MUI `sx` overrides applied to the outer `FormControl`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer `FormControl`. */
  className?: string;
  /** React 19 ref forwarded directly to the outer `FormControl` `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const DATE_INPUT_VERTICAL_PADDING: Record<AtomicSize, string> = {
  xs: '5px',
  sm: '7px',
  md: '9.5px',
  lg: '12.5px',
  xl: '15.5px',
};

function normalizeBoundaryForType(
  boundary: string | undefined,
  enableTime: boolean,
): string | undefined {
  if (!boundary) {
    return undefined;
  }
  if (enableTime) {
    return boundary.includes('T') ? boundary.slice(0, 16) : `${boundary}T00:00`;
  }
  return boundary.slice(0, 10);
}

function clampDateString(
  raw: string,
  minDate: string | undefined,
  maxDate: string | undefined,
  enableTime: boolean,
): string {
  if (!raw) {
    return '';
  }
  const normalizedMin = normalizeBoundaryForType(minDate, enableTime);
  const normalizedMax = normalizeBoundaryForType(maxDate, enableTime);
  if (normalizedMin && raw < normalizedMin) {
    return normalizedMin;
  }
  if (normalizedMax && raw > normalizedMax) {
    return normalizedMax;
  }
  return raw;
}

function isRangeOutOfBounds(
  range: DateRangeValue,
  minDate: string | undefined,
  maxDate: string | undefined,
  enableTime: boolean,
): string | undefined {
  const normalizedMin = normalizeBoundaryForType(minDate, enableTime);
  const normalizedMax = normalizeBoundaryForType(maxDate, enableTime);
  if (range.start && range.end && range.start > range.end) {
    return 'Start date must be on or before end date.';
  }
  if (normalizedMin && range.start && range.start < normalizedMin) {
    return `Date must be on or after ${normalizedMin}.`;
  }
  if (normalizedMax && range.end && range.end > normalizedMax) {
    return `Date must be on or before ${normalizedMax}.`;
  }
  return undefined;
}

/**
 * Material 3 date/datetime picker molecule composing MUI v9 `FormControl`,
 * `TextField`, `IconButton`, and {@link MagicIcon}.
 *
 * Supports `mode="single"` and `mode="range"` (`start` + `end`), optional
 * `enableTime` (`datetime-local`), `minDate`/`maxDate` bounds & validation,
 * `clearable`, `readOnly`, `disabled`, `required`, `outlined`/`filled`
 * appearances, `errorText`, `hint`, and all 5 atomic sizes.
 */
export function MagicDatePicker({
  id,
  testId,
  ariaLabel,
  label,
  hint,
  errorText,
  appearance = 'outlined',
  size = 'md',
  subscriptSizing = 'fixed',
  hideRequiredMarker = false,
  mode = 'single',
  value,
  defaultValue = null,
  rangeValue,
  defaultRangeValue = { start: null, end: null },
  minDate,
  maxDate,
  enableTime = false,
  placeholder,
  startPlaceholder = 'Start date',
  endPlaceholder = 'End date',
  format,
  required = false,
  disabled = false,
  readOnly = false,
  clearable = true,
  color = 'primary',
  fullWidth = true,
  onChange,
  onRangeChange,
  sx,
  className,
  ref,
}: MagicDatePickerProps) {
  const theme = useTheme();
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const metrics = MAGIC_SIZE_METRICS[size];
  const intent = resolveMagicIntentColors(theme, color);

  const [currentSingle, setCurrentSingle] = useControllableState<string | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange,
  });

  const [currentRange, setCurrentRange] = useControllableState<DateRangeValue>({
    value: rangeValue ?? undefined,
    defaultValue: defaultRangeValue ?? { start: null, end: null },
    onChange: onRangeChange,
  });

  const inputType = enableTime ? 'datetime-local' : 'date';
  const resolvedMin = normalizeBoundaryForType(minDate, enableTime);
  const resolvedMax = normalizeBoundaryForType(maxDate, enableTime);
  const muiSize: 'small' | 'medium' =
    size === 'xs' || size === 'sm' ? 'small' : 'medium';

  const rangeValidationError =
    mode === 'range'
      ? isRangeOutOfBounds(currentRange, minDate, maxDate, enableTime)
      : undefined;

  const singleValidationError =
    mode === 'single' && currentSingle
      ? resolvedMin && currentSingle < resolvedMin
        ? `Date must be on or after ${resolvedMin}.`
        : resolvedMax && currentSingle > resolvedMax
          ? `Date must be on or before ${resolvedMax}.`
          : undefined
      : undefined;

  const effectiveErrorText =
    errorText ?? rangeValidationError ?? singleValidationError;
  const hasError = Boolean(effectiveErrorText);
  const helperId =
    effectiveErrorText || hint || format ? `${baseId}-helper` : undefined;
  const subscriptText =
    effectiveErrorText ?? hint ?? (format ? `Format: ${format}` : undefined);

  const showRequiredMarker = required && !hideRequiredMarker;

  const handleSingleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) {
      return;
    }
    const raw = event.target.value;
    if (!raw) {
      setCurrentSingle(null);
      return;
    }
    const clamped = clampDateString(raw, minDate, maxDate, enableTime);
    setCurrentSingle(clamped);
  };

  const handleRangePartChange =
    (part: 'start' | 'end') => (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) {
        return;
      }
      const raw = event.target.value;
      const clamped = raw
        ? clampDateString(raw, minDate, maxDate, enableTime)
        : null;
      const next: DateRangeValue =
        part === 'start'
          ? {
              start: clamped,
              end:
                clamped && currentRange.end && clamped > currentRange.end
                  ? clamped
                  : currentRange.end,
            }
          : {
              start:
                clamped && currentRange.start && clamped < currentRange.start
                  ? clamped
                  : currentRange.start,
              end: clamped,
            };
      setCurrentRange(next);
    };

  const handleClear = () => {
    if (disabled || readOnly) {
      return;
    }
    if (mode === 'range') {
      setCurrentRange({ start: null, end: null });
    } else {
      setCurrentSingle(null);
    }
  };

  const hasValue =
    mode === 'range'
      ? Boolean(currentRange.start || currentRange.end)
      : Boolean(currentSingle);

  const sharedInputSx = {
    '& .MuiInputBase-root': {
      minHeight: metrics.height,
      fontSize: metrics.fontSize,
    },
    '& .MuiOutlinedInput-input': {
      py: DATE_INPUT_VERTICAL_PADDING[size],
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: hasError ? theme.palette.error.main : intent.main,
    },
  };

  const clearButton =
    clearable && hasValue && !disabled && !readOnly ? (
      <InputAdornment position="end">
        <IconButton
          size="small"
          aria-label="Clear date"
          data-testid={testId ? `${testId}-clear` : undefined}
          onClick={handleClear}
          edge="end"
        >
          <MagicIcon icon="close" size="xs" />
        </IconButton>
      </InputAdornment>
    ) : undefined;

  return (
    <FormControl
      ref={ref}
      id={id}
      data-testid={testId}
      data-mode={mode}
      data-appearance={appearance}
      data-size={size}
      aria-label={ariaLabel}
      error={hasError}
      required={showRequiredMarker}
      disabled={disabled}
      fullWidth={fullWidth}
      className={className}
      sx={extraSx}
    >
      {label ? (
        <FormLabel
          htmlFor={mode === 'single' ? `${baseId}-input` : `${baseId}-start`}
          required={showRequiredMarker}
          sx={{
            fontSize: metrics.fontSize - 1,
            fontWeight: 500,
            mb: 0.75,
            color: hasError
              ? theme.palette.error.main
              : theme.palette.text.secondary,
          }}
        >
          {label}
        </FormLabel>
      ) : null}

      {mode === 'range' ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <TextField
            id={`${baseId}-start`}
            type={inputType}
            variant={appearance}
            size={muiSize}
            fullWidth={fullWidth}
            value={currentRange.start ?? ''}
            placeholder={startPlaceholder}
            required={required}
            disabled={disabled}
            error={hasError}
            onChange={handleRangePartChange('start')}
            slotProps={{
              htmlInput: {
                min: resolvedMin,
                max: currentRange.end ?? resolvedMax,
                readOnly,
                'aria-label': startPlaceholder,
                'aria-describedby': helperId,
                'aria-invalid': hasError || undefined,
                ...(testId ? { 'data-testid': `${testId}-start` } : {}),
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MagicIcon icon="event" size="xs" color={color} />
                  </InputAdornment>
                ),
              },
            }}
            sx={sharedInputSx}
          />
          <Box
            component="span"
            aria-hidden="true"
            sx={{ color: 'text.secondary', fontSize: metrics.fontSize, px: 0.25 }}
          >
            to
          </Box>
          <TextField
            id={`${baseId}-end`}
            type={inputType}
            variant={appearance}
            size={muiSize}
            fullWidth={fullWidth}
            value={currentRange.end ?? ''}
            placeholder={endPlaceholder}
            required={required}
            disabled={disabled}
            error={hasError}
            onChange={handleRangePartChange('end')}
            slotProps={{
              htmlInput: {
                min: currentRange.start ?? resolvedMin,
                max: resolvedMax,
                readOnly,
                'aria-label': endPlaceholder,
                'aria-describedby': helperId,
                'aria-invalid': hasError || undefined,
                ...(testId ? { 'data-testid': `${testId}-end` } : {}),
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MagicIcon icon="event" size="xs" color={color} />
                  </InputAdornment>
                ),
                endAdornment: clearButton,
              },
            }}
            sx={sharedInputSx}
          />
        </Stack>
      ) : (
        <TextField
          id={`${baseId}-input`}
          type={inputType}
          variant={appearance}
          size={muiSize}
          fullWidth={fullWidth}
          value={currentSingle ?? ''}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={hasError}
          onChange={handleSingleChange}
          slotProps={{
            htmlInput: {
              min: resolvedMin,
              max: resolvedMax,
              readOnly,
              'aria-label': ariaLabel ?? label ?? placeholder ?? 'Date',
              'aria-describedby': helperId,
              'aria-invalid': hasError || undefined,
              ...(testId ? { 'data-testid': `${testId}-input` } : {}),
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MagicIcon
                    icon={enableTime ? 'schedule' : 'calendar_today'}
                    size="xs"
                    color={hasError ? 'error' : color}
                  />
                </InputAdornment>
              ),
              endAdornment: clearButton,
            },
          }}
          sx={sharedInputSx}
        />
      )}

      {subscriptText ? (
        <FormHelperText
          id={helperId}
          error={hasError}
          role={hasError ? 'alert' : undefined}
          sx={subscriptSizing === 'fixed' ? { minHeight: '1.25em', mx: 0 } : { mx: 0 }}
        >
          {subscriptText}
        </FormHelperText>
      ) : subscriptSizing === 'fixed' ? (
        <FormHelperText
          aria-hidden="true"
          sx={{ minHeight: '1.25em', visibility: 'hidden', mx: 0 }}
        >
          {'\u00A0'}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}
