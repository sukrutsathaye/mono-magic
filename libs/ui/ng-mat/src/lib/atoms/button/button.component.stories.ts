import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButtonComponent } from './button.component';

/**
 * `MagicButtonComponent` wraps Angular Material's button family (`matButton`,
 * `matIconButton`, `matFab`, `matMiniFab`) behind a single atomic design API.
 *
 * - **Content projection**: `<magic-button>Save</magic-button>` is primary; `label` is a fallback.
 * - **Theming**: `color`, `size` and `shape` flow through Material 3 `--mat-*` and `--magic-*` CSS custom properties with zero inline styles.
 * - **References**:
 *   - [Angular Material Button](https://material.angular.dev/components/button/overview)
 *   - [Material 3 Buttons](https://m3.material.io/components/buttons/overview)
 */
const meta: Meta<MagicButtonComponent> = {
  title: 'Atoms/Button',
  component: MagicButtonComponent,
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
    clicked: fn(),
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
      table: { category: 'Appearance' },
    },
    label: {
      control: 'text',
      table: { category: 'Content' },
    },
    loadingLabel: {
      control: 'text',
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
      table: { category: 'State' },
    },
    loading: {
      control: 'boolean',
      table: { category: 'State' },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      table: { category: 'Accessibility' },
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
    clicked: {
      action: 'clicked',
      table: { category: 'Events' },
    },
  },
};

export default meta;
type Story = StoryObj<MagicButtonComponent>;

/**
 * Default filled primary button with click event verification.
 *
 * Inputs: `variant="filled"`, `kind="default"`, `color="primary"`, `size="md"`, `label="Filled Button"`.
 */
export const Default: Story = {
  args: {
    label: 'Filled Button',
    variant: 'filled',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Filled Button' });
    await expect(btn).toBeEnabled();
    await userEvent.click(btn);
    await expect(args.clicked).toHaveBeenCalledTimes(1);
  },
};

/**
 * Medium-emphasis tonal button for secondary actions.
 *
 * Inputs: `variant="tonal"`, `label="Tonal Button"`.
 */
export const Tonal: Story = {
  args: { label: 'Tonal Button', variant: 'tonal' },
};

/**
 * Outlined button with a hairline border for lower-emphasis actions.
 *
 * Inputs: `variant="outlined"`, `label="Outlined Button"`.
 */
export const Outlined: Story = {
  args: { label: 'Outlined Button', variant: 'outlined' },
};

/**
 * Elevated button with subtle surface shadow over patterned backgrounds.
 *
 * Inputs: `variant="elevated"`, `label="Elevated Button"`.
 */
export const Elevated: Story = {
  args: { label: 'Elevated Button', variant: 'elevated' },
};

/**
 * Low-emphasis text button without container fill or border.
 *
 * Inputs: `variant="text"`, `label="Text Button"`.
 */
export const Text: Story = {
  args: { label: 'Text Button', variant: 'text' },
};

/**
 * Circular icon-only button using `ariaLabel` for accessible naming.
 *
 * Inputs: `kind="icon"`, `leadingIcon="favorite"`, `label=""`, `ariaLabel="Favorite"`.
 */
export const IconButton: Story = {
  args: {
    kind: 'icon',
    leadingIcon: 'favorite',
    label: '',
    ariaLabel: 'Favorite',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Favorite' }),
    ).toBeInTheDocument();
  },
};

/**
 * Standard Floating Action Button (FAB) for primary screen actions.
 *
 * Inputs: `kind="fab"`, `leadingIcon="add"`, `label=""`, `ariaLabel="Add item"`.
 */
export const Fab: Story = {
  args: { kind: 'fab', leadingIcon: 'add', label: '', ariaLabel: 'Add item' },
};

/**
 * Compact Mini FAB for secondary or tighter-space floating actions.
 *
 * Inputs: `kind="mini-fab"`, `leadingIcon="edit"`, `label=""`, `ariaLabel="Edit item"`.
 */
export const MiniFab: Story = {
  args: {
    kind: 'mini-fab',
    leadingIcon: 'edit',
    label: '',
    ariaLabel: 'Edit item',
  },
};

/**
 * Extended FAB pairing a leading icon with a descriptive label.
 *
 * Inputs: `kind="extended-fab"`, `leadingIcon="navigation"`, `label="Navigate"`.
 */
export const ExtendedFab: Story = {
  args: {
    kind: 'extended-fab',
    leadingIcon: 'navigation',
    label: 'Navigate',
  },
};

/**
 * Button displaying both leading and trailing Material icons around the label.
 *
 * Inputs: `label="Continue"`, `leadingIcon="check"`, `trailingIcon="arrow_forward"`.
 */
export const WithLeadingAndTrailingIcons: Story = {
  args: {
    label: 'Continue',
    leadingIcon: 'check',
    trailingIcon: 'arrow_forward',
  },
};

/**
 * Comparison of all five Material 3 size scale tokens.
 *
 * Inputs: `size="xs" | "sm" | "md" | "lg" | "xl"`.
 */
export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <magic-button size="xs" label="XS" />
        <magic-button size="sm" label="SM" />
        <magic-button size="md" label="MD" />
        <magic-button size="lg" label="LG" />
        <magic-button size="xl" label="XL" />
      </div>
    `,
  }),
};

/**
 * Comparison of all semantic palette color tokens.
 *
 * Inputs: `color="primary" | "secondary" | "tertiary" | "success" | "warning" | "error" | "neutral"`.
 */
export const Colors: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <magic-button color="primary" label="Primary" />
        <magic-button color="secondary" label="Secondary" />
        <magic-button color="tertiary" label="Tertiary" />
        <magic-button color="success" label="Success" />
        <magic-button color="warning" label="Warning" />
        <magic-button color="error" label="Error" />
        <magic-button color="neutral" label="Neutral" />
      </div>
    `,
  }),
};

/**
 * Comparison of available corner-radius shape overrides.
 *
 * Inputs: `shape="default" | "square" | "rounded" | "pill"`.
 */
export const Shapes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <magic-button shape="default" label="Default" />
        <magic-button shape="square" label="Square" />
        <magic-button shape="rounded" label="Rounded" />
        <magic-button shape="pill" label="Pill" />
      </div>
    `,
  }),
};

/**
 * Natively disabled button that prevents focus and click emission.
 *
 * Inputs: `label="Disabled"`, `disabled=true`.
 */
export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Disabled' });
    await expect(btn).toBeDisabled();
    await expect(args.clicked).not.toHaveBeenCalled();
  },
};

/**
 * Focusable disabled state using `aria-disabled="true"` for tooltips and screen readers.
 *
 * Inputs: `label="Disabled Interactive"`, `disabled=true`, `disabledInteractive=true`.
 */
export const DisabledInteractive: Story = {
  args: {
    label: 'Disabled Interactive',
    disabled: true,
    disabledInteractive: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Disabled Interactive' });
    await expect(btn).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(btn);
    await expect(args.clicked).not.toHaveBeenCalled();
  },
};

/**
 * Button with Material ripple ink effect suppressed.
 *
 * Inputs: `label="No Ripple"`, `disableRipple=true`.
 */
export const DisableRipple: Story = {
  args: { label: 'No Ripple', disableRipple: true },
};

/**
 * Busy loading state that sets `aria-busy="true"` and disables interaction.
 *
 * Inputs: `label="Save"`, `loading=true`.
 */
export const Loading: Story = {
  args: { label: 'Save', loading: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button');
    await expect(btn).toHaveAttribute('aria-busy', 'true');
    await expect(btn).toBeDisabled();
    await expect(args.clicked).not.toHaveBeenCalled();
  },
};

/**
 * Loading state displaying custom progress text via `loadingLabel`.
 *
 * Inputs: `label="Save"`, `loading=true`, `loadingLabel="Saving..."`.
 */
export const LoadingWithCustomLabel: Story = {
  args: { label: 'Save', loading: true, loadingLabel: 'Saving...' },
};

/**
 * Block-level button stretching to 100% of its container width.
 *
 * Inputs: `label="Full Width Action"`, `fullWidth=true`.
 */
export const FullWidth: Story = {
  args: { label: 'Full Width Action', fullWidth: true },
};

/**
 * Rich markup projected via `<ng-content>`, overriding the `label` fallback input.
 *
 * Inputs: `label="Ignored Fallback"`, projected `<magic-button>` children.
 */
export const ContentProjection: Story = {
  render: (args) => ({
    props: args,
    template: `
      <magic-button ${argsToTemplate(args)}>
        <strong>Projected</strong>&nbsp;Content
      </magic-button>
    `,
  }),
  args: { label: 'Ignored Fallback' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Projected/)).toBeInTheDocument();
  },
};

/**
 * Consolidated showcase across button variants, kinds, disabled, and loading states.
 *
 * Inputs: `variant`, `kind`, `disabled=true`, `loading=true`, `loadingLabel="Saving..."`.
 */
export const AllStatesGallery: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <magic-button variant="filled" label="Filled" />
          <magic-button variant="tonal" label="Tonal" />
          <magic-button variant="outlined" label="Outlined" />
          <magic-button variant="elevated" label="Elevated" />
          <magic-button variant="text" label="Text" />
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <magic-button kind="icon" leadingIcon="home" ariaLabel="Home" />
          <magic-button kind="mini-fab" leadingIcon="edit" ariaLabel="Edit" />
          <magic-button kind="fab" leadingIcon="add" ariaLabel="Add" />
          <magic-button kind="extended-fab" leadingIcon="send" label="Send" />
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <magic-button label="Disabled" [disabled]="true" />
          <magic-button label="Loading" [loading]="true" />
          <magic-button label="Saving..." [loading]="true" loadingLabel="Saving..." />
        </div>
      </div>
    `,
  }),
};
