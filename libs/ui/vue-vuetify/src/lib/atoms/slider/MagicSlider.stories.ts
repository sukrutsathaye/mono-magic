import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import MagicSlider from './MagicSlider.vue';

const meta: Meta<typeof MagicSlider> = {
  title: 'Atoms/Slider',
  component: MagicSlider,
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
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    discrete: { control: 'boolean' },
    showTickMarks: { control: 'boolean' },
    range: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    min: 0,
    max: 100,
    step: 5,
    value: 50,
    color: 'primary',
    size: 'md',
    discrete: true,
    showTickMarks: false,
    range: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InteractiveVolumeAndPriceRange: Story = {
  render: () => ({
    components: { MagicSlider },
    setup() {
      const volume = ref(65);
      const priceRange = ref<[number, number]>([25, 75]);
      const formatPercent = (v: number) => `${v}%`;
      const formatDollar = (v: number) => `$${v}`;
      return { volume, priceRange, formatPercent, formatDollar };
    },
    template: `
      <div class="d-flex flex-column ga-6 pa-4" style="max-width: 440px;">
        <div>
          <div class="text-subtitle-2 mb-4">Volume: {{ volume }}%</div>
          <MagicSlider
            v-model="volume"
            :min="0"
            :max="100"
            :step="5"
            discrete
            show-tick-marks
            :display-with="formatPercent"
            color="primary"
          />
        </div>
        <div>
          <div class="text-subtitle-2 mb-4">
            Price Range: \${{ priceRange[0] }} – \${{ priceRange[1] }}
          </div>
          <MagicSlider
            v-model="priceRange"
            range
            :min="0"
            :max="100"
            :step="5"
            discrete
            :display-with="formatDollar"
            color="secondary"
          />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Volume: 65%')).toBeInTheDocument();
    await expect(canvas.getByText(/Price Range: \$25 – \$75/)).toBeInTheDocument();
    const sliders = canvas.getAllByRole('slider');
    await expect(sliders.length).toBeGreaterThanOrEqual(2);
  },
};
