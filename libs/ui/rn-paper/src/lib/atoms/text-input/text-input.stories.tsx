import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicFormField } from '../../molecules/form-field/form-field';
import { MagicTextInput } from './text-input';

/**
 * `MagicTextInput` is a bare, single-element text input atom implementing
 * `TextInputControlProps`.
 *
 * Unlike legacy composite inputs, it does **not** accept `label`, `helperText`,
 * `errorText`, or `variant` props. Wrap it inside `MagicFormField` whenever a
 * Material 3 floating label, hint, error message, or prefix/suffix slot is needed.
 *
 * - **State**: supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) modes via `useControllableState`.
 * - **References**:
 *   - [React Native TextInput](https://reactnative.dev/docs/textinput)
 *   - [Material 3 Text Fields](https://m3.material.io/components/text-fields/overview)
 */
const meta: Meta<typeof MagicTextInput> = {
  title: 'Atoms/TextInput',
  component: MagicTextInput,
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    size: 'md',
    disabled: false,
    required: false,
    readOnly: false,
    invalid: false,
    onChange: fn(),
    onSubmit: fn(),
    onFocus: fn(),
    onBlur: fn(),
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
    defaultValue: { control: 'text', table: { category: 'Value' } },
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
    onChange: { action: 'changed', table: { category: 'Events' } },
    onChangeText: { action: 'changedText', table: { category: 'Events' } },
    onSubmit: { action: 'submitted', table: { category: 'Events' } },
    onFocus: { action: 'focused', table: { category: 'Events' } },
    onBlur: { action: 'blurred', table: { category: 'Events' } },
  },
  render: (args) => (
    <View style={{ maxWidth: 360, width: '100%' }}>
      <MagicTextInput {...args} />
    </View>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicTextInput>;

/**
 * Default standalone text input atom with typing and Enter submission test.
 *
 * Props: `type="text"`, `ariaLabel="Standalone text input"`, `placeholder="Type something..."`.
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
    await expect(args.onSubmit).toHaveBeenCalledWith('Hello');
  },
};

/**
 * Masked password input atom using `secureTextEntry`.
 *
 * Props: `type="password"`, `placeholder="Enter password"`, `ariaLabel="Password"`.
 */
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
    ariaLabel: 'Password',
  },
};

/**
 * Email input atom configured with email keyboard/input mode and autofill hint.
 *
 * Props: `type="email"`, `placeholder="name@example.com"`, `autocomplete="email"`.
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
 * Search input atom mapping to `inputMode="search"` and `returnKeyType="search"`.
 *
 * Props: `type="search"`, `placeholder="Filter items..."`, `ariaLabel="Filter items"`.
 */
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Filter items...',
    ariaLabel: 'Filter items',
  },
};

/**
 * Disabled standalone input state preventing focus and editing.
 *
 * Props: `disabled=true`, `defaultValue="Disabled value"`, `ariaLabel="Disabled input"`.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Disabled value',
    ariaLabel: 'Disabled input',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
  },
};

/**
 * Read-only input state allowing text selection and copy without editing.
 *
 * Props: `readOnly=true`, `defaultValue="Read-only value"`, `ariaLabel="Read-only input"`.
 */
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'Read-only value',
    ariaLabel: 'Read-only input',
  },
};

/**
 * Invalid standalone state exposing `aria-invalid` and Material 3 error border styling.
 *
 * Props: `invalid=true`, `defaultValue="bad-email"`, `ariaLabel="Invalid input"`.
 */
export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: 'bad-email',
    ariaLabel: 'Invalid input',
  },
};

/**
 * Comparison of all five input size scale tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 10, maxWidth: 320, width: '100%' }}>
      <MagicTextInput size="xs" placeholder="XS size" ariaLabel="XS" />
      <MagicTextInput size="sm" placeholder="SM size" ariaLabel="SM" />
      <MagicTextInput size="md" placeholder="MD size" ariaLabel="MD" />
      <MagicTextInput size="lg" placeholder="LG size" ariaLabel="LG" />
      <MagicTextInput size="xl" placeholder="XL size" ariaLabel="XL" />
    </View>
  ),
};

/**
 * Recommended composition wrapping `MagicTextInput` inside `MagicFormField` for floating label and hint display.
 */
export const InsideFormField: Story = {
  render: () => (
    <View style={{ maxWidth: 360, width: '100%' }}>
      <MagicFormField label="Email" hint="Use your work address">
        <MagicTextInput type="email" placeholder="alex@company.com" />
      </MagicFormField>
    </View>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Email')).toBeInTheDocument();
    const input = canvas.getByPlaceholderText('alex@company.com');
    await userEvent.type(input, 'alex@company.com');
    await expect(input).toHaveValue('alex@company.com');
  },
};

function ControlledValidationExample() {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const errorText =
    touched && name.trim().length < 3
      ? 'At least 3 characters required'
      : undefined;

  return (
    <View style={{ maxWidth: 360, width: '100%' }}>
      <MagicFormField
        label="Project name"
        hint="Minimum 3 characters"
        errorText={errorText}
        required
      >
        <MagicTextInput
          value={name}
          placeholder="mono-magic"
          onChange={setName}
          onBlur={() => setTouched(true)}
        />
      </MagicFormField>
    </View>
  );
}

/**
 * Interactive controlled validation pattern pairing `MagicFormField` and `MagicTextInput`.
 */
export const ControlledValidation: Story = {
  render: () => <ControlledValidationExample />,
};
