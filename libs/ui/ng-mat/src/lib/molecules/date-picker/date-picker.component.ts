import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  ErrorStateMatcher,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
  type MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatSuffix,
  type MatFormFieldAppearance,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import type {
  AtomicSize,
  ColorIntent,
  DatePickerMode,
  DatePickerMoleculeProps,
  DateRangeValue,
  FormFieldAppearance,
  FormFieldFloatLabel,
  FormFieldSubscriptSizing,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

export type { DatePickerMode, DateRangeValue };

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

function parseIsoToDate(iso: string | null | undefined): Date | null {
  if (!iso) {
    return null;
  }
  const match = ISO_DATE_RE.exec(iso.trim());
  if (!match) {
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hours = match[4] ? Number(match[4]) : 0;
  const minutes = match[5] ? Number(match[5]) : 0;
  const date = new Date(year, month, day, hours, minutes, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatDateToIso(
  date: Date | null,
  includeTime: boolean,
  timePart: string,
): string | null {
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (!includeTime) {
    return `${year}-${month}-${day}`;
  }
  const cleanTime = /^\d{2}:\d{2}$/.test(timePart) ? timePart : '00:00';
  return `${year}-${month}-${day}T${cleanTime}`;
}

function extractTimePart(iso: string | null | undefined): string {
  if (!iso) {
    return '09:00';
  }
  const match = /T(\d{2}:\d{2})/.exec(iso);
  return match ? match[1] : '09:00';
}

/**
 * A Material 3 date and date-range picker molecule composing `MatFormField`,
 * `MatDatepicker` / `MatDatepickerInput` (single mode), and `MatDateRangePicker` /
 * `MatDateRangeInput` (range mode), with optional `HH:mm` time selection
 * (`enableTime`), `minDate` / `maxDate` bounds, `clearable` reset action,
 * controlled & uncontrolled state, and `outlined` / `filled` appearances.
 *
 * @see https://material.angular.dev/components/datepicker/overview
 */
@Component({
  selector: 'magic-date-picker',
  imports: [
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatSuffix,
    MatInput,
    MatIcon,
    MatIconButton,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDateRangePicker,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicDatePickerComponent
  implements SignalProps<DatePickerMoleculeProps>
{
  /** Id applied to the inner `<mat-form-field>` (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner `<mat-form-field>` (`-input`, `-start`, `-end`, `-clear`, `-time` on children). */
  readonly testId = input<string>();
  /** Accessible name applied to the date input when `label` is omitted. */
  readonly ariaLabel = input<string>();
  /** Floating label displayed above the date field. */
  readonly label = input<string>();
  /** Helper text displayed beneath the date field. */
  readonly hint = input<string>();
  /** Error message displayed beneath the field; activates error styling. */
  readonly errorText = input<string>();
  /** Material field appearance (`'outlined'` or `'filled'`). */
  readonly appearance = input<FormFieldAppearance>('outlined');
  /** Standardized component density/size preset (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Floating label behavior (`'auto'` or `'always'`). */
  readonly floatLabel = input<FormFieldFloatLabel>('auto');
  /** Subscript error/hint space reservation (`'fixed'` or `'dynamic'`). */
  readonly subscriptSizing = input<FormFieldSubscriptSizing>('fixed');
  /** Hides the required asterisk next to the label. */
  readonly hideRequiredMarker = input<boolean>(false);
  /** Selection mode (`'single'` or `'range'`, defaults to `'single'`). */
  readonly mode = input<DatePickerMode>('single');
  /** Controlled single date/datetime ISO string (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`). */
  readonly value = input<string | null>();
  /** Initial uncontrolled single date/datetime ISO string. */
  readonly defaultValue = input<string | null>(null);
  /** Controlled date range value when `mode` is `'range'`. */
  readonly rangeValue = input<DateRangeValue | null>();
  /** Initial uncontrolled date range value when `mode` is `'range'`. */
  readonly defaultRangeValue = input<DateRangeValue | null>(null);
  /** Earliest selectable ISO date/datetime boundary. */
  readonly minDate = input<string>();
  /** Latest selectable ISO date/datetime boundary. */
  readonly maxDate = input<string>();
  /** Whether time-of-day selection (`HH:mm`) is enabled alongside the date picker. */
  readonly enableTime = input<boolean>(false);
  /** Placeholder text shown in single-date mode when empty. */
  readonly placeholder = input<string>('YYYY-MM-DD');
  /** Placeholder text shown for the start input in range mode. */
  readonly startPlaceholder = input<string>('Start date');
  /** Placeholder text shown for the end input in range mode. */
  readonly endPlaceholder = input<string>('End date');
  /** Display format hint (e.g. `'YYYY-MM-DD'`). */
  readonly format = input<string>('YYYY-MM-DD');
  /** Whether a value is required for form validation. */
  readonly required = input<boolean>(false);
  /** Whether the date picker is disabled and non-interactive. */
  readonly disabled = input<boolean>(false);
  /** Whether the date picker displays its value without allowing edits. */
  readonly readOnly = input<boolean>(false);
  /** Whether a clear button is displayed when a value is set. */
  readonly clearable = input<boolean>(true);
  /** Semantic accent color intent for selected dates and focus indicators. */
  readonly color = input<ColorIntent>('primary');

  /** Emits the updated ISO date/datetime string (or `null`) in `'single'` mode. */
  readonly valueChange = output<string | null>();
  /** Emits the updated `DateRangeValue` (or `null`) in `'range'` mode. */
  readonly rangeValueChange = output<DateRangeValue | null>();

  private readonly uncontrolledValue = signal<string | null | undefined>(
    undefined,
  );
  private readonly uncontrolledRange = signal<
    DateRangeValue | null | undefined
  >(undefined);
  private readonly uncontrolledTime = signal<string | undefined>(undefined);
  private readonly pendingRangeStart = signal<Date | null | undefined>(
    undefined,
  );

  /** Effective single ISO value (`value` input takes precedence over local state). */
  readonly currentValue = computed<string | null>(() => {
    const controlled = this.value();
    if (controlled !== undefined) {
      return controlled;
    }
    const local = this.uncontrolledValue();
    if (local !== undefined) {
      return local;
    }
    return this.defaultValue() ?? null;
  });

  /** Effective range ISO value (`rangeValue` input takes precedence over local state). */
  readonly currentRangeValue = computed<DateRangeValue>(() => {
    const controlled = this.rangeValue();
    if (controlled !== undefined) {
      return controlled ?? { start: null, end: null };
    }
    const local = this.uncontrolledRange();
    if (local !== undefined) {
      return local ?? { start: null, end: null };
    }
    return this.defaultRangeValue() ?? { start: null, end: null };
  });

  protected readonly singleDateObj = computed<Date | null>(() =>
    parseIsoToDate(this.currentValue()),
  );

  protected readonly rangeStartObj = computed<Date | null>(() => {
    const pending = this.pendingRangeStart();
    if (pending !== undefined) {
      return pending;
    }
    return parseIsoToDate(this.currentRangeValue().start);
  });

  protected readonly rangeEndObj = computed<Date | null>(() =>
    parseIsoToDate(this.currentRangeValue().end),
  );

  protected readonly minDateObj = computed<Date | null>(() =>
    parseIsoToDate(this.minDate()),
  );

  protected readonly maxDateObj = computed<Date | null>(() =>
    parseIsoToDate(this.maxDate()),
  );

  protected readonly currentTime = computed<string>(() => {
    const local = this.uncontrolledTime();
    if (local !== undefined) {
      return local;
    }
    return extractTimePart(this.currentValue());
  });

  protected readonly matAppearance = computed<MatFormFieldAppearance>(() =>
    this.appearance() === 'filled' ? 'fill' : 'outline',
  );

  protected readonly hasValue = computed(() => {
    if (this.mode() === 'range') {
      const range = this.currentRangeValue();
      return Boolean(range.start || range.end);
    }
    return Boolean(this.currentValue());
  });

  protected readonly showClearButton = computed(
    () =>
      this.clearable() &&
      !this.disabled() &&
      !this.readOnly() &&
      this.hasValue(),
  );

  private readonly matInput = viewChild(MatInput);
  private readonly startInput = viewChild(MatStartDate);
  private readonly endInput = viewChild(MatEndDate);

  protected readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => Boolean(this.errorText()),
  };

  constructor() {
    effect(() => {
      this.errorText();
      this.matInput()?.updateErrorState();
      this.startInput()?.updateErrorState();
      this.endInput()?.updateErrorState();
    });
  }

  protected readonly hostClasses = computed(() =>
    [
      'magic-date-picker',
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      `magic-date-picker--${this.mode()}`,
      this.disabled() ? 'magic-date-picker--disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected onSingleDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (this.disabled() || this.readOnly()) {
      return;
    }
    const iso = formatDateToIso(
      event.value,
      this.enableTime(),
      this.currentTime(),
    );
    this.commitSingleValue(iso);
  }

  protected onTimeChange(event: Event): void {
    if (this.disabled() || this.readOnly()) {
      return;
    }
    const target = event.target as HTMLInputElement;
    const nextTime = target.value || '00:00';
    this.uncontrolledTime.set(nextTime);
    const currentDate = this.singleDateObj();
    if (currentDate) {
      const iso = formatDateToIso(currentDate, true, nextTime);
      this.commitSingleValue(iso);
    }
  }

  protected onRangeStartChange(
    event: MatDatepickerInputEvent<Date, unknown>,
  ): void {
    if (this.disabled() || this.readOnly()) {
      return;
    }
    this.pendingRangeStart.set(event.value ?? null);
    const startIso = formatDateToIso(event.value ?? null, false, '00:00');
    const currentEnd = this.currentRangeValue().end;
    this.commitRangeValue({ start: startIso, end: currentEnd });
  }

  protected onRangeEndChange(
    event: MatDatepickerInputEvent<Date, unknown>,
  ): void {
    if (this.disabled() || this.readOnly()) {
      return;
    }
    const startDate = this.rangeStartObj();
    const startIso =
      formatDateToIso(startDate, false, '00:00') ??
      this.currentRangeValue().start;
    const endIso = formatDateToIso(event.value ?? null, false, '00:00');
    this.pendingRangeStart.set(undefined);
    this.commitRangeValue({ start: startIso, end: endIso });
  }

  /** Clears the active date or date range value. */
  clearValue(event?: Event): void {
    event?.stopPropagation();
    if (this.disabled() || this.readOnly()) {
      return;
    }
    if (this.mode() === 'range') {
      this.pendingRangeStart.set(undefined);
      if (this.rangeValue() === undefined) {
        this.uncontrolledRange.set({ start: null, end: null });
      }
      this.rangeValueChange.emit(null);
    } else {
      this.commitSingleValue(null);
    }
  }

  private commitSingleValue(next: string | null): void {
    if (this.value() === undefined) {
      this.uncontrolledValue.set(next);
    }
    this.valueChange.emit(next);
  }

  private commitRangeValue(next: DateRangeValue): void {
    if (this.rangeValue() === undefined) {
      this.uncontrolledRange.set(next);
    }
    this.rangeValueChange.emit(next);
  }
}
