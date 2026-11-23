import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import ChipStoryDemo from './ChipStoryDemo.svelte';
import MagicChip from './MagicChip.svelte';

const meta: Meta<typeof MagicChip> = {
  title: 'Atoms/Chip',
  component: MagicChip,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['basic', 'selectable', 'input', 'draggable'],
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
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    removable: { control: 'boolean' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Svelte 5',
    color: 'primary',
    size: 'md',
    removable: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VerticalRemovable: Story = {
  args: {
    chips: [
      { id: '1', label: 'Svelte', removable: true },
      { id: '2', label: 'Tailwind', removable: true },
      { id: '3', label: 'Bits UI', disabled: true },
    ],
    orientation: 'vertical',
    color: 'tertiary',
  },
};

export const InteractiveFilterInputAndDraggable: Story = {
  render: () => ({
    Component: ChipStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('filter-chips-item-1'));
    await expect(canvas.getByTestId('chip-select-status')).toHaveTextContent(
      'Selected: Svelte 5, TypeScript',
    );
    const input = canvas.getByTestId('input-chips-input');
    await userEvent.type(input, 'Playwright{Enter}');
    await expect(canvas.getByTestId('chip-input-status')).toHaveTextContent(
      'Tags (3): Atomic Design, Tailwind v4, Playwright',
    );
  },
};
