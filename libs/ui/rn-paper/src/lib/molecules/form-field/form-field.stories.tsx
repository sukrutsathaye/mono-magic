import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, userEvent, within } from 'storybook/test';
import { MagicTextInput } from '../../atoms/text-input/text-input';
import { MagicIcon } from '../../core/icon';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicFormField } from './form-field';

/**
 * `MagicFormField` is the Material 3 form-field molecule for `@mono-magic/rn-paper`.
 *
 * It wraps a single form-control atom (`MagicTextInput`, `MagicSelect`, etc.) via
 * `MagicFormFieldContext` and renders outlined or filled container chrome,
 * floating labels, required markers, prefix/suffix slots, and hint or error text.
 *
 * - **References**:
 *   - [Material 3 Text Fields](https://m3.material.io/components/text-fields/overview)
 *   - [React Native Paper HelperText](https://callstack.github.io/react-native-paper/docs/components/HelperText)
 */
const meta: Meta<typeof MagicFormField> = {
  title: 'Molecules/FormField',
  component: MagicFormField,
  args: {
    label: 'Email address',
    hint: 'We never share your email',
    appearance: 'outlined',
    size: 'md',
    floatLabel: 'auto',
    subscriptSizing: 'fixed',
    hideRequiredMarker: false,
    required: false,
    disabled: false,
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
    hideRequiredMarker: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    label: { control: 'text', table: { category: 'Content' } },
    hint: { control: 'text', table: { category: 'Content' } },
    errorText: { control: 'text', table: { category: 'Content' } },
    required: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    prefix: { control: false, table: { category: 'Slots' } },
    suffix: { control: false, table: { category: 'Slots' } },
    children: { control: false, table: { category: 'Slots' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
  },
  render: (args) => (
    <View style={{ maxWidth: 360, width: '100%' }}>
      <MagicFormField {...args}>
        <MagicTextInput placeholder="you@example.com" />
      </MagicFormField>
    </View>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicFormField>;

/**
 * Default outlined form field wrapping `MagicTextInput` with label and hint text.
 *
 * Props: `appearance="outlined"`, `label="Email address"`, `hint="We never share your email"`.
 */
export const Outlined: Story = {
  args: { appearance: 'outlined' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Email address')).toBeInTheDocument();
    await expect(
      canvas.getByText('We never share your email')
    ).toBeInTheDocument();
    const input = canvas.getByPlaceholderText('you@example.com');
    await userEvent.type(input, 'ada@company.com');
    await expect(input).toHaveValue('ada@company.com');
  },
};

/**
 * Filled Material 3 form field appearance with surfaceVariant container and bottom indicator.
 *
 * Props: `appearance="filled"`.
 */
export const Filled: Story = {
  args: { appearance: 'filled' },
};

/**
 * Validation error state displaying `errorText` in place of the hint and marking the nested control invalid.
 *
 * Props: `label="Username"`, `hint=undefined`, `errorText="This username is already taken"`.
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
      canvas.getByText('This username is already taken')
    ).toBeInTheDocument();
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

/**
 * Form field with its floating label pinned in the raised position even when empty.
 *
 * Props: `floatLabel="always"`, `label="Always Floating"`.
 */
export const AlwaysFloatLabel: Story = {
  args: { floatLabel: 'always', label: 'Always Floating' },
  render: (args) => (
    <View style={{ maxWidth: 360, width: '100%' }}>
      <MagicFormField {...args}>
        <MagicTextInput />
      </MagicFormField>
    </View>
  ),
};

/**
 * Required form field displaying the `*` marker next to the label.
 *
 * Props: `required=true`, `label="Company name"`, `hint="Shown on invoices"`.
 */
export const RequiredField: Story = {
  args: {
    label: 'Company name',
    hint: 'Shown on invoices',
    required: true,
    hideRequiredMarker: false,
  },
};

/**
 * Form field with `prefix` and `suffix` slots rendering Material icons and affixes.
 *
 * Props: `prefix={<MagicIcon icon="mail" />}`, `suffix={<MagicIcon icon="verified" />}`.
 */
export const WithPrefixAndSuffix: Story = {
  render: (args) => (
    <View style={{ maxWidth: 360, width: '100%', gap: 16 }}>
      <MagicFormField
        {...args}
        prefix={<MagicIcon icon="mail" size={18} />}
        suffix={<MagicIcon icon="verified" size={18} />}
      >
        <MagicTextInput placeholder="alex@company.com" />
      </MagicFormField>
      <MagicFormField
        label="Budget"
        appearance="filled"
        subscriptSizing="dynamic"
        prefix={<Text>$</Text>}
        suffix={<Text>USD</Text>}
      >
        <MagicTextInput type="number" placeholder="1200" />
      </MagicFormField>
    </View>
  ),
};

/**
 * Disabled form field propagating disabled state to the nested control.
 *
 * Props: `disabled=true`, `label="Organization ID"`.
 */
export const Disabled: Story = {
  args: {
    label: 'Organization ID',
    hint: 'Managed by workspace admin',
    disabled: true,
  },
  render: (args) => (
    <View style={{ maxWidth: 360, width: '100%' }}>
      <MagicFormField {...args}>
        <MagicTextInput defaultValue="org_01J9X7" />
      </MagicFormField>
    </View>
  ),
};

/**
 * Comparison of all five form field density/size scale tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 12, maxWidth: 360, width: '100%' }}>
      <MagicFormField size="xs" label="XS Field" subscriptSizing="dynamic">
        <MagicTextInput placeholder="XS" />
      </MagicFormField>
      <MagicFormField size="sm" label="SM Field" subscriptSizing="dynamic">
        <MagicTextInput placeholder="SM" />
      </MagicFormField>
      <MagicFormField size="md" label="MD Field" subscriptSizing="dynamic">
        <MagicTextInput placeholder="MD" />
      </MagicFormField>
      <MagicFormField size="lg" label="LG Field" subscriptSizing="dynamic">
        <MagicTextInput placeholder="LG" />
      </MagicFormField>
      <MagicFormField size="xl" label="XL Field" subscriptSizing="dynamic">
        <MagicTextInput placeholder="XL" />
      </MagicFormField>
    </View>
  ),
};

/**
 * Outlined and filled form fields rendered against a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          gap: 16,
          maxWidth: 380,
          width: '100%',
        }}
      >
        <MagicFormField
          label="Outlined Dark"
          hint="Synced with dark MD3 tokens"
          appearance="outlined"
        >
          <MagicTextInput placeholder="dark@example.com" />
        </MagicFormField>
        <MagicFormField
          label="Filled Dark"
          errorText="Please enter a valid value"
          appearance="filled"
        >
          <MagicTextInput defaultValue="invalid" />
        </MagicFormField>
      </View>
    </MagicPaperProvider>
  ),
};
