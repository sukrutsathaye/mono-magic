import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { ChipItem } from '@mono-magic/atomic-design-interfaces';
import MagicChip from './MagicChip.vue';

const meta: Meta<typeof MagicChip> = {
  title: 'Atoms/Chip',
  component: MagicChip,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['basic', 'selectable', 'input', 'draggable'],
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
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    removable: { control: 'boolean' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Vuetify 3',
    color: 'primary',
    size: 'md',
    removable: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Standalone: Story = {};

export const SelectableFilterChips: Story = {
  render: () => ({
    components: { MagicChip },
    setup() {
      const selected = ref<string[]>(['Vue']);
      const chips: ChipItem[] = [
        { id: 'vue', label: 'Vue', selected: true, leadingIcon: 'vuejs' },
        { id: 'ts', label: 'TypeScript', leadingIcon: 'language-typescript' },
        { id: 'vuetify', label: 'Vuetify', leadingIcon: 'vuetify' },
        { id: 'vitest', label: 'Vitest', leadingIcon: 'test-tube' },
      ];
      return { chips, selected };
    },
    template: `
      <div class="d-flex flex-column ga-3">
        <MagicChip
          :chips="chips"
          variant="selectable"
          multiple
          color="primary"
          @select="selected = $event"
        />
        <div class="text-caption">Selected tags: {{ selected.join(', ') || 'none' }}</div>
      </div>
    `,
  }),
};

export const InteractiveTagInput: Story = {
  render: () => ({
    components: { MagicChip },
    setup() {
      const tags = ref<ChipItem[]>([
        { id: '1', label: 'Atomic Design', removable: true },
        { id: '2', label: 'Polyglot', removable: true },
      ]);
      const onAdd = (label: string) => {
        tags.value = [
          ...tags.value,
          { id: String(Date.now()), label, removable: true },
        ];
      };
      const onRemove = (_chip: ChipItem, index: number) => {
        tags.value = tags.value.filter((_, idx) => idx !== index);
      };
      return { tags, onAdd, onRemove };
    },
    template: `
      <div class="d-flex flex-column ga-3">
        <MagicChip
          :chips="tags"
          variant="input"
          color="secondary"
          input-placeholder="Type & press Enter..."
          @add="onAdd"
          @remove="onRemove"
        />
        <div class="text-caption">
          Tag count: {{ tags.length }} ({{ tags.map((t) => t.label).join(', ') }})
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Tag count: 2/)).toBeInTheDocument();
    const input = canvas.getByPlaceholderText('Type & press Enter...');
    await userEvent.type(input, 'Vuetify{enter}');
    await expect(canvas.getByText(/Tag count: 3/)).toBeInTheDocument();
  },
};
