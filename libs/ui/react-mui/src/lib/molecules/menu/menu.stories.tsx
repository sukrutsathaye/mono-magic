import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import type { MenuItem } from '@mono-magic/atomic-design-interfaces';
import { MagicMenu } from './menu';

const DEFAULT_ITEMS: readonly MenuItem[] = [
  { id: 'edit', label: 'Edit project', icon: 'edit' },
  { id: 'duplicate', label: 'Duplicate', icon: 'content_copy' },
  {
    id: 'export',
    label: 'Export as',
    icon: 'download',
    children: [
      { id: 'export-json', label: 'JSON tokens', icon: 'code' },
      { id: 'export-css', label: 'CSS variables', icon: 'css' },
    ],
  },
  { id: 'archive', label: 'Archive', icon: 'archive', disabled: true },
];

/**
 * `MagicMenu` is the Material 3 dropdown menu molecule composing `MagicButton`
 * (or custom trigger nodes) and MUI v9 `Menu` with recursive nested submenus (`item.children`).
 *
 * - **References**:
 *   - [Material 3 Menus](https://m3.material.io/components/menus/overview)
 *   - [MUI Menu](https://mui.com/material-ui/react-menu/)
 */
const meta: Meta<typeof MagicMenu> = {
  title: 'Molecules/Menu',
  component: MagicMenu,
  tags: ['autodocs', 'snapshot'],
  args: {
    items: DEFAULT_ITEMS,
    triggerLabel: 'Actions',
    triggerIcon: 'more_vert',
    triggerType: 'button',
    triggerVariant: 'tonal',
    xPosition: 'after',
    yPosition: 'below',
    overlapTrigger: false,
    hasBackdrop: true,
    disabled: false,
    size: 'md',
    color: 'primary',
    onItemSelect: fn(),
    onMenuOpen: fn(),
    onMenuClose: fn(),
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Content' } },
    triggerLabel: { control: 'text', table: { category: 'Trigger' } },
    triggerIcon: { control: 'text', table: { category: 'Trigger' } },
    triggerType: {
      control: 'select',
      options: ['button', 'icon'],
      table: { category: 'Trigger' },
    },
    triggerVariant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
      table: { category: 'Trigger' },
    },
    xPosition: {
      control: 'select',
      options: ['before', 'after'],
      table: { category: 'Positioning' },
    },
    yPosition: {
      control: 'select',
      options: ['above', 'below'],
      table: { category: 'Positioning' },
    },
    overlapTrigger: {
      control: 'boolean',
      table: { category: 'Positioning' },
    },
    hasBackdrop: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
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
    disabled: { control: 'boolean', table: { category: 'State' } },
    panelClass: { control: 'text', table: { category: 'Appearance' } },
    backdropClass: { control: 'text', table: { category: 'Appearance' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onItemSelect: { action: 'itemSelected', table: { category: 'Events' } },
    onMenuOpen: { action: 'menuOpened', table: { category: 'Events' } },
    onMenuClose: { action: 'menuClosed', table: { category: 'Events' } },
    customTrigger: { control: false, table: { category: 'Trigger' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicMenu>;

/**
 * Default button-triggered menu verifying opening and selecting a leaf action.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await expect(args.onMenuOpen).toHaveBeenCalled();

    const editItem = await screen.findByRole('menuitem', {
      name: /Edit project/i,
    });
    await userEvent.click(editItem);
    await expect(args.onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'edit', label: 'Edit project' }),
    );
  },
};

/**
 * Icon-only trigger button (`triggerType="icon"`).
 */
export const IconTrigger: Story = {
  args: {
    triggerType: 'icon',
    triggerIcon: 'more_vert',
    ariaLabel: 'More options',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'More options' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  },
};

/**
 * Menu with multi-level recursive submenus (`item.children`).
 */
export const NestedSubmenus: Story = {
  args: {
    triggerLabel: 'File Menu',
    triggerIcon: 'folder',
    items: [
      { id: 'new', label: 'New File', icon: 'note_add' },
      {
        id: 'share',
        label: 'Share',
        icon: 'share',
        children: [
          { id: 'copy-link', label: 'Copy link', icon: 'link' },
          { id: 'email-invite', label: 'Email invite', icon: 'mail' },
        ],
      },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'File Menu' }));
    const shareBranch = await screen.findByRole('menuitem', {
      name: /Share/i,
    });
    await userEvent.click(shareBranch);
    const copyLink = await screen.findByRole('menuitem', {
      name: /Copy link/i,
    });
    await userEvent.click(copyLink);
    await expect(args.onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'copy-link', label: 'Copy link' }),
    );
  },
};

/**
 * Comparison of menu trigger sizes (`xs`..`xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicMenu
          key={size}
          size={size}
          triggerLabel={`Size ${size.toUpperCase()}`}
          items={DEFAULT_ITEMS}
        />
      ))}
    </Stack>
  ),
};

/**
 * Showcase of semantic color intents on the menu trigger button.
 */
export const Colors: Story = {
  render: () => (
    <Stack
      direction="row"
      spacing={1.5}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'center' }}
    >
      {(
        [
          'primary',
          'secondary',
          'tertiary',
          'success',
          'warning',
          'error',
          'neutral',
        ] as const
      ).map((color) => (
        <MagicMenu
          key={color}
          color={color}
          triggerLabel={color}
          items={DEFAULT_ITEMS}
        />
      ))}
    </Stack>
  ),
};

/**
 * Disabled menu trigger preventing opening the menu panel.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    triggerLabel: 'Locked Menu',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Locked Menu' }),
    ).toBeDisabled();
  },
};
