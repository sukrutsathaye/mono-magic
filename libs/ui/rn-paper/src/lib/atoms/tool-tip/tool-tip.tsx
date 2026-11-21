import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type {
  ToolTipAtomProps,
  ToolTipPosition,
} from '@mono-magic/atomic-design-interfaces';
import { useMagicPaperColors } from '../../theme/paper-theme';
import { MagicButton } from '../button/button';

export interface MagicToolTipProps extends ToolTipAtomProps {
  /** Trigger element wrapped by the tooltip. Falls back to `MagicButton` when omitted. */
  children?: ReactNode;
  /** Callback fired when the tooltip becomes visible. */
  onOpen?: () => void;
  /** Callback fired when the tooltip hides. */
  onClose?: () => void;
  /** Optional style override applied to the outer wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Optional style override applied to the tooltip bubble. */
  tooltipStyle?: StyleProp<ViewStyle>;
  /** Optional style override applied to the tooltip message text. */
  textStyle?: StyleProp<TextStyle>;
  /** React 19 ref forwarded to the outer tooltip container. */
  ref?: Ref<View>;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    zIndex: 1000,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 48,
    maxWidth: 260,
  },
  bubbleText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  fallbackTrigger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  fallbackTriggerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

function getBubblePositionStyle(position: ToolTipPosition): ViewStyle {
  switch (position) {
    case 'below':
      return {
        top: '100%',
        marginTop: 8,
      };
    case 'left':
    case 'before':
      return {
        right: '100%',
        marginRight: 8,
      };
    case 'right':
    case 'after':
      return {
        left: '100%',
        marginLeft: 8,
      };
    case 'above':
    default:
      return {
        bottom: '100%',
        marginBottom: 8,
      };
  }
}

/**
 * Accessible Material 3 tooltip atom supporting directional placement
 * (`above`, `below`, `left`, `right`, `before`, `after`), hover/focus/touch
 * activation, configurable show/hide delays, and `disabled` suppression.
 */
export function MagicToolTip({
  id,
  testId,
  ariaLabel,
  message,
  label = 'Hover me',
  position = 'above',
  showDelay = 0,
  hideDelay = 0,
  touchGestures = 'auto',
  disabled = false,
  children,
  onOpen,
  onClose,
  style,
  tooltipStyle,
  textStyle,
  ref,
}: MagicToolTipProps) {
  const { colors, dark } = useMagicPaperColors();
  const [visible, setVisible] = useState(false);

  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const isSuppressed = Boolean(disabled || !message);

  useEffect(() => {
    if (isSuppressed && visibleRef.current) {
      clearTimers();
      setVisible(false);
    }
  }, [clearTimers, isSuppressed]);

  const openTooltip = useCallback(() => {
    if (isSuppressed) {
      return;
    }
    clearTimers();
    const commitOpen = () => {
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
        onOpen?.();
      }
    };
    if (showDelay <= 0) {
      commitOpen();
    } else {
      showTimerRef.current = setTimeout(commitOpen, showDelay);
    }
  }, [clearTimers, isSuppressed, onOpen, showDelay]);

  const closeTooltip = useCallback(() => {
    clearTimers();
    const commitClose = () => {
      if (visibleRef.current) {
        visibleRef.current = false;
        setVisible(false);
        onClose?.();
      }
    };
    if (hideDelay <= 0) {
      commitClose();
    } else {
      hideTimerRef.current = setTimeout(commitClose, hideDelay);
    }
  }, [clearTimers, hideDelay, onClose]);

  const handleLongPress = useCallback(() => {
    if (touchGestures === 'off') {
      return;
    }
    openTooltip();
  }, [openTooltip, touchGestures]);

  const handlePress = useCallback(() => {
    if (touchGestures !== 'on') {
      return;
    }
    if (visibleRef.current) {
      closeTooltip();
    } else {
      openTooltip();
    }
  }, [closeTooltip, openTooltip, touchGestures]);

  const bubbleBg = dark ? '#e2e3dc' : '#303033';
  const bubbleFg = dark ? '#1a1c18' : '#f4f3f7';
  const tooltipId = id ? `${id}-tooltip` : undefined;

  const triggerContent =
    children !== undefined ? (
      children
    ) : (
      <MagicButton
        variant="outlined"
        label={label}
        ariaLabel={ariaLabel ?? label}
      />
    );

  const enableHover = touchGestures !== 'on';

  const webMouseProps =
    Platform.OS === 'web' && enableHover
      ? {
          onMouseEnter: openTooltip,
          onMouseLeave: closeTooltip,
        }
      : {};

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      style={[styles.wrapper, style]}
    >
      <Pressable
        testID={testId ? `${testId}-trigger` : undefined}
        accessibilityLabel={ariaLabel}
        accessibilityHint={!isSuppressed ? message : undefined}
        aria-describedby={visible && tooltipId ? tooltipId : undefined}
        onHoverIn={enableHover ? openTooltip : undefined}
        onHoverOut={enableHover ? closeTooltip : undefined}
        onFocus={enableHover ? openTooltip : undefined}
        onBlur={enableHover ? closeTooltip : undefined}
        onLongPress={handleLongPress}
        onPress={handlePress}
        {...webMouseProps}
      >
        {triggerContent}
      </Pressable>

      {visible && !isSuppressed ? (
        <View
          nativeID={tooltipId}
          testID={testId ? `${testId}-bubble` : undefined}
          role="tooltip"
          accessibilityRole="text"
          pointerEvents="none"
          style={[
            styles.bubble,
            getBubblePositionStyle(position),
            {
              backgroundColor: bubbleBg,
              shadowColor: colors.shadow,
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            },
            tooltipStyle,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              { color: bubbleFg },
              textStyle,
            ]}
          >
            {message}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
