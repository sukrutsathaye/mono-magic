import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { TabItem } from '@mono-magic/atomic-design-interfaces';
import { MagicTabs } from './tabs';

const DEFAULT_TABS: readonly TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'dashboard',
    content:
      'Unified Material 3 component contracts shared across React, Angular, React Native, and Flutter.',
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'notifications',
    badgeContent: 3,
    content: 'Recent visual regression snapshots and coverage runs.',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'tune',
    content: 'Configure palette overrides, density metrics, and a11y checks.',
  },
  {
    id: 'legacy',
    label: 'Legacy',
    icon: 'archive',
    disabled: true,
    content: 'Archived legacy configuration.',
  },
];

/**
 * `MagicTabs` is the Material 3 navigation tabs molecule composing MUI v9
 * `Tabs`/`Tab`, `MagicIcon`, `MagicBadge`, and accessible `tabpanel` regions.
 *
 * - **References**:
 *   - [Material 3 Tabs](https://m3.material.io/components/tabs/overview)
 *   - [MUI Tabs](https://mui.com/material-ui/react-tabs/)
 */
const meta: Meta<typeof MagicTabs> = {
  title: 'Molecules/Tabs',
  component: MagicTabs,
  tags: ['autodocs', 'snapshot'],
  args: {
    items: DEFAULT_TABS,
    orientation: 'horizontal',
    variant: 'primary',
    scrollable: false,
    lazy: false,
    color: 'primary',
    size: 'md',
    onTabChange: fn(),
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Content' } },
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
    scrollable: { control: 'boolean', table: { category: 'Behavior' } },
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
    onTabChange: { action: 'tabChanged', table: { category: 'Events' } },
    renderPanel: { control: false, table: { category: 'Slots' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicTabs>;

/**
 * Default primary horizontal tabs verifying tab switching and panel updates.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const activityTab = canvas.getByRole('tab', { name: /Activity/i });
    await userEvent.click(activityTab);
    await expect(args.onTabChange).toHaveBeenCalledWith(
      'activity',
      expect.objectContaining({ id: 'activity' }),
    );
    await expect(
      canvas.getByText('Recent visual regression snapshots and coverage runs.'),
    ).toBeVisible();
  },
};

/**
 * Secondary horizontal tab variant with inline icon+label alignment.
 */
export const SecondaryVariant: Story = {
  args: {
    variant: 'secondary',
    color: 'secondary',
    defaultActiveTabId: 'activity',
  },
};

/**
 * Vertical tab strip paired with side-by-side tab panel content.
 */
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    variant: 'secondary',
    color: 'tertiary',
  },
};

/**
 * Scrollable tab bar for narrow containers with many tab destinations.
 */
export const Scrollable: Story = {
  render: () => (
    <Stack sx={{ maxWidth: 420 }}>
      <MagicTabs
        scrollable
        items={Array.from({ length: 8 }, (_, index) => ({
          id: `step-${index + 1}`,
          label: `Section ${index + 1}`,
          content: `Content for scrollable section ${index + 1}.`,
        }))}
      />
    </Stack>
  ),
};
