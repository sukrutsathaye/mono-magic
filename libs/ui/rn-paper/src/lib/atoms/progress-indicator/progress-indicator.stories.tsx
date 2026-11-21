import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicProgressIndicator } from './progress-indicator';

/**
 * `MagicProgressIndicator` unifies linear progress bars (`determinate`,
 * `indeterminate`, `buffer`, `query`) and circular spinners behind a single
 * Material 3 atomic API.
 *
 * - **References**:
 *   - [React Native Paper ProgressBar](https://callstack.github.io/react-native-paper/docs/components/ProgressBar)
 *   - [React Native Paper ActivityIndicator](https://callstack.github.io/react-native-paper/docs/components/ActivityIndicator)
 *   - [Material 3 Progress Indicators](https://m3.material.io/components/progress-indicators/overview)
 */
const meta: Meta<typeof MagicProgressIndicator> = {
  title: 'Atoms/ProgressIndicator',
  component: MagicProgressIndicator,
  tags: ['autodocs', 'snapshot'],
  args: {
    ariaLabel: 'Loading progress',
    type: 'bar',
    mode: 'determinate',
    value: 55,
    bufferValue: 80,
    color: 'primary',
    size: 'md',
    disabled: false,
    onAnimationEnd: fn(),
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['bar', 'spinner'],
      table: { category: 'Type' },
    },
    mode: {
      control: 'select',
      options: ['determinate', 'indeterminate', 'buffer', 'query'],
      table: { category: 'Behavior' },
    },
    value: {
      control: { type: 'range', min: 0, max: 100 },
      table: { category: 'Value' },
    },
    bufferValue: {
      control: { type: 'range', min: 0, max: 100 },
      table: { category: 'Value' },
    },
    diameter: { control: 'number', table: { category: 'Dimensions' } },
    strokeWidth: { control: 'number', table: { category: 'Dimensions' } },
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
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onAnimationEnd: { action: 'animationEnded', table: { category: 'Events' } },
  },
  render: (args) => (
    <View style={{ maxWidth: 420, width: '100%' }}>
      <MagicProgressIndicator {...args} />
    </View>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicProgressIndicator>;

/**
 * Default determinate linear progress bar showing 55% completion.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', '55');
  },
};

/**
 * Comparison of all four linear bar modes (`determinate`, `indeterminate`, `buffer`, `query`).
 */
export const BarModes: Story = {
  render: () => (
    <View style={{ gap: 16, maxWidth: 420, width: '100%' }}>
      <MagicProgressIndicator
        type="bar"
        mode="determinate"
        value={65}
        ariaLabel="Determinate bar"
      />
      <MagicProgressIndicator
        type="bar"
        mode="buffer"
        value={45}
        bufferValue={75}
        ariaLabel="Buffer bar"
      />
      <MagicProgressIndicator
        type="bar"
        mode="indeterminate"
        ariaLabel="Indeterminate bar"
      />
      <MagicProgressIndicator
        type="bar"
        mode="query"
        ariaLabel="Query bar"
      />
    </View>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bars = canvas.getAllByRole('progressbar');
    await expect(bars).toHaveLength(4);
  },
};

/**
 * Indeterminate and determinate circular spinners across size tokens.
 */
export const Spinners: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
      <MagicProgressIndicator
        type="spinner"
        mode="indeterminate"
        size="xs"
        ariaLabel="XS spinner"
      />
      <MagicProgressIndicator
        type="spinner"
        mode="indeterminate"
        size="sm"
        ariaLabel="SM spinner"
      />
      <MagicProgressIndicator
        type="spinner"
        mode="indeterminate"
        size="md"
        ariaLabel="MD spinner"
      />
      <MagicProgressIndicator
        type="spinner"
        mode="determinate"
        value={75}
        size="lg"
        ariaLabel="LG determinate spinner"
      />
      <MagicProgressIndicator
        type="spinner"
        mode="determinate"
        value={100}
        size="xl"
        ariaLabel="XL complete spinner"
      />
    </View>
  ),
};

/**
 * Gallery of all seven semantic Material 3 color intents on bars and spinners.
 */
export const Colors: Story = {
  render: () => (
    <View style={{ gap: 14, maxWidth: 420, width: '100%' }}>
      <MagicProgressIndicator color="primary" value={80} ariaLabel="Primary" />
      <MagicProgressIndicator color="secondary" value={70} ariaLabel="Secondary" />
      <MagicProgressIndicator color="tertiary" value={60} ariaLabel="Tertiary" />
      <MagicProgressIndicator color="success" value={90} ariaLabel="Success" />
      <MagicProgressIndicator color="warning" value={50} ariaLabel="Warning" />
      <MagicProgressIndicator color="error" value={35} ariaLabel="Error" />
      <MagicProgressIndicator color="neutral" value={40} ariaLabel="Neutral" />
    </View>
  ),
};

/**
 * Disabled progress bar and spinner states.
 */
export const Disabled: Story = {
  render: () => (
    <View style={{ gap: 16, maxWidth: 420, width: '100%' }}>
      <MagicProgressIndicator
        type="bar"
        mode="determinate"
        value={40}
        disabled
        ariaLabel="Disabled bar"
      />
      <MagicProgressIndicator
        type="spinner"
        mode="indeterminate"
        disabled
        ariaLabel="Disabled spinner"
      />
    </View>
  ),
};

/**
 * Dark theme verification for `MagicProgressIndicator`.
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
          maxWidth: 420,
          width: '100%',
        }}
      >
        <MagicProgressIndicator mode="determinate" value={70} color="primary" />
        <MagicProgressIndicator
          mode="buffer"
          value={40}
          bufferValue={75}
          color="tertiary"
        />
        <MagicProgressIndicator type="spinner" mode="indeterminate" color="success" />
      </View>
    </MagicPaperProvider>
  ),
};
