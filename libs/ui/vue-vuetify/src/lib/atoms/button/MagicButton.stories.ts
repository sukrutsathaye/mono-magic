import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicButton from './MagicButton.vue';

const meta: Meta<typeof MagicButton> = {
  title: 'Atoms/Button',
  component: MagicButton,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
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
    kind: {
      control: 'select',
      options: ['default', 'icon', 'fab', 'mini-fab', 'extended-fab'],
    },
    shape: {
      control: 'select',
      options: ['default', 'square', 'rounded', 'pill'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    label: 'Click Me',
    variant: 'filled',
    color: 'primary',
    size: 'md',
    kind: 'default',
    shape: 'default',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => ({
    components: { MagicButton },
    template: `
      <div class="d-flex flex-wrap ga-3 align-center">
        <MagicButton label="Filled" variant="filled" />
        <MagicButton label="Tonal" variant="tonal" />
        <MagicButton label="Outlined" variant="outlined" />
        <MagicButton label="Elevated" variant="elevated" />
        <MagicButton label="Text" variant="text" />
      </div>
    `,
  }),
};

export const ColorIntents: Story = {
  render: () => ({
    components: { MagicButton },
    template: `
      <div class="d-flex flex-wrap ga-3 align-center">
        <MagicButton label="Primary" color="primary" />
        <MagicButton label="Secondary" color="secondary" />
        <MagicButton label="Tertiary" color="tertiary" />
        <MagicButton label="Success" color="success" />
        <MagicButton label="Warning" color="warning" />
        <MagicButton label="Error" color="error" />
        <MagicButton label="Neutral" color="neutral" />
      </div>
    `,
  }),
};

export const SizesAndKinds: Story = {
  render: () => ({
    components: { MagicButton },
    template: `
      <div class="d-flex flex-column ga-4">
        <div class="d-flex flex-wrap ga-3 align-center">
          <MagicButton label="XS" size="xs" />
          <MagicButton label="SM" size="sm" />
          <MagicButton label="MD" size="md" />
          <MagicButton label="LG" size="lg" />
          <MagicButton label="XL" size="xl" />
        </div>
        <div class="d-flex flex-wrap ga-3 align-center">
          <MagicButton label="Leading" leading-icon="check" />
          <MagicButton label="Trailing" trailing-icon="arrow-right" variant="outlined" />
          <MagicButton label="Favorite" kind="icon" leading-icon="heart" color="error" variant="tonal" />
          <MagicButton label="Add" kind="fab" leading-icon="plus" color="primary" />
          <MagicButton label="Edit" kind="mini-fab" leading-icon="pencil" color="secondary" />
          <MagicButton label="Compose" kind="extended-fab" leading-icon="pencil" color="tertiary" />
        </div>
      </div>
    `,
  }),
};

export const InteractiveClickAndLoading: Story = {
  render: () => ({
    components: { MagicButton },
    setup() {
      const clicks = ref(0);
      const isLoading = ref(false);
      const handleSave = () => {
        clicks.value += 1;
        isLoading.value = true;
        setTimeout(() => {
          isLoading.value = false;
        }, 600);
      };
      return { clicks, isLoading, handleSave };
    },
    template: `
      <div class="d-flex flex-column ga-3 align-start">
        <div class="d-flex ga-3 align-center">
          <MagicButton
            label="Save Draft"
            leading-icon="content-save"
            :loading="isLoading"
            @click="handleSave"
          />
          <MagicButton
            label="Disabled Interactive"
            variant="outlined"
            disabled
            disabled-interactive
          />
        </div>
        <div class="text-caption">
          Total saves triggered: {{ clicks }} | Loading: {{ isLoading }}
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Total saves triggered: 0/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /Save Draft/i }));
    await expect(canvas.getByText(/Total saves triggered: 1/)).toBeInTheDocument();
  },
};
