import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ButtonStoryDemo from './ButtonStoryDemo.svelte';
import MagicButton from './MagicButton.svelte';

const meta: Meta<typeof MagicButton> = {
  title: 'Atoms/Button',
  component: MagicButton,
  tags: ['autodocs', 'snapshot'],
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
    kind: {
      control: 'select',
      options: ['default', 'icon', 'fab', 'mini-fab', 'extended-fab'],
    },
    shape: {
      control: 'select',
      options: ['default', 'square', 'rounded', 'pill'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    disabledInteractive: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    label: 'Click Me',
    variant: 'filled',
    color: 'primary',
    size: 'md',
    kind: 'default',
    shape: 'default',
    loading: false,
    disabled: false,
    fullWidth: false,
    onclick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Click Me' }));
    await expect(args.onclick).toHaveBeenCalledTimes(1);
  },
};

export const OutlinedPill: Story = {
  args: {
    label: 'Continue',
    variant: 'outlined',
    shape: 'pill',
    trailingIcon: '→',
    color: 'secondary',
  },
};

export const LoadingState: Story = {
  args: {
    label: 'Uploading',
    loading: true,
    color: 'tertiary',
  },
};

export const InteractiveMatrixAndClickCounter: Story = {
  render: () => ({
    Component: ButtonStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const saveBtn = canvas.getByRole('button', { name: /Save Draft/ });
    await userEvent.click(saveBtn);
    await expect(canvas.getByTestId('button-demo-status')).toHaveTextContent(
      'Saves: 1 | Loading: false',
    );
  },
};
