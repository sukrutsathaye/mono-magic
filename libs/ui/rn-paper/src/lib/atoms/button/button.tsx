import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Platform,
  StyleSheet,
  type StyleProp,
  type View,
  type ViewStyle,
} from 'react-native';
import {
  Button as PaperButton,
  FAB as PaperFAB,
  IconButton as PaperIconButton,
  useTheme,
  type ButtonProps as PaperButtonProps,
  type FABProps as PaperFABProps,
  type IconButtonProps as PaperIconButtonProps,
  type MD3Theme,
} from 'react-native-paper';
import type {
  ButtonAtomProps,
  ButtonType,
  ButtonVariant,
} from '@mono-magic/atomic-design-interfaces';
import {
  MagicIcon,
  renderPaperIcon,
  type MagicIconValue,
} from '../../core/icon';
import {
  MAGIC_PAPER_SHAPE_RADIUS,
  MAGIC_PAPER_SIZE_METRICS,
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export interface MagicButtonProps
  extends Omit<ButtonAtomProps, 'label' | 'leadingIcon' | 'trailingIcon'> {
  /** Visible text label. Optional when `children` is supplied or for icon-only kinds. */
  label?: string;
  /** Leading icon (Material Icons ligature name or custom `ReactNode`). */
  leadingIcon?: MagicIconValue;
  /** Trailing icon (Material Icons ligature name or custom `ReactNode`). */
  trailingIcon?: MagicIconValue;
  /** Semantic button type (`button`, `submit`, or `reset`). */
  type?: ButtonType;
  /** Replacement label shown while `loading` is true. */
  loadingLabel?: string;
  /** Custom button content; takes precedence over `label` when provided. */
  children?: ReactNode;
  /** Press handler fired when activated and not disabled or loading. */
  onPress?: () => void;
  /** Ergonomic web alias fired alongside `onPress`. */
  onClick?: () => void;
  /** Style override applied to the button container. */
  style?: StyleProp<ViewStyle>;
  /** Inner content style override (applicable to `default` and `icon` kinds). */
  contentStyle?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded directly to the underlying button surface. */
  ref?: Ref<View>;
}

const BUTTON_MODE_MAP: Record<
  ButtonVariant,
  NonNullable<PaperButtonProps['mode']>
> = {
  filled: 'contained',
  tonal: 'contained-tonal',
  outlined: 'outlined',
  elevated: 'elevated',
  text: 'text',
};

const ICON_BUTTON_MODE_MAP: Record<
  ButtonVariant,
  PaperIconButtonProps['mode']
> = {
  filled: 'contained',
  tonal: 'contained-tonal',
  outlined: 'outlined',
  elevated: undefined,
  text: undefined,
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
});

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && typeof ref === 'object') {
    (ref as { current: T | null }).current = value;
  }
}

function getFallbackIconName(
  leadingIcon: MagicIconValue | undefined,
  trailingIcon: MagicIconValue | undefined,
  fallback: string
): string {
  if (typeof leadingIcon === 'string' && leadingIcon.length > 0) {
    return leadingIcon;
  }
  if (typeof trailingIcon === 'string' && trailingIcon.length > 0) {
    return trailingIcon;
  }
  return fallback;
}

/**
 * Unified Material 3 button atom wrapping React Native Paper's `Button`,
 * `IconButton`, and `FAB` primitives behind `@mono-magic/atomic-design-interfaces`.
 *
 * Supports all 5 variants (`filled`, `tonal`, `outlined`, `elevated`, `text`),
 * 5 structural kinds (`default`, `icon`, `fab`, `mini-fab`, `extended-fab`),
 * 7 semantic color intents, 5 sizes (`xs`..`xl`), and 4 corner shapes.
 */
export function MagicButton({
  id,
  testId,
  ariaLabel,
  label,
  variant = 'filled',
  kind = 'default',
  shape = 'default',
  color = 'primary',
  size = 'md',
  disabled = false,
  disabledInteractive = false,
  disableRipple = false,
  loading = false,
  loadingLabel,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  type: _type = 'button',
  children,
  onPress,
  onClick,
  style,
  contentStyle,
  ref,
}: MagicButtonProps) {
  const theme = useTheme<MD3Theme>();
  const { semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);
  const metrics = MAGIC_PAPER_SIZE_METRICS[size];
  const radius = MAGIC_PAPER_SHAPE_RADIUS[shape];

  const isDisabled = Boolean(disabled || loading);
  const isInteractiveDisabled = Boolean(
    disabled && disabledInteractive && !loading
  );
  const nativeDisabled = isDisabled && !isInteractiveDisabled;

  const surfaceNodeRef = useRef<View | null>(null);

  const handleSurfaceRef = useCallback(
    (node: View | null) => {
      surfaceNodeRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const target = (
      surfaceNodeRef.current as unknown as HTMLElement | null
    )?.querySelector?.('[role="button"]') as HTMLElement | null;

    if (!target || typeof target.setAttribute !== 'function') {
      return;
    }

    if (isInteractiveDisabled) {
      target.setAttribute('aria-disabled', 'true');
    } else if (!nativeDisabled) {
      target.removeAttribute('aria-disabled');
    }

    if (loading) {
      target.setAttribute('aria-busy', 'true');
    } else {
      target.removeAttribute('aria-busy');
    }
  }, [isInteractiveDisabled, loading, nativeDisabled]);

  const handlePress = useCallback(() => {
    if (isDisabled) {
      return;
    }
    onPress?.();
    onClick?.();
  }, [isDisabled, onClick, onPress]);

  const rippleColor = disableRipple ? 'transparent' : undefined;
  const pressHandler = nativeDisabled ? undefined : handlePress;

  if (kind === 'icon') {
    const iconSource =
      renderPaperIcon(leadingIcon ?? trailingIcon, metrics.iconSize) ??
      renderPaperIcon('circle', metrics.iconSize);

    const iconAriaLabel =
      ariaLabel ||
      label ||
      getFallbackIconName(leadingIcon, trailingIcon, 'Icon button');

    let containerColor: string | undefined;
    let iconColor: string;

    if (isInteractiveDisabled) {
      containerColor =
        variant === 'filled' || variant === 'tonal' || variant === 'elevated'
          ? theme.colors.surfaceDisabled
          : undefined;
      iconColor = theme.colors.onSurfaceDisabled;
    } else if (variant === 'filled') {
      containerColor = intent.main;
      iconColor = intent.onMain;
    } else if (variant === 'tonal') {
      containerColor = intent.container;
      iconColor = intent.onContainer;
    } else if (variant === 'elevated') {
      containerColor = theme.colors.elevation.level1;
      iconColor = intent.main;
    } else {
      containerColor = variant === 'outlined' ? 'transparent' : undefined;
      iconColor = intent.main;
    }

    const outlineStyle: ViewStyle | undefined =
      variant === 'outlined'
        ? {
            borderColor: isDisabled
              ? theme.colors.surfaceDisabled
              : color === 'primary' || color === 'neutral'
                ? theme.colors.outline
                : intent.main,
          }
        : undefined;

    const shapeStyle: ViewStyle | undefined =
      shape !== 'default' ? { borderRadius: radius } : undefined;

    return (
      <PaperIconButton
        ref={handleSurfaceRef}
        nativeID={id}
        testID={testId}
        mode={ICON_BUTTON_MODE_MAP[variant]}
        icon={iconSource as NonNullable<PaperIconButtonProps['icon']>}
        size={metrics.iconSize}
        containerColor={containerColor}
        iconColor={iconColor}
        rippleColor={rippleColor}
        disabled={nativeDisabled}
        loading={loading}
        accessibilityLabel={iconAriaLabel}
        accessibilityState={{
          disabled: isDisabled,
          busy: Boolean(loading),
        }}
        contentStyle={contentStyle}
        style={[shapeStyle, outlineStyle, style]}
        onPress={pressHandler}
      />
    );
  }

  if (kind === 'fab' || kind === 'mini-fab' || kind === 'extended-fab') {
    const fabSize: NonNullable<PaperFABProps['size']> =
      kind === 'mini-fab' || size === 'xs' || size === 'sm'
        ? 'small'
        : size === 'lg' || size === 'xl'
          ? 'large'
          : 'medium';

    const fabMode: NonNullable<PaperFABProps['mode']> =
      variant === 'outlined' || variant === 'text' ? 'flat' : 'elevated';

    let backgroundColor: string;
    let foregroundColor: string;

    if (isInteractiveDisabled) {
      backgroundColor = theme.colors.surfaceDisabled;
      foregroundColor = theme.colors.onSurfaceDisabled;
    } else if (variant === 'tonal') {
      backgroundColor = intent.container;
      foregroundColor = intent.onContainer;
    } else if (variant === 'outlined') {
      backgroundColor = theme.colors.surface;
      foregroundColor = intent.main;
    } else if (variant === 'text') {
      backgroundColor = 'transparent';
      foregroundColor = intent.main;
    } else if (variant === 'elevated') {
      backgroundColor = theme.colors.elevation.level3;
      foregroundColor = intent.main;
    } else {
      backgroundColor = intent.main;
      foregroundColor = intent.onMain;
    }

    const fabIconSize = fabSize === 'large' ? 24 : 20;
    const rawIcon = renderPaperIcon(leadingIcon ?? trailingIcon, fabIconSize);
    const extendedLabel =
      kind === 'extended-fab'
        ? loading && loadingLabel
          ? loadingLabel
          : (label ?? (typeof children === 'string' ? children : ''))
        : undefined;

    const fabAriaLabel =
      ariaLabel ||
      extendedLabel ||
      label ||
      getFallbackIconName(leadingIcon, trailingIcon, 'Floating action button');

    const fabBorderStyle: ViewStyle | undefined =
      variant === 'outlined'
        ? {
            borderWidth: 1,
            borderColor: isDisabled ? theme.colors.surfaceDisabled : intent.main,
          }
        : undefined;

    const fabShapeStyle: ViewStyle | undefined =
      shape !== 'default' ? { borderRadius: radius } : undefined;

    const commonFabProps = {
      ref: handleSurfaceRef,
      nativeID: id,
      testID: testId,
      size: fabSize,
      mode: fabMode,
      color: foregroundColor,
      rippleColor,
      disabled: nativeDisabled,
      loading,
      accessibilityLabel: fabAriaLabel,
      accessibilityState: {
        disabled: isDisabled,
        busy: Boolean(loading),
      },
      style: [
        { backgroundColor },
        fabShapeStyle,
        fabBorderStyle,
        fullWidth ? styles.fullWidth : undefined,
        style,
      ],
      onPress: pressHandler,
    };

    if (kind === 'extended-fab') {
      return (
        <PaperFAB
          {...commonFabProps}
          label={extendedLabel ?? ''}
          icon={rawIcon}
        />
      );
    }

    return (
      <PaperFAB
        {...commonFabProps}
        icon={
          (rawIcon ??
            renderPaperIcon('add', fabIconSize)) as NonNullable<
            PaperFABProps['icon']
          >
        }
      />
    );
  }

  // Default button primitive (Paper.Button)
  let buttonColor: string | undefined;
  let textColor: string;
  let outlineBorderColor: string | undefined;

  if (isInteractiveDisabled) {
    buttonColor =
      variant === 'outlined' || variant === 'text'
        ? 'transparent'
        : theme.colors.surfaceDisabled;
    textColor = theme.colors.onSurfaceDisabled;
    outlineBorderColor =
      variant === 'outlined' ? theme.colors.surfaceDisabled : undefined;
  } else if (variant === 'filled') {
    buttonColor = intent.main;
    textColor = intent.onMain;
  } else if (variant === 'tonal') {
    buttonColor = intent.container;
    textColor = intent.onContainer;
  } else if (variant === 'elevated') {
    buttonColor = theme.colors.elevation.level1;
    textColor = intent.main;
  } else if (variant === 'outlined') {
    buttonColor = 'transparent';
    textColor = intent.main;
    outlineBorderColor =
      color === 'primary' || color === 'neutral'
        ? theme.colors.outline
        : intent.main;
  } else {
    buttonColor = 'transparent';
    textColor = intent.main;
  }

  const hasLeading = Boolean(leadingIcon);
  const hasTrailing = Boolean(trailingIcon);
  const useTrailingAsPaperIcon = !hasLeading && hasTrailing && !loading;

  const paperIcon = hasLeading
    ? renderPaperIcon(leadingIcon, metrics.iconSize)
    : useTrailingAsPaperIcon
      ? renderPaperIcon(trailingIcon, metrics.iconSize)
      : undefined;

  const visibleContent =
    loading && loadingLabel
      ? loadingLabel
      : children !== undefined
        ? children
        : (label ?? '');

  const resolvedAriaLabel =
    ariaLabel ||
    (loading && loadingLabel
      ? loadingLabel
      : label || (typeof children === 'string' ? children : undefined));

  const buttonContent =
    hasTrailing && !useTrailingAsPaperIcon ? (
      <>
        {visibleContent}
        {visibleContent ? ' ' : null}
        <MagicIcon
          icon={trailingIcon}
          size={metrics.iconSize}
          color={isDisabled ? theme.colors.onSurfaceDisabled : textColor}
        />
      </>
    ) : (
      visibleContent
    );

  return (
    <PaperButton
      ref={handleSurfaceRef}
      nativeID={id}
      testID={testId}
      mode={BUTTON_MODE_MAP[variant]}
      compact={size === 'xs' || size === 'sm'}
      buttonColor={buttonColor}
      textColor={textColor}
      rippleColor={rippleColor}
      disabled={nativeDisabled}
      loading={loading}
      icon={paperIcon}
      accessibilityLabel={resolvedAriaLabel}
      accessibilityState={{
        disabled: isDisabled,
        busy: Boolean(loading),
      }}
      contentStyle={[
        {
          minHeight: metrics.height,
          paddingHorizontal: Math.max(
            6,
            Math.round(metrics.paddingHorizontal * 0.4)
          ),
        },
        useTrailingAsPaperIcon ? styles.rowReverse : undefined,
        contentStyle,
      ]}
      labelStyle={{
        fontSize: metrics.fontSize,
        lineHeight: Math.round(metrics.fontSize * 1.3),
      }}
      style={[
        { borderRadius: radius },
        outlineBorderColor ? { borderColor: outlineBorderColor } : undefined,
        fullWidth ? styles.fullWidth : undefined,
        style,
      ]}
      onPress={pressHandler}
    >
      {buttonContent}
    </PaperButton>
  );
}
