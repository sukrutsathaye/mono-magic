import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicButton } from './button';

/**
 * `MagicButton` wraps React Native Paper's button family (`Button`, `IconButton`,
 * and `FAB`) behind a single Material 3 atomic design API.
 *
 * - **Content**: supports `children` (preferred for custom markup) and `label`.
 * - **Icons**: accepts Material Icons ligature strings or custom `ReactNode` elements for `leadingIcon` and `trailingIcon`.
 * - **Theming**: resolves all 7 semantic color intents dynamically from the active `MagicPaperProvider` theme.
 * - **References**:
 *   - [React Native Paper Button](https://callstack.github.io/react-native-paper/docs/components/Button)
 *   - [React Native Paper IconButton](https://callstack.github.io/react-native-paper/docs/components/IconButton)
 *   - [React Native Paper FAB](https://callstack.github.io/react-native-paper/docs/components/FAB)
 *   - [Material 3 Buttons](https://m3.material.io/components/buttons/overview)
 */
const meta: Meta<typeof MagicButton> = {
  title: 'Atoms/Button',
  component: MagicButton,
  args: {
    label: 'Button',
    variant: 'filled',
    kind: 'default',
    shape: 'default',
    color: 'primary',
    size: 'md',
    disabled: false,
    disabledInteractive: false,
    disableRipple: false,
    loading: false,
    fullWidth: false,
    type: 'button',
    onPress: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
      table: { category: 'Appearance' },
    },
    kind: {
      control: 'select',
      options: ['default', 'icon', 'fab', 'mini-fab', 'extended-fab'],
      table: { category: 'Appearance' },
    },
    shape: {
      control: 'select',
      options: ['default', 'square', 'rounded', 'pill'],
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
    fullWidth: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    label: {
      control: 'text',
      table: { category: 'Content' },
    },
    loadingLabel: {
      control: 'text',
      table: { category: 'Content' },
    },
    children: {
      control: false,
      table: { category: 'Content' },
    },
    leadingIcon: {
      control: 'text',
      table: { category: 'Icons' },
    },
    trailingIcon: {
      control: 'text',
      table: { category: 'Icons' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disabledInteractive: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disableRipple: {
      control: 'boolean',
      table: { category: 'State' },
    },
    loading: {
      control: 'boolean',
      table: { category: 'State' },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      table: { category: 'Accessibility' },
    },
    id: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    testId: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    onPress: {
      action: 'pressed',
      table: { category: 'Events' },
    },
    onClick: {
      action: 'clicked',
      table: { category: 'Events' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MagicButton>;

/**
 * Interactive playground story for exploring all `MagicButton` props and press emission.
 *
 * Props: `variant="filled"`, `kind="default"`, `color="primary"`, `size="md"`, `label="Filled Button"`.
 */
export const Playground: Story = {
  args: {
    label: 'Filled Button',
    variant: 'filled',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Filled Button' });
    await expect(btn).not.toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(btn);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

/**
 * Comparison of all five Material 3 button emphasis variants.
 *
 * Props: `variant="filled" | "tonal" | "outlined" | "elevated" | "text"`.
 */
export const Variants: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <MagicButton variant="filled" label="Filled" />
      <MagicButton variant="tonal" label="Tonal" />
      <MagicButton variant="outlined" label="Outlined" />
      <MagicButton variant="elevated" label="Elevated" />
      <MagicButton variant="text" label="Text" />
    </View>
  ),
};

/**
 * Structural button kinds unifying `Paper.Button`, `Paper.IconButton`, and `Paper.FAB`.
 *
 * Props: `kind="default" | "icon" | "mini-fab" | "fab" | "extended-fab"`.
 */
export const Kinds: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <MagicButton kind="default" label="Default" />
      <MagicButton
        kind="icon"
        variant="tonal"
        leadingIcon="favorite"
        ariaLabel="Favorite"
      />
      <MagicButton kind="mini-fab" leadingIcon="edit" ariaLabel="Edit item" />
      <MagicButton kind="fab" leadingIcon="add" ariaLabel="Add item" />
      <MagicButton
        kind="extended-fab"
        leadingIcon="navigation"
        label="Navigate"
      />
    </View>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Favorite' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Add item' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Navigate' })
    ).toBeInTheDocument();
  },
};

/**
 * Comparison of all seven semantic Material 3 palette color intents.
 *
 * Props: `color="primary" | "secondary" | "tertiary" | "success" | "warning" | "error" | "neutral"`.
 */
export const Colors: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <MagicButton color="primary" label="Primary" />
        <MagicButton color="secondary" label="Secondary" />
        <MagicButton color="tertiary" label="Tertiary" />
        <MagicButton color="success" label="Success" />
        <MagicButton color="warning" label="Warning" />
        <MagicButton color="error" label="Error" />
        <MagicButton color="neutral" label="Neutral" />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <MagicButton variant="tonal" color="primary" label="Primary" />
        <MagicButton variant="tonal" color="secondary" label="Secondary" />
        <MagicButton variant="tonal" color="tertiary" label="Tertiary" />
        <MagicButton variant="tonal" color="success" label="Success" />
        <MagicButton variant="tonal" color="warning" label="Warning" />
        <MagicButton variant="tonal" color="error" label="Error" />
        <MagicButton variant="tonal" color="neutral" label="Neutral" />
      </View>
    </View>
  ),
};

/**
 * Comparison of all five Material 3 size scale tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <MagicButton size="xs" label="XS" />
      <MagicButton size="sm" label="SM" />
      <MagicButton size="md" label="MD" />
      <MagicButton size="lg" label="LG" />
      <MagicButton size="xl" label="XL" />
    </View>
  ),
};

/**
 * Comparison of corner-radius shape overrides (`default`, `square`, `rounded`, `pill`).
 */
export const Shapes: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <MagicButton shape="default" label="Default" />
      <MagicButton shape="square" label="Square" />
      <MagicButton shape="rounded" label="Rounded" />
      <MagicButton shape="pill" label="Pill" />
    </View>
  ),
};

/**
 * Buttons displaying leading, trailing, dual Material icons, and custom `ReactNode` icons.
 */
export const Icons: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <MagicButton label="Save" leadingIcon="check" />
      <MagicButton
        variant="tonal"
        label="Next"
        trailingIcon="arrow_forward"
      />
      <MagicButton
        variant="outlined"
        label="Continue"
        leadingIcon="check"
        trailingIcon="arrow_forward"
      />
      <MagicButton
        variant="elevated"
        leadingIcon={<Text style={{ fontSize: 16 }}>✦</Text>}
      >
        Custom Node
      </MagicButton>
    </View>
  ),
};

/**
 * Busy loading states displaying the Paper activity indicator, `aria-busy="true"`, and optional `loadingLabel`.
 */
export const Loading: Story = {
  args: {
    label: 'Save',
    loading: true,
    loadingLabel: 'Saving...',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Saving...' });
    await expect(btn).toHaveAttribute('aria-busy', 'true');
    await expect(btn).toHaveAttribute('aria-disabled', 'true');
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/**
 * Block-level button stretching to 100% of its container width.
 *
 * Props: `label="Full Width Action"`, `fullWidth=true`.
 */
export const FullWidth: Story = {
  args: {
    label: 'Full Width Action',
    fullWidth: true,
  },
  render: (args) => (
    <View style={{ maxWidth: 360, width: '100%' }}>
      <MagicButton {...args} />
    </View>
  ),
};

/**
 * Standard disabled vs focusable `disabledInteractive` button states.
 */
export const Disabled: Story = {
  render: (args) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <MagicButton
        label="Disabled"
        disabled
        onPress={args.onPress}
      />
      <MagicButton
        label="Disabled Interactive"
        disabled
        disabledInteractive
        onPress={args.onPress}
      />
    </View>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledBtn = canvas.getByRole('button', { name: 'Disabled' });
    await expect(disabledBtn).toHaveAttribute('aria-disabled', 'true');

    const interactiveBtn = canvas.getByRole('button', {
      name: 'Disabled Interactive',
    });
    await expect(interactiveBtn).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactiveBtn);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/**
 * Dynamic Material 3 dark palette gallery verifying runtime `useTheme()` styling.
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
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <MagicButton variant="filled" label="Filled" />
          <MagicButton variant="tonal" label="Tonal" />
          <MagicButton variant="outlined" label="Outlined" />
          <MagicButton variant="elevated" label="Elevated" />
          <MagicButton variant="text" label="Text" />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <MagicButton
            kind="icon"
            variant="filled"
            leadingIcon="home"
            ariaLabel="Home"
          />
          <MagicButton
            kind="mini-fab"
            variant="tonal"
            leadingIcon="edit"
            ariaLabel="Edit"
          />
          <MagicButton kind="fab" leadingIcon="add" ariaLabel="Add" />
          <MagicButton
            kind="extended-fab"
            color="tertiary"
            leadingIcon="send"
            label="Send"
          />
        </View>
      </View>
    </MagicPaperProvider>
  ),
};
