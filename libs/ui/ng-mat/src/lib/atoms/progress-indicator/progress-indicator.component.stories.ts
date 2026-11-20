import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { MagicProgressIndicatorComponent } from './progress-indicator.component';

/**
 * `MagicProgressIndicatorComponent` unifies `mat-progress-bar` and
 * `mat-progress-spinner` behind one signal-based atomic API.
 *
 * - **References**:
 *   - [Angular Material Progress Bar](https://material.angular.dev/components/progress-bar/overview)
 *   - [Angular Material Progress Spinner](https://material.angular.dev/components/progress-spinner/overview)
 *   - [Material 3 Progress Indicators](https://m3.material.io/components/progress-indicators/overview)
 */
const meta: Meta<MagicProgressIndicatorComponent> = {
  title: 'Atoms/ProgressIndicator',
  component: MagicProgressIndicatorComponent,
  args: {
    ariaLabel: 'Loading status',
    type: 'bar',
    mode: 'indeterminate',
    value: 45,
    bufferValue: 70,
    color: 'primary',
    size: 'md',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['bar', 'spinner'],
      table: { category: 'Type' },
    },
    mode: {
      control: 'select',
      options: ['determinate', 'indeterminate', 'buffer', 'query'],
      table: { category: 'Behavior' },
    },
    value: { control: { type: 'range', min: 0, max: 100 }, table: { category: 'Value' } },
    bufferValue: { control: { type: 'range', min: 0, max: 100 }, table: { category: 'Value' } },
    diameter: { control: 'number', table: { category: 'Spinner' } },
    strokeWidth: { control: 'number', table: { category: 'Spinner' } },
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
  },
};

export default meta;
type Story = StoryObj<MagicProgressIndicatorComponent>;

/**
 * Default indeterminate linear progress bar.
 *
 * Inputs: `type="bar"`, `mode="indeterminate"`, `color="primary"`, `size="md"`, `ariaLabel="Loading status"`.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('progressbar')).toBeInTheDocument();
  },
};

/**
 * Determinate linear progress bar displaying a known completion percentage.
 *
 * Inputs: `type="bar"`, `mode="determinate"`, `value=65`.
 */
export const DeterminateBar: Story = {
  args: { type: 'bar', mode: 'determinate', value: 65 },
};

/**
 * Buffer linear progress bar showing primary progress alongside buffered progress.
 *
 * Inputs: `type="bar"`, `mode="buffer"`, `value=40`, `bufferValue=75`.
 */
export const BufferBar: Story = {
  args: { type: 'bar', mode: 'buffer', value: 40, bufferValue: 75 },
};

/**
 * Query linear progress bar indicating a pre-determinate loading phase.
 *
 * Inputs: `type="bar"`, `mode="query"`.
 */
export const QueryBar: Story = {
  args: { type: 'bar', mode: 'query' },
};

/**
 * Circular indeterminate spinner for ongoing background work.
 *
 * Inputs: `type="spinner"`, `mode="indeterminate"`.
 */
export const IndeterminateSpinner: Story = {
  args: { type: 'spinner', mode: 'indeterminate' },
};

/**
 * Large determinate circular spinner showing explicit progress.
 *
 * Inputs: `type="spinner"`, `mode="determinate"`, `value=75`, `size="lg"`.
 */
export const DeterminateSpinner: Story = {
  args: { type: 'spinner', mode: 'determinate', value: 75, size: 'lg' },
};

/**
 * Gallery of bar and spinner indicators across semantic colors and size tokens.
 *
 * Inputs: `type="bar" | "spinner"`, `color="primary" | "secondary" | "tertiary" | "success" | "warning" | "error"`, `size="xs".."xl"`.
 */
export const ColorsAndSizes: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; max-width: 400px;">
        <magic-progress-indicator type="bar" mode="determinate" [value]="70" color="success" ariaLabel="Success" />
        <magic-progress-indicator type="bar" mode="determinate" [value]="50" color="warning" ariaLabel="Warning" />
        <magic-progress-indicator type="bar" mode="determinate" [value]="30" color="error" ariaLabel="Error" />
        <div style="display: flex; gap: 16px; align-items: center;">
          <magic-progress-indicator type="spinner" size="xs" color="primary" ariaLabel="XS" />
          <magic-progress-indicator type="spinner" size="sm" color="secondary" ariaLabel="SM" />
          <magic-progress-indicator type="spinner" size="md" color="tertiary" ariaLabel="MD" />
          <magic-progress-indicator type="spinner" size="lg" color="success" ariaLabel="LG" />
          <magic-progress-indicator type="spinner" size="xl" color="error" ariaLabel="XL" />
        </div>
      </div>
    `,
  }),
};
