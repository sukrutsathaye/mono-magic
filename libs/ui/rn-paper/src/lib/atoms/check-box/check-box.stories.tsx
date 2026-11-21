import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicCheckBox, type CheckBoxTask } from './check-box';

const SAMPLE_TASKS: CheckBoxTask[] = [
  {
    id: 'release',
    name: 'Release Checklist',
    checked: false,
    subtasks: [
      { id: 'unit', name: 'Unit tests passing', checked: true },
      { id: 'lint', name: 'Lint & typecheck clean', checked: false },
      { id: 'docs', name: 'Storybook docs verified', checked: false },
    ],
  },
];

/**
 * `MagicCheckBox` renders an accessible Material 3 checkbox control supporting
 * single controllable checkboxes, indeterminate tri-state visuals, `labelPosition`,
 * `disabledInteractive`, and immutable parent/subtask checklists (`tasks`).
 *
 * - **Accessibility**: sets `accessibilityRole="checkbox"` and `accessibilityState={{ checked: 'mixed' | boolean, disabled }}`.
 * - **Theming**: resolves all 7 semantic color intents dynamically from `MagicPaperProvider`.
 * - **References**:
 *   - [Material 3 Checkbox](https://m3.material.io/components/checkbox/overview)
 */
const meta: Meta<typeof MagicCheckBox> = {
  title: 'Atoms/CheckBox',
  component: MagicCheckBox,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'Accept terms and conditions',
    defaultChecked: false,
    indeterminate: false,
    required: false,
    labelPosition: 'after',
    disableRipple: false,
    disabled: false,
    disabledInteractive: false,
    color: 'primary',
    size: 'md',
    onChange: fn(),
    onIndeterminateChange: fn(),
    onTasksChange: fn(),
  },
  argTypes: {
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
    labelPosition: {
      control: 'radio',
      options: ['before', 'after'],
      table: { category: 'Appearance' },
    },
    label: {
      control: 'text',
      table: { category: 'Content' },
    },
    tasks: {
      control: 'object',
      table: { category: 'Content' },
    },
    defaultTasks: {
      control: 'object',
      table: { category: 'Content' },
    },
    children: {
      control: false,
      table: { category: 'Content' },
    },
    checked: {
      control: 'boolean',
      table: { category: 'State' },
    },
    defaultChecked: {
      control: 'boolean',
      table: { category: 'State' },
    },
    indeterminate: {
      control: 'boolean',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disabledInteractive: {
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
    name: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    checkboxValue: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    onChange: {
      action: 'changed',
      table: { category: 'Events' },
    },
    onIndeterminateChange: {
      action: 'indeterminateChanged',
      table: { category: 'Events' },
    },
    onTasksChange: {
      action: 'tasksChanged',
      table: { category: 'Events' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MagicCheckBox>;

/**
 * Interactive playground story verifying toggle emission and checked state.
 */
export const Playground: Story = {
  args: {
    label: 'Accept terms and conditions',
    defaultChecked: false,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const cb = canvas.getByRole('checkbox', {
      name: 'Accept terms and conditions',
    });
    await expect(cb).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(cb);
    await expect(cb).toHaveAttribute('aria-checked', 'true');
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

/**
 * Indeterminate tri-state checkbox (`aria-checked="mixed"`) and required indicator.
 */
export const IndeterminateAndRequired: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <MagicCheckBox
        label="Select all items"
        indeterminate
        onChange={args.onChange}
        onIndeterminateChange={args.onIndeterminateChange}
      />
      <MagicCheckBox
        label="Mandatory agreement"
        required
        defaultChecked
        onChange={args.onChange}
      />
    </View>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const mixed = canvas.getByRole('checkbox', { name: 'Select all items' });
    await expect(mixed).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(mixed);
    await expect(args.onIndeterminateChange).toHaveBeenCalledWith(false);
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

/**
 * Hierarchical parent/subtask checklist computing `allComplete` and `someComplete` automatically.
 */
export const TaskHierarchy: Story = {
  args: {
    defaultTasks: SAMPLE_TASKS,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('checkbox', { name: 'Release Checklist' });
    await expect(parent).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(parent);
    await expect(args.onTasksChange).toHaveBeenCalled();
  },
};

/**
 * Comparison of all seven semantic Material 3 palette color intents.
 */
export const Colors: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <MagicCheckBox color="primary" label="Primary" defaultChecked />
      <MagicCheckBox color="secondary" label="Secondary" defaultChecked />
      <MagicCheckBox color="tertiary" label="Tertiary" defaultChecked />
      <MagicCheckBox color="success" label="Success" defaultChecked />
      <MagicCheckBox color="warning" label="Warning" defaultChecked />
      <MagicCheckBox color="error" label="Error" defaultChecked />
      <MagicCheckBox color="neutral" label="Neutral" defaultChecked />
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
        gap: 16,
      }}
    >
      <MagicCheckBox size="xs" label="XS" defaultChecked />
      <MagicCheckBox size="sm" label="SM" defaultChecked />
      <MagicCheckBox size="md" label="MD" defaultChecked />
      <MagicCheckBox size="lg" label="LG" defaultChecked />
      <MagicCheckBox size="xl" label="XL" defaultChecked />
    </View>
  ),
};

/**
 * Label placement before vs after the checkbox indicator box.
 */
export const LabelPositions: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <MagicCheckBox
        labelPosition="after"
        label="Label placed after (default)"
        defaultChecked
      />
      <MagicCheckBox
        labelPosition="before"
        label="Label placed before"
        defaultChecked
      />
    </View>
  ),
};

/**
 * Disabled and focusable `disabledInteractive` checkbox states.
 */
export const DisabledStates: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <MagicCheckBox
        label="Disabled unchecked"
        disabled
        onChange={args.onChange}
      />
      <MagicCheckBox
        label="Disabled checked"
        disabled
        defaultChecked
        onChange={args.onChange}
      />
      <MagicCheckBox
        label="Disabled interactive"
        disabled
        disabledInteractive
        defaultChecked
        onChange={args.onChange}
      />
    </View>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const interactive = canvas.getByRole('checkbox', {
      name: 'Disabled interactive',
    });
    await expect(interactive).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactive);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
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
        <MagicCheckBox label="Dark Primary Checked" defaultChecked />
        <MagicCheckBox
          color="tertiary"
          label="Dark Tertiary Indeterminate"
          indeterminate
        />
        <MagicCheckBox label="Dark Unchecked" />
      </View>
    </MagicPaperProvider>
  ),
};
