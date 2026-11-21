import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicIcon } from '../../core/icon';
import { MagicButton } from './button';

/**
 * `MagicButton` wraps MUI's button family (`Button`, `IconButton`, `Fab`) behind
 * a single Material 3 atomic design API.
 *
 * - **Variants**: `filled`, `tonal`, `outlined`, `elevated`, `text`.
 * - **Kinds**: `default`, `icon`, `fab`, `mini-fab`, `extended-fab`.
 * - **Shapes & Sizes**: `default` / `square` / `rounded` / `pill` and `xs`..`xl`.
 * - **References**:
 *   - [MUI Button](https://mui.com/material-ui/react-button/)
 *   - [MUI Floating Action Button](https://mui.com/material-ui/react-floating-action-button/)
 *   - [Material 3 Buttons](https://m3.material.io/components/buttons/overview)
 */
const meta: Meta<typeof MagicButton> = {
  title: 'Atoms/Button',
  component: MagicButton,
  args: {
    label: 'Button',
    variant: 'filled',
    kind: 'default',
    shape: 'default',
    color: 'primary',
    size: 'md',
    disabled: false,
    disabledInteractive: false,
    disableRipple: false,
    loading: false,
    fullWidth: false,
    type: 'button',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
      table: { category: 'Appearance' },
    },
    kind: {
      control: 'select',
      options: ['default', 'icon', 'fab', 'mini-fab', 'extended-fab'],
      table: { category: 'Appearance' },
    },
    shape: {
      control: 'select',
      options: ['default', 'square', 'rounded', 'pill'],
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
    fullWidth: {
      control: 'boolean',
      table: { category: 'Layout' },
    },
    label: {
      control: 'text',
      table: { category: 'Content' },
    },
    loadingLabel: {
      control: 'text',
      table: { category: 'Content' },
    },
    children: {
      control: false,
      table: { category: 'Content' },
    },
    leadingIcon: {
      control: 'text',
      table: { category: 'Icons' },
    },
    trailingIcon: {
      control: 'text',
      table: { category: 'Icons' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disabledInteractive: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disableRipple: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    loading: {
      control: 'boolean',
      table: { category: 'State' },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      table: { category: 'Behavior' },
    },
    id: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    testId: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    onClick: {
      action: 'clicked',
      table: { category: 'Events' },
    },
    sx: { control: false, table: { category: 'Appearance' } },
    slotProps: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicButton>;

/**
 * Default filled primary button with click interaction verification.
 */
export const Default: Story = {
  args: {
    label: 'Filled Button',
    variant: 'filled',
    color: 'primary',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Filled Button' });
    await expect(btn).toBeEnabled();
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * All five Material 3 emphasis variants (`filled`, `tonal`, `outlined`, `elevated`, `text`).
 */
export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <MagicButton variant="filled" label="Filled" />
      <MagicButton variant="tonal" label="Tonal" />
      <MagicButton variant="outlined" label="Outlined" />
      <MagicButton variant="elevated" label="Elevated" />
      <MagicButton variant="text" label="Text" />
    </Stack>
  ),
};

/**
 * All seven semantic palette color intents across filled and tonal surfaces.
 */
export const Colors: Story = {
  render: () => {
    const intents = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ] as const;

    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {intents.map((color) => (
            <MagicButton
              key={`filled-${color}`}
              variant="filled"
              color={color}
              label={color.charAt(0).toUpperCase() + color.slice(1)}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {intents.map((color) => (
            <MagicButton
              key={`tonal-${color}`}
              variant="tonal"
              color={color}
              label={`${color.charAt(0).toUpperCase() + color.slice(1)} Tonal`}
            />
          ))}
        </Stack>
      </Stack>
    );
  },
};

/**
 * Comparison of all five atomic size tokens (`xs`, `sm`, `md`, `lg`, `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack
      direction="row"
      spacing={1.5}
      useFlexGap
      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      <MagicButton size="xs" label="XS" />
      <MagicButton size="sm" label="SM" />
      <MagicButton size="md" label="MD" />
      <MagicButton size="lg" label="LG" />
      <MagicButton size="xl" label="XL" />
    </Stack>
  ),
};

/**
 * Corner radius overrides (`default`, `square`, `rounded`, `pill`).
 */
export const Shapes: Story = {
  render: () => (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <MagicButton shape="default" label="Default" />
      <MagicButton shape="square" label="Square" />
      <MagicButton shape="rounded" label="Rounded" />
      <MagicButton shape="pill" label="Pill" />
    </Stack>
  ),
};

/**
 * All five structural button kinds (`default`, `icon`, `fab`, `mini-fab`, `extended-fab`).
 */
export const Kinds: Story = {
  render: () => (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      <MagicButton kind="default" label="Default" />
      <MagicButton
        kind="icon"
        variant="tonal"
        leadingIcon="favorite"
        ariaLabel="Favorite"
      />
      <MagicButton
        kind="mini-fab"
        variant="tonal"
        color="secondary"
        leadingIcon="edit"
        ariaLabel="Edit item"
      />
      <MagicButton
        kind="fab"
        color="primary"
        leadingIcon="add"
        ariaLabel="Add item"
      />
      <MagicButton
        kind="extended-fab"
        variant="tonal"
        color="tertiary"
        leadingIcon="navigation"
        label="Navigate"
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Favorite' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Add item' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /Navigate/ }),
    ).toBeInTheDocument();
  },
};

/**
 * Leading and trailing icons supplied either as Material Icons strings or custom React nodes.
 */
export const WithIcons: Story = {
  render: () => (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <MagicButton leadingIcon="check" label="Confirm" />
      <MagicButton
        variant="outlined"
        trailingIcon="arrow_forward"
        label="Next"
      />
      <MagicButton
        variant="tonal"
        leadingIcon="cloud_upload"
        trailingIcon="arrow_drop_down"
        label="Upload"
      />
      <MagicButton
        variant="elevated"
        leadingIcon={<MagicIcon icon="auto_awesome" size="md" />}
        label="Custom Node"
      />
    </Stack>
  ),
};

/**
 * Native loading states across default, custom `loadingLabel`, icon, and FAB buttons.
 */
export const Loading: Story = {
  render: () => (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      <MagicButton label="Save" loading />
      <MagicButton label="Save" loading loadingLabel="Saving..." />
      <MagicButton
        kind="icon"
        variant="tonal"
        leadingIcon="refresh"
        ariaLabel="Refreshing"
        loading
      />
      <MagicButton
        kind="extended-fab"
        leadingIcon="send"
        label="Send"
        loading
        loadingLabel="Sending..."
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    for (const button of buttons) {
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button).toBeDisabled();
    }
    await expect(canvas.getByText('Saving...')).toBeInTheDocument();
    await expect(canvas.getByText('Sending...')).toBeInTheDocument();
  },
};

/**
 * Comparison of natively disabled buttons vs. focusable `disabledInteractive` buttons.
 */
export const DisabledAndDisabledInteractive: Story = {
  args: {
    onClick: fn(),
  },
  render: (args) => (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <MagicButton
        label="Natively Disabled"
        disabled
        onClick={args.onClick}
      />
      <MagicButton
        label="Disabled Interactive"
        disabled
        disabledInteractive
        onClick={args.onClick}
      />
      <MagicButton
        label="No Ripple"
        disableRipple
        variant="outlined"
      />
    </Stack>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const nativeBtn = canvas.getByRole('button', {
      name: 'Natively Disabled',
    });
    const interactiveBtn = canvas.getByRole('button', {
      name: 'Disabled Interactive',
    });
    await expect(nativeBtn).toBeDisabled();
    await expect(interactiveBtn).not.toBeDisabled();
    await expect(interactiveBtn).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactiveBtn);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/**
 * Full-width block button expanding across its container width.
 */
export const FullWidth: Story = {
  args: {
    label: 'Full Width Primary Action',
    fullWidth: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <MagicButton {...args} />
    </div>
  ),
};

/**
 * Rich JSX children overriding the `label` fallback prop.
 */
export const CustomChildren: Story = {
  args: {
    label: 'Ignored Fallback',
    variant: 'tonal',
    color: 'tertiary',
  },
  render: (args) => (
    <MagicButton {...args}>
      <Typography component="span" sx={{ fontWeight: 700, mr: 0.5 }}>
        Projected
      </Typography>
      Content
    </MagicButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Projected')).toBeInTheDocument();
    await expect(canvas.queryByText('Ignored Fallback')).not.toBeInTheDocument();
  },
};
