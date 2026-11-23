import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import MagicSlideToggle from './MagicSlideToggle.vue';

const meta: Meta<typeof MagicSlideToggle> = {
  title: 'Atoms/SlideToggle',
  component: MagicSlideToggle,
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
    hideIcon: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Auto-save drafts',
    checked: true,
    color: 'primary',
    size: 'md',
    labelPosition: 'after',
    hideIcon: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VariantsAndStates: Story = {
  render: () => ({
    components: { MagicSlideToggle },
    template: `
      <div class="d-flex flex-column ga-2">
        <MagicSlideToggle label="Primary (with icons)" :checked="true" color="primary" />
        <MagicSlideToggle label="Success (no icons)" :checked="true" hide-icon color="success" />
        <MagicSlideToggle label="Label before" :checked="false" label-position="before" color="secondary" />
        <MagicSlideToggle label="Disabled" :checked="true" disabled />
      </div>
    `,
  }),
};

export const InteractiveSettingsPanel: Story = {
  render: () => ({
    components: { MagicSlideToggle },
    setup() {
      const emailAlerts = ref(true);
      const pushAlerts = ref(false);
      const compactMode = ref(false);
      return { emailAlerts, pushAlerts, compactMode };
    },
    template: `
      <div class="d-flex flex-column ga-2" style="max-width: 320px;">
        <MagicSlideToggle v-model="emailAlerts" label="Email notifications" color="primary" />
        <MagicSlideToggle v-model="pushAlerts" label="Push notifications" color="secondary" />
        <MagicSlideToggle v-model="compactMode" label="Compact density" color="tertiary" hide-icon />
        <div class="text-caption pt-2">
          Email: {{ emailAlerts ? 'ON' : 'OFF' }} |
          Push: {{ pushAlerts ? 'ON' : 'OFF' }} |
          Compact: {{ compactMode ? 'ON' : 'OFF' }}
        </div>
      </div>
    `,
  }),
};
