import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, within } from 'storybook/test';
import { MagicChipComponent } from './chip.component';

/**
 * `MagicChipComponent` wraps Angular Material chips (`basic`, `selectable`,
 * `input`, `draggable`) with immutable signal updates, accessibility
 * announcements, and single-chip `<ng-content>` projection fallback.
 *
 * @see https://material.angular.dev/components/chips/overview
 */
const meta: Meta<MagicChipComponent> = {
  title: 'Atoms/Chip',
  component: MagicChipComponent,
  args: {
    chips: [
      { id: '1', label: 'Angular', leadingIcon: 'bolt' },
      { id: '2', label: 'Material', removable: true },
      { id: '3', label: 'Signals', disabled: false },
    ],
    variant: 'basic',
    color: 'primary',
    size: 'md',
    disabled: false,
    removable: false,
    editable: false,
    selectable: true,
    multiple: false,
    hideSelectionIndicator: false,
    orientation: 'horizontal',
    disableRipple: false,
    inputPlaceholder: 'Add tag...',
    chipAdded: fn(),
    chipRemoved: fn(),
    chipEdited: fn(),
    chipReordered: fn(),
    selectionChanged: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['basic', 'selectable', 'input', 'draggable'],
      table: { category: 'Variant' },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
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
    chips: { control: 'object', table: { category: 'Data' } },
    label: { control: 'text', table: { category: 'Content' } },
    removable: { control: 'boolean', table: { category: 'Behavior' } },
    editable: { control: 'boolean', table: { category: 'Behavior' } },
    selectable: { control: 'boolean', table: { category: 'Behavior' } },
    multiple: { control: 'boolean', table: { category: 'Behavior' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<MagicChipComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Angular')).toBeInTheDocument();
    await expect(canvas.getByText('Material')).toBeInTheDocument();
  },
};

export const Selectable: Story = {
  args: {
    variant: 'selectable',
    multiple: true,
    chips: [
      { id: '1', label: 'Small', selected: false },
      { id: '2', label: 'Medium', selected: true },
      { id: '3', label: 'Large', selected: false },
    ],
  },
};

export const StackedVertical: Story = {
  args: {
    variant: 'selectable',
    orientation: 'vertical',
    chips: [
      { id: '1', label: 'Primary' },
      { id: '2', label: 'Accent' },
      { id: '3', label: 'Warn' },
    ],
  },
};

export const InputGrid: Story = {
  args: {
    variant: 'input',
    label: 'Tags',
    removable: true,
    editable: true,
    chips: [
      { id: '1', label: 'TypeScript' },
      { id: '2', label: 'Nx' },
    ],
  },
};

export const Draggable: Story = {
  args: {
    variant: 'draggable',
    removable: true,
    chips: [
      { id: '1', label: 'First' },
      { id: '2', label: 'Second' },
      { id: '3', label: 'Third' },
    ],
  },
};

export const SingleProjectedChip: Story = {
  render: (args) => ({
    props: args,
    template: `<magic-chip ${argsToTemplate(args)}>Projected Chip</magic-chip>`,
  }),
  args: { chips: [] },
};
