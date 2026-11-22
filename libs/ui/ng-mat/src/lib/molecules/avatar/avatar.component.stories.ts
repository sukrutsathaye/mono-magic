import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  MagicAvatarComponent,
  MagicAvatarGroupComponent,
} from './avatar.component';

const AVATAR_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="av" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%236750a4"/><stop offset="100%25" stop-color="%23d0bcff"/></linearGradient></defs><rect width="64" height="64" fill="url(%23av)"/><circle cx="32" cy="24" r="10" fill="%23ffffff"/><path d="M16 54c0-9 7-15 16-15s16 6 16 15" fill="%23ffffff"/></svg>';

/**
 * `MagicAvatarComponent` and `MagicAvatarGroupComponent` display user
 * identities with image -> initials -> Material icon fallback, presence
 * status dots (`online`, `busy`, `offline`), `circle`/`rounded`/`square`
 * shapes, and overlapping `+N` avatar stacks.
 */
const meta: Meta<MagicAvatarComponent> = {
  title: 'Molecules/Avatar',
  component: MagicAvatarComponent,
  args: {
    name: 'Ada Lovelace',
    size: 'md',
    color: 'primary',
    shape: 'circle',
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
      options: [undefined, 'online', 'busy', 'offline'],
      table: { category: 'Status' },
    },
    statusLabel: { control: 'text', table: { category: 'Status' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<MagicAvatarComponent>;

/**
 * Default avatar rendering an inline SVG portrait with an online status indicator.
 *
 * Inputs: `src`, `name="Ada Lovelace"`, `status="online"`.
 */
export const Default: Story = {
  args: {
    src: AVATAR_IMAGE,
    alt: 'Ada Lovelace',
    status: 'online',
    statusLabel: 'Online',
  },
};

/**
 * Comparison of image, derived initials, explicit initials, and icon fallbacks across shapes and sizes.
 *
 * Inputs: `size="xs" | "sm" | "md" | "lg" | "xl"`, `shape="circle" | "rounded" | "square"`, `status`.
 */
export const FallbacksShapesAndSizes: Story = {
  render: (args) => ({
    props: { ...args, sampleImg: AVATAR_IMAGE },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
        <magic-avatar [src]="sampleImg" alt="Portrait" size="xl" shape="circle" status="online" />
        <magic-avatar name="Grace Hopper" size="lg" color="secondary" shape="rounded" status="busy" />
        <magic-avatar initials="ML" size="md" color="tertiary" shape="square" status="offline" />
        <magic-avatar icon="smart_toy" size="sm" color="success" />
        <magic-avatar name="Zoe" size="xs" color="neutral" />
      </div>
    `,
  }),
};

/**
 * Overlapping avatar stack collapsing excess members into a `+N` overflow badge.
 *
 * Inputs: `items` (5 users), `max=3`, `spacing="normal"`.
 */
export const GroupOverflow: Story = {
  decorators: [
    moduleMetadata({
      imports: [MagicAvatarGroupComponent],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
      groupItems: [
        { id: '1', src: AVATAR_IMAGE, name: 'Ada Lovelace', status: 'online' },
        { id: '2', name: 'Alan Turing', color: 'secondary', status: 'busy' },
        { id: '3', name: 'Grace Hopper', color: 'tertiary' },
        { id: '4', name: 'Margaret Hamilton', color: 'success' },
        { id: '5', name: 'Linus Torvalds', color: 'neutral' },
      ],
    },
    template: `
      <div style="display: grid; gap: 16px;">
        <magic-avatar-group [items]="groupItems" [max]="3" size="md" spacing="normal" ariaLabel="Core maintainers" />
        <magic-avatar-group [items]="groupItems" [max]="4" size="lg" spacing="tight" ariaLabel="Reviewers" />
      </div>
    `,
  }),
};
