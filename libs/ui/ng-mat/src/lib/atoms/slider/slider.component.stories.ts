import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, within } from 'storybook/test';
import { MagicSliderComponent } from './slider.component';

/**
 * `MagicSliderComponent` wraps `mat-slider` for single-value and range
 * selection, with Signal Forms (`FormValueControl`) and Reactive/Template Forms.
 *
 * - **References**:
 *   - [Angular Material Slider](https://material.angular.dev/components/slider/overview)
 *   - [Material 3 Sliders](https://m3.material.io/components/sliders/overview)
 *   - [Angular Signal Forms](https://angular.dev/guide/forms/signals/custom-controls)
 */
const meta: Meta<MagicSliderComponent> = {
  title: 'Atoms/Slider',
  component: MagicSliderComponent,
  args: {
    ariaLabel: 'Volume',
    min: 0,
    max: 100,
    step: 1,
    value: 40,
    range: false,
    startValue: 20,
    endValue: 80,
    discrete: false,
    showTickMarks: false,
    disabled: false,
    disableRipple: false,
    color: 'primary',
    size: 'md',
    changed: fn(),
    rangeChanged: fn(),
  },
  argTypes: {
    min: { control: 'number', table: { category: 'Range' } },
    max: { control: 'number', table: { category: 'Range' } },
    step: { control: 'number', table: { category: 'Range' } },
    value: { control: 'number', table: { category: 'Value' } },
    range: { control: 'boolean', table: { category: 'Mode' } },
    startValue: { control: 'number', table: { category: 'Value' } },
    endValue: { control: 'number', table: { category: 'Value' } },
    discrete: { control: 'boolean', table: { category: 'Appearance' } },
    showTickMarks: { control: 'boolean', table: { category: 'Appearance' } },
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
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    changed: { action: 'changed', table: { category: 'Events' } },
    rangeChanged: { action: 'rangeChanged', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicSliderComponent>;

/**
 * Default continuous single-thumb slider initialized to `40`.
 *
 * Inputs: `min=0`, `max=100`, `step=1`, `value=40`, `range=false`, `discrete=false`, `ariaLabel="Volume"`.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider');
    await expect(slider).toHaveValue('40');
  },
};

/**
 * Discrete stepped slider showing value indicator bubbles and track tick marks.
 *
 * Inputs: `min=0`, `max=100`, `step=10`, `value=50`, `discrete=true`, `showTickMarks=true`.
 */
export const DiscreteWithTicks: Story = {
  args: { min: 0, max: 100, step: 10, value: 50, discrete: true, showTickMarks: true },
};

/**
 * Dual-thumb range slider selecting start and end bounds.
 *
 * Inputs: `range=true`, `startValue=25`, `endValue=75`, `discrete=true`.
 */
export const Range: Story = {
  args: { range: true, startValue: 25, endValue: 75, discrete: true },
};

/**
 * Disabled slider preventing thumb interaction.
 *
 * Inputs: `disabled=true`, `value=60`.
 */
export const Disabled: Story = {
  args: { disabled: true, value: 60 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('slider')).toBeDisabled();
  },
};

/**
 * Comparison of sliders across semantic palette colors.
 *
 * Inputs: `value=50`, `color="primary" | "secondary" | "tertiary" | "success" | "warning" | "error"`.
 */
export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; max-width: 360px;">
        <magic-slider color="primary" [value]="50" ariaLabel="Primary" />
        <magic-slider color="secondary" [value]="50" ariaLabel="Secondary" />
        <magic-slider color="tertiary" [value]="50" ariaLabel="Tertiary" />
        <magic-slider color="success" [value]="50" ariaLabel="Success" />
        <magic-slider color="warning" [value]="50" ariaLabel="Warning" />
        <magic-slider color="error" [value]="50" ariaLabel="Error" />
      </div>
    `,
  }),
};
