import type { Meta, StoryObj } from '@storybook/react';
import { MagicButton } from './button';

const meta: Meta<typeof MagicButton> = {
  title: 'Atoms/Button',
  component: MagicButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
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
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof MagicButton>;

export const Filled: Story = {
  args: {
    label: 'Filled Button',
    variant: 'filled',
    color: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
};

export const Outlined: Story = {
  args: {
    label: 'Outlined Button',
    variant: 'outlined',
    color: 'secondary',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    label: 'Saving...',
    variant: 'filled',
    loading: true,
  },
};
