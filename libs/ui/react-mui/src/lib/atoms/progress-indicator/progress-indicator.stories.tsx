import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { MagicProgressIndicator } from './progress-indicator';

/**
 * `MagicProgressIndicator` unifies MUI's `LinearProgress` (`type="bar"`) and
 * `CircularProgress` (`type="spinner"`) behind one Material 3 atomic API.
 *
 * - **Types**: `bar` | `spinner`.
 * - **Modes**: `determinate`, `indeterminate`, `buffer`, `query`.
 * - **Sizes & Colors**: All 5 `AtomicSize` tokens and 7 semantic `ColorIntent`s.
 * - **References**:
 *   - [MUI Progress](https://mui.com/material-ui/react-progress/)
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
    value: 60,
    bufferValue: 80,
    color: 'primary',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['bar', 'spinner'],
      table: { category: 'Appearance' },
    },
    mode: {
      control: 'select',
      options: ['determinate', 'indeterminate', 'buffer', 'query'],
      table: { category: 'Behavior' },
    },
    value: {
      control: { type: 'range', min: 0, max: 100 },
      table: { category: 'Content' },
    },
    bufferValue: {
      control: { type: 'range', min: 0, max: 100 },
      table: { category: 'Content' },
    },
    diameter: { control: 'number', table: { category: 'Layout' } },
    strokeWidth: { control: 'number', table: { category: 'Layout' } },
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
    onAnimationEnd: { action: 'animationEnded', table: { category: 'Behavior' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicProgressIndicator>;

/**
 * Default determinate linear progress bar at 60%.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', '60');
  },
};

/**
 * All four linear bar modes (`determinate`, `indeterminate`, `buffer`, `query`).
 */
export const BarModes: Story = {
  render: () => (
    <Stack spacing={2.5} sx={{ maxWidth: 420 }}>
      <MagicProgressIndicator
        type="bar"
        mode="determinate"
        value={65}
        ariaLabel="Determinate bar"
      />
      <MagicProgressIndicator
        type="bar"
        mode="indeterminate"
        ariaLabel="Indeterminate bar"
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
        mode="query"
        ariaLabel="Query bar"
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bars = canvas.getAllByRole('progressbar');
    await expect(bars).toHaveLength(4);
    await expect(bars[0]).toHaveAttribute('aria-valuenow', '65');
  },
};

/**
 * Determinate and indeterminate circular spinner variants.
 */
export const Spinners: Story = {
  render: () => (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
      <MagicProgressIndicator
        type="spinner"
        mode="determinate"
        value={75}
        size="lg"
        ariaLabel="Determinate spinner"
      />
      <MagicProgressIndicator
        type="spinner"
        mode="indeterminate"
        size="lg"
        color="secondary"
        ariaLabel="Indeterminate spinner"
      />
      <MagicProgressIndicator
        type="spinner"
        mode="determinate"
        value={40}
        diameter={64}
        strokeWidth={6}
        color="tertiary"
        ariaLabel="Custom spinner"
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinners = canvas.getAllByRole('progressbar');
    await expect(spinners[0]).toHaveAttribute('aria-valuenow', '75');
    await expect(spinners[2]).toHaveAttribute('aria-valuenow', '40');
  },
};

/**
 * All seven semantic palette color intents across bars and spinners.
 */
export const Colors: Story = {
  render: () => {
    const colors = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ] as const;

    return (
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {colors.map((color, idx) => (
          <MagicProgressIndicator
            key={color}
            type="bar"
            mode="determinate"
            color={color}
            value={30 + idx * 10}
            ariaLabel={`${color} bar`}
          />
        ))}
      </Stack>
    );
  },
};

/**
 * All five atomic sizes (`xs`..`xl`) for both linear bars and circular spinners.
 */
export const Sizes: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <Stack spacing={2.5} sx={{ maxWidth: 420 }}>
        {sizes.map((size) => (
          <MagicProgressIndicator
            key={`bar-${size}`}
            type="bar"
            mode="determinate"
            size={size}
            value={70}
            ariaLabel={`${size} bar`}
          />
        ))}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {sizes.map((size) => (
            <MagicProgressIndicator
              key={`spinner-${size}`}
              type="spinner"
              mode="determinate"
              size={size}
              value={70}
              ariaLabel={`${size} spinner`}
            />
          ))}
        </Stack>
      </Stack>
    );
  },
};

/**
 * Disabled progress indicator with reduced Material 3 opacity (`0.38`).
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    value: 50,
    type: 'bar',
    mode: 'determinate',
  },
};
