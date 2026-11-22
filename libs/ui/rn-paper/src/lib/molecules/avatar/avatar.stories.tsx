import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import {
  MagicAvatar,
  MagicAvatarGroup,
  type AvatarGroupItem,
} from './avatar';

const AVATAR_SVG_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23005cbb"/><stop offset="100%" stop-color="%237d00fa"/></linearGradient></defs><rect width="128" height="128" fill="url(%23a)"/><circle cx="64" cy="50" r="22" fill="%23ffffff" opacity="0.9"/><path d="M28 112c6-22 24-32 36-32s30 10 36 32" fill="%23ffffff" opacity="0.9"/></svg>';

const TEAM_ITEMS: readonly AvatarGroupItem[] = [
  { id: 'ada', name: 'Ada Lovelace', src: AVATAR_SVG_URI, status: 'online' },
  { id: 'alan', name: 'Alan Turing', color: 'secondary', status: 'busy' },
  { id: 'grace', name: 'Grace Hopper', color: 'tertiary' },
  { id: 'linus', name: 'Linus Torvalds', color: 'success' },
  { id: 'katherine', name: 'Katherine Johnson', color: 'warning' },
];

/**
 * `MagicAvatar` and `MagicAvatarGroup` represent users and teams in `@mono-magic/rn-paper`.
 *
 * `MagicAvatar` supports photo URIs with automatic `onError` fallback to initials
 * or a Material icon (`person`), 5 size tokens, 7 color intents, 3 corner shapes
 * (`circle`, `rounded`, `square`), and presence status dots (`online`, `busy`, `offline`).
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
    src: { control: 'text', table: { category: 'Content' } },
    name: { control: 'text', table: { category: 'Content' } },
    initials: { control: 'text', table: { category: 'Content' } },
    icon: { control: 'text', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicAvatar>;

/**
 * Default initials avatar with online status dot.
 */
export const Default: Story = {
  args: {
    testId: 'story-avatar',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('AL')).toBeInTheDocument();
  },
};

/**
 * Matrix showing image, initials, and icon fallbacks, shapes, and presence statuses.
 */
export const VariantsAndShapes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <MagicAvatar
        src={AVATAR_SVG_URI}
        alt="Profile picture"
        status="online"
        size="lg"
      />
      <MagicAvatar
        name="Alan Turing"
        color="secondary"
        shape="rounded"
        status="busy"
        size="lg"
      />
      <MagicAvatar
        initials="UX"
        color="tertiary"
        shape="square"
        status="offline"
        size="lg"
      />
      <MagicAvatar icon="smart_toy" color="success" size="lg" />
    </View>
  ),
};

/**
 * Stacked `MagicAvatarGroup` with `+N` overflow badge.
 */
export const GroupOverflow: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <MagicAvatarGroup items={TEAM_ITEMS} max={3} size="md" spacing="normal" />
      <MagicAvatarGroup items={TEAM_ITEMS} max={4} size="sm" spacing="tight" />
    </View>
  ),
};

/**
 * Avatars and group rendered inside a dark Material 3 palette.
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
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <MagicAvatar src={AVATAR_SVG_URI} name="Ada Lovelace" status="online" />
          <MagicAvatar name="Grace Hopper" color="secondary" status="busy" />
          <MagicAvatar color="tertiary" />
        </View>
        <MagicAvatarGroup items={TEAM_ITEMS} max={3} />
      </View>
    </MagicPaperProvider>
  ),
};
