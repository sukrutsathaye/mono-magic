import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicProgressIndicator from './MagicProgressIndicator.svelte';
import ProgressIndicatorStoryDemo from './ProgressIndicatorStoryDemo.svelte';

const meta: Meta<typeof MagicProgressIndicator> = {
  title: 'Atoms/ProgressIndicator',
  component: MagicProgressIndicator,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    type: {
      control: 'select',
      options: ['bar', 'spinner'],
    },
    mode: {
      control: 'select',
      options: ['determinate', 'indeterminate', 'buffer', 'query'],
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
    value: { control: { type: 'range', min: 0, max: 100 } },
    bufferValue: { control: { type: 'range', min: 0, max: 100 } },
    disabled: { control: 'boolean' },
  },
  args: {
    type: 'bar',
    mode: 'determinate',
    value: 60,
    bufferValue: 80,
    color: 'primary',
    size: 'md',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LinearDeterminate: Story = {};

export const SpinnerIndeterminate: Story = {
  args: {
    type: 'spinner',
    mode: 'indeterminate',
    color: 'tertiary',
    size: 'lg',
  },
};

export const InteractiveProgressStepper: Story = {
  render: () => ({
    Component: ProgressIndicatorStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '+15%' }));
    await expect(canvas.getByTestId('progress-demo-status')).toHaveTextContent(
      'Progress: 50%',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(canvas.getByTestId('progress-demo-status')).toHaveTextContent(
      'Progress: 0%',
    );
  },
};
