import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { MagicRating } from './rating';

/**
 * `MagicRating` is the Material 3 rating molecule composing MUI v9 `Rating`
 * and `MagicIcon`.
 *
 * - **References**:
 *   - [MUI Rating](https://mui.com/material-ui/react-rating/)
 */
const meta: Meta<typeof MagicRating> = {
  title: 'Molecules/Rating',
  component: MagicRating,
  tags: ['autodocs', 'snapshot'],
  args: {
    defaultValue: 3,
    max: 5,
    precision: 1,
    readOnly: false,
    disabled: false,
    showValue: true,
    reviewCount: 42,
    icon: 'star',
    emptyIcon: 'star_border',
    color: 'warning',
    size: 'md',
    label: 'Satisfaction',
    onChange: fn(),
  },
  argTypes: {
    value: { control: 'number', table: { category: 'Value' } },
    defaultValue: { control: 'number', table: { category: 'Value' } },
    max: { control: 'number', table: { category: 'Behavior' } },
    precision: {
      control: 'select',
      options: [0.5, 1],
      table: { category: 'Behavior' },
    },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    showValue: { control: 'boolean', table: { category: 'Content' } },
    reviewCount: { control: 'number', table: { category: 'Content' } },
    label: { control: 'text', table: { category: 'Content' } },
    icon: { control: 'text', table: { category: 'Appearance' } },
    emptyIcon: { control: 'text', table: { category: 'Appearance' } },
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
    onChange: { action: 'changed', table: { category: 'Events' } },
    onHoverChange: { action: 'hoverChanged', table: { category: 'Events' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicRating>;

function InteractiveRatingDemo() {
  const [fullRating, setFullRating] = useState(3);
  const [halfRating, setHalfRating] = useState(3.5);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <MagicRating
          testId="full-rating"
          label="Overall Experience"
          value={fullRating}
          precision={1}
          showValue
          reviewCount={128}
          onChange={setFullRating}
        />
        <Typography variant="caption" color="text.secondary" data-testid="full-rating-text">
          Selected full rating: {fullRating} / 5
        </Typography>
      </Stack>

      <Stack spacing={0.5}>
        <MagicRating
          testId="half-rating"
          label="Precision Score"
          value={halfRating}
          precision={0.5}
          color="primary"
          showValue
          reviewCount={64}
          onChange={setHalfRating}
        />
        <Typography variant="caption" color="text.secondary" data-testid="half-rating-text">
          Selected half rating: {halfRating.toFixed(1)} / 5
        </Typography>
      </Stack>
    </Stack>
  );
}

/**
 * Stateful interactive full-star (`precision=1`) and half-star (`precision=0.5`) ratings.
 */
export const InteractiveFullAndHalfPrecision: Story = {
  render: () => <InteractiveRatingDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fullRoot = within(canvas.getByTestId('full-rating-control'));
    const fiveStarsRadio = fullRoot.getByRole('radio', { name: '5 Stars' });
    fireEvent.click(fiveStarsRadio);
    await expect(canvas.getByTestId('full-rating-text')).toHaveTextContent(
      'Selected full rating: 5 / 5',
    );
    await expect(canvas.getByTestId('full-rating-value')).toHaveTextContent('5');
  },
};

/**
 * Read-only, disabled, custom icon (`favorite`), and custom `max={10}` variants.
 */
export const StatesAndCustomIcons: Story = {
  render: () => (
    <Stack spacing={1.75}>
      <MagicRating
        label="Read-Only Average"
        value={4.5}
        precision={0.5}
        readOnly
        showValue
        reviewCount={2410}
      />
      <MagicRating
        label="Heart Sentiment"
        defaultValue={4}
        icon="favorite"
        emptyIcon="favorite_border"
        color="error"
        showValue
      />
      <MagicRating
        label="NPS Scale (Max 10)"
        defaultValue={8}
        max={10}
        color="tertiary"
        showValue
      />
      <MagicRating
        label="Disabled Rating"
        value={2}
        disabled
        showValue
      />
    </Stack>
  ),
};

/**
 * Comparison across all 5 atomic sizes (`xs`..`xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={1.5}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicRating
          key={size}
          size={size}
          label={size.toUpperCase()}
          defaultValue={4}
          showValue
        />
      ))}
    </Stack>
  ),
};
