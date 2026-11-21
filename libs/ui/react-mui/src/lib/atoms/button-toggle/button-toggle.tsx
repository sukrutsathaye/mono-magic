import type { MouseEvent, Ref } from 'react';
import MuiToggleButton from '@mui/material/ToggleButton';
import MuiToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
  alpha,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material/styles';
import type {
  AtomicSize,
  ButtonToggleAtomProps,
  ButtonToggleOption,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_SIZE_METRICS,
  resolveMagicIntentColors,
} from '../../theme/mui-theme';

export type { ButtonToggleOption };

/**
 * Props for {@link MagicButtonToggle}, extending {@link ButtonToggleAtomProps}
 * with React 19 / MUI v9 ergonomics (`defaultValue`, `onChange`, `sx`,
 * `className`, and direct `ref` prop).
 */
export interface MagicButtonToggleProps<T = string>
  extends ButtonToggleAtomProps<T> {
  /** Initial selected value(s) used in uncontrolled mode. */
  defaultValue?: T | readonly T[];
  /** Callback fired with the next selection (`T` in single mode, `T[]` in multiple mode). */
  onChange?: (value: T | T[]) => void;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `ToggleButtonGroup` element. */
  ref?: Ref<HTMLDivElement>;
}

const MUI_TOGGLE_SIZE_MAP: Record<AtomicSize, 'small' | 'medium' | 'large'> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'large',
  xl: 'large',
};

/**
 * Material 3 segmented button toggle group wrapping MUI's `ToggleButtonGroup`
 * and `ToggleButton`.
 *
 * Supports generic option values, single (`exclusive`) and multiple selection
 * modes, optional icons and selection checkmarks, `standard` and `legacy`
 * appearances, horizontal and vertical orientations, all 5 atomic sizes, all 7
 * semantic color intents, and focusable `disabledInteractive`.
 */
export function MagicButtonToggle<T = string>({
  id,
  testId,
  ariaLabel,
  options,
  value,
  defaultValue,
  selectionMode = 'single',
  vertical = false,
  appearance = 'standard',
  hideSelectionIndicator = false,
  disabled = false,
  disabledInteractive = false,
  size = 'md',
  color = 'primary',
  name,
  required = false,
  onChange,
  sx,
  className,
  ref,
}: MagicButtonToggleProps<T>) {
  const theme = useTheme();
  const intent = resolveMagicIntentColors(theme, color);
  const metrics = MAGIC_SIZE_METRICS[size];
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const isMultiple = selectionMode === 'multiple';

  const [selectedValue, setSelectedValue] = useControllableState<
    T | readonly T[] | undefined
  >({
    value,
    defaultValue:
      defaultValue !== undefined ? defaultValue : isMultiple ? [] : undefined,
    onChange: (next) => {
      if (next !== undefined) {
        onChange?.(Array.isArray(next) ? [...next] : (next as T));
      }
    },
  });

  const toGroupValue = (): string | string[] | null => {
    if (isMultiple) {
      const selectedArray = Array.isArray(selectedValue) ? selectedValue : [];
      return options
        .map((opt, idx) =>
          selectedArray.some((item) => Object.is(item, opt.value))
            ? String(idx)
            : null,
        )
        .filter((idx): idx is string => idx !== null);
    }

    const idx = options.findIndex((opt) =>
      Object.is(opt.value, selectedValue as T | undefined),
    );
    return idx >= 0 ? String(idx) : null;
  };

  const isSelectedIndex = (index: number): boolean => {
    const option = options[index];
    if (!option) {
      return false;
    }
    if (isMultiple) {
      const selectedArray = Array.isArray(selectedValue) ? selectedValue : [];
      return selectedArray.some((item) => Object.is(item, option.value));
    }
    return Object.is(option.value, selectedValue as T | undefined);
  };

  const handleGroupChange = (
    _event: MouseEvent<HTMLElement>,
    nextRaw: string | string[] | null,
  ) => {
    if (disabled) {
      return;
    }
    if (isMultiple) {
      const rawIndices = Array.isArray(nextRaw) ? nextRaw : [];
      const nextValues = rawIndices
        .map((idxStr) => options[Number(idxStr)])
        .filter((opt): opt is ButtonToggleOption<T> => Boolean(opt))
        .map((opt) => opt.value);
      setSelectedValue(nextValues);
      return;
    }

    if (nextRaw === null || Array.isArray(nextRaw)) {
      return;
    }
    const option = options[Number(nextRaw)];
    if (option) {
      setSelectedValue(option.value);
    }
  };

  const isLegacy = appearance === 'legacy';
  const outlineColor = theme.palette.magic?.outline ?? theme.palette.divider;

  return (
    <MuiToggleButtonGroup
      ref={ref}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-disabled={(disabled && disabledInteractive) || undefined}
      data-name={name || undefined}
      exclusive={!isMultiple}
      orientation={vertical ? 'vertical' : 'horizontal'}
      size={MUI_TOGGLE_SIZE_MAP[size]}
      disabled={disabled && !disabledInteractive}
      value={toGroupValue()}
      onChange={handleGroupChange}
      className={className}
      sx={[
        {
          borderRadius: isLegacy ? 1 : 9999,
          overflow: 'hidden',
          '& .MuiToggleButtonGroup-grouped': {
            borderColor: outlineColor,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: metrics.fontSize,
            minHeight: metrics.height,
            px: `${Math.max(12, Math.round(metrics.horizontalPadding * 0.75))}px`,
            gap: 0.75,
            color: theme.palette.text.primary,
            ...(isLegacy
              ? { borderRadius: 0 }
              : {
                  '&:first-of-type': {
                    borderTopLeftRadius: vertical ? 16 : 9999,
                    borderBottomLeftRadius: vertical ? 0 : 9999,
                    borderTopRightRadius: vertical ? 16 : 0,
                  },
                  '&:last-of-type': {
                    borderTopRightRadius: vertical ? 0 : 9999,
                    borderBottomRightRadius: vertical ? 16 : 9999,
                    borderBottomLeftRadius: vertical ? 16 : 0,
                  },
                }),
            '&:hover': {
              backgroundColor: alpha(intent.main, 0.08),
            },
            '&.Mui-selected': {
              backgroundColor: isLegacy ? intent.main : intent.container,
              color: isLegacy ? intent.contrastText : intent.onContainer,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: isLegacy
                  ? alpha(intent.main, 0.9)
                  : alpha(intent.container, 0.85),
              },
            },
            '&.Mui-disabled, &[aria-disabled="true"]': {
              color: theme.palette.action.disabled,
              backgroundColor: 'transparent',
              cursor: 'not-allowed',
            },
          },
        },
        ...extraSx,
      ]}
    >
      {options.map((option, index) => {
        const optionDisabled = Boolean(option.disabled);
        const effectiveDisabled = disabled || optionDisabled;
        const isNativeDisabled = effectiveDisabled && !disabledInteractive;
        const isAriaDisabled =
          (effectiveDisabled && disabledInteractive) || undefined;
        const isSelected = isSelectedIndex(index);

        return (
          <MuiToggleButton
            key={String(index)}
            value={String(index)}
            disabled={isNativeDisabled}
            aria-disabled={isAriaDisabled}
            aria-label={option.ariaLabel ?? option.label}
            onClick={
              isAriaDisabled
                ? (event) => {
                    event.preventDefault();
                  }
                : undefined
            }
          >
            {isSelected && !hideSelectionIndicator ? (
              <MagicIcon icon="check" size={size} />
            ) : null}
            {option.icon ? <MagicIcon icon={option.icon} size={size} /> : null}
            {option.label ? <span>{option.label}</span> : null}
          </MuiToggleButton>
        );
      })}
    </MuiToggleButtonGroup>
  );
}
