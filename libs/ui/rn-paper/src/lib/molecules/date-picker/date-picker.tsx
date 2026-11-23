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
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  DatePickerMoleculeProps,
  DateRangeValue,
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
  DatePickerMode,
  DatePickerMoleculeProps,
  DateRangeValue,
  MagicDatePickerProps as DatePickerBaseProps,
} from '@mono-magic/atomic-design-interfaces';
export { DATE_PICKER_MODES } from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicDatePicker` molecule. */
export interface MagicDatePickerProps extends DatePickerMoleculeProps {
  /** Fired when the single-date ISO string changes (`mode === 'single'`). */
  onChange?: (value: string | null) => void;
  /** Fired when the start or end date range changes (`mode === 'range'`). */
  onRangeChange?: (range: DateRangeValue) => void;
  /** Fired when the calendar popover opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Style override applied to the outer date picker wrapper. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer wrapper `View`. */
  ref?: Ref<View>;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    width: '100%',
    zIndex: 40,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
      default: {},
    }),
  },
  rangeDivider: {
    fontWeight: '600',
    paddingHorizontal: 2,
  },
  suffixGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 4,
    borderRadius: 999,
  },
  popover: {
    marginTop: 4,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeInput: {
    width: 72,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function extractDatePart(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(iso.trim());
  return match ? match[1] : '';
}

function extractTimePart(iso: string | null | undefined): string {
  if (!iso) {
    return '09:00';
  }
  const match = /T(\d{2}:\d{2})/.exec(iso.trim());
  return match ? match[1] : '09:00';
}

function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function compareIsoStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

function isDateOutOfBounds(
  datePart: string,
  minDate?: string,
  maxDate?: string
): boolean {
  if (!isValidDateString(datePart)) {
    return false;
  }
  const minPart = extractDatePart(minDate);
  const maxPart = extractDatePart(maxDate);
  if (minPart && compareIsoStrings(datePart, minPart) < 0) {
    return true;
  }
  if (maxPart && compareIsoStrings(datePart, maxPart) > 0) {
    return true;
  }
  return false;
}

function parseMonthAnchor(iso: string | null | undefined): {
  year: number;
  month: number;
} {
  const datePart = extractDatePart(iso);
  if (isValidDateString(datePart)) {
    const [y, m] = datePart.split('-').map(Number);
    return { year: y, month: m - 1 };
  }
  return { year: 2026, month: 0 };
}

function buildCalendarDays(year: number, month: number): readonly (string | null)[] {
  const firstDayOfWeek = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${year}-${pad2(month + 1)}-${pad2(day)}`);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function formatWithTime(datePart: string, timePart: string, enableTime: boolean): string {
  if (!datePart) {
    return '';
  }
  if (!enableTime) {
    return datePart;
  }
  const safeTime = /^\d{2}:\d{2}$/.test(timePart) ? timePart : '09:00';
  return `${datePart}T${safeTime}`;
}

interface InnerDateControlsProps {
  mode: 'single' | 'range';
  singleDisplay: string;
  rangeStartDisplay: string;
  rangeEndDisplay: string;
  placeholder: string;
  startPlaceholder: string;
  endPlaceholder: string;
  readOnly: boolean;
  onSingleTextChange: (text: string) => void;
  onRangeStartTextChange: (text: string) => void;
  onRangeEndTextChange: (text: string) => void;
  testId?: string;
}

function MagicDateInputs({
  mode,
  singleDisplay,
  rangeStartDisplay,
  rangeEndDisplay,
  placeholder,
  startPlaceholder,
  endPlaceholder,
  readOnly,
  onSingleTextChange,
  onRangeStartTextChange,
  onRangeEndTextChange,
  testId,
}: InnerDateControlsProps) {
  const field = useMagicFormFieldContext();
  const { colors } = useMagicPaperColors();
  const effectiveSize = field?.size ?? 'md';
  const metrics = MAGIC_PAPER_SIZE_METRICS[effectiveSize];
  const isDisabled = Boolean(field?.disabled);
  const isInvalid = Boolean(field?.hasError);
  const isRequired = Boolean(field?.required);

  const hasContent = Boolean(
    mode === 'single'
      ? singleDisplay || placeholder
      : rangeStartDisplay || rangeEndDisplay || startPlaceholder || endPlaceholder
  );

  const setFieldHasValue = field?.setHasValue;
  const setFieldFocused = field?.setFocused;

  useEffect(() => {
    setFieldHasValue?.(hasContent);
  }, [hasContent, setFieldHasValue]);

  const textColor = isDisabled ? colors.onSurfaceDisabled : colors.onSurface;
  const placeholderColor = isDisabled
    ? colors.onSurfaceDisabled
    : colors.onSurfaceVariant;

  const webInputAttrs =
    Platform.OS === 'web'
      ? ({
          'aria-invalid': isInvalid ? true : undefined,
          'aria-required': isRequired ? true : undefined,
          'aria-readonly': readOnly ? true : undefined,
          'aria-describedby': field?.describedBy,
        } as Record<string, unknown>)
      : {};

  if (mode === 'range') {
    return (
      <View style={styles.inputsRow}>
        <RNTextInput
          nativeID={field?.controlId}
          testID={testId ? `${testId}-start-input` : undefined}
          value={rangeStartDisplay}
          placeholder={startPlaceholder}
          placeholderTextColor={placeholderColor}
          editable={!isDisabled && !readOnly}
          readOnly={readOnly}
          accessibilityLabel={field?.label ? `${field.label} start date` : 'Start date'}
          onChangeText={onRangeStartTextChange}
          onFocus={() => setFieldFocused?.(true)}
          onBlur={() => setFieldFocused?.(false)}
          style={[
            styles.textInput,
            {
              fontSize: metrics.fontSize,
              color: textColor,
              minHeight: Math.max(24, metrics.height - 8),
            },
          ]}
          {...webInputAttrs}
        />
        <Text style={[styles.rangeDivider, { color: placeholderColor }]}>–</Text>
        <RNTextInput
          testID={testId ? `${testId}-end-input` : undefined}
          value={rangeEndDisplay}
          placeholder={endPlaceholder}
          placeholderTextColor={placeholderColor}
          editable={!isDisabled && !readOnly}
          readOnly={readOnly}
          accessibilityLabel={field?.label ? `${field.label} end date` : 'End date'}
          onChangeText={onRangeEndTextChange}
          onFocus={() => setFieldFocused?.(true)}
          onBlur={() => setFieldFocused?.(false)}
          style={[
            styles.textInput,
            {
              fontSize: metrics.fontSize,
              color: textColor,
              minHeight: Math.max(24, metrics.height - 8),
            },
          ]}
          {...webInputAttrs}
        />
      </View>
    );
  }

  return (
    <RNTextInput
      nativeID={field?.controlId}
      testID={testId ? `${testId}-input` : undefined}
      value={singleDisplay}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      editable={!isDisabled && !readOnly}
      readOnly={readOnly}
      accessibilityLabel={field?.label ?? 'Date'}
      onChangeText={onSingleTextChange}
      onFocus={() => setFieldFocused?.(true)}
      onBlur={() => setFieldFocused?.(false)}
      style={[
        styles.textInput,
        {
          fontSize: metrics.fontSize,
          color: textColor,
          minHeight: Math.max(24, metrics.height - 8),
        },
      ]}
      {...webInputAttrs}
    />
  );
}

/**
 * Material 3 date & date-range picker molecule for `@mono-magic/rn-paper`.
 *
 * Composes `MagicFormField` with typed ISO date/datetime inputs, an interactive
 * calendar grid popover, `minDate` / `maxDate` range validation, optional
 * `enableTime` (`HH:mm`), `clearable` reset button, `readOnly` / `disabled`
 * guards, and both `mode="single"` and `mode="range"`.
 */
export function MagicDatePicker({
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
  mode = 'single',
  value: controlledValue,
  defaultValue = null,
  rangeValue: controlledRangeValue,
  defaultRangeValue,
  minDate,
  maxDate,
  enableTime = false,
  placeholder,
  startPlaceholder,
  endPlaceholder,
  format: _format,
  required = false,
  disabled = false,
  readOnly = false,
  clearable = true,
  color = 'primary',
  onChange,
  onRangeChange,
  onOpenChange,
  style,
  ref,
}: MagicDatePickerProps) {
  const { theme, colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(color);
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const [singleValue, setSingleValue] = useControllableState<string | null>({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const [rangeValue, setRangeValue] = useControllableState<DateRangeValue>({
    value: controlledRangeValue ?? undefined,
    defaultValue: defaultRangeValue ?? { start: null, end: null },
    onChange: onRangeChange,
  });

  const [singleDraft, setSingleDraft] = useState<string>(singleValue ?? '');
  const [rangeStartDraft, setRangeStartDraft] = useState<string>(
    rangeValue.start ?? ''
  );
  const [rangeEndDraft, setRangeEndDraft] = useState<string>(
    rangeValue.end ?? ''
  );
  const [validationError, setValidationError] = useState<string | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSingleDraft(singleValue ?? '');
  }, [singleValue]);

  useEffect(() => {
    setRangeStartDraft(rangeValue.start ?? '');
    setRangeEndDraft(rangeValue.end ?? '');
  }, [rangeValue.end, rangeValue.start]);

  const initialAnchor = useMemo(
    () =>
      parseMonthAnchor(
        mode === 'single'
          ? (singleValue ?? minDate ?? maxDate)
          : (rangeValue.start ?? rangeValue.end ?? minDate ?? maxDate)
      ),
    [maxDate, minDate, mode, rangeValue.end, rangeValue.start, singleValue]
  );

  const [viewYear, setViewYear] = useState(initialAnchor.year);
  const [viewMonth, setViewMonth] = useState(initialAnchor.month);

  const toggleOpen = useCallback(
    (next: boolean) => {
      if (disabled || readOnly) {
        return;
      }
      setOpen((prev) => {
        if (prev !== next) {
          onOpenChange?.(next);
        }
        return next;
      });
    },
    [disabled, onOpenChange, readOnly]
  );

  const handleSingleTextChange = useCallback(
    (text: string) => {
      setSingleDraft(text);
      const trimmed = text.trim();
      if (!trimmed) {
        setValidationError(undefined);
        setSingleValue(null);
        return;
      }
      const datePart = extractDatePart(trimmed);
      if (!isValidDateString(datePart)) {
        setValidationError(
          enableTime ? 'Use YYYY-MM-DDTHH:mm format' : 'Use YYYY-MM-DD format'
        );
        return;
      }
      if (isDateOutOfBounds(datePart, minDate, maxDate)) {
        setValidationError('Date is outside allowed range');
        return;
      }
      setValidationError(undefined);
      const formatted = enableTime
        ? formatWithTime(datePart, extractTimePart(trimmed), true)
        : datePart;
      setSingleValue(formatted);
    },
    [enableTime, maxDate, minDate, setSingleValue]
  );

  const handleRangeStartTextChange = useCallback(
    (text: string) => {
      setRangeStartDraft(text);
      const trimmed = text.trim();
      if (!trimmed) {
        setValidationError(undefined);
        setRangeValue({ start: null, end: rangeValue.end });
        return;
      }
      const datePart = extractDatePart(trimmed);
      if (!isValidDateString(datePart)) {
        setValidationError('Use YYYY-MM-DD format');
        return;
      }
      if (isDateOutOfBounds(datePart, minDate, maxDate)) {
        setValidationError('Start date is outside allowed range');
        return;
      }
      const formatted = enableTime
        ? formatWithTime(datePart, extractTimePart(trimmed), true)
        : datePart;
      if (rangeValue.end && compareIsoStrings(formatted, rangeValue.end) > 0) {
        setValidationError('Start date must be before end date');
        return;
      }
      setValidationError(undefined);
      setRangeValue({ start: formatted, end: rangeValue.end });
    },
    [enableTime, maxDate, minDate, rangeValue.end, setRangeValue]
  );

  const handleRangeEndTextChange = useCallback(
    (text: string) => {
      setRangeEndDraft(text);
      const trimmed = text.trim();
      if (!trimmed) {
        setValidationError(undefined);
        setRangeValue({ start: rangeValue.start, end: null });
        return;
      }
      const datePart = extractDatePart(trimmed);
      if (!isValidDateString(datePart)) {
        setValidationError('Use YYYY-MM-DD format');
        return;
      }
      if (isDateOutOfBounds(datePart, minDate, maxDate)) {
        setValidationError('End date is outside allowed range');
        return;
      }
      const formatted = enableTime
        ? formatWithTime(datePart, extractTimePart(trimmed), true)
        : datePart;
      if (
        rangeValue.start &&
        compareIsoStrings(formatted, rangeValue.start) < 0
      ) {
        setValidationError('End date must be on or after start date');
        return;
      }
      setValidationError(undefined);
      setRangeValue({ start: rangeValue.start, end: formatted });
    },
    [enableTime, maxDate, minDate, rangeValue.start, setRangeValue]
  );

  const handleSelectDay = useCallback(
    (dateIso: string) => {
      if (disabled || readOnly || isDateOutOfBounds(dateIso, minDate, maxDate)) {
        return;
      }
      setValidationError(undefined);
      if (mode === 'single') {
        const nextVal = formatWithTime(
          dateIso,
          extractTimePart(singleValue),
          enableTime
        );
        setSingleValue(nextVal);
        setSingleDraft(nextVal);
        if (!enableTime) {
          toggleOpen(false);
        }
        return;
      }

      const currentStartDate = extractDatePart(rangeValue.start);
      const currentEndDate = extractDatePart(rangeValue.end);

      if (!currentStartDate || (currentStartDate && currentEndDate)) {
        const startVal = formatWithTime(
          dateIso,
          extractTimePart(rangeValue.start),
          enableTime
        );
        setRangeValue({ start: startVal, end: null });
        setRangeStartDraft(startVal);
        setRangeEndDraft('');
        return;
      }

      const startTime = extractTimePart(rangeValue.start);
      const endTime = extractTimePart(rangeValue.end);
      if (compareIsoStrings(dateIso, currentStartDate) < 0) {
        const nextRange = {
          start: formatWithTime(dateIso, startTime, enableTime),
          end: formatWithTime(currentStartDate, endTime, enableTime),
        };
        setRangeValue(nextRange);
        setRangeStartDraft(nextRange.start);
        setRangeEndDraft(nextRange.end);
      } else {
        const nextRange = {
          start: formatWithTime(currentStartDate, startTime, enableTime),
          end: formatWithTime(dateIso, endTime, enableTime),
        };
        setRangeValue(nextRange);
        setRangeStartDraft(nextRange.start);
        setRangeEndDraft(nextRange.end);
      }
      if (!enableTime) {
        toggleOpen(false);
      }
    },
    [
      disabled,
      enableTime,
      maxDate,
      minDate,
      mode,
      rangeValue.end,
      rangeValue.start,
      readOnly,
      setRangeValue,
      setSingleValue,
      singleValue,
      toggleOpen,
    ]
  );

  const handleTimeChange = useCallback(
    (timeText: string) => {
      if (disabled || readOnly) {
        return;
      }
      const cleanTime = timeText.trim();
      if (!/^\d{2}:\d{2}$/.test(cleanTime)) {
        return;
      }
      if (mode === 'single') {
        const datePart = extractDatePart(singleValue);
        if (datePart) {
          const next = `${datePart}T${cleanTime}`;
          setSingleValue(next);
          setSingleDraft(next);
        }
      } else if (rangeValue.start) {
        const startDate = extractDatePart(rangeValue.start);
        const endDate = extractDatePart(rangeValue.end);
        const nextRange = {
          start: startDate ? `${startDate}T${cleanTime}` : null,
          end: endDate ? `${endDate}T${cleanTime}` : null,
        };
        setRangeValue(nextRange);
      }
    },
    [
      disabled,
      mode,
      rangeValue.end,
      rangeValue.start,
      readOnly,
      setRangeValue,
      setSingleValue,
      singleValue,
    ]
  );

  const handleClear = useCallback(() => {
    if (disabled || readOnly) {
      return;
    }
    setValidationError(undefined);
    if (mode === 'single') {
      setSingleDraft('');
      setSingleValue(null);
    } else {
      setRangeStartDraft('');
      setRangeEndDraft('');
      setRangeValue({ start: null, end: null });
    }
  }, [disabled, mode, readOnly, setRangeValue, setSingleValue]);

  const hasValue =
    mode === 'single'
      ? Boolean(singleDraft)
      : Boolean(rangeStartDraft || rangeEndDraft);

  const effectiveErrorText = errorText ?? validationError;
  const resolvedPlaceholder =
    placeholder ?? (enableTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD');
  const resolvedStartPlaceholder = startPlaceholder ?? 'Start YYYY-MM-DD';
  const resolvedEndPlaceholder = endPlaceholder ?? 'End YYYY-MM-DD';

  const calendarCells = useMemo(
    () => buildCalendarDays(viewYear, viewMonth),
    [viewMonth, viewYear]
  );

  const stepMonth = useCallback((delta: number) => {
    setViewMonth((prevMonth) => {
      const next = prevMonth + delta;
      if (next < 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  }, []);

  const selectedStartDate =
    mode === 'single'
      ? extractDatePart(singleValue)
      : extractDatePart(rangeValue.start);
  const selectedEndDate =
    mode === 'range' ? extractDatePart(rangeValue.end) : '';

  const dividerColor = colors.outlineVariant ?? colors.outline;

  return (
    <View ref={ref} nativeID={baseId} style={[styles.root, style]}>
      <MagicFormField
        id={id}
        testId={testId}
        ariaLabel={ariaLabel}
        label={label}
        hint={hint}
        errorText={effectiveErrorText}
        appearance={appearance}
        size={size}
        floatLabel={floatLabel}
        subscriptSizing={subscriptSizing}
        hideRequiredMarker={hideRequiredMarker}
        required={required}
        disabled={disabled}
        suffix={
          <View style={styles.suffixGroup}>
            {clearable && hasValue && !disabled && !readOnly ? (
              <Pressable
                testID={testId ? `${testId}-clear` : undefined}
                accessibilityRole="button"
                accessibilityLabel="Clear date"
                onPress={handleClear}
                style={styles.iconBtn}
              >
                <MagicIcon
                  icon="close"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
              </Pressable>
            ) : null}
            <Pressable
              testID={testId ? `${testId}-calendar-toggle` : undefined}
              disabled={disabled || readOnly}
              accessibilityRole="button"
              accessibilityLabel="Toggle calendar"
              accessibilityState={{ expanded: open, disabled: disabled || readOnly }}
              onPress={() => toggleOpen(!open)}
              style={styles.iconBtn}
            >
              <MagicIcon
                icon="calendar_today"
                size={18}
                color={
                  disabled
                    ? colors.onSurfaceDisabled
                    : open
                      ? intent.main
                      : colors.onSurfaceVariant
                }
              />
            </Pressable>
          </View>
        }
      >
        <MagicDateInputs
          mode={mode}
          singleDisplay={singleDraft}
          rangeStartDisplay={rangeStartDraft}
          rangeEndDisplay={rangeEndDraft}
          placeholder={resolvedPlaceholder}
          startPlaceholder={resolvedStartPlaceholder}
          endPlaceholder={resolvedEndPlaceholder}
          readOnly={readOnly}
          onSingleTextChange={handleSingleTextChange}
          onRangeStartTextChange={handleRangeStartTextChange}
          onRangeEndTextChange={handleRangeEndTextChange}
          testId={testId}
        />
      </MagicFormField>

      {open && !disabled && !readOnly ? (
        <View
          testID={testId ? `${testId}-calendar` : undefined}
          style={[
            styles.popover,
            {
              borderRadius: theme.roundness,
              borderColor: dividerColor,
              backgroundColor: colors.elevation.level2,
            },
          ]}
        >
          <View style={styles.calendarHeader}>
            <Pressable
              testID={testId ? `${testId}-prev-month` : undefined}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => stepMonth(-1)}
              style={styles.iconBtn}
            >
              <MagicIcon icon="chevron_left" size={20} color={colors.onSurface} />
            </Pressable>

            <Text
              testID={testId ? `${testId}-month-label` : undefined}
              style={[styles.monthLabel, { color: colors.onSurface }]}
            >
              {`${MONTH_NAMES[viewMonth]} ${viewYear}`}
            </Text>

            <Pressable
              testID={testId ? `${testId}-next-month` : undefined}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={() => stepMonth(1)}
              style={styles.iconBtn}
            >
              <MagicIcon icon="chevron_right" size={20} color={colors.onSurface} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map((dayName) => (
              <View key={dayName} style={styles.weekdayCell}>
                <Text
                  style={[styles.weekdayText, { color: colors.onSurfaceVariant }]}
                >
                  {dayName}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarCells.map((cellIso, idx) => {
              if (!cellIso) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const dayNumber = Number(cellIso.slice(-2));
              const isOut = isDateOutOfBounds(cellIso, minDate, maxDate);
              const isEndpoint =
                cellIso === selectedStartDate || cellIso === selectedEndDate;
              const isInRange = Boolean(
                mode === 'range' &&
                  selectedStartDate &&
                  selectedEndDate &&
                  compareIsoStrings(cellIso, selectedStartDate) > 0 &&
                  compareIsoStrings(cellIso, selectedEndDate) < 0
              );

              return (
                <View key={cellIso} style={styles.dayCell}>
                  <Pressable
                    testID={testId ? `${testId}-day-${cellIso}` : undefined}
                    disabled={isOut}
                    accessibilityRole="button"
                    accessibilityLabel={cellIso}
                    accessibilityState={{
                      selected: isEndpoint,
                      disabled: isOut,
                    }}
                    onPress={() => handleSelectDay(cellIso)}
                    style={({ pressed }) => [
                      styles.dayButton,
                      {
                        backgroundColor: isOut
                          ? 'transparent'
                          : isEndpoint
                            ? intent.main
                            : isInRange
                              ? intent.container
                              : pressed
                                ? colors.surfaceVariant
                                : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: isOut
                            ? colors.onSurfaceDisabled
                            : isEndpoint
                              ? intent.onMain
                              : isInRange
                                ? intent.onContainer
                                : colors.onSurface,
                        },
                      ]}
                    >
                      {dayNumber}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {enableTime ? (
            <View style={[styles.timeRow, { borderTopColor: dividerColor }]}>
              <Text style={[styles.timeLabel, { color: colors.onSurfaceVariant }]}>
                Time (HH:mm)
              </Text>
              <RNTextInput
                testID={testId ? `${testId}-time-input` : undefined}
                defaultValue={extractTimePart(
                  mode === 'single' ? singleValue : rangeValue.start
                )}
                accessibilityLabel="Time"
                placeholder="09:00"
                placeholderTextColor={colors.onSurfaceVariant}
                onChangeText={handleTimeChange}
                style={[
                  styles.timeInput,
                  {
                    color: colors.onSurface,
                    borderColor: dividerColor,
                    backgroundColor: colors.surface,
                  },
                ]}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
