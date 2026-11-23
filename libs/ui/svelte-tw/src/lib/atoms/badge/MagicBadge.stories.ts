import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import BadgeStoryDemo from './BadgeStoryDemo.svelte';
import MagicBadge from './MagicBadge.svelte';

const meta: Meta<typeof MagicBadge> = {
  title: 'Atoms/Badge',
  component: MagicBadge,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
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
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
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
    },
    overlap: { control: 'boolean' },
    hidden: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    content: 4,
    label: 'Notifications',
    icon: '🔔',
    color: 'primary',
    size: 'md',
    position: 'above after',
    overlap: true,
    hidden: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DotIndicator: Story = {
  args: {
    content: undefined,
    label: 'Online',
    color: 'success',
    position: 'above after',
  },
};

export const PositionsAndNonOverlap: Story = {
  args: {
    content: '9+',
    label: 'Messages',
    color: 'error',
    position: 'below before',
    overlap: false,
    size: 'lg',
  },
};

export const InteractiveCounterAndIntents: Story = {
  render: () => ({
    Component: BadgeStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const incBtn = canvas.getByRole('button', { name: '+1 Notification' });
    await userEvent.click(incBtn);
    await expect(canvas.getByTestId('badge-demo-status')).toHaveTextContent(
      'Count: 4 | Hidden: false',
    );
    const toggleBtn = canvas.getByRole('button', { name: 'Hide Badge' });
    await userEvent.click(toggleBtn);
    await expect(canvas.getByTestId('badge-demo-status')).toHaveTextContent(
      'Count: 4 | Hidden: true',
    );
  },
};
