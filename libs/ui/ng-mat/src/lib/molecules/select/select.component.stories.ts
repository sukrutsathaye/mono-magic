import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicSelectComponent } from './select.component';

/**
 * `MagicSelectComponent` composes `magic-form-field` and `mat-select` with
 * flat and grouped options, multiple selection, compact trigger summaries,
 * Signal Forms (`FormValueControl`) and Reactive/Template Forms support.
 *
 * - **References**:
 *   - [Angular Material Select](https://material.angular.dev/components/select/overview)
 *   - [Material 3 Menus](https://m3.material.io/components/menus/overview)
 *   - [Material 3 Text Fields](https://m3.material.io/components/text-fields/overview)
 *   - [Angular Signal Forms](https://angular.dev/guide/forms/signals/custom-controls)
 */
const meta: Meta<MagicSelectComponent<string>> = {
  title: 'Molecules/Select',
  component: MagicSelectComponent,
  args: {
    label: 'Favorite fruit',
    placeholder: 'Choose one',
    hint: 'Pick any seasonal option',
    appearance: 'outlined',
    size: 'md',
    floatLabel: 'auto',
    subscriptSizing: 'fixed',
    hideRequiredMarker: false,
    multiple: false,
    customTriggerSummary: false,
    required: false,
    disabled: false,
    disableRipple: false,
    hideSingleSelectionIndicator: false,
    disableOptionCentering: false,
    typeaheadDebounceInterval: 200,
    panelWidth: 'auto',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'durian', label: 'Durian (Out of stock)', disabled: true },
    ],
    optionGroups: [],
    value: null,
    changed: fn(),
    openedChanged: fn(),
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Field' } },
    placeholder: { control: 'text', table: { category: 'Field' } },
    hint: { control: 'text', table: { category: 'Field' } },
    errorText: { control: 'text', table: { category: 'Validation' } },
    appearance: {
      control: 'select',
      options: ['outlined', 'filled'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    floatLabel: {
      control: 'select',
      options: ['auto', 'always'],
      table: { category: 'Field' },
    },
    subscriptSizing: {
      control: 'select',
      options: ['fixed', 'dynamic'],
      table: { category: 'Field' },
    },
    hideRequiredMarker: { control: 'boolean', table: { category: 'Validation' } },
    options: { control: 'object', table: { category: 'Data' } },
    optionGroups: { control: 'object', table: { category: 'Data' } },
    value: { control: 'object', table: { category: 'Value' } },
    multiple: { control: 'boolean', table: { category: 'Behavior' } },
    customTriggerSummary: { control: 'boolean', table: { category: 'Behavior' } },
    disableRipple: { control: 'boolean', table: { category: 'Behavior' } },
    hideSingleSelectionIndicator: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    disableOptionCentering: { control: 'boolean', table: { category: 'Behavior' } },
    panelClass: { control: 'text', table: { category: 'Appearance' } },
    panelWidth: { control: 'text', table: { category: 'Appearance' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    invalid: { control: 'boolean', table: { category: 'Validation' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    changed: { action: 'changed', table: { category: 'Events' } },
    openedChanged: { action: 'openedChanged', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicSelectComponent<string>>;

/**
 * Default single-select outlined dropdown with a disabled option and selection test.
 *
 * Inputs: `appearance="outlined"`, `multiple=false`, `value=null`, `options` (Apple, Banana, Cherry, Durian disabled).
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByRole('combobox');
    await userEvent.click(combobox);
    const doc = within(document.body);
    await userEvent.click(doc.getByRole('option', { name: 'Banana' }));
    await expect(args.changed).toHaveBeenCalledWith('banana');
  },
};

/**
 * Categorized dropdown options rendered with `<mat-optgroup>` headings.
 *
 * Inputs: `label="Produce"`, `options=[]`, `optionGroups` (Citrus, Stone fruit), `value="orange"`.
 */
export const Grouped: Story = {
  args: {
    label: 'Produce',
    options: [],
    optionGroups: [
      {
        label: 'Citrus',
        options: [
          { value: 'lemon', label: 'Lemon' },
          { value: 'orange', label: 'Orange' },
        ],
      },
      {
        label: 'Stone fruit',
        options: [
          { value: 'peach', label: 'Peach' },
          { value: 'plum', label: 'Plum' },
        ],
      },
    ],
    value: 'orange',
  },
};

/**
 * Multi-select dropdown displaying comma-separated selected labels.
 *
 * Inputs: `label="Toppings"`, `multiple=true`, `value=['apple', 'cherry']`.
 */
export const Multiple: Story = {
  args: {
    label: 'Toppings',
    multiple: true,
    value: ['apple', 'cherry'],
  },
};

/**
 * Multi-select dropdown using a condensed "+N others" trigger summary for long selections.
 *
 * Inputs: `label="Selected items"`, `multiple=true`, `customTriggerSummary=true`, `value=['apple', 'banana', 'cherry']`.
 */
export const CustomTriggerSummary: Story = {
  args: {
    label: 'Selected items',
    multiple: true,
    customTriggerSummary: true,
    value: ['apple', 'banana', 'cherry'],
  },
};

/**
 * Required invalid select state rendering `errorText` below the field.
 *
 * Inputs: `label="Country"`, `required=true`, `invalid=true`, `errorText="Please choose a country"`, `hint=""`.
 */
export const WithErrorAndHint: Story = {
  args: {
    label: 'Country',
    required: true,
    invalid: true,
    errorText: 'Please choose a country',
    hint: '',
  },
};

/**
 * Filled Material 3 form field variant with a preselected option.
 *
 * Inputs: `appearance="filled"`, `value="apple"`.
 */
export const Filled: Story = {
  args: {
    appearance: 'filled',
    value: 'apple',
  },
};

/**
 * Disabled select control exposing `aria-disabled="true"`.
 *
 * Inputs: `disabled=true`, `value="apple"`.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'apple',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

/**
 * Comparison of all five select field size scale tokens.
 *
 * Inputs: `size="xs" | "sm" | "md" | "lg" | "xl"`, `value="apple"`.
 */
export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 12px; max-width: 360px;">
        <magic-select [options]="options" size="xs" label="XS" value="apple" />
        <magic-select [options]="options" size="sm" label="SM" value="apple" />
        <magic-select [options]="options" size="md" label="MD" value="apple" />
        <magic-select [options]="options" size="lg" label="LG" value="apple" />
        <magic-select [options]="options" size="xl" label="XL" value="apple" />
      </div>
    `,
  }),
};
