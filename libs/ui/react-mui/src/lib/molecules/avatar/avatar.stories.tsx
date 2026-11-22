import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicAvatar, MagicAvatarGroup } from './avatar';

const SAMPLE_AVATAR_BLUE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%231976d2"/><circle cx="32" cy="24" r="11" fill="%23ffffff"/><path d="M14 54c3-10 33-10 36 0" fill="%23ffffff"/></svg>';

const SAMPLE_AVATAR_VIOLET =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%236750a4"/><circle cx="32" cy="24" r="11" fill="%23ffffff"/><path d="M14 54c3-10 33-10 36 0" fill="%23ffffff"/></svg>';

/**
 * `MagicAvatar` and `MagicAvatarGroup` provide Material 3 user/workspace identity
 * badges with deterministic image -> initials -> icon fallback, status dots,
 * shape variants, and stacked `+N` overflow groups.
 *
 * - **References**:
 *   - [MUI Avatar](https://mui.com/material-ui/react-avatar/)
 */
const meta: Meta<typeof MagicAvatar> = {
  title: 'Molecules/Avatar',
  component: MagicAvatar,
  tags: ['autodocs', 'snapshot'],
  args: {
    name: 'Ada Lovelace',
    size: 'md',
    color: 'primary',
    shape: 'circle',
    status: 'online',
  },
  argTypes: {
    src: { control: 'text', table: { category: 'Media' } },
    alt: { control: 'text', table: { category: 'Media' } },
    name: { control: 'text', table: { category: 'Content' } },
    initials: { control: 'text', table: { category: 'Content' } },
    icon: { control: 'text', table: { category: 'Content' } },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
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
    shape: {
      control: 'select',
      options: ['circle', 'rounded', 'square'],
      table: { category: 'Appearance' },
    },
    status: {
      control: 'select',
      options: ['online', 'busy', 'offline'],
      table: { category: 'Status' },
    },
    statusLabel: { control: 'text', table: { category: 'Status' } },
    onImageError: { action: 'imageErrored', table: { category: 'Events' } },
    children: { control: false, table: { category: 'Slots' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicAvatar>;

/**
 * Default avatar with derived initials and online status badge.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('AL')).toBeInTheDocument();
    await expect(
      canvas.getByRole('img', { name: 'Status: online' }),
    ).toBeInTheDocument();
  },
};

/**
 * Fallback hierarchy: inline SVG image -> derived initials -> custom icon -> default person icon.
 */
export const FallbackChain: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <MagicAvatar
        src={SAMPLE_AVATAR_BLUE}
        alt="Ada Lovelace"
        name="Ada Lovelace"
        status="online"
      />
      <MagicAvatar name="Grace Hopper" color="secondary" status="busy" />
      <MagicAvatar icon="engineering" color="tertiary" status="offline" />
      <MagicAvatar color="neutral" />
    </Stack>
  ),
};

/**
 * Comparison of all 5 sizes (`xs`..`xl`) and 3 geometric shapes (`circle`, `rounded`, `square`).
 */
export const SizesAndShapes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <MagicAvatar
            key={size}
            size={size}
            name="Design System"
            color="primary"
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {(['circle', 'rounded', 'square'] as const).map((shape) => (
          <MagicAvatar
            key={shape}
            shape={shape}
            size="lg"
            name={shape}
            color="secondary"
          />
        ))}
      </Stack>
    </Stack>
  ),
};

/**
 * Stacked `MagicAvatarGroup` with `max` overflow `+N` indicator and click callback.
 */
export const GroupWithOverflow: Story = {
  render: () => {
    const onAvatarClick = fn();
    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <MagicAvatarGroup
          testId="story-avatar-group"
          max={3}
          size="md"
          spacing="normal"
          onAvatarClick={onAvatarClick}
          items={[
            {
              id: 'ada',
              name: 'Ada Lovelace',
              src: SAMPLE_AVATAR_BLUE,
              status: 'online',
            },
            {
              id: 'grace',
              name: 'Grace Hopper',
              src: SAMPLE_AVATAR_VIOLET,
              status: 'busy',
            },
            { id: 'alan', name: 'Alan Turing', color: 'tertiary' },
            { id: 'tim', name: 'Tim Berners', color: 'secondary' },
            { id: 'margaret', name: 'Margaret Hamilton', color: 'success' },
          ]}
        />
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('+2')).toBeInTheDocument();
    await userEvent.click(canvas.getByTestId('story-avatar-group-item-ada'));
  },
};
