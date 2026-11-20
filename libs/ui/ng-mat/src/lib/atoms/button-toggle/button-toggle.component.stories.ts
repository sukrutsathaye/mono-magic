import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButtonToggleComponent } from './button-toggle.component';

/**
 * `MagicButtonToggleComponent` wraps `mat-button-toggle-group` supporting
 * single and multiple selection, icons, vertical orientation, Signal Forms
 * (`FormValueControl`) and Reactive/Template Forms.
 *
 * - **References**:
 *   - [Angular Material Button Toggle](https://material.angular.dev/components/button-toggle/overview)
 *   - [Material 3 Segmented Buttons](https://m3.material.io/components/segmented-buttons/overview)
 *   - [Angular Signal Forms](https://angular.dev/guide/forms/signals/custom-controls)
 */
const meta: Meta<MagicButtonToggleComponent> = {
  title: 'Atoms/ButtonToggle',
  component: MagicButtonToggleComponent,
  args: {
    ariaLabel: 'Text alignment',
    options: [
      { value: 'left', label: 'Left', icon: 'format_align_left' },
      { value: 'center', label: 'Center', icon: 'format_align_center' },
      { value: 'right', label: 'Right', icon: 'format_align_right' },
      { value: 'justify', label: 'Justify', disabled: true },
    ],
    value: 'left',
    selectionMode: 'single',
    vertical: false,
    appearance: 'standard',
    hideSelectionIndicator: false,
    disabled: false,
    disabledInteractive: false,
    color: 'primary',
    size: 'md',
    changed: fn(),
  },
  argTypes: {
    options: { control: 'object', table: { category: 'Data' } },
    value: { control: 'object', table: { category: 'Value' } },
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
      table: { category: 'Behavior' },
    },
    vertical: { control: 'boolean', table: { category: 'Layout' } },
    appearance: {
      control: 'select',
      options: ['standard', 'legacy'],
      table: { category: 'Appearance' },
    },
    hideSelectionIndicator: { control: 'boolean', table: { category: 'Appearance' } },
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
  },
};

export default meta;
type Story = StoryObj<MagicButtonToggleComponent>;

/**
 * Default single-select horizontal toggle group with icons and a disabled option.
 *
 * Inputs: `selectionMode="single"`, `value="left"`, `vertical=false`, `options` (4 alignment items).
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const centerBtn = canvas.getByRole('radio', { name: 'Center' });
    await userEvent.click(centerBtn);
    await expect(args.changed).toHaveBeenCalledWith('center');
  },
};

/**
 * Multi-select toggle group allowing any combination of active formatting options.
 *
 * Inputs: `selectionMode="multiple"`, `value=['bold']`, `ariaLabel="Formatting"`, `options` (Bold, Italic, Underline).
 */
export const Multiple: Story = {
  args: {
    ariaLabel: 'Formatting',
    selectionMode: 'multiple',
    value: ['bold'],
    options: [
      { value: 'bold', label: 'Bold', icon: 'format_bold' },
      { value: 'italic', label: 'Italic', icon: 'format_italic' },
      { value: 'underline', label: 'Underline', icon: 'format_underlined' },
    ],
  },
};

/**
 * Vertically stacked toggle group layout.
 *
 * Inputs: `vertical=true` (inherits default `options` and `value="left"`).
 */
export const Vertical: Story = {
  args: { vertical: true },
};

/**
 * Disabled toggle group preventing selection changes across all options.
 *
 * Inputs: `disabled=true`.
 */
export const Disabled: Story = {
  args: { disabled: true },
};
