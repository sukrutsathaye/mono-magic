import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicSlideToggle from './MagicSlideToggle.svelte';
import SlideToggleStoryDemo from './SlideToggleStoryDemo.svelte';

const meta: Meta<typeof MagicSlideToggle> = {
  title: 'Atoms/SlideToggle',
  component: MagicSlideToggle,
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
    hideIcon: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Auto-save drafts',
    checked: true,
    color: 'primary',
    size: 'md',
    labelPosition: 'after',
    hideIcon: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LabelBeforeNoIcon: Story = {
  args: {
    label: 'Dark theme',
    checked: false,
    hideIcon: true,
    labelPosition: 'before',
    color: 'tertiary',
  },
};

export const InteractiveSettingsPanel: Story = {
  render: () => ({
    Component: SlideToggleStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('push-switch-control'));
    await expect(canvas.getByTestId('switch-demo-status')).toHaveTextContent(
      'Email: ON | Push: ON | Compact: OFF',
    );
  },
};
