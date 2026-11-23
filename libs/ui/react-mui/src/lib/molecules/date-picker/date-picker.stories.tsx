import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import type { DateRangeValue } from '@mono-magic/atomic-design-interfaces';
import { MagicDatePicker } from './date-picker';

/**
 * `MagicDatePicker` is the Material 3 date and datetime picker molecule composing
 * MUI v9 `FormControl`, `TextField`, `IconButton`, and `MagicIcon`.
 *
 * - **References**:
 *   - [Material 3 Date Pickers](https://m3.material.io/components/date-pickers/overview)
 */
const meta: Meta<typeof MagicDatePicker> = {
  title: 'Molecules/DatePicker',
  component: MagicDatePicker,
  tags: ['autodocs', 'snapshot'],
  args: {
    mode: 'single',
    label: 'Release Date',
    hint: 'Choose a target deployment date within 2026',
    appearance: 'outlined',
    size: 'md',
    minDate: '2026-01-01',
    maxDate: '2026-12-31',
    enableTime: false,
    clearable: true,
    required: false,
    disabled: false,
    readOnly: false,
    color: 'primary',
    onChange: fn(),
    onRangeChange: fn(),
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range'],
      table: { category: 'Behavior' },
    },
    label: { control: 'text', table: { category: 'Content' } },
    hint: { control: 'text', table: { category: 'Content' } },
    errorText: { control: 'text', table: { category: 'Validation' } },
    value: { control: 'text', table: { category: 'Value' } },
    defaultValue: { control: 'text', table: { category: 'Value' } },
    minDate: { control: 'text', table: { category: 'Validation' } },
    maxDate: { control: 'text', table: { category: 'Validation' } },
    enableTime: { control: 'boolean', table: { category: 'Behavior' } },
    clearable: { control: 'boolean', table: { category: 'Behavior' } },
    required: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    readOnly: { control: 'boolean', table: { category: 'State' } },
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
    onChange: { action: 'changed', table: { category: 'Events' } },
    onRangeChange: { action: 'rangeChanged', table: { category: 'Events' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <MagicDatePicker {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicDatePicker>;

function InteractiveSingleDateDemo() {
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-06-15');
  return (
    <Stack spacing={1.5} sx={{ maxWidth: 400 }}>
      <MagicDatePicker
        testId="single-date-picker"
        label="Milestone Target Date"
        hint="Bounded between Jan 1 and Dec 31, 2026"
        value={selectedDate}
        minDate="2026-01-01"
        maxDate="2026-12-31"
        clearable
        onChange={setSelectedDate}
      />
      <Typography variant="caption" color="text.secondary" data-testid="single-date-output">
        Selected date: {selectedDate ?? 'Unset'}
      </Typography>
    </Stack>
  );
}

/**
 * Stateful interactive single-date picker with live selection and clear button verification.
 */
export const InteractiveSingleDate: Story = {
  render: () => <InteractiveSingleDateDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('single-date-picker-input') as HTMLInputElement;
    await expect(canvas.getByTestId('single-date-output')).toHaveTextContent(
      'Selected date: 2026-06-15',
    );
    fireEvent.change(input, { target: { value: '2026-09-20' } });
    await expect(canvas.getByTestId('single-date-output')).toHaveTextContent(
      'Selected date: 2026-09-20',
    );
    await userEvent.click(canvas.getByTestId('single-date-picker-clear'));
    await expect(canvas.getByTestId('single-date-output')).toHaveTextContent(
      'Selected date: Unset',
    );
  },
};

function InteractiveDateRangeDemo() {
  const [range, setRange] = useState<DateRangeValue>({
    start: '2026-04-01',
    end: '2026-04-14',
  });
  return (
    <Stack spacing={1.5} sx={{ maxWidth: 540 }}>
      <MagicDatePicker
        testId="range-date-picker"
        mode="range"
        label="Sprint Cycle"
        hint="Pick start and end dates"
        rangeValue={range}
        minDate="2026-01-01"
        maxDate="2026-12-31"
        clearable
        onRangeChange={setRange}
      />
      <Typography variant="caption" color="text.secondary" data-testid="range-output">
        Range: {range.start ?? '—'} → {range.end ?? '—'}
      </Typography>
    </Stack>
  );
}

/**
 * Stateful interactive date-range picker (`start` and `end`) with live range readout.
 */
export const InteractiveDateRange: Story = {
  render: () => <InteractiveDateRangeDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const endInput = canvas.getByTestId('range-date-picker-end') as HTMLInputElement;
    fireEvent.change(endInput, { target: { value: '2026-04-28' } });
    await expect(canvas.getByTestId('range-output')).toHaveTextContent(
      'Range: 2026-04-01 → 2026-04-28',
    );
  },
};

/**
 * Datetime (`enableTime`), `filled` appearance, error state, readOnly, and disabled comparison.
 */
export const StatesAndAppearances: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 440 }}>
      <MagicDatePicker
        label="Deployment Window (Datetime)"
        appearance="filled"
        enableTime
        defaultValue="2026-07-04T09:30"
      />
      <MagicDatePicker
        label="Required Date With Error"
        required
        errorText="Please choose a valid release date."
      />
      <MagicDatePicker
        label="Read-Only Audit Date"
        readOnly
        defaultValue="2026-03-10"
      />
      <MagicDatePicker
        label="Disabled Date Picker"
        disabled
        defaultValue="2026-02-01"
      />
    </Stack>
  ),
};
