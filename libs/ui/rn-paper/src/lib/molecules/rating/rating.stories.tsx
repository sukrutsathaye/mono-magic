import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicRating } from './rating';

/**
 * `MagicRating` is the Material 3 star rating molecule for `@mono-magic/rn-paper`.
 *
 * It supports whole-star (`precision={1}`) and half-star (`precision={0.5}`)
 * selection, customizable `max` units, `showValue`, `reviewCount`, `readOnly`,
 * `disabled`, semantic colors, and 5 size tokens.
 */
const meta: Meta<typeof MagicRating> = {
  title: 'Molecules/Rating',
  component: MagicRating,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'Customer Satisfaction',
    defaultValue: 4,
    max: 5,
    precision: 1,
    showValue: true,
    reviewCount: 42,
    readOnly: false,
    disabled: false,
    color: 'warning',
    size: 'md',
    onChange: fn(),
  },
  argTypes: {
    precision: {
      control: 'select',
      options: [0.5, 1],
      table: { category: 'Behavior' },
    },
    max: { control: 'number', table: { category: 'Behavior' } },
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
    showValue: { control: 'boolean', table: { category: 'Content' } },
    reviewCount: { control: 'number', table: { category: 'Content' } },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    onChange: { action: 'changed', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicRating>;

function InteractiveWholeStarsDemo(
  args: React.ComponentProps<typeof MagicRating>
) {
  const [rating, setRating] = useState(3);

  return (
    <View style={{ gap: 8 }}>
      <MagicRating
        testId="story-rating-whole"
        label="Rate your experience"
        value={rating}
        precision={1}
        showValue
        reviewCount={128}
        onChange={(next) => {
          setRating(next);
          args.onChange?.(next);
        }}
      />
      <Text testID="story-rating-whole-summary">{`Current score: ${rating}/5`}</Text>
    </View>
  );
}

/**
 * Interactive full-star rating updating live score and review count.
 */
export const InteractiveWholeStars: Story = {
  render: (args) => <InteractiveWholeStarsDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('story-rating-whole-star-5'));
    await expect(args.onChange).toHaveBeenCalledWith(5);
    await expect(
      canvas.getByTestId('story-rating-whole-summary')
    ).toHaveTextContent('Current score: 5/5');
  },
};

function InteractiveHalfStarsDemo(
  args: React.ComponentProps<typeof MagicRating>
) {
  const [rating, setRating] = useState(3.5);

  return (
    <View style={{ gap: 8 }}>
      <MagicRating
        testId="story-rating-half"
        label="Half-star Precision"
        value={rating}
        precision={0.5}
        showValue
        reviewCount={64}
        color="primary"
        size="lg"
        onChange={(next) => {
          setRating(next);
          args.onChange?.(next);
        }}
      />
    </View>
  );
}

/**
 * Interactive half-star precision (`0.5`) rating with live decimal readout.
 */
export const InteractiveHalfStars: Story = {
  render: (args) => <InteractiveHalfStarsDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('story-rating-half-star-4.5'));
    await expect(args.onChange).toHaveBeenCalledWith(4.5);
    await expect(canvas.getByTestId('story-rating-half-value')).toHaveTextContent(
      '4.5'
    );
  },
};

/**
 * Read-only, disabled, custom `max`, and all 5 size presets.
 */
export const StatesAndSizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <MagicRating label="Read-only Rating" value={4.5} precision={0.5} readOnly showValue reviewCount={312} />
      <MagicRating label="Disabled Rating" value={2} disabled showValue />
      <MagicRating label="10-Star Scale (SM)" defaultValue={7} max={10} size="sm" color="secondary" showValue />
      <MagicRating label="Extra Large (XL)" defaultValue={4} size="xl" color="tertiary" showValue />
    </View>
  ),
};

/**
 * Rating controls rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12, gap: 12 }}>
        <MagicRating
          label="Dark Mode Rating"
          defaultValue={4.5}
          precision={0.5}
          showValue
          reviewCount={89}
          color="warning"
        />
      </View>
    </MagicPaperProvider>
  ),
};
