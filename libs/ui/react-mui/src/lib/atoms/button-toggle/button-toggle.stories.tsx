import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButtonToggle } from './button-toggle';

/**
 * `MagicButtonToggle` wraps MUI's `ToggleButtonGroup` and `ToggleButton` with
 * single and multiple selection, icons, selection indicator checkmarks,
 * `standard` / `legacy` appearances, vertical layout, and `disabledInteractive`.
 *
 * - **References**:
 *   - [MUI Toggle Button](https://mui.com/material-ui/react-toggle-button/)
 *   - [Material 3 Segmented Buttons](https://m3.material.io/components/segmented-buttons/overview)
 */
const meta: Meta<typeof MagicButtonToggle> = {
  title: 'Atoms/ButtonToggle',
  component: MagicButtonToggle,
  tags: ['autodocs', 'snapshot'],
  args: {
    ariaLabel: 'Text alignment',
    options: [
      { value: 'left', label: 'Left', icon: 'format_align_left' },
      { value: 'center', label: 'Center', icon: 'format_align_center' },
      { value: 'right', label: 'Right', icon: 'format_align_right' },
      { value: 'justify', label: 'Justify', disabled: true },
    ],
    defaultValue: 'left',
    selectionMode: 'single',
    vertical: false,
    appearance: 'standard',
    hideSelectionIndicator: false,
    disabled: false,
    disabledInteractive: false,
    size: 'md',
    color: 'primary',
    required: false,
    onChange: fn(),
  },
  argTypes: {
    options: { control: 'object', table: { category: 'Content' } },
    value: { control: 'object', table: { category: 'Content' } },
    defaultValue: { control: 'object', table: { category: 'Content' } },
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
    hideSelectionIndicator: {
      control: 'boolean',
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
    disabledInteractive: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'State' } },
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
type Story = StoryObj<typeof MagicButtonToggle>;

/**
 * Default single-select horizontal segmented toggle group with icons and a disabled item.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const centerBtn = canvas.getByRole('button', { name: 'Center' });
    await userEvent.click(centerBtn);
    await expect(centerBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onChange).toHaveBeenCalledWith('center');
  },
};

/**
 * Multiple-selection toggle group allowing independent activation of options.
 */
export const MultipleSelection: Story = {
  args: {
    ariaLabel: 'Text formatting',
    selectionMode: 'multiple',
    defaultValue: ['bold'],
    options: [
      { value: 'bold', label: 'Bold', icon: 'format_bold' },
      { value: 'italic', label: 'Italic', icon: 'format_italic' },
      { value: 'underline', label: 'Underline', icon: 'format_underlined' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const italicBtn = canvas.getByRole('button', { name: 'Italic' });
    await userEvent.click(italicBtn);
    await expect(args.onChange).toHaveBeenCalledWith(['bold', 'italic']);
  },
};

/**
 * Vertically stacked toggle group layout.
 */
export const Vertical: Story = {
  args: {
    vertical: true,
    defaultValue: 'center',
  },
};

/**
 * Comparison of `standard` (M3 tonal pill) vs. `legacy` (rectangular filled) appearances and hidden selection indicator.
 */
export const Appearances: Story = {
  render: () => (
    <Stack spacing={2}>
      <MagicButtonToggle
        appearance="standard"
        defaultValue="day"
        ariaLabel="Standard appearance"
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
      <MagicButtonToggle
        appearance="legacy"
        hideSelectionIndicator
        defaultValue="week"
        ariaLabel="Legacy appearance"
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
    </Stack>
  ),
};

/**
 * All seven semantic color intents rendered across segmented toggle groups.
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
      <Stack spacing={1.5}>
        {colors.map((color) => (
          <MagicButtonToggle
            key={color}
            color={color}
            defaultValue="on"
            ariaLabel={`${color} toggle`}
            options={[
              { value: 'on', label: color },
              { value: 'off', label: 'Alt' },
            ]}
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
        <MagicButtonToggle
          key={size}
          size={size}
          defaultValue="a"
          ariaLabel={`${size} toggle`}
          options={[
            { value: 'a', label: size.toUpperCase() },
            { value: 'b', label: 'Option' },
          ]}
        />
      ))}
    </Stack>
  ),
};

/**
 * Comparison of natively disabled toggle group vs. focusable `disabledInteractive`.
 */
export const DisabledAndDisabledInteractive: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => (
    <Stack spacing={2}>
      <MagicButtonToggle
        ariaLabel="Natively disabled"
        disabled
        defaultValue="a"
        options={[
          { value: 'a', label: 'Native A' },
          { value: 'b', label: 'Native B' },
        ]}
        onChange={args.onChange}
      />
      <MagicButtonToggle
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
    const nativeB = canvas.getByRole('button', { name: 'Native B' });
    const interactiveB = canvas.getByRole('button', { name: 'Interactive B' });
    await expect(nativeB).toBeDisabled();
    await expect(interactiveB).not.toBeDisabled();
    await expect(interactiveB).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactiveB);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
