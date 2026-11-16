import type { Meta, StoryObj } from '@storybook/angular';
import { MagicButtonComponent } from './button.component';

const meta: Meta<MagicButtonComponent> = {
  title: 'Atoms/Button',
  component: MagicButtonComponent,
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
    clicked: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<MagicButtonComponent>;

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
