import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import MagicRadioButton from './MagicRadioButton.vue';

const meta: Meta<typeof MagicRadioButton> = {
  title: 'Atoms/RadioButton',
  component: MagicRadioButton,
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
    vertical: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    options: [
      { value: 'light', label: 'Light Theme' },
      { value: 'dark', label: 'Dark Theme' },
      { value: 'system', label: 'System Default' },
    ],
    value: 'system',
    color: 'primary',
    size: 'md',
    vertical: true,
    labelPosition: 'after',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HorizontalInline: Story = {
  args: {
    vertical: false,
    color: 'secondary',
  },
};

export const InteractivePlanSelector: Story = {
  render: () => ({
    components: { MagicRadioButton },
    setup() {
      const selectedPlan = ref('pro');
      const options = [
        { value: 'free', label: 'Free — $0/mo' },
        { value: 'pro', label: 'Pro — $19/mo' },
        { value: 'team', label: 'Team — $49/mo' },
        { value: 'legacy', label: 'Legacy (Unavailable)', disabled: true },
      ];
      return { selectedPlan, options };
    },
    template: `
      <div class="d-flex flex-column ga-3">
        <MagicRadioButton
          v-model="selectedPlan"
          :options="options"
          name="billing-plan"
          color="primary"
        />
        <div class="text-caption">Selected billing tier: <strong>{{ selectedPlan }}</strong></div>
      </div>
    `,
  }),
};
