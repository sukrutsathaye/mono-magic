import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { ToolTipPosition } from '@mono-magic/atomic-design-interfaces';
import MagicButton from '../button/MagicButton.vue';
import MagicToolTip from './MagicToolTip.vue';

const meta: Meta<typeof MagicToolTip> = {
  title: 'Atoms/ToolTip',
  component: MagicToolTip,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    position: {
      control: 'select',
      options: ['above', 'below', 'left', 'right', 'before', 'after'],
    },
    touchGestures: {
      control: 'select',
      options: ['auto', 'on', 'off'],
    },
    showDelay: { control: 'number' },
    hideDelay: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: {
    message: 'Save changes to workspace',
    label: 'Hover me',
    position: 'above',
    showDelay: 0,
    hideDelay: 0,
    touchGestures: 'auto',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Positions: Story = {
  render: () => ({
    components: { MagicToolTip, MagicButton },
    setup() {
      const positions: ToolTipPosition[] = [
        'above',
        'below',
        'left',
        'right',
        'before',
        'after',
      ];
      return { positions };
    },
    template: `
      <div class="d-flex flex-wrap ga-4 pa-8 justify-center">
        <MagicToolTip
          v-for="pos in positions"
          :key="pos"
          :position="pos"
          :message="'Placed ' + pos"
        >
          <MagicButton variant="tonal" :label="pos" />
        </MagicToolTip>
      </div>
    `,
  }),
};

export const DelaysAndDisabled: Story = {
  render: () => ({
    components: { MagicToolTip, MagicButton },
    template: `
      <div class="d-flex flex-wrap ga-4 pa-4">
        <MagicToolTip message="Appears after 400ms" :show-delay="400" :hide-delay="200">
          <MagicButton variant="outlined" label="Delayed (400ms)" />
        </MagicToolTip>
        <MagicToolTip message="Tap to toggle tooltip" touch-gestures="on">
          <MagicButton variant="outlined" label="Click / Touch Toggle" color="secondary" />
        </MagicToolTip>
        <MagicToolTip message="Hidden when disabled" disabled>
          <MagicButton variant="outlined" label="Disabled Tooltip" />
        </MagicToolTip>
      </div>
    `,
  }),
};

export const InteractiveControlledAndPositionSwitcher: Story = {
  render: () => ({
    components: { MagicToolTip, MagicButton },
    setup() {
      const open = ref(false);
      const position = ref<ToolTipPosition>('above');
      const positions: ToolTipPosition[] = [
        'above',
        'below',
        'left',
        'right',
        'before',
        'after',
      ];
      const events = ref(0);
      return { open, position, positions, events };
    },
    template: `
      <div class="d-flex flex-column ga-4 pa-6 align-start">
        <div class="d-flex flex-wrap ga-2 align-center">
          <MagicButton
            :label="open ? 'Hide Tooltip' : 'Show Tooltip'"
            color="primary"
            @click="open = !open"
          />
          <MagicButton
            v-for="pos in positions"
            :key="pos"
            :label="pos"
            :variant="position === pos ? 'filled' : 'outlined'"
            size="sm"
            @click="position = pos"
          />
        </div>
        <div class="pa-6">
          <MagicToolTip
            v-model="open"
            :position="position"
            :message="'Controlled tooltip (' + position + ')'"
            @open="events += 1"
          >
            <MagicButton variant="elevated" color="tertiary" label="Target Element" />
          </MagicToolTip>
        </div>
        <div class="text-caption">
          Open: {{ open }} | Position: {{ position }} | Open events: {{ events }}
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Open: false \| Position: above/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'below' }));
    await userEvent.click(canvas.getByRole('button', { name: /Show Tooltip/i }));
    await expect(canvas.getByText(/Open: true \| Position: below/)).toBeInTheDocument();
  },
};
