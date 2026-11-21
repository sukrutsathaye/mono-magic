import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import {
  MagicSelect,
  type SelectOption,
  type SelectOptionGroup,
} from './select';

const FRAMEWORK_OPTIONS: readonly SelectOption<string>[] = [
  { value: 'angular', label: 'Angular Material' },
  { value: 'rn-paper', label: 'React Native Paper' },
  { value: 'flutter', label: 'Flutter Material 3' },
  { value: 'legacy', label: 'Legacy UI (Deprecated)', disabled: true },
];

const GROUPED_OPTIONS: readonly SelectOptionGroup<string>[] = [
  {
    label: 'Web & Mobile',
    options: [
      { value: 'angular', label: 'Angular 21' },
      { value: 'react-native', label: 'React Native 0.81' },
    ],
  },
  {
    label: 'Experimental',
    disabled: true,
    options: [{ value: 'vision', label: 'visionOS UI' }],
  },
];

/**
 * `MagicSelect` is the Material 3 dropdown select molecule for `@mono-magic/rn-paper`.
 *
 * It wraps an accessible combobox trigger (`role="combobox"`) and listbox panel
 * (`role="listbox"`) inside `MagicFormField`, supporting flat `options`,
 * grouped `optionGroups`, single and `multiple` selection, and
 * `customTriggerSummary` (`"First (+1 other)"` / `"First (+N others)"`).
 *
 * - **References**:
 *   - [Material 3 Menus & Selects](https://m3.material.io/components/menus/overview)
 */
const meta: Meta<typeof MagicSelect<string>> = {
  title: 'Molecules/Select',
  component: MagicSelect,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'UI Library',
    hint: 'Choose your target design system implementation',
    placeholder: 'Select a library',
    appearance: 'outlined',
    size: 'md',
    floatLabel: 'auto',
    subscriptSizing: 'fixed',
    hideRequiredMarker: false,
    multiple: false,
    required: false,
    disabled: false,
    disableRipple: false,
    customTriggerSummary: false,
    options: FRAMEWORK_OPTIONS,
    optionGroups: [],
    onChange: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
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
    floatLabel: {
      control: 'select',
      options: ['auto', 'always'],
      table: { category: 'Appearance' },
    },
    subscriptSizing: {
      control: 'select',
      options: ['fixed', 'dynamic'],
      table: { category: 'Appearance' },
    },
    hideRequiredMarker: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    label: { control: 'text', table: { category: 'Content' } },
    hint: { control: 'text', table: { category: 'Content' } },
    errorText: { control: 'text', table: { category: 'Content' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    options: { control: 'object', table: { category: 'Options' } },
    optionGroups: { control: 'object', table: { category: 'Options' } },
    value: { control: 'object', table: { category: 'Value' } },
    defaultValue: { control: 'object', table: { category: 'Value' } },
    multiple: { control: 'boolean', table: { category: 'Behavior' } },
    customTriggerSummary: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    disableRipple: { control: 'boolean', table: { category: 'Behavior' } },
    panelClass: { control: 'text', table: { category: 'Appearance' } },
    required: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onChange: { action: 'changed', table: { category: 'Events' } },
    onOpenChange: { action: 'openChanged', table: { category: 'Events' } },
  },
  render: (args) => (
    <View style={{ maxWidth: 360, width: '100%', minHeight: 240 }}>
      <MagicSelect {...args} />
    </View>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicSelect<string>>;

/**
 * Default single-select outlined combobox opening the listbox and picking an option.
 *
 * Props: `appearance="outlined"`, `multiple=false`.
 */
export const SingleSelect: Story = {
  args: {
    testId: 'single-select',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByRole('combobox');
    await userEvent.click(combobox);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    const opt = canvas.getByRole('option', { name: 'React Native Paper' });
    await userEvent.click(opt);
    await expect(args.onChange).toHaveBeenCalledWith('rn-paper');
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

/**
 * Filled Material 3 appearance with preselected value.
 *
 * Props: `appearance="filled"`, `defaultValue="flutter"`.
 */
export const FilledAppearance: Story = {
  args: {
    appearance: 'filled',
    defaultValue: 'flutter',
  },
};

/**
 * Multi-select mode with `customTriggerSummary` formatting `"First (+N other/others)"`.
 *
 * Props: `multiple=true`, `customTriggerSummary=true`, `defaultValue=['angular', 'rn-paper', 'flutter']`.
 */
export const MultipleWithCustomSummary: Story = {
  args: {
    label: 'Target Platforms',
    multiple: true,
    customTriggerSummary: true,
    defaultValue: ['angular', 'rn-paper', 'flutter'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Angular Material (+2 others)')
    ).toBeInTheDocument();
  },
};

/**
 * Grouped options (`optionGroups`) with group headers and cascading group `disabled` state.
 */
export const OptionGroups: Story = {
  args: {
    label: 'Platform Stack',
    options: [],
    optionGroups: GROUPED_OPTIONS,
    defaultValue: 'react-native',
  },
};

/**
 * Validation error state displaying `errorText` and marking the combobox `aria-invalid="true"`.
 *
 * Props: `required=true`, `errorText="Please select a target framework"`.
 */
export const WithError: Story = {
  args: {
    required: true,
    hint: undefined,
    errorText: 'Please select a target framework',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Please select a target framework')
    ).toBeInTheDocument();
    await expect(canvas.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  },
};

/**
 * Disabled select field preventing listbox opening.
 *
 * Props: `disabled=true`, `defaultValue="angular"`.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'angular',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  },
};

/**
 * Comparison of all 5 form-field density scale tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: (args) => (
    <View style={{ gap: 12, maxWidth: 360, width: '100%' }}>
      <MagicSelect
        {...args}
        size="xs"
        label="XS Select"
        subscriptSizing="dynamic"
        defaultValue="angular"
      />
      <MagicSelect
        {...args}
        size="sm"
        label="SM Select"
        subscriptSizing="dynamic"
        defaultValue="angular"
      />
      <MagicSelect
        {...args}
        size="md"
        label="MD Select"
        subscriptSizing="dynamic"
        defaultValue="rn-paper"
      />
      <MagicSelect
        {...args}
        size="lg"
        label="LG Select"
        subscriptSizing="dynamic"
        defaultValue="flutter"
      />
      <MagicSelect
        {...args}
        size="xl"
        label="XL Select"
        subscriptSizing="dynamic"
        defaultValue="flutter"
      />
    </View>
  ),
};

/**
 * Outlined and filled select molecules rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: (args) => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          gap: 16,
          maxWidth: 380,
          width: '100%',
        }}
      >
        <MagicSelect
          {...args}
          label="Outlined Dark Select"
          appearance="outlined"
          defaultValue="rn-paper"
        />
        <MagicSelect
          {...args}
          label="Filled Dark Multi-Select"
          appearance="filled"
          multiple
          customTriggerSummary
          defaultValue={['angular', 'flutter']}
        />
      </View>
    </MagicPaperProvider>
  ),
};
