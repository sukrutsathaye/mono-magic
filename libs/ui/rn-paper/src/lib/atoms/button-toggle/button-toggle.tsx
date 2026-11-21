import { useCallback, useEffect, useRef, type Ref } from 'react';
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
  ButtonToggleAtomProps,
  ButtonToggleOption,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_PAPER_SIZE_METRICS,
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export type { ButtonToggleOption };

export interface MagicButtonToggleProps<T = string>
  extends ButtonToggleAtomProps<T> {
  /** Initial selection used in uncontrolled mode (`value` omitted). */
  defaultValue?: T | T[];
  /** Callback fired with the updated single value or array of selected values. */
  onChange?: (value: T | T[]) => void;
  /** Optional style override applied to the segmented group container. */
  style?: StyleProp<ViewStyle>;
  /** Optional style override applied to individual segment buttons. */
  buttonStyle?: StyleProp<ViewStyle>;
  /** Optional style override applied to segment labels. */
  labelStyle?: StyleProp<TextStyle>;
  /** React 19 ref forwarded to the segmented group container. */
  ref?: Ref<View>;
}

const styles = StyleSheet.create({
  group: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentLabel: {
    fontWeight: '500',
  },
});

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && typeof ref === 'object') {
    (ref as { current: T | null }).current = value;
  }
}

function isOptionSelected<T>(
  currentValue: T | readonly T[] | undefined,
  optionValue: T,
  isMultiple: boolean
): boolean {
  if (isMultiple) {
    return Array.isArray(currentValue)
      ? currentValue.some((item) => Object.is(item, optionValue))
      : false;
  }
  return Object.is(currentValue, optionValue);
}

/**
 * Material 3 segmented button toggle group (`MagicButtonToggle`) supporting
 * single and multiple selection, horizontal and vertical layouts, `standard` and
 * `legacy` appearances, selection checkmarks, option icons, `disabledInteractive`,
 * all 5 sizes, and all 7 color intents.
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
  required = false,
  onChange,
  style,
  buttonStyle,
  labelStyle,
  ref,
}: MagicButtonToggleProps<T>) {
  const { theme, colors, semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);
  const metrics = MAGIC_PAPER_SIZE_METRICS[size];
  const isMultiple = selectionMode === 'multiple';
  const groupNodeRef = useRef<View | null>(null);

  const handleGroupRef = useCallback(
    (node: View | null) => {
      groupNodeRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  const [currentValue, setCurrentValue] = useControllableState<
    T | readonly T[] | undefined
  >({
    value,
    defaultValue:
      defaultValue !== undefined ? defaultValue : isMultiple ? [] : undefined,
    onChange: onChange
      ? (next) => {
          if (next !== undefined) {
            onChange(Array.isArray(next) ? [...next] : (next as T));
          }
        }
      : undefined,
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const rootEl = groupNodeRef.current as unknown as HTMLElement | null;
    const selector = isMultiple ? '[role="button"]' : '[role="radio"]';
    const itemEls = rootEl?.querySelectorAll?.(selector);
    if (!itemEls) {
      return;
    }
    options.forEach((option, index) => {
      const el = itemEls[index] as HTMLElement | undefined;
      if (!el || typeof el.setAttribute !== 'function') {
        return;
      }
      const itemDisabled = Boolean(disabled || option.disabled);
      if (itemDisabled) {
        el.setAttribute('aria-disabled', 'true');
      } else {
        el.removeAttribute('aria-disabled');
      }
    });
  }, [disabled, disabledInteractive, isMultiple, options]);

  const handleToggleOption = useCallback(
    (optionValue: T, optionDisabled: boolean) => {
      if (disabled || optionDisabled) {
        return;
      }

      if (isMultiple) {
        setCurrentValue((prev) => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const exists = list.some((item) => Object.is(item, optionValue));
          return exists
            ? list.filter((item) => !Object.is(item, optionValue))
            : [...list, optionValue];
        });
      } else {
        setCurrentValue(optionValue);
      }
    },
    [disabled, isMultiple, setCurrentValue]
  );

  const isLegacy = appearance === 'legacy';
  const groupRadius = isLegacy ? 4 : Math.round(metrics.height / 2);
  const borderColor = disabled ? colors.surfaceDisabled : colors.outline;
  const horizontalPad = Math.max(
    10,
    Math.round(metrics.paddingHorizontal * 0.55)
  );

  return (
    <View
      ref={handleGroupRef}
      nativeID={id}
      testID={testId}
      accessibilityRole={isMultiple ? 'none' : 'radiogroup'}
      role={isMultiple ? 'group' : 'radiogroup'}
      accessibilityLabel={ariaLabel}
      accessibilityState={{ disabled }}
      aria-disabled={disabled ? true : undefined}
      aria-required={required ? true : undefined}
      style={[
        styles.group,
        {
          flexDirection: vertical ? 'column' : 'row',
          borderRadius: groupRadius,
          borderWidth: 1,
          borderColor,
        },
        style,
      ]}
    >
      {options.map((option, index) => {
        const selected = isOptionSelected(
          currentValue,
          option.value,
          isMultiple
        );
        const itemDisabled = Boolean(disabled || option.disabled);
        const isInteractiveDisabled = Boolean(
          itemDisabled && disabledInteractive
        );
        const nativeDisabled = itemDisabled && !isInteractiveDisabled;
        const isLast = index === options.length - 1;

        const segmentBg = itemDisabled
          ? selected
            ? colors.surfaceDisabled
            : colors.surface
          : selected
            ? isLegacy
              ? intent.main
              : intent.container
            : colors.surface;

        const segmentFg = itemDisabled
          ? colors.onSurfaceDisabled
          : selected
            ? isLegacy
              ? intent.onMain
              : intent.onContainer
            : colors.onSurface;

        const showCheck = selected && !hideSelectionIndicator;

        return (
          <Pressable
            key={`${String(option.value)}-${index}`}
            testID={testId ? `${testId}-option-${index}` : undefined}
            accessibilityRole={isMultiple ? 'button' : 'radio'}
            accessibilityLabel={option.ariaLabel ?? option.label}
            accessibilityState={
              isMultiple
                ? { selected, disabled: itemDisabled }
                : { checked: selected, disabled: itemDisabled }
            }
            aria-checked={isMultiple ? undefined : selected}
            aria-pressed={isMultiple ? selected : undefined}
            disabled={nativeDisabled}
            onPress={() =>
              handleToggleOption(option.value, Boolean(option.disabled))
            }
            style={({ pressed }) => [
              styles.segment,
              {
                minHeight: metrics.height,
                paddingHorizontal: horizontalPad,
                backgroundColor: segmentBg,
                borderColor,
                borderRightWidth: !vertical && !isLast ? 1 : 0,
                borderBottomWidth: vertical && !isLast ? 1 : 0,
                opacity: itemDisabled ? 0.65 : pressed ? 0.85 : 1,
              },
              buttonStyle,
            ]}
          >
            {showCheck ? (
              <MagicIcon
                icon="check"
                size={metrics.iconSize}
                color={segmentFg}
              />
            ) : null}
            {option.icon ? (
              <MagicIcon
                icon={option.icon}
                size={metrics.iconSize}
                color={segmentFg}
              />
            ) : null}
            {option.label ? (
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    fontSize: metrics.fontSize,
                    color: segmentFg,
                  },
                  labelStyle,
                ]}
              >
                {option.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
