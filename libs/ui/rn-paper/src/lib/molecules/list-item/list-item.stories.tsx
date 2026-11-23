import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicListItem } from './list-item';

/**
 * `MagicListItem` is the Material 3 list row molecule for `@mono-magic/rn-paper`.
 *
 * It supports overline, primary, and secondary text, leading icons or `MagicAvatar`
 * thumbnails, trailing metadata/badges/icons, `'standard' | 'outlined' | 'filled'`
 * appearances, dense spacing, dividers, and selectable/interactive row states.
 */
const meta: Meta<typeof MagicListItem> = {
  title: 'Molecules/ListItem',
  component: MagicListItem,
  tags: ['autodocs', 'snapshot'],
  args: {
    primaryText: 'Design Tokens & Theme',
    secondaryText: 'Manage Material 3 palettes and typography scales',
    overlineText: 'CONFIGURATION',
    leadingIcon: 'palette',
    trailingIcon: 'chevron_right',
    appearance: 'standard',
    color: 'primary',
    size: 'md',
    interactive: true,
    selectable: false,
    selected: false,
    disabled: false,
    divider: true,
    dense: false,
    onPress: fn(),
    onSelectedChange: fn(),
  },
  argTypes: {
    appearance: {
      control: 'select',
      options: ['standard', 'outlined', 'filled'],
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
    interactive: { control: 'boolean', table: { category: 'Behavior' } },
    selectable: { control: 'boolean', table: { category: 'Behavior' } },
    selected: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    divider: { control: 'boolean', table: { category: 'Layout' } },
    dense: { control: 'boolean', table: { category: 'Layout' } },
    onPress: { action: 'pressed', table: { category: 'Events' } },
    onSelectedChange: { action: 'selectedChanged', table: { category: 'Events' } },
  },
  render: (args) => (
    <View style={{ maxWidth: 440, width: '100%' }}>
      <MagicListItem {...args} />
    </View>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicListItem>;

/**
 * Default interactive list item with leading icon, overline, and trailing chevron.
 */
export const Default: Story = {
  args: {
    testId: 'story-list-item',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByTestId('story-list-item-row');
    await userEvent.click(row);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

function InteractiveListDemo(args: React.ComponentProps<typeof MagicListItem>) {
  const [selectedIds, setSelectedIds] = useState<readonly string[]>(['alice']);
  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <View style={{ maxWidth: 440, width: '100%', gap: 8 }}>
      <MagicListItem
        testId="li-alice"
        overlineText="ENGINEERING"
        primaryText="Alice Chen"
        secondaryText="Principal UI Architect"
        leadingAvatarText="AC"
        trailingBadge={3}
        trailingIcon={
          selectedIds.includes('alice')
            ? 'check_circle'
            : 'radio_button_unchecked'
        }
        appearance="outlined"
        selectable
        selected={selectedIds.includes('alice')}
        color="primary"
        onSelectedChange={(next) => {
          args.onSelectedChange?.(next);
          toggle('alice');
        }}
      />
      <MagicListItem
        testId="li-marcus"
        overlineText="DESIGN"
        primaryText="Marcus Vance"
        secondaryText="Material 3 Systems Lead"
        leadingAvatarText="MV"
        trailingText="Online"
        trailingIcon={
          selectedIds.includes('marcus')
            ? 'check_circle'
            : 'radio_button_unchecked'
        }
        appearance="outlined"
        selectable
        selected={selectedIds.includes('marcus')}
        color="secondary"
        onSelectedChange={(next) => {
          args.onSelectedChange?.(next);
          toggle('marcus');
        }}
      />
      <MagicListItem
        testId="li-locked"
        primaryText="Archived Workspace"
        secondaryText="Disabled item cannot be selected"
        leadingIcon="lock"
        appearance="filled"
        selectable
        disabled
      />
    </View>
  );
}

/**
 * Stateful selectable contact list toggling selection and showing avatars & badges.
 */
export const InteractiveSelectableList: Story = {
  render: (args) => <InteractiveListDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marcusRow = canvas.getByTestId('li-marcus-row');
    await expect(marcusRow).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(marcusRow);
    await expect(marcusRow).toHaveAttribute('aria-selected', 'true');
  },
};

/**
 * Comparison of surface appearances (`standard`, `outlined`, `filled`), dense mode, and sizes.
 */
export const AppearancesAndSizes: Story = {
  render: () => (
    <View style={{ maxWidth: 460, width: '100%', gap: 10 }}>
      <MagicListItem
        primaryText="Standard Dense (XS)"
        secondaryText="Compact hairline list item"
        leadingIcon="tune"
        trailingText="v2"
        appearance="standard"
        size="xs"
        dense
        divider
      />
      <MagicListItem
        primaryText="Outlined Row (MD)"
        secondaryText="Bordered card-like list row"
        leadingIcon="layers"
        trailingBadge="NEW"
        appearance="outlined"
        size="md"
      />
      <MagicListItem
        primaryText="Filled Row (LG)"
        secondaryText="Tonal surface variant container"
        leadingAvatarText="FL"
        trailingIcon="arrow_forward"
        appearance="filled"
        size="lg"
        color="tertiary"
      />
    </View>
  ),
};

/**
 * List items rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          gap: 10,
          maxWidth: 440,
          width: '100%',
        }}
      >
        <MagicListItem
          overlineText="ACTIVE"
          primaryText="Production Cluster"
          secondaryText="us-west-2 • Healthy"
          leadingIcon="cloud_done"
          trailingBadge={12}
          appearance="outlined"
          selectable
          defaultSelected
        />
        <MagicListItem
          primaryText="Staging Environment"
          secondaryText="Preview deployments enabled"
          leadingIcon="science"
          trailingIcon="chevron_right"
          appearance="filled"
          interactive
        />
      </View>
    </MagicPaperProvider>
  ),
};
