import { useState } from 'react';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicListItem } from './list-item';

/**
 * `MagicListItem` is the Material 3 list row molecule composing MUI v9 `ListItem`,
 * `ListItemButton`, `ListItemText`, `MagicAvatar`, and `MagicIcon`.
 *
 * - **References**:
 *   - [Material 3 Lists](https://m3.material.io/components/lists/overview)
 *   - [MUI List](https://mui.com/material-ui/react-list/)
 */
const meta: Meta<typeof MagicListItem> = {
  title: 'Molecules/ListItem',
  component: MagicListItem,
  tags: ['autodocs', 'snapshot'],
  args: {
    primaryText: 'Design Token Sync',
    secondaryText: 'Synchronize Material 3 palettes across React, Angular, and Flutter',
    overlineText: 'MONOREPO',
    leadingIcon: 'palette',
    trailingText: 'Updated',
    trailingBadge: 4,
    trailingIcon: 'chevron_right',
    interactive: true,
    selectable: false,
    selected: false,
    disabled: false,
    divider: true,
    dense: false,
    color: 'primary',
    size: 'md',
    appearance: 'standard',
    onClick: fn(),
    onSelectedChange: fn(),
  },
  argTypes: {
    primaryText: { control: 'text', table: { category: 'Content' } },
    secondaryText: { control: 'text', table: { category: 'Content' } },
    overlineText: { control: 'text', table: { category: 'Content' } },
    leadingIcon: { control: 'text', table: { category: 'Media' } },
    leadingAvatarText: { control: 'text', table: { category: 'Media' } },
    leadingAvatarSrc: { control: 'text', table: { category: 'Media' } },
    trailingIcon: { control: 'text', table: { category: 'Trailing' } },
    trailingText: { control: 'text', table: { category: 'Trailing' } },
    trailingBadge: { control: 'text', table: { category: 'Trailing' } },
    interactive: { control: 'boolean', table: { category: 'Behavior' } },
    selectable: { control: 'boolean', table: { category: 'Behavior' } },
    selected: { control: 'boolean', table: { category: 'State' } },
    defaultSelected: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    divider: { control: 'boolean', table: { category: 'Appearance' } },
    dense: { control: 'boolean', table: { category: 'Appearance' } },
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
    onClick: { action: 'clicked', table: { category: 'Events' } },
    onSelectedChange: { action: 'selectedChanged', table: { category: 'Events' } },
    leadingSlot: { control: false, table: { category: 'Slots' } },
    trailingSlot: { control: false, table: { category: 'Slots' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
  render: (args) => (
    <List sx={{ maxWidth: 520, p: 0 }}>
      <MagicListItem {...args} />
    </List>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicListItem>;

/**
 * Default interactive list item verifying click activation.
 */
export const Default: Story = {
  args: {
    testId: 'default-list-item',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Design Token Sync/i });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

function InteractiveSelectableListDemo() {
  const items = [
    {
      id: 'react',
      overline: 'WEB',
      primary: 'React MUI Library',
      secondary: 'MUI v9 + React 19 components',
      initials: 'RM',
      badge: 'v9',
    },
    {
      id: 'angular',
      overline: 'WEB',
      primary: 'Angular Material',
      secondary: 'Angular 22 signal components',
      initials: 'AM',
      badge: 'v22',
    },
    {
      id: 'flutter',
      overline: 'CROSS-PLATFORM',
      primary: 'Flutter Material 3',
      secondary: 'Widgetbook & Dart contracts',
      initials: 'FL',
      badge: '3.50',
    },
  ];

  const [selectedIds, setSelectedIds] = useState<string[]>(['react']);

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <Stack spacing={1.5} sx={{ maxWidth: 520 }}>
      <Typography variant="caption" color="text.secondary" data-testid="selection-summary">
        Selected ({selectedIds.length}): {selectedIds.join(', ') || 'None'}
      </Typography>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 0 }}>
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <MagicListItem
              key={item.id}
              testId={`list-item-${item.id}`}
              overlineText={item.overline}
              primaryText={item.primary}
              secondaryText={item.secondary}
              leadingAvatarText={item.initials}
              trailingBadge={item.badge}
              trailingIcon={isSelected ? 'check_circle' : 'radio_button_unchecked'}
              appearance="outlined"
              selectable
              selected={isSelected}
              onSelectedChange={() => toggleId(item.id)}
            />
          );
        })}
      </List>
    </Stack>
  );
}

/**
 * Stateful interactive selectable list with live multi-selection count and toggling.
 */
export const InteractiveSelectableList: Story = {
  render: () => <InteractiveSelectableListDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('selection-summary')).toHaveTextContent(
      'Selected (1): react',
    );
    const angularBtn = canvas.getByTestId('list-item-angular-button');
    await userEvent.click(angularBtn);
    await expect(canvas.getByTestId('selection-summary')).toHaveTextContent(
      'Selected (2): react, angular',
    );
    const reactBtn = canvas.getByTestId('list-item-react-button');
    await userEvent.click(reactBtn);
    await expect(canvas.getByTestId('selection-summary')).toHaveTextContent(
      'Selected (1): angular',
    );
  },
};

/**
 * Comparison of `standard`, `outlined`, and `filled` surface appearances plus disabled and dense states.
 */
export const AppearancesAndStates: Story = {
  render: () => (
    <List sx={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 1.25, p: 0 }}>
      <MagicListItem
        appearance="standard"
        primaryText="Standard Surface Row"
        secondaryText="With hairline bottom divider"
        leadingIcon="article"
        divider
      />
      <MagicListItem
        appearance="outlined"
        primaryText="Outlined Surface Row"
        secondaryText="Bordered card-like list item"
        leadingAvatarText="OL"
        trailingText="Ready"
        interactive
      />
      <MagicListItem
        appearance="filled"
        color="secondary"
        primaryText="Filled Selected Surface"
        secondaryText="Tonal container highlight"
        leadingIcon="verified"
        trailingBadge="New"
        selectable
        selected
      />
      <MagicListItem
        appearance="outlined"
        primaryText="Dense Disabled Row"
        secondaryText="Interaction suppressed"
        leadingIcon="lock"
        dense
        disabled
        interactive
      />
    </List>
  ),
};

/**
 * Comparison across all 5 atomic sizes (`xs`..`xl`) and semantic colors.
 */
export const SizesAndColors: Story = {
  render: () => (
    <List sx={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 1, p: 0 }}>
      {(
        [
          { size: 'xs', color: 'primary' },
          { size: 'sm', color: 'secondary' },
          { size: 'md', color: 'tertiary' },
          { size: 'lg', color: 'success' },
          { size: 'xl', color: 'warning' },
        ] as const
      ).map(({ size, color }) => (
        <MagicListItem
          key={size}
          size={size}
          color={color}
          appearance="outlined"
          primaryText={`${size.toUpperCase()} List Item`}
          secondaryText={`Semantic ${color} accent`}
          leadingIcon="layers"
          trailingBadge={size.toUpperCase()}
          selectable
          selected
        />
      ))}
    </List>
  ),
};
