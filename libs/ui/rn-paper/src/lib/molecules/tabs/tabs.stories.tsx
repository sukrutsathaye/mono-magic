import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicTabs, type TabItem } from './tabs';

const SAMPLE_TABS: readonly TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'dashboard',
    content:
      'Workspace overview showing active packages, build health, and shared tokens.',
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'notifications',
    badgeContent: 3,
    content: 'Recent commits, Storybook visual snapshots, and pipeline runs.',
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'lock',
    disabled: true,
    content: 'Restricted section.',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    content: 'Configure Material 3 palette, font scaling, and density tokens.',
  },
];

/**
 * `MagicTabs` is the Material 3 navigation tabs molecule for `@mono-magic/rn-paper`.
 *
 * It supports `horizontal` and `vertical` orientations, `primary` and `secondary`
 * M3 tab layouts, `MagicBadge` counters, scrollable tab strips, lazy panel mounting,
 * and keyboard arrow/Home/End navigation.
 */
const meta: Meta<typeof MagicTabs> = {
  title: 'Molecules/Tabs',
  component: MagicTabs,
  tags: ['autodocs', 'snapshot'],
  args: {
    items: SAMPLE_TABS,
    defaultActiveTabId: 'overview',
    orientation: 'horizontal',
    variant: 'primary',
    scrollable: false,
    lazy: false,
    color: 'primary',
    size: 'md',
    onTabChange: fn(),
  },
  argTypes: {
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
    scrollable: { control: 'boolean', table: { category: 'Behavior' } },
    lazy: { control: 'boolean', table: { category: 'Behavior' } },
    items: { control: 'object', table: { category: 'Content' } },
    onTabChange: { action: 'tabChanged', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicTabs>;

/**
 * Default primary horizontal tabs with interactive tab switching test.
 */
export const Default: Story = {
  args: {
    testId: 'story-tabs',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const activityTab = canvas.getByRole('tab', { name: /Activity/ });
    await userEvent.click(activityTab);
    await expect(args.onTabChange).toHaveBeenCalledWith(
      'activity',
      SAMPLE_TABS[1]
    );
    await expect(activityTab).toHaveAttribute('aria-selected', 'true');
  },
};

/**
 * Vertical secondary tabs with custom panel renderer.
 */
export const VerticalSecondary: Story = {
  args: {
    orientation: 'vertical',
    variant: 'secondary',
    color: 'secondary',
  },
  render: (args) => (
    <MagicTabs
      {...args}
      renderPanel={(item) => (
        <View style={{ gap: 4 }}>
          <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.label}</Text>
          <Text style={{ fontSize: 14, color: '#44474e' }}>{item.content}</Text>
        </View>
      )}
    />
  ),
};

/**
 * Tabs rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12 }}>
        <MagicTabs items={SAMPLE_TABS} color="primary" />
      </View>
    </MagicPaperProvider>
  ),
};
