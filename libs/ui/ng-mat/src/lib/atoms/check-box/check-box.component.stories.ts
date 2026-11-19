import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicCheckBoxComponent } from './check-box.component';

/**
 * `MagicCheckBoxComponent` wraps `mat-checkbox` with Signal Forms (`FormCheckboxControl`),
 * Reactive/Template Forms support, indeterminate state, and optional immutable
 * parent/subtask checklists.
 *
 * @see https://material.angular.dev/components/checkbox/overview
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

export const Checked: Story = {
  args: { label: 'Subscribed', checked: true },
};

export const Indeterminate: Story = {
  args: { label: 'Select all', indeterminate: true },
};

export const LabelBefore: Story = {
  args: { label: 'Label before box', labelPosition: 'before' },
};

export const Disabled: Story = {
  args: { label: 'Disabled checkbox', disabled: true, checked: true },
};

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
