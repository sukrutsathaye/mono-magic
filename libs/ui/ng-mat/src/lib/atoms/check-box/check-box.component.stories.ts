import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicCheckBoxComponent } from './check-box.component';

/**
 * `MagicCheckBoxComponent` wraps `mat-checkbox` with Signal Forms (`FormCheckboxControl`),
 * Reactive/Template Forms support, indeterminate state, and optional immutable
 * parent/subtask checklists.
 *
 * - **References**:
 *   - [Angular Material Checkbox](https://material.angular.dev/components/checkbox/overview)
 *   - [Material 3 Checkbox](https://m3.material.io/components/checkbox/overview)
 *   - [Angular Signal Forms](https://angular.dev/guide/forms/signals/custom-controls)
 */
const meta: Meta<MagicCheckBoxComponent> = {
  title: 'Atoms/CheckBox',
  component: MagicCheckBoxComponent,
  args: {
    label: 'Accept terms and conditions',
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    labelPosition: 'after',
    disableRipple: false,
    disabledInteractive: false,
    color: 'primary',
    size: 'md',
    tasks: [],
    changed: fn(),
    tasksChanged: fn(),
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    checked: { control: 'boolean', table: { category: 'State' } },
    indeterminate: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    labelPosition: {
      control: 'select',
      options: ['before', 'after'],
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
    disableRipple: { control: 'boolean', table: { category: 'Behavior' } },
    disabledInteractive: { control: 'boolean', table: { category: 'Behavior' } },
    tasks: { control: 'object', table: { category: 'Checklist' } },
    changed: { action: 'changed', table: { category: 'Events' } },
    tasksChanged: { action: 'tasksChanged', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicCheckBoxComponent>;

/**
 * Default unchecked checkbox with toggle interaction verification.
 *
 * Inputs: `label="Accept terms and conditions"`, `checked=false`, `indeterminate=false`, `color="primary"`, `size="md"`.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.changed).toHaveBeenCalledWith(true);
  },
};

/**
 * Pre-checked checkbox state.
 *
 * Inputs: `label="Subscribed"`, `checked=true`.
 */
export const Checked: Story = {
  args: { label: 'Subscribed', checked: true },
};

/**
 * Mixed/indeterminate state typically used for partial parent selections.
 *
 * Inputs: `label="Select all"`, `indeterminate=true`.
 */
export const Indeterminate: Story = {
  args: { label: 'Select all', indeterminate: true },
};

/**
 * Checkbox with its label positioned before the control box.
 *
 * Inputs: `label="Label before box"`, `labelPosition="before"`.
 */
export const LabelBefore: Story = {
  args: { label: 'Label before box', labelPosition: 'before' },
};

/**
 * Disabled checked checkbox that cannot be toggled.
 *
 * Inputs: `label="Disabled checkbox"`, `disabled=true`, `checked=true`.
 */
export const Disabled: Story = {
  args: { label: 'Disabled checkbox', disabled: true, checked: true },
};

/**
 * Comparison of checked checkboxes across semantic palette colors.
 *
 * Inputs: `checked=true`, `color="primary" | "secondary" | "tertiary" | "success" | "warning" | "error"`.
 */
export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <magic-check-box color="primary" [checked]="true" label="Primary" />
        <magic-check-box color="secondary" [checked]="true" label="Secondary" />
        <magic-check-box color="tertiary" [checked]="true" label="Tertiary" />
        <magic-check-box color="success" [checked]="true" label="Success" />
        <magic-check-box color="warning" [checked]="true" label="Warning" />
        <magic-check-box color="error" [checked]="true" label="Error" />
      </div>
    `,
  }),
};

/**
 * Hierarchical parent/subtask checklist mode with automatic indeterminate aggregation and locked items.
 *
 * Inputs: `ariaLabel="Release checklist"`, `tasks` (2 parent tasks, 1 with 3 subtasks and 1 disabled).
 */
export const NestedTaskList: Story = {
  args: {
    ariaLabel: 'Release checklist',
    tasks: [
      {
        id: 'prep',
        name: 'Release preparation',
        checked: false,
        subtasks: [
          { id: 'lint', name: 'Run lint', checked: true },
          { id: 'tests', name: 'Run unit tests', checked: false },
          { id: 'docs', name: 'Update docs', checked: false },
        ],
      },
      {
        id: 'locked',
        name: 'Locked milestone',
        checked: true,
        disabled: true,
      },
    ],
  },
};

/**
 * Custom HTML label projected through `<ng-content>`.
 *
 * Inputs: projected `<magic-check-box>` child markup (inherits default `checked=false`).
 */
export const ContentProjection: Story = {
  render: (args) => ({
    props: args,
    template: `
      <magic-check-box ${argsToTemplate(args)}>
        <strong>Projected</strong>&nbsp;rich label
      </magic-check-box>
    `,
  }),
};
