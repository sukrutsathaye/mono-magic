import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicRadioButtonComponent } from './radio-button.component';

/**
 * `MagicRadioButtonComponent` wraps `mat-radio-group` and `mat-radio-button`
 * with Signal Forms (`FormValueControl`) and Reactive/Template Forms support.
 *
 * @see https://material.angular.dev/components/radio/overview
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

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const proRadio = canvas.getByRole('radio', { name: 'Pro' });
    await userEvent.click(proRadio);
    await expect(proRadio).toBeChecked();
    await expect(args.changed).toHaveBeenCalledWith('pro');
  },
};

export const Horizontal: Story = {
  args: { vertical: false },
};

export const LabelBefore: Story = {
  args: { labelPosition: 'before' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

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
