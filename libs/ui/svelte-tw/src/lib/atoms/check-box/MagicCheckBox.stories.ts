import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import CheckBoxStoryDemo from './CheckBoxStoryDemo.svelte';
import MagicCheckBox from './MagicCheckBox.svelte';

const meta: Meta<typeof MagicCheckBox> = {
  title: 'Atoms/CheckBox',
  component: MagicCheckBox,
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
    labelPosition: {
      control: 'select',
      options: ['after', 'before'],
    },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Subscribe to release notes',
    checked: false,
    indeterminate: false,
    color: 'primary',
    size: 'md',
    labelPosition: 'after',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IndeterminateAndBefore: Story = {
  args: {
    label: 'Select all modules',
    indeterminate: true,
    labelPosition: 'before',
    color: 'secondary',
  },
};

export const InteractiveChecklistAndTaskTree: Story = {
  render: () => ({
    Component: CheckBoxStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('terms-cb-control'));
    await expect(canvas.getByTestId('checkbox-terms-status')).toHaveTextContent(
      'Agreed: true',
    );
    await userEvent.click(canvas.getByTestId('tree-cb-task-1-sub-1'));
    await expect(canvas.getByTestId('tree-cb-task-1')).toHaveAttribute(
      'aria-checked',
      'true',
    );
  },
};
