import type { Meta, StoryObj } from '@storybook/angular';
import { MagicTextInputComponent } from './text-input.component';

const meta: Meta<MagicTextInputComponent> = {
  title: 'Atoms/TextInput',
  component: MagicTextInputComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    valueChange: { action: 'valueChange' },
  },
};

export default meta;
type Story = StoryObj<MagicTextInputComponent>;

export const Outlined: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    helperText: 'We will never share your email.',
    variant: 'outlined',
    size: 'md',
  },
};
