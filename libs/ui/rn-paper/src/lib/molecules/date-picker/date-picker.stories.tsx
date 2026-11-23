import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicDatePicker, type DateRangeValue } from './date-picker';

/**
 * `MagicDatePicker` is the Material 3 date and date-range picker molecule for `@mono-magic/rn-paper`.
 *
 * It composes `MagicFormField` with typed ISO date/datetime inputs, an interactive
 * calendar grid popover, `minDate`/`maxDate` validation, optional `enableTime`,
 * `clearable` reset, `readOnly`/`disabled` states, and `mode="single" | "range"`.
 */
const meta: Meta<typeof MagicDatePicker> = {
  title: 'Molecules/DatePicker',
  component: MagicDatePicker,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'Target Date',
    hint: 'Select or enter YYYY-MM-DD',
    mode: 'single',
    appearance: 'outlined',
    size: 'md',
    clearable: true,
    enableTime: false,
    required: false,
    disabled: false,
    readOnly: false,
    color: 'primary',
    onChange: fn(),
    onRangeChange: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range'],
      table: { category: 'Behavior' },
    },
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
    enableTime: { control: 'boolean', table: { category: 'Behavior' } },
    clearable: { control: 'boolean', table: { category: 'Behavior' } },
    required: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    onChange: { action: 'changed', table: { category: 'Events' } },
    onRangeChange: { action: 'rangeChanged', table: { category: 'Events' } },
  },
  render: (args) => (
    <View style={{ maxWidth: 380, width: '100%' }}>
      <MagicDatePicker {...args} />
    </View>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicDatePicker>;

function InteractiveSingleDateDemo(
  args: React.ComponentProps<typeof MagicDatePicker>
) {
  const [value, setValue] = useState<string | null>('2026-06-10');

  return (
    <View style={{ maxWidth: 380, width: '100%', gap: 10 }}>
      <MagicDatePicker
        testId="story-dp-single"
        label="Release Date"
        hint="Allowed between June 5 and June 25"
        value={value}
        minDate="2026-06-05"
        maxDate="2026-06-25"
        clearable
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      />
      <Text testID="story-dp-single-selected">
        {`Selected: ${value ?? 'None'}`}
      </Text>
    </View>
  );
}

/**
 * Interactive single date selection via calendar popover with min/max bounds and clearable action.
 */
export const InteractiveSingleDate: Story = {
  render: (args) => <InteractiveSingleDateDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('story-dp-single-calendar-toggle'));
    await userEvent.click(canvas.getByTestId('story-dp-single-day-2026-06-18'));
    await expect(args.onChange).toHaveBeenCalledWith('2026-06-18');
    await expect(
      canvas.getByTestId('story-dp-single-selected')
    ).toHaveTextContent('Selected: 2026-06-18');
  },
};

function InteractiveDateRangeDemo(
  args: React.ComponentProps<typeof MagicDatePicker>
) {
  const [range, setRange] = useState<DateRangeValue>({
    start: '2026-07-04',
    end: '2026-07-09',
  });

  return (
    <View style={{ maxWidth: 420, width: '100%', gap: 10 }}>
      <MagicDatePicker
        testId="story-dp-range"
        label="Sprint Window"
        mode="range"
        appearance="filled"
        rangeValue={range}
        onRangeChange={(next) => {
          setRange(next);
          args.onRangeChange?.(next);
        }}
      />
      <Text testID="story-dp-range-summary">
        {`Range: ${range.start ?? 'unset'} -> ${range.end ?? 'unset'}`}
      </Text>
    </View>
  );
}

/**
 * Interactive date-range selection picking start and end dates on the calendar grid.
 */
export const InteractiveDateRange: Story = {
  render: (args) => <InteractiveDateRangeDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('story-dp-range-calendar-toggle'));
    await userEvent.click(canvas.getByTestId('story-dp-range-day-2026-07-12'));
    await userEvent.click(canvas.getByTestId('story-dp-range-day-2026-07-16'));
    await expect(args.onRangeChange).toHaveBeenLastCalledWith({
      start: '2026-07-12',
      end: '2026-07-16',
    });
  },
};

/**
 * DateTime picker (`enableTime`), validation error, readOnly, and disabled states.
 */
export const StatesAndTimeSelection: Story = {
  render: () => (
    <View style={{ maxWidth: 380, width: '100%', gap: 12 }}>
      <MagicDatePicker
        label="Deployment Timestamp"
        enableTime
        defaultValue="2026-08-01T14:30"
        hint="Includes HH:mm time selector"
      />
      <MagicDatePicker
        label="Due Date"
        required
        errorText="Deadline is required"
        appearance="outlined"
      />
      <MagicDatePicker
        label="Locked Audit Date"
        readOnly
        value="2026-01-15"
      />
      <MagicDatePicker
        label="Disabled Picker"
        disabled
        value="2026-01-15"
      />
    </View>
  ),
};

/**
 * Date pickers rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          gap: 16,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <MagicDatePicker
          label="Dark Outlined Date"
          defaultValue="2026-09-12"
          appearance="outlined"
        />
        <MagicDatePicker
          label="Dark Filled Range"
          mode="range"
          appearance="filled"
          defaultRangeValue={{ start: '2026-09-01', end: '2026-09-10' }}
        />
      </View>
    </MagicPaperProvider>
  ),
};
