import { useCallback, useEffect, useId, type ReactNode, type Ref } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  DialogActionItem,
  DialogMoleculeProps,
  DialogSize,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  DialogActionItem,
  DialogMoleculeProps,
  DialogSize,
} from '@mono-magic/atomic-design-interfaces';

/** Reason passed to `onClose` when `MagicDialog` is dismissed. */
export type DialogCloseReason = 'backdrop' | 'escape' | 'close-button';

/** Props for the React Native Paper `MagicDialog` molecule. */
export interface MagicDialogProps extends DialogMoleculeProps {
  /** Fired when the user dismisses the dialog via backdrop, Escape key, or header close button. */
  onClose?: (reason: DialogCloseReason) => void;
  /** Fired when a footer action button in `actions` is pressed. */
  onActionClick?: (action: DialogActionItem) => void;
  /** Optional custom slot rendered above the title/subtitle in the dialog header. */
  headerSlot?: ReactNode;
  /** Optional custom slot rendered in the dialog footer alongside or replacing `actions`. */
  footerSlot?: ReactNode;
  /** Custom body content rendered inside the dialog body container. */
  children?: ReactNode;
  /**
   * When true, renders the dialog and backdrop inside its parent layout box
   * instead of a viewport-fixed overlay. Useful for embedded previews and visual snapshots.
   */
  inline?: boolean;
  /** Style override applied to the dialog surface container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the dialog surface container `View`. */
  ref?: Ref<View>;
}

const DIALOG_MAX_WIDTH: Record<Exclude<DialogSize, 'fullscreen'>, number> = {
  sm: 360,
  md: 520,
  lg: 760,
};

const styles = StyleSheet.create({
  overlayFixed: {
    ...Platform.select({
      web: {
        position: 'fixed' as unknown as 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      default: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    }),
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  overlayInline: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overlayFullscreen: {
    padding: 0,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  surface: {
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    zIndex: 1,
    ...Platform.select({
      web: {
        boxShadow:
          '0 8px 24px 4px rgba(0, 0, 0, 0.18), 0 4px 8px 0 rgba(0, 0, 0, 0.24)',
      },
      default: {
        elevation: 6,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.24,
        shadowRadius: 10,
      },
    }),
  },
  surfaceFullscreen: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
  },
  surfaceInlineFullscreen: {
    width: '100%',
    minHeight: 320,
    maxWidth: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 12,
  },
  scrollBody: {
    maxHeight: 240,
  },
  scrollBodyContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 12,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  footerStart: {
    justifyContent: 'flex-start',
  },
  footerEnd: {
    justifyContent: 'flex-end',
  },
});

/**
 * Material 3 modal dialog molecule composing a scrim backdrop, responsive
 * M3 surface (`sm`, `md`, `lg`, `fullscreen`), optional close button,
 * scrollable body, and footer `MagicButton` actions.
 */
export function MagicDialog({
  id,
  testId,
  ariaLabel,
  open = false,
  title,
  subtitle,
  content,
  size = 'md',
  dismissible = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  scrollable = false,
  actions = [],
  alignActions = 'end',
  onClose,
  onActionClick,
  headerSlot,
  footerSlot,
  children,
  inline = false,
  style,
  ref,
}: MagicDialogProps) {
  const { theme, colors } = useMagicPaperColors();
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const titleId = `${baseId}-title`;
  const bodyId = `${baseId}-body`;

  const canCloseOnBackdrop = Boolean(dismissible && closeOnBackdropClick);
  const canCloseOnEscape = Boolean(dismissible && closeOnEscape);
  const canShowCloseButton = Boolean(dismissible && showCloseButton);

  useEffect(() => {
    if (
      !open ||
      !canCloseOnEscape ||
      Platform.OS !== 'web' ||
      typeof window === 'undefined'
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.('escape');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canCloseOnEscape, onClose, open]);

  const handleBackdropPress = useCallback(() => {
    if (canCloseOnBackdrop) {
      onClose?.('backdrop');
    }
  }, [canCloseOnBackdrop, onClose]);

  const handleCloseButtonPress = useCallback(() => {
    if (dismissible) {
      onClose?.('close-button');
    }
  }, [dismissible, onClose]);

  const handleActionPress = useCallback(
    (action: DialogActionItem) => {
      if (!action.disabled) {
        onActionClick?.(action);
      }
    },
    [onActionClick]
  );

  if (!open) {
    return null;
  }

  const isFullscreen = size === 'fullscreen';
  const hasHeader = Boolean(headerSlot || title || subtitle || canShowCloseButton);
  const hasBody = Boolean(content || children);
  const hasFooter = Boolean(footerSlot || actions.length > 0);

  const webDialogAriaProps =
    Platform.OS === 'web'
      ? ({
          role: 'dialog',
          'aria-modal': !inline,
          'aria-labelledby': title && !ariaLabel ? titleId : undefined,
          'aria-describedby': hasBody ? bodyId : undefined,
        } as Record<string, unknown>)
      : {};

  const sizeStyle: ViewStyle = isFullscreen
    ? inline
      ? styles.surfaceInlineFullscreen
      : styles.surfaceFullscreen
    : {
        maxWidth: DIALOG_MAX_WIDTH[size],
        borderRadius: theme.roundness * 2,
      };

  return (
    <View
      testID={testId ? `${testId}-overlay` : undefined}
      style={[
        inline ? styles.overlayInline : styles.overlayFixed,
        isFullscreen ? styles.overlayFullscreen : undefined,
      ]}
    >
      <Pressable
        testID={testId ? `${testId}-backdrop` : 'magic-dialog-backdrop'}
        accessibilityLabel="Close dialog backdrop"
        onPress={handleBackdropPress}
        style={styles.backdrop}
      />

      <View
        ref={ref}
        nativeID={id}
        testID={testId}
        accessibilityLabel={ariaLabel ?? title ?? 'Dialog'}
        accessibilityViewIsModal={!inline}
        style={[
          styles.surface,
          {
            backgroundColor: colors.elevation.level3,
            borderWidth: isFullscreen ? 0 : 1,
            borderColor: colors.outlineVariant ?? colors.outline,
          },
          sizeStyle,
          style,
        ]}
        {...webDialogAriaProps}
      >
        {hasHeader ? (
          <View
            testID={testId ? `${testId}-header` : undefined}
            style={styles.header}
          >
            <View style={styles.headerTextGroup}>
              {headerSlot}
              {title ? (
                <Text
                  nativeID={titleId}
                  accessibilityRole="header"
                  testID={testId ? `${testId}-title` : undefined}
                  style={[styles.title, { color: colors.onSurface }]}
                >
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text
                  testID={testId ? `${testId}-subtitle` : undefined}
                  style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {canShowCloseButton ? (
              <MagicButton
                testId={testId ? `${testId}-close` : 'magic-dialog-close'}
                kind="icon"
                variant="text"
                color="neutral"
                size="sm"
                leadingIcon="close"
                ariaLabel="Close dialog"
                onPress={handleCloseButtonPress}
              />
            ) : null}
          </View>
        ) : null}

        {hasBody ? (
          scrollable ? (
            <ScrollView
              nativeID={bodyId}
              testID={testId ? `${testId}-body` : 'magic-dialog-body'}
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollBodyContent}
            >
              {content ? (
                <Text
                  testID={testId ? `${testId}-content` : undefined}
                  style={[styles.contentText, { color: colors.onSurfaceVariant }]}
                >
                  {content}
                </Text>
              ) : null}
              {children}
            </ScrollView>
          ) : (
            <View
              nativeID={bodyId}
              testID={testId ? `${testId}-body` : 'magic-dialog-body'}
              style={styles.body}
            >
              {content ? (
                <Text
                  testID={testId ? `${testId}-content` : undefined}
                  style={[styles.contentText, { color: colors.onSurfaceVariant }]}
                >
                  {content}
                </Text>
              ) : null}
              {children}
            </View>
          )
        ) : null}

        {hasFooter ? (
          <View
            testID={testId ? `${testId}-footer` : undefined}
            style={[
              styles.footer,
              alignActions === 'start' ? styles.footerStart : styles.footerEnd,
            ]}
          >
            {footerSlot}
            {actions.map((action, index) => {
              const actionKey = action.id ?? `${action.label}-${index}`;
              return (
                <MagicButton
                  key={actionKey}
                  testId={
                    testId
                      ? `${testId}-action-${action.id ?? index}`
                      : undefined
                  }
                  label={action.label}
                  variant={action.variant ?? 'text'}
                  color={action.color ?? 'primary'}
                  leadingIcon={action.icon}
                  disabled={action.disabled}
                  size="sm"
                  onPress={() => handleActionPress(action)}
                />
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}
