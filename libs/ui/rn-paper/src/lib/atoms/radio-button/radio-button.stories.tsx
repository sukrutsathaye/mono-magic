import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicRadioButton } from './radio-button';

/**
 * `MagicRadioButton` renders an accessible Material 3 radio group supporting
 * controlled/uncontrolled selection, horizontal/vertical stacking, per-option
 * label placement (`before` | `after`), `required` markers, `disabledInteractive`,
 * and all 5 size and 7 semantic color tokens.
 *
 * - **References**:
 *   - [React Native Paper RadioButton](https://callstack.github.io/react-native-paper/docs/components/RadioButton)
 *   - [Material 3 Radio Button](https://m3.material.io/components/radio-button/overview)
 */
const meta: Meta<typeof MagicRadioButton> = {
  title: 'Atoms/RadioButton',
  component: MagicRadioButton,
  tags: ['autodocs', 'snapshot'],
  args: {
    ariaLabel: 'Subscription plan',
    options: [
      { value: 'starter', label: 'Starter' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise (disabled)', disabled: true },
    ],
    defaultValue: 'starter',
    labelPosition: 'after',
    vertical: false,
    disabled: false,
    disabledInteractive: false,
    required: false,
    disableRipple: false,
    color: 'primary',
    size: 'md',
    onChange: fn(),
  },
  argTypes: {
    options: { control: 'object', table: { category: 'Data' } },
    value: { control: 'text', table: { category: 'Value' } },
    defaultValue: { control: 'text', table: { category: 'Value' } },
    vertical: { control: 'boolean', table: { category: 'Layout' } },
    labelPosition: {
      control: 'select',
      options: ['before', 'after'],
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
    disableRipple: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    name: { control: 'text', table: { category: 'Attributes' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onChange: { action: 'changed', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicRadioButton>;

/**
 * Default horizontal radio group with an initially selected option and one disabled item.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const proRadio = canvas.getByRole('radio', { name: 'Pro' });
    await expect(proRadio).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(proRadio);
    await expect(proRadio).toHaveAttribute('aria-checked', 'true');
    await expect(args.onChange).toHaveBeenCalledWith('pro');
  },
};

/**
 * Vertically stacked radio options with required field marker.
 */
export const VerticalRequired: Story = {
  args: {
    vertical: true,
    required: true,
    defaultValue: 'pro',
  },
};

/**
 * Radio group placing labels before the radio circles.
 */
export const LabelBefore: Story = {
  args: {
    labelPosition: 'before',
    vertical: true,
    defaultValue: 'starter',
  },
};

/**
 * Disabled vs focusable `disabledInteractive` radio group states.
 */
export const Disabled: Story = {
  render: (args) => (
    <View style={{ gap: 16 }}>
      <MagicRadioButton
        ariaLabel="Standard disabled"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
        defaultValue="a"
        disabled
        onChange={args.onChange}
      />
      <MagicRadioButton
        ariaLabel="Interactive disabled"
        options={[
          { value: 'a', label: 'Interactive A' },
          { value: 'b', label: 'Interactive B' },
        ]}
        defaultValue="a"
        disabled
        disabledInteractive
        onChange={args.onChange}
      />
    </View>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const interactiveB = canvas.getByRole('radio', { name: 'Interactive B' });
    await expect(interactiveB).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactiveB);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Gallery of all 5 sizes and all 7 semantic Material 3 color intents.
 */
export const SizesAndColors: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <MagicRadioButton
          size="xs"
          color="primary"
          defaultValue="a"
          options={[{ value: 'a', label: 'XS Primary' }]}
        />
        <MagicRadioButton
          size="sm"
          color="secondary"
          defaultValue="a"
          options={[{ value: 'a', label: 'SM Secondary' }]}
        />
        <MagicRadioButton
          size="md"
          color="tertiary"
          defaultValue="a"
          options={[{ value: 'a', label: 'MD Tertiary' }]}
        />
        <MagicRadioButton
          size="lg"
          color="success"
          defaultValue="a"
          options={[{ value: 'a', label: 'LG Success' }]}
        />
        <MagicRadioButton
          size="xl"
          color="error"
          defaultValue="a"
          options={[{ value: 'a', label: 'XL Error' }]}
        />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <MagicRadioButton
          color="warning"
          defaultValue="a"
          options={[{ value: 'a', label: 'Warning' }]}
        />
        <MagicRadioButton
          color="neutral"
          defaultValue="a"
          options={[{ value: 'a', label: 'Neutral' }]}
        />
      </View>
    </View>
  ),
};

/**
 * Dynamic Material 3 dark theme verification for `MagicRadioButton`.
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
        <MagicRadioButton
          ariaLabel="Dark theme plan"
          defaultValue="monthly"
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual' },
          ]}
        />
      </View>
    </MagicPaperProvider>
  ),
};
