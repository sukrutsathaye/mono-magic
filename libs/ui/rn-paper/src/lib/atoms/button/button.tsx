import type { StyleProp, ViewStyle } from 'react-native';
import {
  Button as PaperButton,
  type ButtonProps as PaperButtonProps,
} from 'react-native-paper';
import type {
  AtomicSize,
  ButtonAtomProps,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { magicPaperTheme } from '../../theme/paper-theme';

export interface MagicButtonProps extends ButtonAtomProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const MODE_MAP: Record<ButtonVariant, NonNullable<PaperButtonProps['mode']>> = {
  filled: 'contained',
  tonal: 'contained-tonal',
  outlined: 'outlined',
  elevated: 'elevated',
  text: 'text',
};

const CONTENT_PADDING_MAP: Record<AtomicSize, ViewStyle> = {
  xs: { paddingVertical: 0, paddingHorizontal: 4 },
  sm: { paddingVertical: 2, paddingHorizontal: 8 },
  md: { paddingVertical: 4, paddingHorizontal: 12 },
  lg: { paddingVertical: 6, paddingHorizontal: 16 },
  xl: { paddingVertical: 8, paddingHorizontal: 20 },
};

function resolveButtonColors(
  variant: ButtonVariant,
  color: ColorIntent
): Pick<PaperButtonProps, 'buttonColor' | 'textColor'> {
  const palette: Record<ColorIntent, string> = {
    primary: magicPaperTheme.colors.primary,
    secondary: magicPaperTheme.colors.secondary,
    tertiary: magicPaperTheme.colors.tertiary,
    success: '#2e7d32',
    warning: '#ed6c02',
    error: magicPaperTheme.colors.error,
    neutral: '#455a64',
  };

  const token = palette[color];
  if (variant === 'filled') {
    return { buttonColor: token, textColor: '#ffffff' };
  }
  if (variant === 'outlined' || variant === 'text') {
    return { textColor: token };
  }
  return {};
}

export function MagicButton({
  testId,
  ariaLabel,
  label,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leadingIcon,
  onPress,
  style,
}: MagicButtonProps) {
  const isDisabled = disabled || loading;
  const colorProps = resolveButtonColors(variant, color);

  return (
    <PaperButton
      testID={testId}
      accessibilityLabel={ariaLabel ?? label}
      mode={MODE_MAP[variant]}
      compact={size === 'xs' || size === 'sm'}
      disabled={isDisabled}
      loading={loading}
      icon={leadingIcon}
      contentStyle={CONTENT_PADDING_MAP[size]}
      style={[fullWidth ? { width: '100%' } : undefined, style]}
      onPress={isDisabled ? undefined : onPress}
      {...colorProps}
    >
      {label}
    </PaperButton>
  );
}
