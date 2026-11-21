import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicRadioButton } from './radio-button';

/**
 * `MagicRadioButton` wraps MUI's `RadioGroup` and `Radio` with controlled and
 * uncontrolled state, generic option values, horizontal/vertical layout, and
 * `disabledInteractive` (`aria-disabled="true"`).
 *
 * - **Sizes**: `xs`, `sm`, `md`, `lg`, `xl`.
 * - **Colors**: All 7 Material 3 semantic intents (`primary`..`neutral`).
 * - **References**:
 *   - [MUI Radio Group](https://mui.com/material-ui/react-radio-button/)
 *   - [Material 3 Radio Button](https://m3.material.io/components/radio-button/overview)
 */
const meta: Meta<typeof MagicRadioButton> = {
  title: 'Atoms/RadioButton',
  component: MagicRadioButton,
  tags: ['autodocs', 'snapshot'],
  args: {
    ariaLabel: 'Subscription tier',
    options: [
      { value: 'starter', label: 'Starter' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise (disabled)', disabled: true },
    ],
    defaultValue: 'starter',
    labelPosition: 'after',
    vertical: false,
    disabled: false,
    disabledInteractive: false,
    disableRipple: false,
    required: false,
    color: 'primary',
    size: 'md',
    onChange: fn(),
  },
  argTypes: {
    options: { control: 'object', table: { category: 'Content' } },
    value: { control: 'text', table: { category: 'Content' } },
    defaultValue: { control: 'text', table: { category: 'Content' } },
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
    vertical: { control: 'boolean', table: { category: 'Layout' } },
    labelPosition: {
      control: 'select',
      options: ['before', 'after'],
      table: { category: 'Layout' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    disabledInteractive: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'State' } },
    disableRipple: { control: 'boolean', table: { category: 'Behavior' } },
    name: { control: 'text', table: { category: 'Behavior' } },
    onChange: { action: 'changed', table: { category: 'Behavior' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicRadioButton>;

/**
 * Default horizontal radio group with an initially selected option and one disabled item.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const proRadio = canvas.getByRole('radio', { name: 'Pro' });
    await expect(proRadio).not.toBeChecked();
    await userEvent.click(proRadio);
    await expect(proRadio).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith('pro');
  },
};

/**
 * Vertically stacked radio options.
 */
export const Vertical: Story = {
  args: {
    vertical: true,
    defaultValue: 'pro',
  },
};

/**
 * Radio buttons with labels placed before the radio circles.
 */
export const LabelBefore: Story = {
  args: {
    labelPosition: 'before',
    vertical: true,
  },
};

/**
 * All seven semantic color intents rendered with selected options.
 */
export const Colors: Story = {
  render: () => {
    const colors = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ] as const;

    return (
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {colors.map((color) => (
          <MagicRadioButton
            key={color}
            color={color}
            defaultValue="a"
            ariaLabel={`${color} radio`}
            options={[{ value: 'a', label: color }]}
          />
        ))}
      </Stack>
    );
  },
};

/**
 * Comparison of all five atomic size tokens (`xs`..`xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={1.5}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicRadioButton
          key={size}
          size={size}
          defaultValue="a"
          ariaLabel={`${size} radio`}
          options={[
            { value: 'a', label: `${size.toUpperCase()} selected` },
            { value: 'b', label: `${size.toUpperCase()} unselected` },
          ]}
        />
      ))}
    </Stack>
  ),
};

/**
 * Comparison of natively disabled radio group vs. focusable `disabledInteractive`.
 */
export const DisabledAndDisabledInteractive: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => (
    <Stack spacing={2}>
      <MagicRadioButton
        ariaLabel="Natively disabled"
        disabled
        defaultValue="a"
        options={[
          { value: 'a', label: 'Native A' },
          { value: 'b', label: 'Native B' },
        ]}
        onChange={args.onChange}
      />
      <MagicRadioButton
        ariaLabel="Disabled interactive"
        disabled
        disabledInteractive
        defaultValue="a"
        options={[
          { value: 'a', label: 'Interactive A' },
          { value: 'b', label: 'Interactive B' },
        ]}
        onChange={args.onChange}
      />
    </Stack>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const nativeB = canvas.getByRole('radio', { name: 'Native B' });
    const interactiveB = canvas.getByRole('radio', { name: 'Interactive B' });
    await expect(nativeB).toBeDisabled();
    await expect(interactiveB).not.toBeDisabled();
    await expect(interactiveB).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactiveB);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
