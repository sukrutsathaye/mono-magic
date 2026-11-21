import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { MagicIcon } from '../../core/icon';
import { MagicButton } from '../button/button';
import { MagicBadge } from './badge';

/**
 * `MagicBadge` wraps MUI's `Badge` around projected children (e.g. a
 * `MagicButton`, icon, or text) with `icon` and `label` fallbacks.
 *
 * - **Sizes**: `xs`, `sm`, `md`, `lg`, `xl`.
 * - **Colors**: All 7 Material 3 semantic intents (`primary`..`neutral`).
 * - **Positions**: `above after`, `above before`, `below after`, `below before`, `above`, `below`, `before`, `after`.
 * - **References**:
 *   - [MUI Badge](https://mui.com/material-ui/react-badge/)
 *   - [Material 3 Badges](https://m3.material.io/components/badges/overview)
 */
const meta: Meta<typeof MagicBadge> = {
  title: 'Atoms/Badge',
  component: MagicBadge,
  tags: ['autodocs', 'snapshot'],
  args: {
    content: 7,
    icon: 'mail',
    label: 'Notifications',
    color: 'primary',
    size: 'md',
    position: 'above after',
    overlap: true,
    hidden: false,
    disabled: false,
    description: '7 unread messages',
  },
  argTypes: {
    content: { control: 'text', table: { category: 'Content' } },
    icon: { control: 'text', table: { category: 'Content' } },
    label: { control: 'text', table: { category: 'Content' } },
    children: { control: false, table: { category: 'Content' } },
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
    position: {
      control: 'select',
      options: [
        'above after',
        'above before',
        'below after',
        'below before',
        'above',
        'below',
        'before',
        'after',
      ],
      table: { category: 'Layout' },
    },
    overlap: { control: 'boolean', table: { category: 'Layout' } },
    hidden: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    description: { control: 'text', table: { category: 'Accessibility' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    sx: { control: false, table: { category: 'Appearance' } },
    slotProps: { control: false, table: { category: 'Behavior' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicBadge>;

/**
 * Default icon badge displaying a numeric unread count.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('7')).toBeInTheDocument();
  },
};

/**
 * Badge anchored around a `MagicButton` in both overlapping and non-overlapping modes.
 */
export const WrappingButton: Story = {
  render: () => (
    <Stack direction="row" spacing={3} useFlexGap sx={{ alignItems: 'center', p: 1 }}>
      <MagicBadge content={12} color="error" overlap>
        <MagicButton variant="tonal" label="Overlap" />
      </MagicBadge>
      <MagicBadge content={4} color="secondary" overlap={false}>
        <MagicButton variant="outlined" label="Inline" />
      </MagicBadge>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('12')).toBeInTheDocument();
    await expect(canvas.getByText('4')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Overlap' })).toBeInTheDocument();
  },
};

/**
 * All seven semantic palette color intents rendered across icon targets.
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
      <Stack direction="row" spacing={3} useFlexGap sx={{ p: 1, flexWrap: 'wrap' }}>
        {colors.map((color, idx) => (
          <MagicBadge
            key={color}
            color={color}
            content={idx + 1}
            icon="notifications"
            description={`${color} badge`}
          />
        ))}
      </Stack>
    );
  },
};

/**
 * Comparison of all five atomic size tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={3} useFlexGap sx={{ alignItems: 'center', p: 1 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicBadge
          key={size}
          size={size}
          content={9}
          icon="mail"
          description={`${size} badge`}
        />
      ))}
    </Stack>
  ),
};

/**
 * Directional corner anchor positions around a target element.
 */
export const Positions: Story = {
  render: () => (
    <Stack direction="row" spacing={3} useFlexGap sx={{ p: 2, flexWrap: 'wrap' }}>
      {(
        [
          'above after',
          'above before',
          'below after',
          'below before',
          'above',
          'below',
          'before',
          'after',
        ] as const
      ).map((position) => (
        <MagicBadge key={position} position={position} content="!" color="tertiary">
          <Typography
            variant="body2"
            sx={{ px: 1.5, py: 0.75, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
          >
            {position}
          </Typography>
        </MagicBadge>
      ))}
    </Stack>
  ),
};

/**
 * Dot badge mode (when `content` is omitted) and hidden/disabled visibility states.
 */
export const DotHiddenAndDisabled: Story = {
  render: () => (
    <Stack direction="row" spacing={3} useFlexGap sx={{ alignItems: 'center', p: 1 }}>
      <MagicBadge icon="chat" color="success" description="Active dot" />
      <MagicBadge content={5} icon="notifications" hidden description="Hidden" />
      <MagicBadge content={5} icon="notifications" disabled description="Disabled" />
      <MagicBadge content={0} icon={<MagicIcon icon="inbox" />} label="Zero" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('0')).toBeInTheDocument();
  },
};
