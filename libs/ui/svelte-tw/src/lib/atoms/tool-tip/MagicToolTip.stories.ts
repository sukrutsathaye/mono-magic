import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicToolTip from './MagicToolTip.svelte';
import ToolTipStoryDemo from './ToolTipStoryDemo.svelte';

const meta: Meta<typeof MagicToolTip> = {
  title: 'Atoms/ToolTip',
  component: MagicToolTip,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    position: {
      control: 'select',
      options: ['above', 'below', 'left', 'right', 'before', 'after'],
    },
    touchGestures: {
      control: 'select',
      options: ['auto', 'on', 'off'],
    },
    showDelay: { control: 'number' },
    hideDelay: { control: 'number' },
    disabled: { control: 'boolean' },
    open: { control: 'boolean' },
  },
  args: {
    message: 'Save changes to workspace',
    label: 'Hover me',
    position: 'above',
    showDelay: 0,
    hideDelay: 0,
    touchGestures: 'auto',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Tooltip disabled',
  },
};

export const InteractiveControlledAndPositionSwitcher: Story = {
  render: () => ({
    Component: ToolTipStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show Tooltip' }));
    await expect(canvas.getByTestId('tooltip-demo-status')).toHaveTextContent(
      'Open: true | Position: above',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'right' }));
    await expect(canvas.getByTestId('tooltip-demo-status')).toHaveTextContent(
      'Open: true | Position: right',
    );
  },
};
