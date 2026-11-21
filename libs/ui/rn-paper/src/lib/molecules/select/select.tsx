import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type Ref,
} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  SelectMoleculeProps,
  SelectOption,
} from '@mono-magic/atomic-design-interfaces';
import { useMagicFormFieldContext } from '../../core/form-field-context';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_PAPER_SIZE_METRICS,
  useMagicPaperColors,
} from '../../theme/paper-theme';
import { MagicFormField } from '../form-field/form-field';

export type {
  SelectMoleculeProps,
  SelectOption,
  SelectOptionGroup,
} from '@mono-magic/atomic-design-interfaces';

export interface MagicSelectProps<T = string | number>
  extends SelectMoleculeProps<T> {
  /** Initial selected value used in uncontrolled mode (`value` is omitted). */
  defaultValue?: T | readonly T[] | null;
  /** Emitted when the selected value or array of values changes. */
  onChange?: (value: T | T[] | null) => void;
  /** Emitted when the select listbox panel opens (`true`) or closes (`false`). */
  onOpenChange?: (opened: boolean) => void;
  /** Comparator used to match option values to the selected value(s). */
  compareWith?: (o1: T, o2: T) => boolean;
  /** Style override applied to the outer form-field wrapper. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer wrapper `View`. */
  ref?: Ref<View>;
}

const styles = StyleSheet.create({
  rootWrapper: {
    position: 'relative',
    width: '100%',
    zIndex: 40,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    paddingVertical: 4,
  },
  triggerText: {
    flex: 1,
    minWidth: 0,
  },
  backdrop: {
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
        top: -1000,
        right: -1000,
        bottom: -1000,
        left: -1000,
      },
    }),
    backgroundColor: 'transparent',
    zIndex: 85,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: 2,
    paddingVertical: 6,
    zIndex: 95,
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
  groupHeader: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  groupHeaderText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionGrouped: {
    paddingLeft: 24,
  },
  optionLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
});

function defaultCompareWith<T>(a: T, b: T): boolean {
  return Object.is(a, b);
}

interface InnerTriggerProps {
  id?: string;
  testId?: string;
  ariaLabel?: string;
  open: boolean;
  hasSelection: boolean;
  summaryText: string;
  placeholder: string;
  listboxId: string;
  onToggle: () => void;
}

function MagicSelectTriggerControl({
  id,
  testId,
  ariaLabel,
  open,
  hasSelection,
  summaryText,
  placeholder,
  listboxId,
  onToggle,
}: InnerTriggerProps) {
  const field = useMagicFormFieldContext();
  const { colors } = useMagicPaperColors();

  const effectiveSize = field?.size ?? 'md';
  const isDisabled = Boolean(field?.disabled);
  const isRequired = Boolean(field?.required);
  const isInvalid = Boolean(field?.hasError);
  const metrics = MAGIC_PAPER_SIZE_METRICS[effectiveSize];

  const setFieldFocused = field?.setFocused;
  const setFieldHasValue = field?.setHasValue;
  const hasDisplayValue = Boolean(hasSelection || placeholder);

  useEffect(() => {
    setFieldFocused?.(open);
  }, [open, setFieldFocused]);

  useEffect(() => {
    setFieldHasValue?.(hasDisplayValue);
  }, [hasDisplayValue, setFieldHasValue]);

  const effectiveId = id ?? field?.controlId;
  const effectiveAriaLabel = ariaLabel ?? field?.label;
  const effectiveLabelledBy =
    !ariaLabel && field?.label ? field.labelId : undefined;

  const textColor = isDisabled
    ? colors.onSurfaceDisabled
    : hasSelection
      ? colors.onSurface
      : colors.onSurfaceVariant;

  const chevronColor = isDisabled
    ? colors.onSurfaceDisabled
    : open
      ? colors.primary
      : colors.onSurfaceVariant;

  const webComboboxAttrs =
    Platform.OS === 'web'
      ? ({
          role: 'combobox',
          'aria-expanded': open,
          'aria-haspopup': 'listbox',
          'aria-controls': open ? listboxId : undefined,
          'aria-disabled': isDisabled ? true : undefined,
          'aria-required': isRequired ? true : undefined,
          'aria-invalid': isInvalid ? true : undefined,
          'aria-describedby': field?.describedBy,
        } as Record<string, unknown>)
      : {};

  return (
    <Pressable
      nativeID={effectiveId}
      testID={testId ? `${testId}-trigger` : 'magic-select-trigger'}
      disabled={isDisabled}
      accessibilityRole="combobox"
      accessibilityLabel={effectiveAriaLabel}
      aria-labelledby={effectiveLabelledBy}
      accessibilityState={{
        disabled: isDisabled,
        expanded: open,
      }}
      onPress={onToggle}
      style={[
        styles.trigger,
        { minHeight: Math.max(24, metrics.height - 8) },
      ]}
      {...webComboboxAttrs}
    >
      <Text
        numberOfLines={1}
        testID={testId ? `${testId}-value` : undefined}
        style={[
          styles.triggerText,
          {
            fontSize: metrics.fontSize,
            color: textColor,
          },
        ]}
      >
        {hasSelection ? summaryText : placeholder}
      </Text>
      <MagicIcon
        icon={open ? 'expand_less' : 'expand_more'}
        size={metrics.iconSize}
        color={chevronColor}
      />
    </Pressable>
  );
}

/**
 * Material 3 dropdown select molecule composing `MagicFormField` with an
 * accessible combobox trigger (`role="combobox"`) and listbox panel
 * (`role="listbox"`).
 *
 * Supports flat `options`, grouped `optionGroups`, single and `multiple`
 * selection, `customTriggerSummary` (`"First (+1 other)"` / `"First (+N others)"`),
 * and full `MagicFormField` integration (`label`, `hint`, `errorText`,
 * `appearance`, `size`, `floatLabel`, `subscriptSizing`, `hideRequiredMarker`).
 */
export function MagicSelect<T = string | number>({
  id,
  testId,
  ariaLabel,
  label,
  hint,
  errorText,
  appearance = 'outlined',
  size = 'md',
  floatLabel = 'auto',
  subscriptSizing = 'fixed',
  hideRequiredMarker = false,
  options = [],
  optionGroups = [],
  value,
  defaultValue,
  placeholder = 'Select an option',
  multiple = false,
  required = false,
  disabled = false,
  disableRipple = false,
  customTriggerSummary = false,
  panelClass,
  compareWith = defaultCompareWith,
  onChange,
  onOpenChange,
  style,
  ref,
}: MagicSelectProps<T>) {
  const { theme, colors } = useMagicPaperColors();
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const listboxId = `${baseId}-listbox`;

  const initialDefault =
    defaultValue !== undefined ? defaultValue : multiple ? ([] as T[]) : null;

  const [currentValue, setCurrentValue] = useControllableState<
    T | readonly T[] | null
  >({
    value,
    defaultValue: initialDefault,
    onChange: (next) => {
      if (Array.isArray(next)) {
        onChange?.([...next] as T[]);
      } else {
        onChange?.(next as T | null);
      }
    },
  });

  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen((prev) => {
        if (prev !== nextOpen) {
          onOpenChange?.(nextOpen);
        }
        return nextOpen;
      });
    },
    [onOpenChange]
  );

  const handleToggleOpen = useCallback(() => {
    if (disabled) {
      return;
    }
    handleOpenChange(!open);
  }, [disabled, handleOpenChange, open]);

  useEffect(() => {
    if (!open || Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleOpenChange, open]);

  const allOptions = useMemo<readonly SelectOption<T>[]>(
    () => [
      ...options,
      ...optionGroups.flatMap((group) => group.options),
    ],
    [optionGroups, options]
  );

  const isOptionSelected = useCallback(
    (optionValue: T): boolean => {
      if (multiple) {
        const list = Array.isArray(currentValue)
          ? (currentValue as readonly T[])
          : [];
        return list.some((item) => compareWith(item, optionValue));
      }
      if (currentValue === null || currentValue === undefined || Array.isArray(currentValue)) {
        return false;
      }
      return compareWith(currentValue as T, optionValue);
    },
    [compareWith, currentValue, multiple]
  );

  const { hasSelection, summaryText } = useMemo(() => {
    const resolveLabel = (item: T): string =>
      allOptions.find((opt) => compareWith(opt.value, item))?.label ??
      String(item);

    if (multiple) {
      const list = Array.isArray(currentValue)
        ? (currentValue as readonly T[])
        : [];
      if (list.length === 0) {
        return { hasSelection: false, summaryText: '' };
      }
      const firstLabel = resolveLabel(list[0]);
      if (customTriggerSummary && list.length > 1) {
        const extraCount = list.length - 1;
        const suffix = extraCount === 1 ? 'other' : 'others';
        return {
          hasSelection: true,
          summaryText: `${firstLabel} (+${extraCount} ${suffix})`,
        };
      }
      return {
        hasSelection: true,
        summaryText: list.map(resolveLabel).join(', '),
      };
    }

    if (
      currentValue === null ||
      currentValue === undefined ||
      Array.isArray(currentValue)
    ) {
      return { hasSelection: false, summaryText: '' };
    }

    const matched = allOptions.find((opt) =>
      compareWith(opt.value, currentValue as T)
    );
    if (!matched) {
      return { hasSelection: false, summaryText: '' };
    }
    return { hasSelection: true, summaryText: matched.label };
  }, [allOptions, compareWith, currentValue, customTriggerSummary, multiple]);

  const handleOptionPress = useCallback(
    (option: SelectOption<T>, groupDisabled = false) => {
      if (disabled || option.disabled || groupDisabled) {
        return;
      }

      if (multiple) {
        const list = Array.isArray(currentValue)
          ? [...(currentValue as readonly T[])]
          : [];
        const existingIndex = list.findIndex((item) =>
          compareWith(item, option.value)
        );
        if (existingIndex >= 0) {
          list.splice(existingIndex, 1);
        } else {
          list.push(option.value);
        }
        setCurrentValue(list);
      } else {
        setCurrentValue(option.value);
        handleOpenChange(false);
      }
    },
    [compareWith, currentValue, disabled, handleOpenChange, multiple, setCurrentValue]
  );

  const renderOptionRow = (
    option: SelectOption<T>,
    keyPrefix: string,
    index: number,
    grouped: boolean,
    groupDisabled = false
  ) => {
    const selected = isOptionSelected(option.value);
    const isOptDisabled = Boolean(option.disabled || groupDisabled);
    const optionTextColor = isOptDisabled
      ? colors.onSurfaceDisabled
      : selected
        ? colors.primary
        : colors.onSurface;
    const optionBgColor = selected
      ? colors.secondaryContainer
      : 'transparent';

    const webOptionAttrs =
      Platform.OS === 'web'
        ? ({
            role: 'option',
            'aria-selected': selected,
            'aria-disabled': isOptDisabled ? true : undefined,
          } as Record<string, unknown>)
        : {};

    return (
      <Pressable
        key={`${keyPrefix}-${String(option.value)}-${index}`}
        testID={
          testId
            ? `${testId}-option-${String(option.value)}`
            : `magic-select-option-${String(option.value)}`
        }
        disabled={isOptDisabled}
        accessibilityRole="menuitem"
        accessibilityLabel={option.label}
        accessibilityState={{
          disabled: isOptDisabled,
          selected,
        }}
        onPress={() => handleOptionPress(option, groupDisabled)}
        style={({ pressed }) => [
          styles.optionRow,
          grouped ? styles.optionGrouped : undefined,
          {
            backgroundColor:
              pressed && !disableRipple && !isOptDisabled
                ? colors.surfaceVariant
                : optionBgColor,
          },
        ]}
        {...webOptionAttrs}
      >
        <View style={styles.optionLeading}>
          {multiple ? (
            <MagicIcon
              icon={selected ? 'check_box' : 'check_box_outline_blank'}
              size={18}
              color={
                isOptDisabled
                  ? colors.onSurfaceDisabled
                  : selected
                    ? colors.primary
                    : colors.onSurfaceVariant
              }
            />
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.optionLabel,
              {
                color: optionTextColor,
                fontWeight: selected ? '600' : '400',
              },
            ]}
          >
            {option.label}
          </Text>
        </View>

        {!multiple && selected ? (
          <MagicIcon
            icon="check"
            size={18}
            color={isOptDisabled ? colors.onSurfaceDisabled : colors.primary}
          />
        ) : null}
      </Pressable>
    );
  };

  const webListboxAttrs =
    Platform.OS === 'web'
      ? ({
          role: 'listbox',
          'aria-multiselectable': multiple ? true : undefined,
          dataSet: panelClass ? { panelClass } : undefined,
        } as Record<string, unknown>)
      : {};

  return (
    <View ref={ref} style={[styles.rootWrapper, style]}>
      <MagicFormField
        id={id}
        testId={testId}
        ariaLabel={ariaLabel}
        label={label}
        hint={hint}
        errorText={errorText}
        appearance={appearance}
        size={size}
        floatLabel={floatLabel}
        subscriptSizing={subscriptSizing}
        hideRequiredMarker={hideRequiredMarker}
        required={required}
        disabled={disabled}
      >
        <MagicSelectTriggerControl
          id={id ? `${id}-trigger` : undefined}
          testId={testId}
          ariaLabel={ariaLabel}
          open={open}
          hasSelection={hasSelection}
          summaryText={summaryText}
          placeholder={placeholder}
          listboxId={listboxId}
          onToggle={handleToggleOpen}
        />
      </MagicFormField>

      {open ? (
        <>
          <Pressable
            testID={testId ? `${testId}-backdrop` : 'magic-select-backdrop'}
            accessibilityLabel="Close options"
            onPress={() => handleOpenChange(false)}
            style={styles.backdrop}
          />
          <View
            nativeID={listboxId}
            testID={testId ? `${testId}-panel` : 'magic-select-panel'}
            accessibilityLabel={ariaLabel ?? label ?? placeholder}
            style={[
              styles.panel,
              {
                top: MAGIC_PAPER_SIZE_METRICS[size].height + 16,
                borderRadius: theme.roundness,
                backgroundColor: colors.elevation.level2,
                borderWidth: 1,
                borderColor: colors.outlineVariant ?? colors.outline,
              },
            ]}
            {...webListboxAttrs}
          >
            {options.map((opt, idx) =>
              renderOptionRow(opt, 'flat', idx, false, false)
            )}

            {optionGroups.map((group, groupIdx) => {
              const isGroupDisabled = Boolean(group.disabled);
              return (
                <View
                  key={`group-${group.label}-${groupIdx}`}
                  testID={
                    testId
                      ? `${testId}-group-${groupIdx}`
                      : `magic-select-group-${groupIdx}`
                  }
                >
                  <View style={styles.groupHeader}>
                    <Text
                      style={[
                        styles.groupHeaderText,
                        {
                          color: isGroupDisabled
                            ? colors.onSurfaceDisabled
                            : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {group.label}
                    </Text>
                  </View>
                  {group.options.map((opt, optIdx) =>
                    renderOptionRow(
                      opt,
                      `group-${groupIdx}`,
                      optIdx,
                      true,
                      isGroupDisabled
                    )
                  )}
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}
