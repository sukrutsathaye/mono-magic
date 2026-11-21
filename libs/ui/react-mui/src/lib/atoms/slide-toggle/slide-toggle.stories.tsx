import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicSlideToggle } from './slide-toggle';

/**
 * `MagicSlideToggle` wraps MUI's `Switch` with Material 3 thumb icons,
 * controlled/uncontrolled state, `before`/`after` label placement, all 5
 * atomic sizes, all 7 semantic color intents, and `disabledInteractive`.
 *
 * - **References**:
 *   - [MUI Switch](https://mui.com/material-ui/react-switch/)
 *   - [Material 3 Switch](https://m3.material.io/components/switch/overview)
 */
const meta: Meta<typeof MagicSlideToggle> = {
  title: 'Atoms/SlideToggle',
  component: MagicSlideToggle,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'Enable notifications',
    defaultChecked: false,
    required: false,
    hideIcon: false,
    labelPosition: 'after',
    disableRipple: false,
    disabled: false,
    disabledInteractive: false,
    color: 'primary',
    size: 'md',
    onChange: fn(),
    onToggleChange: fn(),
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    children: { control: false, table: { category: 'Content' } },
    checked: { control: 'boolean', table: { category: 'State' } },
    defaultChecked: { control: 'boolean', table: { category: 'State' } },
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
    hideIcon: { control: 'boolean', table: { category: 'Appearance' } },
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
    onToggleChange: { action: 'toggled', table: { category: 'Behavior' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicSlideToggle>;

/**
 * Default off-state slide toggle with click interaction verification.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith(true);
    await expect(args.onToggleChange).toHaveBeenCalledTimes(1);
  },
};

/**
 * Pre-checked toggle and toggle with thumb icons hidden (`hideIcon`).
 */
export const CheckedAndHideIcon: Story = {
  render: () => (
    <Stack direction="row" spacing={3} useFlexGap sx={{ alignItems: 'center' }}>
      <MagicSlideToggle label="With icon" defaultChecked />
      <MagicSlideToggle label="Icon hidden" defaultChecked hideIcon />
    </Stack>
  ),
};

/**
 * Label placed before the switch track (`labelPosition="before"`).
 */
export const LabelBefore: Story = {
  args: {
    label: 'Label before switch',
    labelPosition: 'before',
    defaultChecked: true,
  },
};

/**
 * All seven semantic palette color intents in the checked state.
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
      <Stack direction="row" spacing={2.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {colors.map((color) => (
          <MagicSlideToggle
            key={color}
            color={color}
            defaultChecked
            label={color}
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
    <Stack direction="row" spacing={2.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicSlideToggle
          key={size}
          size={size}
          defaultChecked
          label={size.toUpperCase()}
        />
      ))}
    </Stack>
  ),
};

/**
 * Comparison of natively disabled toggle vs. focusable `disabledInteractive`.
 */
export const DisabledAndDisabledInteractive: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => (
    <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <MagicSlideToggle
        label="Natively Disabled"
        disabled
        defaultChecked
        onChange={args.onChange}
      />
      <MagicSlideToggle
        label="Disabled Interactive"
        disabled
        disabledInteractive
        defaultChecked={false}
        onChange={args.onChange}
      />
    </Stack>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const nativeSwitch = canvas.getByRole('switch', {
      name: 'Natively Disabled',
    });
    const interactiveSwitch = canvas.getByRole('switch', {
      name: 'Disabled Interactive',
    });
    await expect(nativeSwitch).toBeDisabled();
    await expect(interactiveSwitch).not.toBeDisabled();
    await expect(interactiveSwitch).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactiveSwitch);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Custom JSX label projected as `children` overriding `label`.
 */
export const CustomChildren: Story = {
  render: () => (
    <MagicSlideToggle defaultChecked>
      <Typography component="span" sx={{ fontWeight: 700, mr: 0.5 }}>
        Rich
      </Typography>
      switch label
    </MagicSlideToggle>
  ),
};
