import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicChip } from './chip';

/**
 * `MagicChip` unifies static/removable chip lists (`basic`), filter/choice
 * chip listboxes (`selectable`), interactive token input grids (`input`), and
 * reorderable drag-and-drop chip sets (`draggable`).
 *
 * - **Variants**: `basic`, `selectable`, `input`, `draggable`.
 * - **Features**: Avatars (`avatarSrc`), leading icons (`leadingIcon`),
 *   inline double-click editing (`editable`), and horizontal/vertical orientations.
 * - **References**:
 *   - [MUI Chip](https://mui.com/material-ui/react-chip/)
 *   - [Material 3 Chips](https://m3.material.io/components/chips/overview)
 */
const meta: Meta<typeof MagicChip> = {
  title: 'Atoms/Chip',
  component: MagicChip,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'Chip',
    variant: 'basic',
    color: 'primary',
    size: 'md',
    removable: false,
    editable: false,
    selectable: false,
    multiple: true,
    hideSelectionIndicator: false,
    orientation: 'horizontal',
    disableRipple: false,
    disabled: false,
    inputPlaceholder: 'Add item...',
    onChipsChange: fn(),
    onRemoved: fn(),
    onSelectionChange: fn(),
    onAdded: fn(),
    onEdited: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['basic', 'selectable', 'input', 'draggable'],
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
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
    chips: {
      control: 'object',
      table: { category: 'Content' },
    },
    defaultChips: {
      control: 'object',
      table: { category: 'Content' },
    },
    label: {
      control: 'text',
      table: { category: 'Content' },
    },
    inputPlaceholder: {
      control: 'text',
      table: { category: 'Content' },
    },
    children: {
      control: false,
      table: { category: 'Content' },
    },
    removable: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    editable: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    selectable: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    multiple: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    hideSelectionIndicator: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    disableRipple: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
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
    onChipsChange: {
      action: 'chipsChanged',
      table: { category: 'Events' },
    },
    onRemoved: {
      action: 'removed',
      table: { category: 'Events' },
    },
    onSelectionChange: {
      action: 'selectionChanged',
      table: { category: 'Events' },
    },
    onAdded: {
      action: 'added',
      table: { category: 'Events' },
    },
    onEdited: {
      action: 'edited',
      table: { category: 'Events' },
    },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: false, table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicChip>;

/**
 * Basic static and removable chip list.
 */
export const Default: Story = {
  args: {
    variant: 'basic',
    removable: true,
    defaultChips: [
      { id: 'react', label: 'React 19', leadingIcon: 'code' },
      { id: 'mui', label: 'MUI v9', leadingIcon: 'palette' },
      { id: 'nx', label: 'Nx Monorepo', leadingIcon: 'hub' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('React 19')).toBeInTheDocument();
    await expect(canvas.getByText('MUI v9')).toBeInTheDocument();
  },
};

/**
 * Multi-select filter chip set showing the leading `check` indicator on active items.
 */
export const Selectable: Story = {
  args: {
    variant: 'selectable',
    multiple: true,
    defaultChips: [
      { id: 'ts', label: 'TypeScript', selected: true },
      { id: 'storybook', label: 'Storybook', selected: false },
      { id: 'vitest', label: 'Vitest', selected: false },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const vitestOption = canvas.getByRole('option', { name: /Vitest/i });
    await userEvent.click(vitestOption);
    await expect(args.onSelectionChange).toHaveBeenCalledWith(['ts', 'vitest']);
  },
};

/**
 * Input chip grid supporting adding new chips on Enter/comma and inline editing on double-click.
 */
export const InputAndEditable: Story = {
  args: {
    variant: 'input',
    removable: true,
    editable: true,
    inputPlaceholder: 'Add tag...',
    defaultChips: [
      { id: 'design', label: 'Design Systems' },
      { id: 'a11y', label: 'Accessibility' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Add tag...');
    await userEvent.type(input, 'M3 Tokens{Enter}');
    await expect(args.onAdded).toHaveBeenCalledWith('M3 Tokens');
    await expect(canvas.getByText('M3 Tokens')).toBeInTheDocument();
  },
};

/**
 * Draggable chip list with `drag_indicator` handle and keyboard arrow reordering.
 */
export const Draggable: Story = {
  args: {
    variant: 'draggable',
    defaultChips: [
      { id: 'step-1', label: '1. Architect' },
      { id: 'step-2', label: '2. Implement' },
      { id: 'step-3', label: '3. Verify' },
    ],
  },
};

/**
 * All seven semantic palette color intents rendered in selected state.
 */
export const Colors: Story = {
  render: () => {
    const intents = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ] as const;

    return (
      <Stack spacing={1.5}>
        {intents.map((color) => (
          <MagicChip
            key={color}
            variant="selectable"
            color={color}
            defaultChips={[
              {
                id: `${color}-selected`,
                label: `${color.charAt(0).toUpperCase() + color.slice(1)} Selected`,
                selected: true,
              },
              {
                id: `${color}-unselected`,
                label: `${color.charAt(0).toUpperCase() + color.slice(1)} Outlined`,
                selected: false,
              },
            ]}
          />
        ))}
      </Stack>
    );
  },
};

/**
 * Comparison of all five atomic size tokens (`xs`, `sm`, `md`, `lg`, `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack
      direction="row"
      spacing={1.5}
      useFlexGap
      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicChip key={size} size={size} label={`Size ${size.toUpperCase()}`} />
      ))}
    </Stack>
  ),
};

/**
 * Chips with leading avatars, Material Icons, and vertical orientation.
 */
export const AvatarsIconsAndVertical: Story = {
  args: {
    variant: 'basic',
    orientation: 'vertical',
    defaultChips: [
      {
        id: 'ada',
        label: 'Ada Lovelace',
        avatarSrc:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="12" fill="%23005cbb"/></svg>',
        avatarAlt: 'Ada Avatar',
      },
      {
        id: 'verified',
        label: 'Verified Maintainer',
        leadingIcon: 'verified',
      },
    ],
  },
};
