import { useEffect, type ReactNode, type Ref } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AlertSeverity,
  ColorIntent,
  ToastMoleculeProps,
  ToastPosition,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicIcon } from '../../core/icon';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  ToastMoleculeProps,
  ToastPosition,
} from '@mono-magic/atomic-design-interfaces';

/** Reason passed to `onClose` when `MagicToast` is dismissed. */
export type ToastCloseReason = 'timeout' | 'dismiss';

/** Props for the React Native Paper `MagicToast` molecule. */
export interface MagicToastProps extends ToastMoleculeProps {
  /** Fired when the toast auto-dismisses (`timeout`) or user presses close (`dismiss`). */
  onClose?: (reason: ToastCloseReason) => void;
  /** Fired when the user presses the inline action button (`actionLabel`). */
  onAction?: () => void;
  /** Optional custom content rendered beneath `message`. */
  children?: ReactNode;
  /**
   * When true, renders the toast inside its parent layout box instead of a
   * viewport-fixed anchor. Useful for embedded Storybook previews and visual snapshots.
   */
  inline?: boolean;
  /** Style override applied to the toast surface container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the toast surface container `View`. */
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

const POSITION_STYLES: Record<ToastPosition, ViewStyle> = {
  'top-left': { top: 16, left: 16, alignItems: 'flex-start' },
  'top-center': { top: 16, left: 16, right: 16, alignItems: 'center' },
  'top-right': { top: 16, right: 16, alignItems: 'flex-end' },
  'bottom-left': { bottom: 16, left: 16, alignItems: 'flex-start' },
  'bottom-center': { bottom: 16, left: 16, right: 16, alignItems: 'center' },
  'bottom-right': { bottom: 16, right: 16, alignItems: 'flex-end' },
};

const styles = StyleSheet.create({
  anchorFixed: {
    ...Platform.select({
      web: {
        position: 'fixed' as unknown as 'absolute',
      },
      default: {
        position: 'absolute',
      },
    }),
    zIndex: 1100,
    pointerEvents: 'box-none',
  },
  anchorInline: {
    width: '100%',
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 280,
    maxWidth: 460,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 12px 2px rgba(0, 0, 0, 0.16), 0 2px 4px 0 rgba(0, 0, 0, 0.22)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
      },
    }),
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

/**
 * Material 3 transient notification toast molecule supporting 6 viewport
 * anchor positions, semantic severity accents, auto-dismiss timeout cleanup,
 * inline action button, and manual dismissal.
 */
export function MagicToast({
  id,
  testId,
  ariaLabel,
  open = false,
  severity = 'info',
  title,
  message,
  duration = 4000,
  position = 'bottom-right',
  dismissible = true,
  actionLabel,
  onClose,
  onAction,
  children,
  inline = false,
  style,
  ref,
}: MagicToastProps) {
  const { theme, colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(SEVERITY_INTENT_MAP[severity]);

  useEffect(() => {
    if (!open || duration === null || duration === undefined || duration <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      onClose?.('timeout');
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose, open]);

  if (!open) {
    return null;
  }

  const isAssertive = severity === 'error';
  const webLiveAriaProps =
    Platform.OS === 'web'
      ? ({
          role: isAssertive ? 'alert' : 'status',
          'aria-live': isAssertive ? 'assertive' : 'polite',
        } as Record<string, unknown>)
      : {};

  return (
    <View
      testID={testId ? `${testId}-anchor` : undefined}
      style={
        inline
          ? styles.anchorInline
          : [styles.anchorFixed, POSITION_STYLES[position]]
      }
    >
      <View
        ref={ref}
        nativeID={id}
        testID={testId}
        accessibilityRole={isAssertive ? 'alert' : undefined}
        accessibilityLiveRegion={isAssertive ? 'assertive' : 'polite'}
        accessibilityLabel={ariaLabel ?? (title ? `${title}: ${message}` : message)}
        style={[
          styles.surface,
          {
            borderRadius: theme.roundness,
            backgroundColor: colors.elevation.level3,
            borderColor: intent.main,
          },
          style,
        ]}
        {...webLiveAriaProps}
      >
        <MagicIcon
          testID={testId ? `${testId}-icon` : undefined}
          icon={SEVERITY_ICON_MAP[severity]}
          size={20}
          color={intent.main}
        />

        <View style={styles.body}>
          {title ? (
            <Text
              testID={testId ? `${testId}-title` : undefined}
              style={[styles.title, { color: colors.onSurface }]}
            >
              {title}
            </Text>
          ) : null}
          <Text
            testID={testId ? `${testId}-message` : undefined}
            style={[styles.message, { color: colors.onSurfaceVariant }]}
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
                variant="text"
                color={SEVERITY_INTENT_MAP[severity]}
                size="xs"
                onPress={onAction}
              />
            ) : null}
            {dismissible ? (
              <MagicButton
                testId={testId ? `${testId}-dismiss` : undefined}
                kind="icon"
                variant="text"
                color="neutral"
                size="xs"
                leadingIcon="close"
                ariaLabel="Dismiss notification"
                onPress={() => onClose?.('dismiss')}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
