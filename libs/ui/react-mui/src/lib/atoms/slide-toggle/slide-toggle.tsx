import type { ChangeEvent, ReactNode, Ref } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiSwitch from '@mui/material/Switch';
import {
  alpha,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material/styles';
import type {
  AtomicSize,
  SlideToggleAtomProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_SIZE_METRICS,
  resolveMagicIntentColors,
} from '../../theme/mui-theme';

/**
 * Props for {@link MagicSlideToggle}, extending {@link SlideToggleAtomProps}
 * with React 19 / MUI v9 ergonomics (`defaultChecked`, `children`, `onChange`,
 * `onToggleChange`, `sx`, `className`, and direct `ref` prop).
 */
export interface MagicSlideToggleProps extends SlideToggleAtomProps {
  /** Initial checked state used in uncontrolled mode. Defaults to `false`. */
  defaultChecked?: boolean;
  /** Rich React label content; takes precedence over `label`. */
  children?: ReactNode;
  /** Callback fired with the next boolean state whenever the toggle changes. */
  onChange?: (checked: boolean) => void;
  /** Callback fired on toggle interaction (mirrors Material's toggleChange event). */
  onToggleChange?: () => void;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded to the outer label / switch wrapper. */
  ref?: Ref<HTMLLabelElement>;
}

interface SwitchSizeMetric {
  width: number;
  height: number;
  thumbUnchecked: number;
  thumbChecked: number;
  iconSize: number;
  translateX: number;
}

const SWITCH_SIZE_METRICS: Record<AtomicSize, SwitchSizeMetric> = {
  xs: {
    width: 36,
    height: 20,
    thumbUnchecked: 12,
    thumbChecked: 14,
    iconSize: 10,
    translateX: 16,
  },
  sm: {
    width: 42,
    height: 24,
    thumbUnchecked: 14,
    thumbChecked: 18,
    iconSize: 12,
    translateX: 18,
  },
  md: {
    width: 52,
    height: 32,
    thumbUnchecked: 16,
    thumbChecked: 24,
    iconSize: 16,
    translateX: 20,
  },
  lg: {
    width: 60,
    height: 36,
    thumbUnchecked: 20,
    thumbChecked: 28,
    iconSize: 18,
    translateX: 24,
  },
  xl: {
    width: 68,
    height: 40,
    thumbUnchecked: 24,
    thumbChecked: 32,
    iconSize: 20,
    translateX: 28,
  },
};

function renderThumbIcon(
  iconName: string,
  size: number,
  color: string,
  backgroundColor: string,
  thumbSize: number,
) {
  return (
    <Box
      component="span"
      sx={{
        width: thumbSize,
        height: thumbSize,
        borderRadius: '50%',
        backgroundColor,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 1,
      }}
    >
      <MagicIcon icon={iconName} size={size} />
    </Box>
  );
}

/**
 * Material 3 slide toggle (switch) atom wrapping MUI's `Switch` and
 * `FormControlLabel`.
 *
 * Supports Material 3 thumb icons (`check` / `close` unless `hideIcon` is
 * true), controlled and uncontrolled state, `before` / `after` label placement,
 * all 5 atomic sizes, all 7 semantic colors, and focusable
 * `disabledInteractive` (`aria-disabled="true"`).
 */
export function MagicSlideToggle({
  id,
  testId,
  ariaLabel,
  label,
  checked,
  defaultChecked = false,
  required = false,
  hideIcon = false,
  labelPosition = 'after',
  disableRipple = false,
  disabled = false,
  disabledInteractive = false,
  color = 'primary',
  size = 'md',
  name,
  onChange,
  onToggleChange,
  children,
  sx,
  className,
  ref,
}: MagicSlideToggleProps) {
  const theme = useTheme();
  const intent = resolveMagicIntentColors(theme, color);
  const switchMetric = SWITCH_SIZE_METRICS[size];
  const labelMetric = MAGIC_SIZE_METRICS[size];
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const [isChecked, setIsChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  });

  const isNativeDisabled = disabled && !disabledInteractive;
  const isAriaDisabled = (disabled && disabledInteractive) || undefined;
  const outline = theme.palette.magic?.outline ?? theme.palette.divider;
  const surfaceContainerHighest =
    theme.palette.magic?.surfaceContainerHighest ??
    theme.palette.action.hover;
  const onSurfaceVariant =
    theme.palette.magic?.onSurfaceVariant ?? theme.palette.text.secondary;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      event.target.checked = isChecked;
      return;
    }
    onToggleChange?.();
    setIsChecked(event.target.checked);
  };

  const labelContent = children ?? label;
  const hasLabel =
    labelContent !== undefined &&
    labelContent !== null &&
    labelContent !== false &&
    labelContent !== '';

  const paddingOffset = (switchMetric.height - switchMetric.thumbChecked) / 2;
  const uncheckedPaddingOffset =
    (switchMetric.height - switchMetric.thumbUnchecked) / 2;

  const switchElement = (
    <MuiSwitch
      id={hasLabel ? undefined : id}
      data-testid={hasLabel ? undefined : testId}
      name={name}
      checked={isChecked}
      required={required}
      disabled={isNativeDisabled}
      disableRipple={disableRipple}
      color={color}
      onChange={handleChange}
      icon={
        hideIcon
          ? undefined
          : renderThumbIcon(
              'close',
              switchMetric.iconSize,
              surfaceContainerHighest,
              isAriaDisabled ? theme.palette.action.disabled : onSurfaceVariant,
              switchMetric.thumbUnchecked,
            )
      }
      checkedIcon={
        hideIcon
          ? undefined
          : renderThumbIcon(
              'check',
              switchMetric.iconSize,
              isAriaDisabled ? theme.palette.text.disabled : intent.main,
              intent.contrastText,
              switchMetric.thumbChecked,
            )
      }
      slotProps={{
        input: {
          'aria-label': ariaLabel ?? (typeof label === 'string' ? label : undefined),
          'aria-disabled': isAriaDisabled,
          'aria-required': required || undefined,
        },
      }}
      sx={[
        {
          width: switchMetric.width,
          height: switchMetric.height,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: `${uncheckedPaddingOffset}px`,
            transitionDuration: '200ms',
            '&:hover': {
              backgroundColor: isAriaDisabled
                ? 'transparent'
                : alpha(intent.main, 0.08),
            },
            '&.Mui-checked': {
              padding: `${paddingOffset}px`,
              transform: `translateX(${switchMetric.translateX}px)`,
              color: intent.contrastText,
              '& + .MuiSwitch-track': {
                backgroundColor: isAriaDisabled
                  ? theme.palette.action.disabledBackground
                  : intent.main,
                opacity: 1,
                border: 'none',
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                backgroundColor: theme.palette.action.disabledBackground,
                opacity: 0.5,
              },
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
              color: theme.palette.action.disabled,
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: isChecked
              ? switchMetric.thumbChecked
              : switchMetric.thumbUnchecked,
            height: isChecked
              ? switchMetric.thumbChecked
              : switchMetric.thumbUnchecked,
            backgroundColor: isAriaDisabled
              ? theme.palette.action.disabled
              : onSurfaceVariant,
          },
          '& .MuiSwitch-track': {
            borderRadius: switchMetric.height / 2,
            backgroundColor: surfaceContainerHighest,
            border: `2px solid ${
              isAriaDisabled ? theme.palette.action.disabled : outline
            }`,
            opacity: 1,
            transition: theme.transitions.create(['background-color'], {
              duration: 200,
            }),
          },
        },
        ...(!hasLabel ? extraSx : []),
      ]}
    />
  );

  if (!hasLabel) {
    return switchElement;
  }

  return (
    <FormControlLabel
      ref={ref}
      id={id}
      data-testid={testId}
      className={className}
      control={switchElement}
      label={labelContent}
      labelPlacement={labelPosition === 'before' ? 'start' : 'end'}
      disabled={isNativeDisabled}
      sx={[
        {
          m: 0,
          gap: 1.25,
          alignItems: 'center',
          '& .MuiFormControlLabel-label': {
            fontSize: labelMetric.fontSize,
            ...(isAriaDisabled
              ? {
                  color: theme.palette.text.disabled,
                  cursor: 'not-allowed',
                }
              : {}),
          },
        },
        ...extraSx,
      ]}
    />
  );
}
