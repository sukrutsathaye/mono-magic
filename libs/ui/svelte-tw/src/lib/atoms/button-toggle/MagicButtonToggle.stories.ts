import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import ButtonToggleStoryDemo from './ButtonToggleStoryDemo.svelte';
import MagicButtonToggle from './MagicButtonToggle.svelte';

const meta: Meta<typeof MagicButtonToggle> = {
  title: 'Atoms/ButtonToggle',
  component: MagicButtonToggle,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
    },
    appearance: {
      control: 'select',
      options: ['standard', 'legacy'],
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
    vertical: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    options: [
      { value: 'left', label: 'Left', icon: '⬅' },
      { value: 'center', label: 'Center', icon: '⬌' },
      { value: 'right', label: 'Right', icon: '➡' },
    ],
    value: 'left',
    selectionMode: 'single',
    appearance: 'standard',
    color: 'primary',
    size: 'md',
    vertical: false,
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VerticalLegacy: Story = {
  args: {
    vertical: true,
    appearance: 'legacy',
    color: 'tertiary',
    value: 'center',
  },
};

export const InteractiveSingleMultipleAndVertical: Story = {
  render: () => ({
    Component: ButtonToggleStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('align-toggle-item-center'));
    await expect(canvas.getByTestId('toggle-align-status')).toHaveTextContent(
      'Alignment: center',
    );
    await userEvent.click(canvas.getByTestId('format-toggle-item-italic'));
    await expect(canvas.getByTestId('toggle-format-status')).toHaveTextContent(
      'Formats: bold, italic',
    );
  },
};
