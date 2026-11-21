import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicMenu, type MenuItem } from './menu';

const DEFAULT_MENU_ITEMS: readonly MenuItem[] = [
  { id: 'edit', label: 'Edit Item', icon: 'edit' },
  { id: 'duplicate', label: 'Duplicate', icon: 'content_copy' },
  {
    id: 'share',
    label: 'Share',
    icon: 'share',
    children: [
      { id: 'copy-link', label: 'Copy Link', icon: 'link' },
      { id: 'email', label: 'Send via Email', icon: 'mail' },
    ],
  },
  { id: 'archive', label: 'Archive', icon: 'archive', disabled: true },
  { id: 'delete', label: 'Delete', icon: 'delete' },
];

/**
 * `MagicMenu` is the Material 3 dropdown action menu molecule for `@mono-magic/rn-paper`.
 *
 * It composes `MagicButton` (or a custom `triggerSlot`) with an accessible `role="menu"`
 * popover surface supporting `xPosition`, `yPosition`, `overlapTrigger`, backdrop
 * click-away, keyboard dismissal (`Escape` / `Tab`), and recursive submenu drill-down.
 *
 * - **References**:
 *   - [Material 3 Menus](https://m3.material.io/components/menus/overview)
 *   - [React Native Paper Menu](https://callstack.github.io/react-native-paper/docs/components/Menu)
 */
const meta: Meta<typeof MagicMenu> = {
  title: 'Molecules/Menu',
  component: MagicMenu,
  tags: ['autodocs', 'snapshot'],
  args: {
    items: DEFAULT_MENU_ITEMS,
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
    triggerLabel: { control: 'text', table: { category: 'Trigger' } },
    triggerIcon: { control: 'text', table: { category: 'Trigger' } },
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
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    items: { control: 'object', table: { category: 'Content' } },
    triggerSlot: { control: false, table: { category: 'Slots' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onItemSelect: { action: 'itemSelected', table: { category: 'Events' } },
    onMenuOpen: { action: 'menuOpened', table: { category: 'Events' } },
    onMenuClose: { action: 'menuClosed', table: { category: 'Events' } },
  },
  render: (args) => (
    <View style={{ minHeight: 260, alignItems: 'flex-start' }}>
      <MagicMenu {...args} />
    </View>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicMenu>;

/**
 * Default button-triggered menu with play test opening the menu and selecting a leaf item.
 *
 * Props: `triggerType="button"`, `triggerLabel="Actions"`.
 */
export const ButtonTrigger: Story = {
  args: {
    testId: 'story-menu',
    triggerType: 'button',
    triggerLabel: 'Actions',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await expect(args.onMenuOpen).toHaveBeenCalledTimes(1);

    const editItem = canvas.getByRole('menuitem', { name: 'Edit Item' });
    await userEvent.click(editItem);
    await expect(args.onItemSelect).toHaveBeenCalledWith(DEFAULT_MENU_ITEMS[0]);
    await expect(args.onMenuClose).toHaveBeenCalledWith('click');
  },
};

/**
 * Icon-button trigger (`triggerType="icon"`) rendering a compact overflow icon button.
 *
 * Props: `triggerType="icon"`, `triggerIcon="more_vert"`, `ariaLabel="More options"`.
 */
export const IconTrigger: Story = {
  args: {
    triggerType: 'icon',
    triggerIcon: 'more_vert',
    ariaLabel: 'More options',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const iconBtn = canvas.getByRole('button', { name: 'More options' });
    await userEvent.click(iconBtn);
    await expect(args.onMenuOpen).toHaveBeenCalled();
  },
};

/**
 * Nested submenu drill-down verifying parent item chevron and child selection.
 */
export const NestedSubmenu: Story = {
  args: {
    triggerLabel: 'Share Menu',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Share Menu' }));
    const shareParent = canvas.getByRole('menuitem', { name: 'Share' });
    await userEvent.click(shareParent);

    const copyLinkItem = canvas.getByRole('menuitem', { name: 'Copy Link' });
    await userEvent.click(copyLinkItem);
    await expect(args.onItemSelect).toHaveBeenCalledWith(
      DEFAULT_MENU_ITEMS[2].children?.[0]
    );
  },
};

/**
 * Comparison of all 5 trigger size tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: (args) => (
    <View
      style={{
        minHeight: 260,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <MagicMenu {...args} size="xs" triggerLabel="XS" />
      <MagicMenu {...args} size="sm" triggerLabel="SM" />
      <MagicMenu {...args} size="md" triggerLabel="MD" />
      <MagicMenu {...args} size="lg" triggerLabel="LG" />
      <MagicMenu {...args} size="xl" triggerLabel="XL" />
    </View>
  ),
};

/**
 * Comparison of semantic color intents (`primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, `neutral`).
 */
export const Colors: Story = {
  render: (args) => (
    <View
      style={{
        minHeight: 260,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <MagicMenu {...args} color="primary" triggerLabel="Primary" />
      <MagicMenu {...args} color="secondary" triggerLabel="Secondary" />
      <MagicMenu {...args} color="tertiary" triggerLabel="Tertiary" />
      <MagicMenu {...args} color="success" triggerLabel="Success" />
      <MagicMenu {...args} color="warning" triggerLabel="Warning" />
      <MagicMenu {...args} color="error" triggerLabel="Error" />
      <MagicMenu {...args} color="neutral" triggerLabel="Neutral" />
    </View>
  ),
};

/**
 * Disabled menu trigger preventing the menu panel from opening.
 *
 * Props: `disabled=true`.
 */
export const Disabled: Story = {
  args: {
    triggerLabel: 'Locked Menu',
    disabled: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Locked Menu' });
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await expect(args.onMenuOpen).not.toHaveBeenCalled();
  },
};

/**
 * Menu rendered in an open state inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: (args) => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          minHeight: 280,
          alignItems: 'flex-start',
        }}
      >
        <MagicMenu
          {...args}
          defaultOpen
          hasBackdrop={false}
          triggerLabel="Dark Menu"
        />
      </View>
    </MagicPaperProvider>
  ),
};
