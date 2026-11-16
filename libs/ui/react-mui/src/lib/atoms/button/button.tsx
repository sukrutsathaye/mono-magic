import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import type {
  AtomicSize,
  ButtonAtomProps,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';

export interface MagicButtonProps extends ButtonAtomProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const VARIANT_MAP: Record<ButtonVariant, MuiButtonProps['variant']> = {
  filled: 'contained',
  elevated: 'contained',
  tonal: 'outlined',
  outlined: 'outlined',
  text: 'text',
};

const COLOR_MAP: Record<ColorIntent, MuiButtonProps['color']> = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  neutral: 'inherit',
};

const SIZE_MAP: Record<AtomicSize, MuiButtonProps['size']> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'large',
  xl: 'large',
};

export function MagicButton({
  id,
  testId,
  ariaLabel,
  label,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
}: MagicButtonProps) {
  return (
    <MuiButton
      id={id}
      data-testid={testId}
      aria-label={ariaLabel ?? label}
      type={type}
      variant={VARIANT_MAP[variant]}
      color={COLOR_MAP[color]}
      size={SIZE_MAP[size]}
      disabled={disabled}
      loading={loading}
      fullWidth={fullWidth}
      disableElevation={variant !== 'elevated'}
      onClick={onClick}
    >
      {label}
    </MuiButton>
  );
}
