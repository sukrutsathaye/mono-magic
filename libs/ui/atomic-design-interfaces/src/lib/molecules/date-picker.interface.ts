import type { ColorIntent } from '../common/atomic.interface.js';
import type { FormFieldMoleculeProps } from './form-field.interface.js';

/** Selection mode for `MagicDatePicker` (`single` date or `range` of dates). */
export type DatePickerMode = 'single' | 'range';

/** Ordered list of supported date picker selection modes. */
export const DATE_PICKER_MODES: readonly DatePickerMode[] = [
  'single',
  'range',
] as const;

/**
 * Framework-agnostic ISO date/datetime range value.
 *
 * Dates are serialized as `YYYY-MM-DD` (or `YYYY-MM-DDTHH:mm` when time selection is enabled).
 */
export interface DateRangeValue {
  /** Start of the selected range as an ISO date/datetime string, or `null` when unset. */
  start: string | null;
  /** End of the selected range as an ISO date/datetime string, or `null` when unset. */
  end: string | null;
}

/** Shared property contract for `MagicDatePicker` across all UI libraries. */
export interface DatePickerMoleculeProps extends FormFieldMoleculeProps {
  /** Selection mode (`single` or `range`, defaults to `'single'`). */
  mode?: DatePickerMode;
  /** Controlled single date/datetime ISO string (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`). */
  value?: string | null;
  /** Initial uncontrolled single date/datetime ISO string. */
  defaultValue?: string | null;
  /** Controlled date range value when `mode` is `'range'`. */
  rangeValue?: DateRangeValue | null;
  /** Initial uncontrolled date range value when `mode` is `'range'`. */
  defaultRangeValue?: DateRangeValue | null;
  /** Earliest selectable ISO date/datetime boundary. */
  minDate?: string;
  /** Latest selectable ISO date/datetime boundary. */
  maxDate?: string;
  /** Whether time-of-day selection (`HH:mm`) is enabled alongside the date picker. */
  enableTime?: boolean;
  /** Placeholder text shown in single-date mode when empty. */
  placeholder?: string;
  /** Placeholder text shown for the start input in range mode. */
  startPlaceholder?: string;
  /** Placeholder text shown for the end input in range mode. */
  endPlaceholder?: string;
  /** Display format hint (e.g. `'YYYY-MM-DD'`, `'MM/DD/YYYY'`). */
  format?: string;
  /** Whether a value is required for form validation. */
  required?: boolean;
  /** Whether the date picker is disabled and non-interactive. */
  disabled?: boolean;
  /** Whether the date picker displays its value without allowing edits. */
  readOnly?: boolean;
  /** Whether a clear button is displayed when a value is set. */
  clearable?: boolean;
  /** Semantic accent color intent for selected dates and focus indicators. */
  color?: ColorIntent;
}

/** Alias for {@link DatePickerMoleculeProps} aligned with `MagicDatePicker` component naming. */
export type MagicDatePickerProps = DatePickerMoleculeProps;
