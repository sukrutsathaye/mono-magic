import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicRadioButtonComponent } from './radio-button.component';

/**
 * `MagicRadioButtonComponent` wraps `mat-radio-group` and `mat-radio-button`
 * with Signal Forms (`FormValueControl`) and Reactive/Template Forms support.
 *
 * - **References**:
 *   - [Angular Material Radio Button](https://material.angular.dev/components/radio/overview)
 *   - [Material 3 Radio Button](https://m3.material.io/components/radio-button/overview)
 *   - [Angular Signal Forms](https://angular.dev/guide/forms/signals/custom-controls)
 */
const meta: Meta<MagicRadioButtonComponent> = {
  title: 'Atoms/RadioButton',
  component: MagicRadioButtonComponent,
  args: {
    ariaLabel: 'Select an option',
    options: [
      { value: 'starter', label: 'Starter' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise (disabled)', disabled: true },
    ],
    value: 'starter',
    labelPosition: 'after',
    vertical: true,
    disabled: false,
    required: false,
    disableRipple: false,
    disabledInteractive: false,
    color: 'primary',
    size: 'md',
    changed: fn(),
  },
  argTypes: {
    options: { control: 'object', table: { category: 'Data' } },
    value: { control: 'text', table: { category: 'Value' } },
    vertical: { control: 'boolean', table: { category: 'Layout' } },
    labelPosition: {
      control: 'select',
      options: ['before', 'after'],
      table: { category: 'Appearance' },
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
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    changed: { action: 'changed', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicRadioButtonComponent>;

/**
 * Default vertical radio group with an initially selected option and one disabled item.
 *
 * Inputs: `vertical=true`, `value="starter"`, `labelPosition="after"`, `options` (Starter, Pro, Enterprise disabled).
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const proRadio = canvas.getByRole('radio', { name: 'Pro' });
    await userEvent.click(proRadio);
    await expect(proRadio).toBeChecked();
    await expect(args.changed).toHaveBeenCalledWith('pro');
  },
};

/**
 * Radio options arranged horizontally in a single row.
 *
 * Inputs: `vertical=false`.
 */
export const Horizontal: Story = {
  args: { vertical: false },
};

/**
 * Radio group with option labels placed before the radio circles.
 *
 * Inputs: `labelPosition="before"`.
 */
export const LabelBefore: Story = {
  args: { labelPosition: 'before' },
};

/**
 * Entire radio group disabled so no option can be selected.
 *
 * Inputs: `disabled=true`.
 */
export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * Comparison of selected radio buttons across semantic palette colors.
 *
 * Inputs: `color="primary" | "secondary" | "tertiary" | "success" | "error"`, `value="a"`.
 */
export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <magic-radio-button color="primary" value="a" [options]="[{ value: 'a', label: 'Primary' }]" />
        <magic-radio-button color="secondary" value="a" [options]="[{ value: 'a', label: 'Secondary' }]" />
        <magic-radio-button color="tertiary" value="a" [options]="[{ value: 'a', label: 'Tertiary' }]" />
        <magic-radio-button color="success" value="a" [options]="[{ value: 'a', label: 'Success' }]" />
        <magic-radio-button color="error" value="a" [options]="[{ value: 'a', label: 'Error' }]" />
      </div>
    `,
  }),
};
