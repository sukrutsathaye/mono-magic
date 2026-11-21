import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { MagicTextInput } from '../../atoms/text-input/text-input';
import { MagicIcon } from '../../core/icon';
import { MagicFormField } from './form-field';

/**
 * `MagicFormField` is the Material 3 form-field molecule wrapping bare form-control
 * atoms (`MagicTextInput`, `MagicSelect`, etc.) via React 19 `MagicFormFieldContext`.
 *
 * It owns floating labels, hints, error messages (`errorText` overrides `hint`),
 * required markers, subscript spacing, and prefix/suffix adornments.
 *
 * - **References**:
 *   - [MUI FormControl](https://mui.com/material-ui/api/form-control/)
 *   - [Material 3 Text Fields](https://m3.material.io/components/text-fields/overview)
 */
const meta: Meta<typeof MagicFormField> = {
  title: 'Molecules/FormField',
  component: MagicFormField,
  args: {
    label: 'Email address',
    hint: 'We never share your email.',
    appearance: 'outlined',
    size: 'md',
    floatLabel: 'auto',
    subscriptSizing: 'fixed',
    hideRequiredMarker: false,
    fullWidth: true,
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
      table: { category: 'Behavior' },
    },
    subscriptSizing: {
      control: 'select',
      options: ['fixed', 'dynamic'],
      table: { category: 'Layout' },
    },
    hideRequiredMarker: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    fullWidth: {
      control: 'boolean',
      table: { category: 'Layout' },
    },
    label: { control: 'text', table: { category: 'Content' } },
    hint: { control: 'text', table: { category: 'Content' } },
    errorText: { control: 'text', table: { category: 'Validation' } },
    prefix: { control: 'text', table: { category: 'Icons' } },
    suffix: { control: 'text', table: { category: 'Icons' } },
    required: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    children: { control: false, table: { category: 'Content' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <MagicFormField {...args}>
        <MagicTextInput type="email" placeholder="you@example.com" />
      </MagicFormField>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicFormField>;

/**
 * Default outlined Material 3 form field wrapping a bare `MagicTextInput`.
 */
export const Default: Story = {
  args: {
    appearance: 'outlined',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email address');
    await expect(
      canvas.getByText('We never share your email.'),
    ).toBeInTheDocument();
    await userEvent.type(input, 'alex@example.com');
    await expect(input).toHaveValue('alex@example.com');
  },
};

/**
 * Filled Material 3 form field appearance.
 */
export const Filled: Story = {
  args: {
    appearance: 'filled',
    label: 'Work email',
  },
};

/**
 * Form field displaying descriptive helper hint text below the control.
 */
export const WithHint: Story = {
  args: {
    label: 'Workspace slug',
    hint: 'Lowercase letters, numbers, and hyphens only.',
    subscriptSizing: 'fixed',
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <MagicFormField {...args}>
        <MagicTextInput placeholder="mono-magic" />
      </MagicFormField>
    </div>
  ),
};

/**
 * Validation error presentation where `errorText` takes precedence over `hint`
 * and marks the inner control with `aria-invalid="true"`.
 */
export const WithError: Story = {
  args: {
    label: 'Username',
    hint: 'Choose a unique handle.',
    errorText: 'This username is already taken.',
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <MagicFormField {...args}>
        <MagicTextInput defaultValue="admin" />
      </MagicFormField>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    await expect(alert).toHaveTextContent('This username is already taken.');
    await expect(
      canvas.queryByText('Choose a unique handle.'),
    ).not.toBeInTheDocument();
    const input = canvas.getByLabelText('Username');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

/**
 * Leading and trailing adornments passed via `prefix` and `suffix`, supporting
 * both Material Icons string names and custom React nodes.
 */
export const WithAffixes: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 360 }}>
      <MagicFormField
        label="Email with icon names"
        hint="String icon names resolve via MagicIcon"
        prefix="mail"
        suffix="verified"
      >
        <MagicTextInput type="email" placeholder="alex@company.com" />
      </MagicFormField>
      <MagicFormField
        label="Budget"
        hint="Custom ReactNode affixes"
        prefix={<Typography component="span" color="text.secondary">$</Typography>}
        suffix={<MagicIcon icon="payments" size="sm" />}
      >
        <MagicTextInput type="number" defaultValue="250" />
      </MagicFormField>
    </Stack>
  ),
};

/**
 * Form field with `floatLabel="always"` keeping the label raised even when empty.
 */
export const FloatLabelAlways: Story = {
  args: {
    label: 'Always floating label',
    floatLabel: 'always',
    hint: 'Label stays pinned above the control.',
  },
};

/**
 * Comparison of required fields showing the default asterisk vs. `hideRequiredMarker`.
 */
export const RequiredAndHideMarker: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 360 }}>
      <MagicFormField
        label="Full name"
        required
        hint="Displays required asterisk marker"
      >
        <MagicTextInput placeholder="Ada Lovelace" />
      </MagicFormField>
      <MagicFormField
        label="Full name (marker hidden)"
        required
        hideRequiredMarker
        hint="Still sets native required attribute without asterisk"
      >
        <MagicTextInput placeholder="Ada Lovelace" />
      </MagicFormField>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    await expect(inputs).toHaveLength(2);
    await expect(inputs[0]).toBeRequired();
    await expect(inputs[1]).toBeRequired();
  },
};

/**
 * Comparison of all five atomic form field density/size scale tokens (`xs`..`xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 360 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicFormField
          key={size}
          size={size}
          label={`${size.toUpperCase()} Field`}
          subscriptSizing="dynamic"
        >
          <MagicTextInput placeholder={`${size.toUpperCase()} input`} />
        </MagicFormField>
      ))}
    </Stack>
  ),
};
