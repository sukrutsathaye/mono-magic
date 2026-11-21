import { useId, type Ref } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiRadio from '@mui/material/Radio';
import MuiRadioGroup from '@mui/material/RadioGroup';
import {
  alpha,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material/styles';
import type {
  AtomicSize,
  ColorIntent,
  RadioButtonAtomProps,
  RadioOption,
} from '@mono-magic/atomic-design-interfaces';
import { useControllableState } from '../../core/use-controllable-state';
import { MAGIC_SIZE_METRICS, resolveMagicIntentColors } from '../../theme/mui-theme';

export type { RadioOption };

/**
 * Props for {@link MagicRadioButton}, extending {@link RadioButtonAtomProps}
 * with React 19 / MUI v9 ergonomics (`defaultValue`, `onChange`, `sx`,
 * `className`, and direct `ref` prop).
 */
export interface MagicRadioButtonProps<T = string>
  extends RadioButtonAtomProps<T> {
  /** Initial selected value used in uncontrolled mode. */
  defaultValue?: T;
  /** Callback fired with the selected option value when selection changes. */
  onChange?: (value: T) => void;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `RadioGroup` container. */
  ref?: Ref<HTMLDivElement>;
}

const RADIO_ICON_SIZE: Record<AtomicSize, number> = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 28,
};

function resolveRadioSx(
  theme: Theme,
  color: ColorIntent,
  size: AtomicSize,
  isAriaDisabled: boolean,
) {
  const intent = resolveMagicIntentColors(theme, color);
  const iconDim = RADIO_ICON_SIZE[size];

  return {
    color: isAriaDisabled
      ? theme.palette.action.disabled
      : theme.palette.magic?.onSurfaceVariant ?? theme.palette.text.secondary,
    '& .MuiSvgIcon-root': {
      fontSize: iconDim,
    },
    '&.Mui-checked': {
      color: isAriaDisabled ? theme.palette.action.disabled : intent.main,
    },
    '&:hover': {
      backgroundColor: isAriaDisabled
        ? 'transparent'
        : alpha(intent.main, 0.08),
    },
    ...(isAriaDisabled
      ? {
          cursor: 'not-allowed',
        }
      : {}),
  };
}

/**
 * Material 3 radio button group atom wrapping MUI's `RadioGroup`,
 * `FormControlLabel`, and `Radio`.
 *
 * Supports generic option values, controlled (`value` + `onChange`) and
 * uncontrolled (`defaultValue`) modes, horizontal or vertical layouts,
 * `before`/`after` label placement, all 5 sizes, all 7 semantic colors, and
 * focusable `disabledInteractive` (`aria-disabled="true"`).
 */
export function MagicRadioButton<T = string>({
  id,
  testId,
  ariaLabel,
  options,
  value,
  defaultValue,
  name,
  labelPosition = 'after',
  required = false,
  disabled = false,
  disabledInteractive = false,
  disableRipple = false,
  vertical = false,
  color = 'primary',
  size = 'md',
  onChange,
  sx,
  className,
  ref,
}: MagicRadioButtonProps<T>) {
  const theme = useTheme();
  const generatedName = useId();
  const resolvedName = name || generatedName;
  const metrics = MAGIC_SIZE_METRICS[size];
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const [selectedValue, setSelectedValue] = useControllableState<T | undefined>(
    {
      value,
      defaultValue,
      onChange: (next) => {
        if (next !== undefined) {
          onChange?.(next);
        }
      },
    },
  );

  const selectedIndex = options.findIndex((opt) =>
    Object.is(opt.value, selectedValue),
  );
  const groupControlValue = selectedIndex >= 0 ? String(selectedIndex) : '';

  const isGroupAriaDisabled = disabled && disabledInteractive;

  const handleGroupChange = (_event: unknown, rawIndex: string) => {
    if (disabled) {
      return;
    }
    const idx = Number(rawIndex);
    const option = options[idx];
    if (!option) {
      return;
    }
    if (option.disabled) {
      return;
    }
    setSelectedValue(option.value);
  };

  return (
    <MuiRadioGroup
      ref={ref}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-disabled={isGroupAriaDisabled || undefined}
      name={resolvedName}
      row={!vertical}
      value={groupControlValue}
      onChange={handleGroupChange}
      className={className}
      sx={[
        {
          gap: vertical ? 0.25 : 1.5,
        },
        ...extraSx,
      ]}
    >
      {options.map((option, index) => {
        const optionDisabled = Boolean(option.disabled);
        const optionEffectiveDisabled = disabled || optionDisabled;
        const isNativeDisabled =
          (optionEffectiveDisabled && !disabledInteractive) ||
          (optionDisabled && !disabledInteractive);
        const isAriaDisabled =
          (optionEffectiveDisabled && disabledInteractive) || undefined;
        const placement =
          (option.labelPosition ?? labelPosition) === 'before'
            ? 'start'
            : 'end';

        return (
          <FormControlLabel
            key={String(index)}
            value={String(index)}
            label={option.label}
            labelPlacement={placement}
            disabled={isNativeDisabled}
            sx={{
              m: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: metrics.fontSize,
                ...(isAriaDisabled
                  ? {
                      color: theme.palette.text.disabled,
                      cursor: 'not-allowed',
                    }
                  : {}),
              },
            }}
            control={
              <MuiRadio
                color={color}
                size={size === 'xs' || size === 'sm' ? 'small' : 'medium'}
                required={option.required ?? required}
                disableRipple={disableRipple}
                slotProps={{
                  input: {
                    'aria-disabled': isAriaDisabled,
                  },
                }}
                onClick={
                  isAriaDisabled
                    ? (event) => {
                        event.preventDefault();
                      }
                    : undefined
                }
                sx={resolveRadioSx(
                  theme,
                  color,
                  size,
                  Boolean(isAriaDisabled),
                )}
              />
            }
          />
        );
      })}
    </MuiRadioGroup>
  );
}
