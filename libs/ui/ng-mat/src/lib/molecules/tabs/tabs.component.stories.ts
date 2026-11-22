import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicTabsComponent } from './tabs.component';

/**
 * `MagicTabsComponent` wraps Angular Material `MatTabGroup` for horizontal
 * tabs and provides an accessible vertical WAI-ARIA `tablist` with keyboard
 * navigation (`ArrowUp`/`ArrowDown`/`Home`/`End`), supporting icons, badges,
 * scrollable tab headers, lazy panels, and `[magicTabPanel]` templates.
 *
 * - **References**:
 *   - [Angular Material Tabs](https://material.angular.dev/components/tabs/overview)
 *   - [Material 3 Tabs](https://m3.material.io/components/tabs/overview)
 */
const meta: Meta<MagicTabsComponent> = {
  title: 'Molecules/Tabs',
  component: MagicTabsComponent,
  args: {
    orientation: 'horizontal',
    variant: 'primary',
    scrollable: false,
    lazy: false,
    color: 'primary',
    size: 'md',
    defaultActiveTabId: 'overview',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: 'dashboard',
        content: 'Summary metrics and workspace health indicators.',
      },
      {
        id: 'notifications',
        label: 'Alerts',
        icon: 'notifications',
        badgeContent: 3,
        content: 'Three recent pipeline alerts require review.',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        content: 'Configure theme palettes and CI notifications.',
      },
      {
        id: 'billing',
        label: 'Billing',
        disabled: true,
        content: 'Enterprise billing portal.',
      },
    ],
    activeTabChange: fn(),
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Data' } },
    activeTabId: { control: 'text', table: { category: 'State' } },
    defaultActiveTabId: { control: 'text', table: { category: 'State' } },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      table: { category: 'Appearance' },
    },
    scrollable: { control: 'boolean', table: { category: 'Layout' } },
    lazy: { control: 'boolean', table: { category: 'Behavior' } },
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
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    activeTabChange: { action: 'activeTabChange', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicTabsComponent>;

/**
 * Default horizontal primary tabs with icons, badge, disabled tab, and tab switch interaction test.
 *
 * Inputs: `orientation="horizontal"`, `variant="primary"`, `items` (Overview, Alerts with badge, Settings, Billing disabled).
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /Alerts/i }));
    await expect(args.activeTabChange).toHaveBeenCalledWith('notifications');
  },
};

/**
 * Vertical tab strip with keyboard navigation (`ArrowDown`/`ArrowUp`/`Home`/`End`).
 *
 * Inputs: `orientation="vertical"`, `color="secondary"`, `defaultActiveTabId="overview"`.
 */
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    color: 'secondary',
    ariaLabel: 'Account sections',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /Settings/i }));
    await expect(args.activeTabChange).toHaveBeenCalledWith('settings');
  },
};

/**
 * Scrollable horizontal tabs with secondary indicator styling.
 *
 * Inputs: `scrollable=true`, `variant="secondary"`, 7 tab items.
 */
export const ScrollableSecondary: Story = {
  args: {
    scrollable: true,
    variant: 'secondary',
    items: Array.from({ length: 7 }, (_, i) => ({
      id: `tab-${i + 1}`,
      label: `Section ${i + 1}`,
      content: `Content for section ${i + 1}.`,
    })),
  },
};
