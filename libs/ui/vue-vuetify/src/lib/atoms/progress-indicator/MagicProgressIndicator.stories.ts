import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicProgressIndicator from './MagicProgressIndicator.vue';

const meta: Meta<typeof MagicProgressIndicator> = {
  title: 'Atoms/ProgressIndicator',
  component: MagicProgressIndicator,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    type: {
      control: 'select',
      options: ['bar', 'spinner'],
    },
    mode: {
      control: 'select',
      options: ['determinate', 'indeterminate', 'buffer', 'query'],
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
    value: { control: { type: 'range', min: 0, max: 100 } },
    bufferValue: { control: { type: 'range', min: 0, max: 100 } },
  },
  args: {
    type: 'bar',
    mode: 'determinate',
    value: 60,
    bufferValue: 80,
    color: 'primary',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LinearDeterminate: Story = {};

export const ModesGallery: Story = {
  render: () => ({
    components: { MagicProgressIndicator },
    template: `
      <div class="d-flex flex-column ga-4" style="max-width: 480px;">
        <div>
          <div class="text-caption mb-1">Determinate (65%)</div>
          <MagicProgressIndicator type="bar" mode="determinate" :value="65" color="primary" />
        </div>
        <div>
          <div class="text-caption mb-1">Buffer (45% / 75%)</div>
          <MagicProgressIndicator type="bar" mode="buffer" :value="45" :buffer-value="75" color="secondary" />
        </div>
        <div>
          <div class="text-caption mb-1">Indeterminate</div>
          <MagicProgressIndicator type="bar" mode="indeterminate" color="tertiary" />
        </div>
        <div class="d-flex ga-4 align-center pt-2">
          <MagicProgressIndicator type="spinner" mode="determinate" :value="75" color="success" size="md" />
          <MagicProgressIndicator type="spinner" mode="indeterminate" color="primary" size="lg" />
          <MagicProgressIndicator type="spinner" mode="indeterminate" color="warning" size="sm" />
        </div>
      </div>
    `,
  }),
};

export const InteractiveProgressStepper: Story = {
  render: () => ({
    components: { MagicProgressIndicator },
    setup() {
      const progress = ref(35);
      const step = (delta: number) => {
        progress.value = Math.max(0, Math.min(100, progress.value + delta));
      };
      return { progress, step };
    },
    template: `
      <div class="d-flex flex-column ga-4" style="max-width: 420px;">
        <MagicProgressIndicator type="bar" :value="progress" color="primary" size="lg" />
        <div class="d-flex align-center ga-4">
          <MagicProgressIndicator type="spinner" :value="progress" color="secondary" :diameter="48" />
          <div class="d-flex ga-2">
            <v-btn size="small" variant="outlined" @click="step(-15)">-15%</v-btn>
            <v-btn size="small" color="primary" @click="step(15)">+15%</v-btn>
            <v-btn size="small" variant="tonal" @click="progress = 0">Reset</v-btn>
          </div>
        </div>
        <div class="text-caption">Progress: {{ progress }}%</div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Progress: 35%/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /\+15%/i }));
    await expect(canvas.getByText(/Progress: 50%/)).toBeInTheDocument();
  },
};
