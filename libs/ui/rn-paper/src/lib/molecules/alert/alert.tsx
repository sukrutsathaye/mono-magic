import { type ReactNode, type Ref } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AlertMoleculeProps,
  AlertSeverity,
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicIcon, type MagicIconValue } from '../../core/icon';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  AlertMoleculeProps,
  AlertSeverity,
  AlertVariant,
} from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicAlert` molecule. */
export interface MagicAlertProps extends Omit<AlertMoleculeProps, 'icon'> {
  /** Optional Material icon string name or custom `ReactNode` overriding the default severity icon. */
  icon?: MagicIconValue;
  /** Fired when the user presses the dismiss close button (`dismissible === true`). */
  onDismiss?: () => void;
  /** Fired when the user presses the inline action button (`actionLabel`). */
  onAction?: () => void;
  /** Optional custom content rendered beneath `message`. */
  children?: ReactNode;
  /** Style override applied to the alert container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the alert container `View`. */
  ref?: Ref<View>;
}

const SEVERITY_ICON_MAP: Record<AlertSeverity, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

const SEVERITY_INTENT_MAP: Record<AlertSeverity, ColorIntent> = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

interface AlertSizeTokens {
  paddingVertical: number;
  paddingHorizontal: number;
  iconSize: number;
  titleFontSize: number;
  messageFontSize: number;
  gap: number;
}

const ALERT_SIZE_TOKENS: Record<AtomicSize, AlertSizeTokens> = {
  xs: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    iconSize: 16,
    titleFontSize: 13,
    messageFontSize: 12,
    gap: 8,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    iconSize: 18,
    titleFontSize: 14,
    messageFontSize: 13,
    gap: 10,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    iconSize: 20,
    titleFontSize: 15,
    messageFontSize: 14,
    gap: 12,
  },
  lg: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    iconSize: 22,
    titleFontSize: 16,
    messageFontSize: 15,
    gap: 12,
  },
  xl: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    iconSize: 24,
    titleFontSize: 18,
    messageFontSize: 16,
    gap: 14,
  },
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    paddingTop: 1,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontWeight: '600',
    lineHeight: 20,
  },
  message: {
    lineHeight: 20,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
});

/**
 * Material 3 inline feedback alert banner supporting `info`, `success`,
 * `warning`, and `error` severities across `standard`, `filled`, and
 * `outlined` visual variants, optional inline action, and dismiss button.
 */
export function MagicAlert({
  id,
  testId,
  ariaLabel,
  severity = 'info',
  variant = 'standard',
  title,
  message,
  icon,
  hideIcon = false,
  dismissible = false,
  actionLabel,
  size = 'md',
  onDismiss,
  onAction,
  children,
  style,
  ref,
}: MagicAlertProps) {
  const { theme, colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(SEVERITY_INTENT_MAP[severity]);
  const tokens = ALERT_SIZE_TOKENS[size];

  const isFilled = variant === 'filled';
  const isOutlined = variant === 'outlined';

  const backgroundColor = isFilled
    ? intent.main
    : isOutlined
      ? colors.surface
      : intent.container;

  const foregroundColor = isFilled
    ? intent.onMain
    : isOutlined
      ? colors.onSurface
      : intent.onContainer;

  const iconColor = isFilled ? intent.onMain : intent.main;
  const borderColor = isOutlined ? intent.main : 'transparent';

  const resolvedIcon: MagicIconValue = icon ?? SEVERITY_ICON_MAP[severity];
  const buttonColor: ColorIntent = isFilled
    ? 'neutral'
    : SEVERITY_INTENT_MAP[severity];

  const webAlertAriaProps =
    Platform.OS === 'web'
      ? ({
          role: 'alert',
          'aria-live': severity === 'error' ? 'assertive' : 'polite',
        } as Record<string, unknown>)
      : {};

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      accessibilityRole="alert"
      accessibilityLiveRegion={severity === 'error' ? 'assertive' : 'polite'}
      accessibilityLabel={ariaLabel ?? (title ? `${title}: ${message}` : message)}
      style={[
        styles.container,
        {
          borderRadius: theme.roundness,
          backgroundColor,
          borderWidth: isOutlined ? 1 : 0,
          borderColor,
          paddingVertical: tokens.paddingVertical,
          paddingHorizontal: tokens.paddingHorizontal,
          gap: tokens.gap,
        },
        style,
      ]}
      {...webAlertAriaProps}
    >
      {!hideIcon ? (
        <View
          testID={testId ? `${testId}-icon` : undefined}
          style={styles.iconWrapper}
        >
          <MagicIcon
            icon={resolvedIcon}
            size={tokens.iconSize}
            color={iconColor}
          />
        </View>
      ) : null}

      <View style={styles.body}>
        {title ? (
          <Text
            testID={testId ? `${testId}-title` : undefined}
            style={[
              styles.title,
              { color: foregroundColor, fontSize: tokens.titleFontSize },
            ]}
          >
            {title}
          </Text>
        ) : null}
        <Text
          testID={testId ? `${testId}-message` : undefined}
          style={[
            styles.message,
            { color: foregroundColor, fontSize: tokens.messageFontSize },
          ]}
        >
          {message}
        </Text>
        {children}
      </View>

      {actionLabel || dismissible ? (
        <View style={styles.trailing}>
          {actionLabel ? (
            <MagicButton
              testId={testId ? `${testId}-action` : undefined}
              label={actionLabel}
              variant={isFilled ? 'tonal' : 'text'}
              color={buttonColor}
              size="xs"
              onPress={onAction}
            />
          ) : null}
          {dismissible ? (
            <MagicButton
              testId={testId ? `${testId}-dismiss` : undefined}
              kind="icon"
              variant="text"
              color={buttonColor}
              size="xs"
              leadingIcon="close"
              ariaLabel="Dismiss alert"
              onPress={onDismiss}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
