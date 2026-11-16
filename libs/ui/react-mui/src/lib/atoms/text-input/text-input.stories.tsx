import type { Meta, StoryObj } from '@storybook/react';
import { MagicTextInput } from './text-input';

const meta: Meta<typeof MagicTextInput> = {
  title: 'Atoms/TextInput',
  component: MagicTextInput,
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof MagicTextInput>;

export const Outlined: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    helperText: 'We will never share your email.',
    variant: 'outlined',
    size: 'md',
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    value: 'ab',
    errorText: 'Must be at least 3 characters.',
    variant: 'outlined',
  },
};
