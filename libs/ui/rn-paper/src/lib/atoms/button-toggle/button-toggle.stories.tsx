import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicButtonToggle } from './button-toggle';

/**
 * `MagicButtonToggle` implements Material 3 segmented toggle buttons supporting
 * single and multiple selection, horizontal and vertical stacking, `standard`
 * and `legacy` appearances, selection checkmarks, option icons, `disabledInteractive`,
 * and all 5 sizes and 7 semantic color intents.
 *
 * - **References**:
 *   - [React Native Paper SegmentedButtons](https://callstack.github.io/react-native-paper/docs/components/SegmentedButtons)
 *   - [Material 3 Segmented Buttons](https://m3.material.io/components/segmented-buttons/overview)
 */
const meta: Meta<typeof MagicButtonToggle> = {
  title: 'Atoms/ButtonToggle',
  component: MagicButtonToggle,
  tags: ['autodocs', 'snapshot'],
  args: {
    ariaLabel: 'Text alignment',
    options: [
      { value: 'left', label: 'Left', icon: 'format_align_left' },
      { value: 'center', label: 'Center', icon: 'format_align_center' },
      { value: 'right', label: 'Right', icon: 'format_align_right' },
      { value: 'justify', label: 'Justify', disabled: true },
    ],
    defaultValue: 'left',
    selectionMode: 'single',
    vertical: false,
    appearance: 'standard',
    hideSelectionIndicator: false,
    disabled: false,
    disabledInteractive: false,
    size: 'md',
    color: 'primary',
    required: false,
    onChange: fn(),
  },
  argTypes: {
    options: { control: 'object', table: { category: 'Data' } },
    value: { control: 'object', table: { category: 'Value' } },
    defaultValue: { control: 'object', table: { category: 'Value' } },
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
      table: { category: 'Behavior' },
    },
    vertical: { control: 'boolean', table: { category: 'Layout' } },
    appearance: {
      control: 'select',
      options: ['standard', 'legacy'],
      table: { category: 'Appearance' },
    },
    hideSelectionIndicator: {
      control: 'boolean',
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
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    disabledInteractive: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    name: { control: 'text', table: { category: 'Attributes' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onChange: { action: 'changed', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicButtonToggle>;

/**
 * Default single-select horizontal toggle group with icons and a disabled segment.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const centerBtn = canvas.getByRole('radio', { name: 'Center' });
    await expect(centerBtn).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(centerBtn);
    await expect(centerBtn).toHaveAttribute('aria-checked', 'true');
    await expect(args.onChange).toHaveBeenCalledWith('center');
  },
};

/**
 * Multi-select toggle group allowing simultaneous active formatting flags.
 */
export const Multiple: Story = {
  args: {
    ariaLabel: 'Formatting',
    selectionMode: 'multiple',
    defaultValue: ['bold'],
    options: [
      { value: 'bold', label: 'Bold', icon: 'format_bold' },
      { value: 'italic', label: 'Italic', icon: 'format_italic' },
      { value: 'underline', label: 'Underline', icon: 'format_underlined' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const italicBtn = canvas.getByRole('button', { name: 'Italic' });
    await userEvent.click(italicBtn);
    await expect(italicBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onChange).toHaveBeenCalledWith(['bold', 'italic']);
  },
};

/**
 * Vertically stacked segmented toggle group and `legacy` square appearance comparison.
 */
export const VerticalAndLegacy: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
      <MagicButtonToggle
        vertical
        defaultValue="top"
        options={[
          { value: 'top', label: 'Top' },
          { value: 'middle', label: 'Middle' },
          { value: 'bottom', label: 'Bottom' },
        ]}
      />
      <MagicButtonToggle
        appearance="legacy"
        hideSelectionIndicator
        defaultValue="day"
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
    </View>
  ),
};

/**
 * Disabled vs focusable `disabledInteractive` button toggle group states.
 */
export const Disabled: Story = {
  render: (args) => (
    <View style={{ gap: 16 }}>
      <MagicButtonToggle
        ariaLabel="Standard disabled"
        disabled
        defaultValue="a"
        options={[
          { value: 'a', label: 'One' },
          { value: 'b', label: 'Two' },
        ]}
        onChange={args.onChange}
      />
      <MagicButtonToggle
        ariaLabel="Interactive disabled"
        disabled
        disabledInteractive
        defaultValue="a"
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
        onChange={args.onChange}
      />
    </View>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const beta = canvas.getByRole('radio', { name: 'Beta' });
    await expect(beta).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(beta);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Gallery of all 5 sizes (`xs`..`xl`) and all 7 semantic Material 3 color intents.
 */
export const SizesAndColors: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <MagicButtonToggle
        size="xs"
        color="primary"
        defaultValue="a"
        options={[
          { value: 'a', label: 'XS' },
          { value: 'b', label: 'Primary' },
        ]}
      />
      <MagicButtonToggle
        size="sm"
        color="secondary"
        defaultValue="a"
        options={[
          { value: 'a', label: 'SM' },
          { value: 'b', label: 'Secondary' },
        ]}
      />
      <MagicButtonToggle
        size="md"
        color="tertiary"
        defaultValue="a"
        options={[
          { value: 'a', label: 'MD' },
          { value: 'b', label: 'Tertiary' },
        ]}
      />
      <MagicButtonToggle
        size="lg"
        color="success"
        defaultValue="a"
        options={[
          { value: 'a', label: 'LG' },
          { value: 'b', label: 'Success' },
        ]}
      />
      <MagicButtonToggle
        size="xl"
        color="warning"
        defaultValue="a"
        options={[
          { value: 'a', label: 'XL' },
          { value: 'b', label: 'Warning' },
        ]}
      />
      <MagicButtonToggle
        color="error"
        defaultValue="a"
        options={[
          { value: 'a', label: 'Error' },
          { value: 'b', label: 'Alt' },
        ]}
      />
      <MagicButtonToggle
        color="neutral"
        defaultValue="a"
        options={[
          { value: 'a', label: 'Neutral' },
          { value: 'b', label: 'Alt' },
        ]}
      />
    </View>
  ),
};

/**
 * Dynamic Material 3 dark theme verification for `MagicButtonToggle`.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
        }}
      >
        <MagicButtonToggle
          ariaLabel="Dark theme view"
          defaultValue="grid"
          options={[
            { value: 'list', label: 'List', icon: 'view_list' },
            { value: 'grid', label: 'Grid', icon: 'grid_view' },
          ]}
        />
      </View>
    </MagicPaperProvider>
  ),
};
