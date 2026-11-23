import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  type DateRangeValue,
  MagicDatePickerComponent,
} from './date-picker.component';

/**
 * `MagicDatePickerComponent` composes Angular Material `MatFormField`,
 * `MatDatepicker` (single mode), and `MatDateRangePicker` (range mode), with
 * `minDate` / `maxDate` constraints, optional `HH:mm` time selection
 * (`enableTime`), `clearable` reset button, `readOnly` / `disabled` /
 * `errorText` states, and `outlined` / `filled` appearances.
 *
 * - **References**:
 *   - [Angular Material Datepicker](https://material.angular.dev/components/datepicker/overview)
 */
const meta: Meta<MagicDatePickerComponent> = {
  title: 'Molecules/DatePicker',
  component: MagicDatePickerComponent,
  args: {
    mode: 'single',
    label: 'Release date',
    placeholder: 'YYYY-MM-DD',
    hint: 'Select a target milestone date',
    appearance: 'outlined',
    size: 'md',
    floatLabel: 'auto',
    subscriptSizing: 'fixed',
    hideRequiredMarker: false,
    enableTime: false,
    required: false,
    disabled: false,
    readOnly: false,
    clearable: true,
    color: 'primary',
    defaultValue: '2026-06-15',
    minDate: '2026-06-01',
    maxDate: '2026-06-30',
    valueChange: fn(),
    rangeValueChange: fn(),
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range'],
      table: { category: 'Behavior' },
    },
    value: { control: 'text', table: { category: 'Value' } },
    defaultValue: { control: 'text', table: { category: 'Value' } },
    rangeValue: { control: 'object', table: { category: 'Value' } },
    defaultRangeValue: { control: 'object', table: { category: 'Value' } },
    minDate: { control: 'text', table: { category: 'Validation' } },
    maxDate: { control: 'text', table: { category: 'Validation' } },
    enableTime: { control: 'boolean', table: { category: 'Behavior' } },
    label: { control: 'text', table: { category: 'Field' } },
    hint: { control: 'text', table: { category: 'Field' } },
    errorText: { control: 'text', table: { category: 'Validation' } },
    placeholder: { control: 'text', table: { category: 'Field' } },
    startPlaceholder: { control: 'text', table: { category: 'Field' } },
    endPlaceholder: { control: 'text', table: { category: 'Field' } },
    appearance: {
      control: 'select',
      options: ['outlined', 'filled'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'success',
        'warning',
        'error',
        'neutral',
      ],
      table: { category: 'Appearance' },
    },
    required: { control: 'boolean', table: { category: 'Validation' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    clearable: { control: 'boolean', table: { category: 'Behavior' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    valueChange: { action: 'valueChange', table: { category: 'Events' } },
    rangeValueChange: {
      action: 'rangeValueChange',
      table: { category: 'Events' },
    },
  },
};

export default meta;
type Story = StoryObj<MagicDatePickerComponent>;

/**
 * Interactive single date picker with calendar popup selection, clear button, and live readout.
 */
export const SingleDateInteractive: Story = {
  render: (args) => {
    const selected = signal<string | null>('2026-06-15');

    return {
      props: {
        ...args,
        selected,
        onValue(next: string | null) {
          selected.set(next);
          args.valueChange?.(next);
        },
      },
      template: `
        <div style="display: grid; gap: 10px; max-width: 380px;">
          <magic-date-picker
            mode="single"
            [label]="label"
            [hint]="hint"
            [appearance]="appearance"
            [value]="selected()"
            [minDate]="minDate"
            [maxDate]="maxDate"
            [enableTime]="enableTime"
            [clearable]="clearable"
            [required]="required"
            [disabled]="disabled"
            [readOnly]="readOnly"
            testId="single-dp"
            (valueChange)="onValue($event)"
          />
          <p data-testid="single-dp-readout" style="margin: 0; font-size: 0.875rem;">
            Selected: {{ selected() ?? 'none' }}
          </p>
        </div>
      `,
    };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('single-dp-clear'));
    await expect(args.valueChange).toHaveBeenCalledWith(null);
    await expect(canvas.getByTestId('single-dp-readout')).toHaveTextContent(
      'Selected: none',
    );
  },
};

/**
 * Interactive date range picker supporting start & end selection via `MatDateRangePicker`.
 */
export const DateRangeInteractive: Story = {
  render: (args) => {
    const range = signal<DateRangeValue | null>({
      start: '2026-06-10',
      end: '2026-06-18',
    });

    return {
      props: {
        ...args,
        range,
        onRange(next: DateRangeValue | null) {
          range.set(next);
          args.rangeValueChange?.(next);
        },
      },
      template: `
        <div style="display: grid; gap: 10px; max-width: 420px;">
          <magic-date-picker
            mode="range"
            label="Sprint window"
            hint="Choose sprint start and end dates"
            [rangeValue]="range()"
            minDate="2026-06-01"
            maxDate="2026-06-30"
            [clearable]="true"
            testId="range-dp"
            (rangeValueChange)="onRange($event)"
          />
          <p data-testid="range-dp-readout" style="margin: 0; font-size: 0.875rem;">
            Range: {{ range()?.start ?? '—' }} to {{ range()?.end ?? '—' }}
          </p>
        </div>
      `,
    };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('range-dp-readout')).toHaveTextContent(
      'Range: 2026-06-10 to 2026-06-18',
    );
    await userEvent.click(canvas.getByTestId('range-dp-clear'));
    await expect(args.rangeValueChange).toHaveBeenCalledWith(null);
  },
};

/**
 * Single date & time picker (`enableTime = true`) with filled appearance.
 */
export const WithTimeSelection: Story = {
  args: {
    label: 'Deployment window',
    appearance: 'filled',
    enableTime: true,
    defaultValue: '2026-06-20T14:30',
    hint: 'ISO datetime emitted as YYYY-MM-DDTHH:mm',
  },
};

/**
 * Validation error, readOnly, and disabled states comparison.
 */
export const ErrorReadOnlyAndDisabled: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; max-width: 360px;">
        <magic-date-picker
          label="Required Date"
          [required]="true"
          errorText="Please select a valid future date"
          hint=""
        />
        <magic-date-picker
          label="Read-only Date"
          defaultValue="2026-06-15"
          [readOnly]="true"
        />
        <magic-date-picker
          label="Disabled Date"
          defaultValue="2026-06-15"
          [disabled]="true"
        />
      </div>
    `,
  }),
};
