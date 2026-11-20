import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicFormFieldComponent } from '../../molecules/form-field/form-field.component';
import { MagicTextInputComponent } from './text-input.component';

/**
 * `MagicTextInputComponent` is a bare, single-element `<input>` atom.
 *
 * Unlike composite wrappers, it renders **only** the native `<input>`. Wrap it
 * inside `<magic-form-field>` whenever a Material floating label, hint, error
 * message or prefix/suffix slot is needed.
 *
 * - **Forms**: works natively with `[(value)]`, Reactive Forms (`formControl`), Template-driven Forms (`[(ngModel)]`) and Angular Signal Forms (`[formField]`).
 * - **References**:
 *   - [Angular Material Input](https://material.angular.dev/components/input/overview)
 *   - [Material 3 Text Fields](https://m3.material.io/components/text-fields/overview)
 *   - [Angular Signal Forms](https://angular.dev/guide/forms/signals/custom-controls)
 */
const meta: Meta<MagicTextInputComponent> = {
  title: 'Atoms/TextInput',
  component: MagicTextInputComponent,
  decorators: [
    moduleMetadata({
      imports: [MagicFormFieldComponent, ReactiveFormsModule],
    }),
  ],
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    value: '',
    size: 'md',
    disabled: false,
    required: false,
    readOnly: false,
    invalid: false,
    touch: fn(),
    submitted: fn(),
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
      table: { category: 'Input' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    value: { control: 'text', table: { category: 'Value' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'State' } },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    invalid: { control: 'boolean', table: { category: 'State' } },
    name: { control: 'text', table: { category: 'Attributes' } },
    autocomplete: { control: 'text', table: { category: 'Attributes' } },
    minLength: { control: 'number', table: { category: 'Validation' } },
    maxLength: { control: 'number', table: { category: 'Validation' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    touch: { action: 'touch', table: { category: 'Events' } },
    submitted: { action: 'submitted', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicTextInputComponent>;

/**
 * Default standalone text `<input>` atom with typing and Enter submission test.
 *
 * Inputs: `type="text"`, `ariaLabel="Standalone text input"`, `placeholder="Type something..."`.
 */
export const Default: Story = {
  args: {
    ariaLabel: 'Standalone text input',
    placeholder: 'Type something...',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const inputEl = canvas.getByRole('textbox', {
      name: 'Standalone text input',
    });
    await userEvent.type(inputEl, 'Hello{Enter}');
    await expect(inputEl).toHaveValue('Hello');
    await expect(args.submitted).toHaveBeenCalledWith('Hello');
  },
};

/**
 * Masked password input atom.
 *
 * Inputs: `type="password"`, `placeholder="Enter password"`, `ariaLabel="Password"`.
 */
export const Password: Story = {
  args: { type: 'password', placeholder: 'Enter password', ariaLabel: 'Password' },
};

/**
 * Email input atom configured with semantic type and browser autofill hint.
 *
 * Inputs: `type="email"`, `placeholder="name@example.com"`, `autocomplete="email"`, `ariaLabel="Email"`.
 */
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'name@example.com',
    autocomplete: 'email',
    ariaLabel: 'Email',
  },
};

/**
 * Disabled input state preventing focus and editing.
 *
 * Inputs: `disabled=true`, `value="Disabled value"`, `ariaLabel="Disabled input"`.
 */
export const Disabled: Story = {
  args: { disabled: true, value: 'Disabled value', ariaLabel: 'Disabled input' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
  },
};

/**
 * Read-only input state allowing text selection and copy without editing.
 *
 * Inputs: `readOnly=true`, `value="Read-only value"`, `ariaLabel="Read-only input"`.
 */
export const ReadOnly: Story = {
  args: { readOnly: true, value: 'Read-only value', ariaLabel: 'Read-only input' },
};

/**
 * Invalid state exposing `aria-invalid` and error styling hooks.
 *
 * Inputs: `invalid=true`, `value="bad-email"`, `ariaLabel="Invalid input"`.
 */
export const Invalid: Story = {
  args: { invalid: true, value: 'bad-email', ariaLabel: 'Invalid input' },
};

/**
 * Comparison of all five input size scale tokens.
 *
 * Inputs: `size="xs" | "sm" | "md" | "lg" | "xl"`.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 10px; max-width: 320px;">
        <magic-text-input size="xs" placeholder="XS size" ariaLabel="XS" />
        <magic-text-input size="sm" placeholder="SM size" ariaLabel="SM" />
        <magic-text-input size="md" placeholder="MD size" ariaLabel="MD" />
        <magic-text-input size="lg" placeholder="LG size" ariaLabel="LG" />
        <magic-text-input size="xl" placeholder="XL size" ariaLabel="XL" />
      </div>
    `,
  }),
};

/**
 * Recommended composition wrapping `<magic-text-input>` inside `<magic-form-field>` for floating label and hint display.
 *
 * Inputs: `type="email"`, `placeholder="alex@company.com"` inside `<magic-form-field label="Email" hint="Use your work address">`.
 */
export const InsideFormField: Story = {
  render: () => ({
    template: `
      <div style="max-width: 360px;">
        <magic-form-field label="Email" hint="Use your work address">
          <magic-text-input type="email" placeholder="alex@company.com" />
        </magic-form-field>
      </div>
    `,
  }),
};

/**
 * Angular Reactive Forms integration with `FormControl` validators and dynamic error text.
 *
 * Inputs: `[formControl]` (`Validators.required`, `Validators.minLength(3)`), `placeholder="mono-magic"`.
 */
export const ReactiveFormsIntegration: Story = {
  render: () => {
    const control = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]);
    return {
      props: { control },
      template: `
        <div style="max-width: 360px;">
          <magic-form-field
            label="Project name"
            hint="Minimum 3 characters"
            [errorText]="control.invalid && control.touched ? 'At least 3 characters required' : undefined"
          >
            <magic-text-input [formControl]="control" placeholder="mono-magic" />
          </magic-form-field>
        </div>
      `,
    };
  },
};
