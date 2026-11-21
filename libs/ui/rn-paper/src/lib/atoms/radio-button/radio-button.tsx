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
  AtomicSize,
  RadioButtonAtomProps,
  RadioOption,
} from '@mono-magic/atomic-design-interfaces';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_PAPER_SIZE_METRICS,
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export type { RadioOption };

export interface MagicRadioButtonProps<T = string>
  extends RadioButtonAtomProps<T> {
  /** Initial selected value used in uncontrolled mode (`value` omitted). */
  defaultValue?: T;
  /** Callback fired with the newly selected option value. */
  onChange?: (value: T) => void;
  /** Optional style override applied to the radio group container. */
  style?: StyleProp<ViewStyle>;
  /** Optional style override applied to each option row. */
  optionStyle?: StyleProp<ViewStyle>;
  /** Optional style override applied to option labels. */
  labelStyle?: StyleProp<TextStyle>;
  /** React 19 ref forwarded to the radio group container. */
  ref?: Ref<View>;
}

const RADIO_DIAMETERS: Record<AtomicSize, number> = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 28,
};

const styles = StyleSheet.create({
  group: {
    flexWrap: 'wrap',
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  outerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  innerDot: {
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
 * Material 3 radio button group atom supporting controlled/uncontrolled state,
 * horizontal/vertical layouts, per-option `labelPosition` (`before` | `after`),
 * `required` indicator, `disabledInteractive`, all 5 sizes, and all 7 color intents.
 */
export function MagicRadioButton<T = string>({
  id,
  testId,
  ariaLabel,
  options,
  value,
  defaultValue,
  labelPosition = 'after',
  required = false,
  disabled = false,
  disabledInteractive = false,
  vertical = false,
  color = 'primary',
  size = 'md',
  onChange,
  style,
  optionStyle,
  labelStyle,
  ref,
}: MagicRadioButtonProps<T>) {
  const { theme, colors, semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);
  const metrics = MAGIC_PAPER_SIZE_METRICS[size];
  const outerDiameter = RADIO_DIAMETERS[size];
  const innerDiameter = Math.max(8, Math.round(outerDiameter * 0.5));
  const groupNodeRef = useRef<View | null>(null);

  const handleGroupRef = useCallback(
    (node: View | null) => {
      groupNodeRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  const [selectedValue, setSelectedValue] = useControllableState<T | undefined>({
    value,
    defaultValue,
    onChange: onChange
      ? (next) => {
          if (next !== undefined) {
            onChange(next);
          }
        }
      : undefined,
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const rootEl = groupNodeRef.current as unknown as HTMLElement | null;
    const radioEls = rootEl?.querySelectorAll?.('[role="radio"]');
    if (!radioEls) {
      return;
    }
    options.forEach((option, index) => {
      const el = radioEls[index] as HTMLElement | undefined;
      if (!el || typeof el.setAttribute !== 'function') {
        return;
      }
      const isItemDisabled = Boolean(disabled || option.disabled);
      if (isItemDisabled) {
        el.setAttribute('aria-disabled', 'true');
      } else {
        el.removeAttribute('aria-disabled');
      }
    });
  }, [disabled, disabledInteractive, options]);

  const handleSelect = useCallback(
    (optionValue: T, optionDisabled: boolean) => {
      if (disabled || optionDisabled) {
        return;
      }
      setSelectedValue(optionValue);
    },
    [disabled, setSelectedValue]
  );

  return (
    <View
      ref={handleGroupRef}
      nativeID={id}
      testID={testId}
      accessibilityRole="radiogroup"
      accessibilityLabel={ariaLabel}
      accessibilityState={{ disabled }}
      aria-disabled={disabled ? true : undefined}
      aria-required={required ? true : undefined}
      style={[
        styles.group,
        {
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'flex-start' : 'center',
        },
        style,
      ]}
    >
      {options.map((option, index) => {
        const isSelected = Object.is(selectedValue, option.value);
        const isItemDisabled = Boolean(disabled || option.disabled);
        const isInteractiveDisabled = Boolean(
          isItemDisabled && disabledInteractive
        );
        const nativeDisabled = isItemDisabled && !isInteractiveDisabled;
        const resolvedLabelPos = option.labelPosition ?? labelPosition;
        const isItemRequired = Boolean(option.required ?? required);
        const borderColor = isItemDisabled
          ? colors.onSurfaceDisabled
          : isSelected
            ? intent.main
            : colors.onSurfaceVariant;
        const dotColor = isItemDisabled ? colors.onSurfaceDisabled : intent.main;
        const textColor = isItemDisabled
          ? colors.onSurfaceDisabled
          : colors.onSurface;

        return (
          <Pressable
            key={`${String(option.value)}-${index}`}
            testID={testId ? `${testId}-option-${index}` : undefined}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{
              checked: isSelected,
              disabled: isItemDisabled,
            }}
            aria-checked={isSelected}
            disabled={nativeDisabled}
            onPress={() => handleSelect(option.value, Boolean(option.disabled))}
            style={({ pressed }) => [
              styles.optionRow,
              {
                flexDirection:
                  resolvedLabelPos === 'before' ? 'row-reverse' : 'row',
                opacity: isItemDisabled ? 0.6 : pressed ? 0.8 : 1,
              },
              optionStyle,
            ]}
          >
            <View
              style={[
                styles.outerCircle,
                {
                  width: outerDiameter,
                  height: outerDiameter,
                  borderRadius: outerDiameter / 2,
                  borderColor,
                },
              ]}
            >
              {isSelected ? (
                <View
                  style={[
                    styles.innerDot,
                    {
                      width: innerDiameter,
                      height: innerDiameter,
                      backgroundColor: dotColor,
                    },
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                {
                  fontSize: metrics.fontSize,
                  color: textColor,
                },
                labelStyle,
              ]}
            >
              {option.label}
              {isItemRequired ? ' *' : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
