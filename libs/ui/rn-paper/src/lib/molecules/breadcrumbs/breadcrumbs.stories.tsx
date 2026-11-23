import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicBreadcrumbs, type BreadcrumbItem } from './breadcrumbs';

const FULL_TRAIL: readonly BreadcrumbItem[] = [
  { id: 'home', label: 'Workspace', icon: 'home', href: '/' },
  { id: 'libs', label: 'Libs', href: '/libs' },
  { id: 'ui', label: 'UI', href: '/libs/ui' },
  { id: 'rn-paper', label: 'RN Paper', href: '/libs/ui/rn-paper' },
  { id: 'molecules', label: 'Molecules', current: true },
];

/**
 * `MagicBreadcrumbs` is the Material 3 breadcrumb navigation molecule for `@mono-magic/rn-paper`.
 *
 * It supports leading icons per crumb, custom string or Material icon separators,
 * `maxItems` ellipsis collapse/expand, disabled items, and current-page semantics.
 */
const meta: Meta<typeof MagicBreadcrumbs> = {
  title: 'Molecules/Breadcrumbs',
  component: MagicBreadcrumbs,
  tags: ['autodocs', 'snapshot'],
  args: {
    items: FULL_TRAIL,
    separator: 'chevron_right',
    color: 'primary',
    size: 'md',
    disabled: false,
    onItemPress: fn(),
  },
  argTypes: {
    separator: { control: 'text', table: { category: 'Appearance' } },
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
    maxItems: { control: 'number', table: { category: 'Behavior' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    onItemPress: { action: 'itemPressed', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicBreadcrumbs>;

function InteractiveTrailDemo(args: React.ComponentProps<typeof MagicBreadcrumbs>) {
  const [activeLength, setActiveLength] = useState(FULL_TRAIL.length);
  const items = FULL_TRAIL.slice(0, activeLength).map((item, idx, arr) => ({
    ...item,
    current: idx === arr.length - 1,
  }));

  return (
    <View style={{ gap: 10 }}>
      <MagicBreadcrumbs
        testId="story-breadcrumbs"
        items={items}
        separator="chevron_right"
        onItemPress={(item, index) => {
          setActiveLength(index + 1);
          args.onItemPress?.(item, index);
        }}
      />
      <Text testID="story-breadcrumbs-location">
        {`Current location: ${items[items.length - 1]?.label ?? ''}`}
      </Text>
    </View>
  );
}

/**
 * Interactive breadcrumb trail where clicking any ancestor updates the active trail.
 */
export const InteractiveTrail: Story = {
  render: (args) => <InteractiveTrailDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('story-breadcrumbs-item-ui'));
    await expect(args.onItemPress).toHaveBeenCalled();
    await expect(
      canvas.getByTestId('story-breadcrumbs-location')
    ).toHaveTextContent('Current location: UI');
  },
};

/**
 * Collapsed breadcrumb trail (`maxItems={3}`) expanding middle items on ellipsis click.
 */
export const CollapsedWithEllipsis: Story = {
  args: {
    testId: 'collapsed-breadcrumbs',
    maxItems: 3,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 2,
    separator: '/',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Libs')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByTestId('collapsed-breadcrumbs-expand')
    );
    await expect(canvas.getByText('Libs')).toBeInTheDocument();
  },
};

/**
 * Breadcrumbs showing disabled segments and multiple density sizes.
 */
export const DisabledAndSizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <MagicBreadcrumbs
        size="sm"
        separator=">"
        items={[
          { id: '1', label: 'Root', icon: 'folder' },
          { id: '2', label: 'Restricted', disabled: true },
          { id: '3', label: 'Settings', current: true },
        ]}
      />
      <MagicBreadcrumbs
        size="lg"
        color="secondary"
        items={FULL_TRAIL.slice(0, 3)}
      />
    </View>
  ),
};

/**
 * Breadcrumbs rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12 }}>
        <MagicBreadcrumbs items={FULL_TRAIL} separator="chevron_right" />
      </View>
    </MagicPaperProvider>
  ),
};
