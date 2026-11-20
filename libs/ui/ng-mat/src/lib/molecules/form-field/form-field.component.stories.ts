import { MatIcon } from '@angular/material/icon';
import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { MagicTextInputComponent } from '../../atoms/text-input/text-input.component';
import {
  MagicFormFieldComponent,
  MagicPrefixDirective,
  MagicSuffixDirective,
} from './form-field.component';

/**
 * `MagicFormFieldComponent` is the sole molecule responsible for rendering
 * `mat-form-field`. It wraps projected form-control atoms (`magic-text-input`,
 * `magic-select`) and provides floating labels, hints, validation error display
 * and `[magicPrefix]` / `[magicSuffix]` slots.
 *
 * - **References**:
 *   - [Angular Material Form Field](https://material.angular.dev/components/form-field/overview)
 *   - [Material 3 Text Fields](https://m3.material.io/components/text-fields/overview)
 */
const meta: Meta<MagicFormFieldComponent> = {
  title: 'Molecules/FormField',
  component: MagicFormFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        MagicTextInputComponent,
        MagicPrefixDirective,
        MagicSuffixDirective,
        MatIcon,
      ],
    }),
  ],
  args: {
    label: 'Email address',
    hint: 'We never share your email',
    appearance: 'outlined',
    size: 'md',
    floatLabel: 'auto',
    subscriptSizing: 'fixed',
    hideRequiredMarker: false,
  },
  argTypes: {
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
      table: { category: 'Appearance' },
    },
    subscriptSizing: {
      control: 'select',
      options: ['fixed', 'dynamic'],
      table: { category: 'Appearance' },
    },
    hideRequiredMarker: { control: 'boolean', table: { category: 'Appearance' } },
    label: { control: 'text', table: { category: 'Content' } },
    hint: { control: 'text', table: { category: 'Content' } },
    errorText: { control: 'text', table: { category: 'Content' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px;">
        <magic-form-field ${argsToTemplate(args)}>
          <magic-text-input placeholder="you@example.com" />
        </magic-form-field>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<MagicFormFieldComponent>;

/**
 * Default outlined form field wrapping `<magic-text-input>` with label and hint text.
 *
 * Inputs: `appearance="outlined"`, `label="Email address"`, `hint="We never share your email"`, `size="md"`, `floatLabel="auto"`.
 */
export const Outlined: Story = {
  args: { appearance: 'outlined' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Email address')).toBeInTheDocument();
    await expect(
      canvas.getByText('We never share your email'),
    ).toBeInTheDocument();
  },
};

/**
 * Filled Material 3 form field appearance.
 *
 * Inputs: `appearance="filled"`.
 */
export const Filled: Story = {
  args: { appearance: 'filled' },
};

/**
 * Validation error state displaying `errorText` in place of the hint.
 *
 * Inputs: `label="Username"`, `hint=undefined`, `errorText="This username is already taken"`.
 */
export const WithError: Story = {
  args: {
    label: 'Username',
    hint: undefined,
    errorText: 'This username is already taken',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('This username is already taken'),
    ).toBeInTheDocument();
  },
};

/**
 * Form field with its floating label pinned in the raised position at all times.
 *
 * Inputs: `floatLabel="always"`, `label="Always Floating"`.
 */
export const AlwaysFloatLabel: Story = {
  args: { floatLabel: 'always', label: 'Always Floating' },
};

/**
 * Form field with projected `[magicPrefix]` and `[magicSuffix]` Material icons.
 *
 * Inputs: default `meta.args` plus projected `<mat-icon magicPrefix>` and `<mat-icon magicSuffix>`.
 */
export const WithPrefixAndSuffix: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px;">
        <magic-form-field ${argsToTemplate(args)}>
          <mat-icon magicPrefix>mail</mat-icon>
          <magic-text-input placeholder="alex@company.com" />
          <mat-icon magicSuffix>verified</mat-icon>
        </magic-form-field>
      </div>
    `,
  }),
};

/**
 * Comparison of all five form field density/size scale tokens.
 *
 * Inputs: `size="xs" | "sm" | "md" | "lg" | "xl"`.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 12px; max-width: 360px;">
        <magic-form-field size="xs" label="XS Field"><magic-text-input placeholder="XS" /></magic-form-field>
        <magic-form-field size="sm" label="SM Field"><magic-text-input placeholder="SM" /></magic-form-field>
        <magic-form-field size="md" label="MD Field"><magic-text-input placeholder="MD" /></magic-form-field>
        <magic-form-field size="lg" label="LG Field"><magic-text-input placeholder="LG" /></magic-form-field>
        <magic-form-field size="xl" label="XL Field"><magic-text-input placeholder="XL" /></magic-form-field>
      </div>
    `,
  }),
};
