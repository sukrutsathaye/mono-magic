import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import MagicBadge from './MagicBadge.vue';

const meta: Meta<typeof MagicBadge> = {
  title: 'Atoms/Badge',
  component: MagicBadge,
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
    position: {
      control: 'select',
      options: [
        'above after',
        'above before',
        'below after',
        'below before',
        'above',
        'below',
        'before',
        'after',
      ],
    },
    overlap: { control: 'boolean' },
    hidden: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    content: 4,
    label: 'Notifications',
    color: 'primary',
    size: 'md',
    position: 'above after',
    overlap: true,
    hidden: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    content: '99+',
    icon: 'bell',
    color: 'error',
    size: 'lg',
  },
};

export const ColorIntents: Story = {
  render: () => ({
    components: { MagicBadge },
    template: `
      <div class="d-flex flex-wrap ga-6 align-center">
        <MagicBadge content="3" color="primary" icon="email" />
        <MagicBadge content="7" color="secondary" icon="chat" />
        <MagicBadge content="2" color="tertiary" icon="star" />
        <MagicBadge content="OK" color="success" icon="check-circle" />
        <MagicBadge content="!" color="warning" icon="alert" />
        <MagicBadge content="99+" color="error" icon="bell" />
        <MagicBadge content="0" color="neutral" icon="inbox" />
      </div>
    `,
  }),
};

export const Positions: Story = {
  render: () => ({
    components: { MagicBadge },
    template: `
      <div class="d-flex flex-wrap ga-8 align-center pa-4">
        <MagicBadge content="1" position="above after" label="Above After" />
        <MagicBadge content="2" position="above before" label="Above Before" />
        <MagicBadge content="3" position="below after" label="Below After" />
        <MagicBadge content="4" position="below before" label="Below Before" />
      </div>
    `,
  }),
};

export const InteractiveCounter: Story = {
  render: () => ({
    components: { MagicBadge },
    setup() {
      const count = ref(3);
      const hidden = ref(false);
      const increment = () => {
        count.value += 1;
      };
      const reset = () => {
        count.value = 0;
      };
      return { count, hidden, increment, reset };
    },
    template: `
      <div class="d-flex flex-column ga-4 align-start">
        <MagicBadge
          :content="count"
          :hidden="hidden"
          color="error"
          description="Unread notifications"
        >
          <v-btn variant="outlined" prepend-icon="mdi-bell">Inbox</v-btn>
        </MagicBadge>
        <div class="d-flex ga-2 align-center">
          <v-btn size="small" color="primary" @click="increment">+1 Notification</v-btn>
          <v-btn size="small" variant="tonal" @click="reset">Clear</v-btn>
          <v-btn size="small" variant="outlined" @click="hidden = !hidden">
            {{ hidden ? 'Show Badge' : 'Hide Badge' }}
          </v-btn>
        </div>
        <div class="text-caption">Current count: {{ count }} | Hidden: {{ hidden }}</div>
      </div>
    `,
  }),
};
