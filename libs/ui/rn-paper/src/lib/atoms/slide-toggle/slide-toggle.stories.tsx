import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicSlideToggle } from './slide-toggle';

/**
 * `MagicSlideToggle` implements an accessible Material 3 switch atom supporting
 * controlled/uncontrolled state, thumb check/close icons, `labelPosition`
 * (`before` | `after`), `disabledInteractive`, `required`, all 5 sizes, and
 * all 7 semantic color intents.
 *
 * - **References**:
 *   - [React Native Paper Switch](https://callstack.github.io/react-native-paper/docs/components/Switch)
 *   - [Material 3 Switch](https://m3.material.io/components/switch/overview)
 */
const meta: Meta<typeof MagicSlideToggle> = {
  title: 'Atoms/SlideToggle',
  component: MagicSlideToggle,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'Enable notifications',
    defaultChecked: false,
    disabled: false,
    disabledInteractive: false,
    required: false,
    hideIcon: false,
    labelPosition: 'after',
    disableRipple: false,
    color: 'primary',
    size: 'md',
    onChange: fn(),
    onToggleChange: fn(),
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    children: { control: false, table: { category: 'Content' } },
    checked: { control: 'boolean', table: { category: 'Value' } },
    defaultChecked: { control: 'boolean', table: { category: 'Value' } },
    hideIcon: { control: 'boolean', table: { category: 'Appearance' } },
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
    onToggleChange: { action: 'toggled', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicSlideToggle>;

/**
 * Default off-state slide toggle with click interaction test.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(args.onChange).toHaveBeenCalledWith(true);
    await expect(args.onToggleChange).toHaveBeenCalledTimes(1);
  },
};

/**
 * Comparison of checked, `hideIcon`, `labelPosition="before"`, and `required` states.
 */
export const Variants: Story = {
  render: () => (
    <View style={{ gap: 14 }}>
      <MagicSlideToggle label="Checked with icon" defaultChecked />
      <MagicSlideToggle label="Thumb icon hidden" defaultChecked hideIcon />
      <MagicSlideToggle
        label="Label before switch"
        labelPosition="before"
        defaultChecked
      />
      <MagicSlideToggle label="Required consent" required />
      <MagicSlideToggle>
        <Text style={{ fontWeight: '600' }}>Custom projected label</Text>
      </MagicSlideToggle>
    </View>
  ),
};

/**
 * Disabled vs focusable `disabledInteractive` slide toggle states.
 */
export const Disabled: Story = {
  render: (args) => (
    <View style={{ gap: 14 }}>
      <MagicSlideToggle
        label="Disabled off"
        disabled
        onChange={args.onChange}
      />
      <MagicSlideToggle
        label="Disabled checked"
        disabled
        defaultChecked
        onChange={args.onChange}
      />
      <MagicSlideToggle
        label="Disabled Interactive"
        disabled
        disabledInteractive
        defaultChecked
        onChange={args.onChange}
      />
    </View>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const interactive = canvas.getByRole('switch', {
      name: 'Disabled Interactive',
    });
    await expect(interactive).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactive);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Gallery of all 5 sizes (`xs`..`xl`) and all 7 semantic color intents.
 */
export const SizesAndColors: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <MagicSlideToggle size="xs" defaultChecked label="XS" />
        <MagicSlideToggle size="sm" defaultChecked label="SM" />
        <MagicSlideToggle size="md" defaultChecked label="MD" />
        <MagicSlideToggle size="lg" defaultChecked label="LG" />
        <MagicSlideToggle size="xl" defaultChecked label="XL" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <MagicSlideToggle color="primary" defaultChecked label="Primary" />
        <MagicSlideToggle color="secondary" defaultChecked label="Secondary" />
        <MagicSlideToggle color="tertiary" defaultChecked label="Tertiary" />
        <MagicSlideToggle color="success" defaultChecked label="Success" />
        <MagicSlideToggle color="warning" defaultChecked label="Warning" />
        <MagicSlideToggle color="error" defaultChecked label="Error" />
        <MagicSlideToggle color="neutral" defaultChecked label="Neutral" />
      </View>
    </View>
  ),
};

/**
 * Dynamic Material 3 dark palette verification for `MagicSlideToggle`.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          gap: 12,
        }}
      >
        <MagicSlideToggle label="Dark mode enabled" defaultChecked />
        <MagicSlideToggle label="Auto-sync" color="tertiary" />
      </View>
    </MagicPaperProvider>
  ),
};
