import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicMenuComponent } from './menu.component';

/**
 * `MagicMenuComponent` wraps `mat-menu` with `magic-button` (button or icon
 * trigger), custom `[magicMenuTrigger]` slot support, link items, ARIA menu
 * roles, and arbitrary-depth nested submenus.
 *
 * - **References**:
 *   - [Angular Material Menu](https://material.angular.dev/components/menu/overview)
 *   - [Material 3 Menus](https://m3.material.io/components/menus/overview)
 */
const meta: Meta<MagicMenuComponent> = {
  title: 'Molecules/Menu',
  component: MagicMenuComponent,
  args: {
    triggerLabel: 'Actions',
    triggerType: 'button',
    triggerVariant: 'tonal',
    xPosition: 'after',
    yPosition: 'below',
    overlapTrigger: false,
    hasBackdrop: true,
    restoreFocus: true,
    disabled: false,
    size: 'md',
    color: 'primary',
    items: [
      { id: 'edit', label: 'Edit item', icon: 'edit' },
      { id: 'duplicate', label: 'Duplicate', icon: 'content_copy' },
      { id: 'archive', label: 'Archive', icon: 'archive', disabled: true },
    ],
    itemSelected: fn(),
    closed: fn(),
    opened: fn(),
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Data' } },
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
    overlapTrigger: { control: 'boolean', table: { category: 'Positioning' } },
    hasBackdrop: { control: 'boolean', table: { category: 'Positioning' } },
    backdropClass: { control: 'text', table: { category: 'Appearance' } },
    panelClass: { control: 'text', table: { category: 'Appearance' } },
    restoreFocus: { control: 'boolean', table: { category: 'Accessibility' } },
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
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    itemSelected: { action: 'itemSelected', table: { category: 'Events' } },
    closed: { action: 'closed', table: { category: 'Events' } },
    opened: { action: 'opened', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicMenuComponent>;

/**
 * Default tonal button menu with icons, a disabled option, and selection interaction test.
 *
 * Inputs: `triggerLabel="Actions"`, `triggerType="button"`, `triggerVariant="tonal"`, `items` (Edit item, Duplicate, Archive disabled).
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    const doc = within(document.body);
    await userEvent.click(doc.getByRole('menuitem', { name: /Edit item/i }));
    await expect(args.itemSelected).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'edit' }),
    );
  },
};

/**
 * Compact icon-button menu trigger using an accessible label.
 *
 * Inputs: `triggerType="icon"`, `triggerIcon="more_vert"`, `triggerLabel="More options"`.
 */
export const IconTrigger: Story = {
  args: {
    triggerType: 'icon',
    triggerIcon: 'more_vert',
    triggerLabel: 'More options',
  },
};

/**
 * Multi-level cascading submenu tree demonstrating arbitrary-depth nested `children`.
 *
 * Inputs: `triggerLabel="Share & Export"`, `triggerIcon="ios_share"`, nested `items` tree (3 levels).
 */
export const NestedSubmenu: Story = {
  args: {
    triggerLabel: 'Share & Export',
    triggerIcon: 'ios_share',
    items: [
      { id: 'download', label: 'Download PDF', icon: 'download' },
      {
        id: 'share',
        label: 'Share with',
        icon: 'group',
        children: [
          { id: 'email', label: 'Send via Email', icon: 'mail' },
          {
            id: 'workspace',
            label: 'Workspace',
            icon: 'workspaces',
            children: [
              { id: 'engineering', label: 'Engineering' },
              { id: 'design', label: 'Design Systems' },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Menu combining anchor link items with `menuitemradio` and `menuitemcheckbox` ARIA roles.
 *
 * Inputs: `triggerLabel="Resources"`, `triggerIcon="menu_book"`, `items` with `link` and `role` overrides.
 */
export const WithLinksAndIcons: Story = {
  args: {
    triggerLabel: 'Resources',
    triggerIcon: 'menu_book',
    items: [
      {
        id: 'material',
        label: 'Angular Material',
        icon: 'open_in_new',
        link: '#material',
      },
      {
        id: 'radio-a',
        label: 'Density: Comfortable',
        icon: 'view_agenda',
        role: 'menuitemradio',
      },
      {
        id: 'check-a',
        label: 'Show grid lines',
        icon: 'grid_on',
        role: 'menuitemcheckbox',
      },
    ],
  },
};

/**
 * Custom overlay alignment opening above and before the trigger without a backdrop.
 *
 * Inputs: `triggerLabel="Positioned Menu"`, `xPosition="before"`, `yPosition="above"`, `overlapTrigger=true`, `hasBackdrop=false`.
 */
export const Positions: Story = {
  args: {
    triggerLabel: 'Positioned Menu',
    xPosition: 'before',
    yPosition: 'above',
    overlapTrigger: true,
    hasBackdrop: false,
  },
};

/**
 * Disabled menu trigger preventing the menu overlay from opening.
 *
 * Inputs: `disabled=true`.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};
