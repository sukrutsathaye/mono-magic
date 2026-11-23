import type { Meta, StoryObj } from '@storybook/svelte-vite';
import MagicSlider from './MagicSlider.svelte';
import SliderStoryDemo from './SliderStoryDemo.svelte';

const meta: Meta<typeof MagicSlider> = {
  title: 'Atoms/Slider',
  component: MagicSlider,
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
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    discrete: { control: 'boolean' },
    showTickMarks: { control: 'boolean' },
    range: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    min: 0,
    max: 100,
    step: 5,
    value: 50,
    color: 'primary',
    size: 'md',
    discrete: true,
    showTickMarks: false,
    range: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RangeWithTicks: Story = {
  args: {
    range: true,
    startValue: 20,
    endValue: 80,
    step: 10,
    discrete: true,
    showTickMarks: true,
    color: 'secondary',
  },
};

export const InteractiveVolumeAndPriceRange: Story = {
  render: () => ({
    Component: SliderStoryDemo,
  }),
};
