import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { CheckBoxTask } from '@mono-magic/atomic-design-interfaces';
import MagicCheckBox from './MagicCheckBox.vue';

const meta: Meta<typeof MagicCheckBox> = {
  title: 'Atoms/CheckBox',
  component: MagicCheckBox,
  tags: ['autodocs', 'snapshot'],
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
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    labelPosition: {
      control: 'select',
      options: ['after', 'before'],
    },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Subscribe to release notes',
    color: 'primary',
    size: 'md',
    labelPosition: 'after',
    indeterminate: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IndeterminateAndDisabled: Story = {
  render: () => ({
    components: { MagicCheckBox },
    template: `
      <div class="d-flex flex-column ga-2">
        <MagicCheckBox label="Checked" :checked="true" color="primary" />
        <MagicCheckBox label="Indeterminate" indeterminate color="secondary" />
        <MagicCheckBox label="Label Before" :checked="true" label-position="before" color="success" />
        <MagicCheckBox label="Disabled" :checked="true" disabled />
      </div>
    `,
  }),
};

export const InteractiveTaskTree: Story = {
  render: () => ({
    components: { MagicCheckBox },
    setup() {
      const tasks = ref<CheckBoxTask[]>([
        { id: 'design', name: 'Design tokens synced', checked: true },
        {
          id: 'qa',
          name: 'Verification Gates',
          checked: false,
          subtasks: [
            { id: 'unit', name: 'Unit tests >= 80%', checked: true },
            { id: 'visual', name: 'Storybook visual snapshots', checked: false },
          ],
        },
        { id: 'docs', name: 'README updated', checked: false },
      ]);
      return { tasks };
    },
    template: `
      <div class="d-flex flex-column ga-3">
        <MagicCheckBox
          label="Release Readiness"
          :tasks="tasks"
          color="primary"
          @update:tasks="tasks = $event"
        />
        <pre class="text-caption bg-grey-lighten-4 pa-2 rounded">{{ JSON.stringify(tasks, null, 2) }}</pre>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const docsCheckbox = canvas.getByLabelText(/README updated/i);
    await expect(docsCheckbox).not.toBeChecked();
    await userEvent.click(docsCheckbox);
    await expect(docsCheckbox).toBeChecked();
  },
};
