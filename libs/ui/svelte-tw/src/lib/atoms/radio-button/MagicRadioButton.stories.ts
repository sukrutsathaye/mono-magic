import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicRadioButton from './MagicRadioButton.svelte';
import RadioButtonStoryDemo from './RadioButtonStoryDemo.svelte';

const meta: Meta<typeof MagicRadioButton> = {
  title: 'Atoms/RadioButton',
  component: MagicRadioButton,
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
    vertical: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    options: [
      { value: 'light', label: 'Light Theme' },
      { value: 'dark', label: 'Dark Theme' },
      { value: 'system', label: 'System Default' },
    ],
    value: 'system',
    color: 'primary',
    size: 'md',
    vertical: true,
    labelPosition: 'after',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HorizontalInline: Story = {
  args: {
    vertical: false,
    color: 'secondary',
  },
};

export const InteractivePlanSelector: Story = {
  render: () => ({
    Component: RadioButtonStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('plan-radio-item-team'));
    await expect(canvas.getByTestId('radio-plan-status')).toHaveTextContent(
      'Selected plan: team',
    );
  },
};
