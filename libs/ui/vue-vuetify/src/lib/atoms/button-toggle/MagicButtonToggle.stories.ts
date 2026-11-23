import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicButtonToggle from './MagicButtonToggle.vue';

const meta: Meta<typeof MagicButtonToggle> = {
  title: 'Atoms/ButtonToggle',
  component: MagicButtonToggle,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
    },
    appearance: {
      control: 'select',
      options: ['standard', 'legacy'],
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
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    vertical: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    options: [
      { value: 'left', label: 'Left', icon: 'format-align-left' },
      { value: 'center', label: 'Center', icon: 'format-align-center' },
      { value: 'right', label: 'Right', icon: 'format-align-right' },
    ],
    selectionMode: 'single',
    appearance: 'standard',
    color: 'primary',
    size: 'md',
    vertical: false,
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleSelection: Story = {
  args: {
    value: 'left',
  },
};

export const MultipleFormatting: Story = {
  render: () => ({
    components: { MagicButtonToggle },
    setup() {
      const formats = ref<string[]>(['bold']);
      const options = [
        { value: 'bold', label: 'Bold', icon: 'format-bold' },
        { value: 'italic', label: 'Italic', icon: 'format-italic' },
        { value: 'underline', label: 'Underline', icon: 'format-underline' },
      ];
      return { formats, options };
    },
    template: `
      <div class="d-flex flex-column ga-3 align-start">
        <MagicButtonToggle
          v-model="formats"
          :options="options"
          selection-mode="multiple"
          color="secondary"
        />
        <div class="text-caption">Active formats: {{ formats.join(', ') || 'none' }}</div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Active formats: bold/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /Italic/i }));
    await expect(canvas.getByText(/Active formats: bold, italic/)).toBeInTheDocument();
  },
};

export const VerticalLegacy: Story = {
  render: () => ({
    components: { MagicButtonToggle },
    setup() {
      const view = ref('grid');
      const options = [
        { value: 'list', label: 'List View', icon: 'view-list' },
        { value: 'grid', label: 'Grid View', icon: 'view-grid' },
        { value: 'board', label: 'Board View', icon: 'view-column' },
      ];
      return { view, options };
    },
    template: `
      <div class="d-flex flex-column ga-3 align-start">
        <MagicButtonToggle
          v-model="view"
          :options="options"
          vertical
          appearance="legacy"
          required
          color="tertiary"
        />
        <div class="text-caption">Selected view: {{ view }}</div>
      </div>
    `,
  }),
};
