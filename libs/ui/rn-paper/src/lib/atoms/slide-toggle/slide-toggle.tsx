import { useCallback, useEffect, useRef, type ReactNode, type Ref } from 'react';
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
  AtomicSize,
  SlideToggleAtomProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_PAPER_SIZE_METRICS,
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export interface MagicSlideToggleProps extends SlideToggleAtomProps {
  /** Initial checked state used in uncontrolled mode (`checked` omitted). */
  defaultChecked?: boolean;
  /** Callback fired with the updated boolean state on toggle. */
  onChange?: (checked: boolean) => void;
  /** Void callback alias fired alongside `onChange` when toggled. */
  onToggleChange?: () => void;
  /** Optional custom label content taking precedence over `label`. */
  children?: ReactNode;
  /** Optional style override applied to the toggle row container. */
  style?: StyleProp<ViewStyle>;
  /** Optional style override applied to the text label. */
  labelStyle?: StyleProp<TextStyle>;
  /** React 19 ref forwarded to the pressable switch container. */
  ref?: Ref<View>;
}

interface SwitchSizeSpec {
  trackWidth: number;
  trackHeight: number;
  thumbSize: number;
  thumbUncheckedSize: number;
  iconSize: number;
}

const SWITCH_SIZE_MAP: Record<AtomicSize, SwitchSizeSpec> = {
  xs: {
    trackWidth: 38,
    trackHeight: 22,
    thumbSize: 16,
    thumbUncheckedSize: 12,
    iconSize: 12,
  },
  sm: {
    trackWidth: 44,
    trackHeight: 26,
    thumbSize: 20,
    thumbUncheckedSize: 14,
    iconSize: 14,
  },
  md: {
    trackWidth: 52,
    trackHeight: 32,
    thumbSize: 24,
    thumbUncheckedSize: 16,
    iconSize: 16,
  },
  lg: {
    trackWidth: 60,
    trackHeight: 36,
    thumbSize: 28,
    thumbUncheckedSize: 18,
    iconSize: 18,
  },
  xl: {
    trackWidth: 68,
    trackHeight: 40,
    thumbSize: 32,
    thumbUncheckedSize: 22,
    iconSize: 20,
  },
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
  },
  track: {
    justifyContent: 'center',
    borderWidth: 2,
  },
  thumb: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  label: {
    fontWeight: '400',
  },
});

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && typeof ref === 'object') {
    (ref as { current: T | null }).current = value;
  }
}

/**
 * Material 3 switch (`slide-toggle`) atom supporting controlled/uncontrolled
 * state, thumb check/close icons (`!hideIcon`), `labelPosition` (`before` | `after`),
 * `disabledInteractive`, `required` marker, all 5 sizes, and all 7 color intents.
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
  disabled = false,
  disabledInteractive = false,
  color = 'primary',
  size = 'md',
  onChange,
  onToggleChange,
  children,
  style,
  labelStyle,
  ref,
}: MagicSlideToggleProps) {
  const { theme, colors, semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);
  const metrics = MAGIC_PAPER_SIZE_METRICS[size];
  const spec = SWITCH_SIZE_MAP[size];
  const pressableRef = useRef<View | null>(null);

  const handlePressableRef = useCallback(
    (node: View | null) => {
      pressableRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  const handleStateChange = useCallback(
    (next: boolean) => {
      onChange?.(next);
      onToggleChange?.();
    },
    [onChange, onToggleChange]
  );

  const [isChecked, setIsChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: handleStateChange,
  });

  const isDisabled = Boolean(disabled);
  const isInteractiveDisabled = Boolean(isDisabled && disabledInteractive);
  const nativeDisabled = isDisabled && !isInteractiveDisabled;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const el = pressableRef.current as unknown as HTMLElement | null;
    if (!el || typeof el.setAttribute !== 'function') {
      return;
    }
    if (isDisabled) {
      el.setAttribute('aria-disabled', 'true');
    } else {
      el.removeAttribute('aria-disabled');
    }
  }, [isDisabled, isInteractiveDisabled]);

  const handlePress = useCallback(() => {
    if (isDisabled) {
      return;
    }
    setIsChecked((prev) => !prev);
  }, [isDisabled, setIsChecked]);

  const activeThumbSize =
    isChecked || !hideIcon ? spec.thumbSize : spec.thumbUncheckedSize;
  const paddingOffset = Math.max(
    2,
    Math.floor((spec.trackHeight - 4 - activeThumbSize) / 2)
  );
  const translateX = isChecked
    ? spec.trackWidth - 4 - activeThumbSize - paddingOffset
    : paddingOffset;

  const trackBg = isDisabled
    ? isChecked
      ? colors.onSurfaceDisabled
      : colors.surfaceDisabled
    : isChecked
      ? intent.main
      : colors.surfaceVariant;

  const trackBorder = isDisabled
    ? colors.surfaceDisabled
    : isChecked
      ? intent.main
      : colors.outline;

  const thumbBg = isDisabled
    ? colors.surface
    : isChecked
      ? intent.onMain
      : colors.outline;

  const iconColor = isDisabled
    ? colors.onSurfaceDisabled
    : isChecked
      ? intent.main
      : colors.surfaceVariant;

  const labelColor = isDisabled ? colors.onSurfaceDisabled : colors.onSurface;
  const resolvedAriaLabel =
    ariaLabel ?? label ?? (typeof children === 'string' ? children : undefined);

  const labelContent =
    children !== undefined ? (
      typeof children === 'string' ? (
        <Text
          style={[
            styles.label,
            { fontSize: metrics.fontSize, color: labelColor },
            labelStyle,
          ]}
        >
          {children}
          {required ? ' *' : ''}
        </Text>
      ) : (
        children
      )
    ) : label ? (
      <Text
        style={[
          styles.label,
          { fontSize: metrics.fontSize, color: labelColor },
          labelStyle,
        ]}
      >
        {label}
        {required ? ' *' : ''}
      </Text>
    ) : null;

  return (
    <Pressable
      ref={handlePressableRef}
      nativeID={id}
      testID={testId}
      accessibilityRole="switch"
      accessibilityLabel={resolvedAriaLabel}
      accessibilityState={{
        checked: isChecked,
        disabled: isDisabled,
      }}
      aria-checked={isChecked}
      aria-required={required ? true : undefined}
      disabled={nativeDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          flexDirection: labelPosition === 'before' ? 'row-reverse' : 'row',
          opacity: isDisabled ? 0.65 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View
        testID={testId ? `${testId}-track` : undefined}
        style={[
          styles.track,
          {
            width: spec.trackWidth,
            height: spec.trackHeight,
            borderRadius: spec.trackHeight / 2,
            backgroundColor: trackBg,
            borderColor: trackBorder,
          },
        ]}
      >
        <View
          testID={testId ? `${testId}-thumb` : undefined}
          style={[
            styles.thumb,
            {
              width: activeThumbSize,
              height: activeThumbSize,
              backgroundColor: thumbBg,
              transform: [{ translateX }],
            },
          ]}
        >
          {!hideIcon ? (
            <MagicIcon
              icon={isChecked ? 'check' : 'close'}
              size={spec.iconSize}
              color={iconColor}
            />
          ) : null}
        </View>
      </View>
      {labelContent}
    </Pressable>
  );
}
