import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicChip, type ChipItem } from './chip';

const SAMPLE_CHIPS: ChipItem[] = [
  { id: 'ts', label: 'TypeScript', leadingIcon: 'code' },
  { id: 'rn', label: 'React Native', selected: true },
  { id: 'nx', label: 'Nx Monorepo' },
];

/**
 * `MagicChip` unifies all four Material 3 chip variants (`basic`, `selectable`,
 * `input`, and `draggable`) behind `@mono-magic/atomic-design-interfaces`.
 *
 * - **Variants**:
 *   - `basic`: static or removable chip set (or single chip fallback from `label`).
 *   - `selectable`: single or multi-select filter chips with leading check indicator.
 *   - `input`: interactive chip grid with `TextInput` add, inline edit, and delete.
 *   - `draggable`: reorderable chip list with keyboard and button reordering.
 * - **References**:
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
      control: 'radio',
      options: ['horizontal', 'vertical'],
      table: { category: 'Appearance' },
    },
    hideSelectionIndicator: {
      control: 'boolean',
      table: { category: 'Appearance' },
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
    removable: {
      control: 'boolean',
      table: { category: 'State' },
    },
    editable: {
      control: 'boolean',
      table: { category: 'State' },
    },
    selectable: {
      control: 'boolean',
      table: { category: 'State' },
    },
    multiple: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disableRipple: {
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
  },
};

export default meta;
type Story = StoryObj<typeof MagicChip>;

/**
 * Basic chip list with leading icons and removable action buttons.
 */
export const Playground: Story = {
  args: {
    defaultChips: SAMPLE_CHIPS,
    removable: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const removeBtn = canvas.getByRole('button', {
      name: 'Remove TypeScript',
    });
    await userEvent.click(removeBtn);
    await expect(args.onRemoved).toHaveBeenCalledTimes(1);
    await expect(args.onChipsChange).toHaveBeenCalledTimes(1);
  },
};

/**
 * Selectable filter chips supporting multi-selection and leading checkmark indicators.
 */
export const Selectable: Story = {
  args: {
    variant: 'selectable',
    multiple: true,
    defaultChips: SAMPLE_CHIPS,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const tsChip = canvas.getByRole('button', { name: 'TypeScript' });
    await userEvent.click(tsChip);
    await expect(args.onSelectionChange).toHaveBeenCalledWith(['ts', 'rn']);
  },
};

/**
 * Input chip grid supporting adding new chips via `TextInput`, inline editing, and deletion.
 */
export const InputChips: Story = {
  args: {
    variant: 'input',
    removable: true,
    editable: true,
    inputPlaceholder: 'Add skill...',
    defaultChips: [
      { id: 'react', label: 'React' },
      { id: 'paper', label: 'Paper' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Add skill...');
    await userEvent.type(input, 'Vitest,');
    await expect(args.onAdded).toHaveBeenCalledWith('Vitest');
  },
};

/**
 * Draggable / reorderable chips supporting move-left/right buttons and keyboard arrows.
 */
export const Draggable: Story = {
  args: {
    variant: 'draggable',
    defaultChips: [
      { id: 'step-1', label: 'Design' },
      { id: 'step-2', label: 'Develop' },
      { id: 'step-3', label: 'Ship' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const moveLaterBtn = canvas.getByRole('button', {
      name: 'Move Design later',
    });
    await userEvent.click(moveLaterBtn);
    await expect(args.onChipsChange).toHaveBeenCalledTimes(1);
  },
};

/**
 * Comparison of all seven semantic Material 3 palette color intents.
 */
export const Colors: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
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
        <MagicChip
          key={color}
          variant="selectable"
          color={color}
          defaultChips={[
            { id: `${color}-1`, label: `${color} selected`, selected: true },
            { id: `${color}-2`, label: `${color} default`, selected: false },
          ]}
        />
      ))}
    </View>
  ),
};

/**
 * Comparison of all five Material 3 size scale tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <MagicChip size="xs" label="XS Chip" />
      <MagicChip size="sm" label="SM Chip" />
      <MagicChip size="md" label="MD Chip" />
      <MagicChip size="lg" label="LG Chip" />
      <MagicChip size="xl" label="XL Chip" />
    </View>
  ),
};

/**
 * Vertical orientation and disabled chip states.
 */
export const OrientationAndDisabled: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 24 }}>
      <MagicChip
        orientation="vertical"
        variant="selectable"
        defaultChips={[
          { id: 'v1', label: 'Vertical One', selected: true },
          { id: 'v2', label: 'Vertical Two' },
        ]}
      />
      <MagicChip
        disabled
        variant="selectable"
        removable
        defaultChips={[
          { id: 'd1', label: 'Disabled Selected', selected: true },
          { id: 'd2', label: 'Disabled Default' },
        ]}
      />
    </View>
  ),
};

/**
 * Dark palette preview verifying runtime theme token adaptation.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          gap: 12,
        }}
      >
        <MagicChip
          variant="selectable"
          removable
          defaultChips={SAMPLE_CHIPS}
        />
      </View>
    </MagicPaperProvider>
  ),
};
