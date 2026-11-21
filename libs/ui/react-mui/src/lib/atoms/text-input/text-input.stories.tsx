import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicFormField } from '../../molecules/form-field/form-field';
import { MagicTextInput } from './text-input';

/**
 * `MagicTextInput` is a bare, single-control text input atom implementing
 * `TextInputControlProps`.
 *
 * Wrap it inside `MagicFormField` whenever a Material 3 floating label, hint,
 * validation error, or prefix/suffix slot is needed, or render it standalone for
 * compact inputs.
 *
 * - **References**:
 *   - [MUI OutlinedInput](https://mui.com/material-ui/api/outlined-input/)
 *   - [MUI FilledInput](https://mui.com/material-ui/api/filled-input/)
 *   - [Material 3 Text Fields](https://m3.material.io/components/text-fields/overview)
 */
const meta: Meta<typeof MagicTextInput> = {
  title: 'Atoms/TextInput',
  component: MagicTextInput,
  args: {
    type: 'text',
    placeholder: 'Type something...',
    size: 'md',
    disabled: false,
    required: false,
    readOnly: false,
    invalid: false,
    fullWidth: true,
    onChange: fn(),
    onSubmit: fn(),
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
      table: { category: 'Behavior' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    fullWidth: {
      control: 'boolean',
      table: { category: 'Layout' },
    },
    value: { control: 'text', table: { category: 'Content' } },
    defaultValue: { control: 'text', table: { category: 'Content' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'State' } },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    invalid: { control: 'boolean', table: { category: 'Validation' } },
    minLength: { control: 'number', table: { category: 'Validation' } },
    maxLength: { control: 'number', table: { category: 'Validation' } },
    name: { control: 'text', table: { category: 'Behavior' } },
    autocomplete: { control: 'text', table: { category: 'Behavior' } },
    autoComplete: { control: 'text', table: { category: 'Behavior' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onChange: { action: 'changed', table: { category: 'Events' } },
    onSubmit: { action: 'submitted', table: { category: 'Events' } },
    onFocus: { action: 'focused', table: { category: 'Events' } },
    onBlur: { action: 'blurred', table: { category: 'Events' } },
    sx: { control: false, table: { category: 'Appearance' } },
    slotProps: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicTextInput>;

/**
 * Recommended composition rendering `MagicTextInput` inside `MagicFormField`
 * with floating label, hint, and Enter submission verification.
 */
export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <MagicFormField
        label="Email address"
        hint="Use your work email address."
        appearance="outlined"
      >
        <MagicTextInput {...args} type="email" placeholder="you@company.com" />
      </MagicFormField>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email address');
    await userEvent.type(input, 'dev@magic.dev{Enter}');
    await expect(input).toHaveValue('dev@magic.dev');
    await expect(args.onSubmit).toHaveBeenCalledWith('dev@magic.dev');
  },
};

/**
 * Bare standalone `MagicTextInput` rendered outside `MagicFormField` with an
 * explicit `ariaLabel`.
 */
export const Standalone: Story = {
  args: {
    ariaLabel: 'Standalone text input',
    placeholder: 'Bare text input without form field...',
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <MagicTextInput {...args} />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', {
      name: 'Standalone text input',
    });
    await userEvent.type(input, 'Hello{Enter}');
    await expect(input).toHaveValue('Hello');
    await expect(args.onSubmit).toHaveBeenCalledWith('Hello');
  },
};

/**
 * Showcase of supported native HTML input `type` values inside `MagicFormField`.
 */
export const InputTypes: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 360 }}>
      <MagicFormField label="Text" subscriptSizing="dynamic">
        <MagicTextInput type="text" placeholder="Plain text" />
      </MagicFormField>
      <MagicFormField label="Email" subscriptSizing="dynamic">
        <MagicTextInput
          type="email"
          placeholder="name@example.com"
          autocomplete="email"
        />
      </MagicFormField>
      <MagicFormField label="Password" subscriptSizing="dynamic">
        <MagicTextInput
          type="password"
          defaultValue="supersecret"
          placeholder="Enter password"
        />
      </MagicFormField>
      <MagicFormField label="Search" subscriptSizing="dynamic">
        <MagicTextInput type="search" placeholder="Search docs..." />
      </MagicFormField>
      <MagicFormField label="Phone" subscriptSizing="dynamic">
        <MagicTextInput type="tel" placeholder="+1 (555) 010-9999" />
      </MagicFormField>
      <MagicFormField label="Website" subscriptSizing="dynamic">
        <MagicTextInput type="url" placeholder="https://mono-magic.dev" />
      </MagicFormField>
      <MagicFormField label="Quantity" subscriptSizing="dynamic">
        <MagicTextInput type="number" defaultValue="42" />
      </MagicFormField>
    </Stack>
  ),
};

/**
 * Comparison of all five atomic size tokens (`xs`, `sm`, `md`, `lg`, `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 360 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicTextInput
          key={size}
          size={size}
          placeholder={`${size.toUpperCase()} input`}
          ariaLabel={`${size.toUpperCase()} input`}
        />
      ))}
    </Stack>
  ),
};

/**
 * Interactive control states: enabled, read-only, disabled, and invalid.
 */
export const States: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 360 }}>
      <MagicFormField label="Default" subscriptSizing="dynamic">
        <MagicTextInput defaultValue="Editable value" />
      </MagicFormField>
      <MagicFormField label="Read-only" subscriptSizing="dynamic">
        <MagicTextInput readOnly defaultValue="Read-only value" />
      </MagicFormField>
      <MagicFormField label="Disabled" subscriptSizing="dynamic">
        <MagicTextInput disabled defaultValue="Disabled value" />
      </MagicFormField>
      <MagicFormField
        label="Invalid"
        errorText="Please provide a valid value."
      >
        <MagicTextInput invalid defaultValue="bad-input" />
      </MagicFormField>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Disabled')).toBeDisabled();
    await expect(canvas.getByLabelText('Read-only')).toHaveAttribute(
      'readonly',
    );
    await expect(canvas.getByLabelText('Invalid')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

/**
 * Text inputs inheriting prefix and suffix slots from `MagicFormField` in both
 * outlined and filled appearances.
 */
export const WithAffixes: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 360 }}>
      <MagicFormField
        label="Outlined with affixes"
        appearance="outlined"
        prefix="person"
        suffix="check_circle"
        subscriptSizing="dynamic"
      >
        <MagicTextInput defaultValue="ada.lovelace" />
      </MagicFormField>
      <MagicFormField
        label="Filled with affixes"
        appearance="filled"
        prefix="lock"
        suffix="visibility_off"
        subscriptSizing="dynamic"
      >
        <MagicTextInput type="password" defaultValue="secret123" />
      </MagicFormField>
    </Stack>
  ),
};

/**
 * Validation attributes (`required`, `minLength`, `maxLength`) combined with
 * `MagicFormField` error messaging.
 */
export const ErrorAndValidation: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <MagicFormField
        label="Project code"
        errorText="Must be between 3 and 12 characters."
      >
        <MagicTextInput
          required
          minLength={3}
          maxLength={12}
          defaultValue="ab"
        />
      </MagicFormField>
    </div>
  ),
};

/**
 * Uncontrolled input initialized with `defaultValue`, requiring no parent state.
 */
export const Uncontrolled: Story = {
  args: {
    defaultValue: 'Initial uncontrolled text',
    ariaLabel: 'Uncontrolled input',
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <MagicTextInput {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Uncontrolled input' });
    await expect(input).toHaveValue('Initial uncontrolled text');
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated value');
    await expect(input).toHaveValue('Updated value');
  },
};
