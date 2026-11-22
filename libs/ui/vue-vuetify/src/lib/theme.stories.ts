import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { MAGIC_VUETIFY_THEME_COLORS } from './theme';

const meta: Meta = {
  title: 'Foundation/ThemePalette',
  tags: ['autodocs'],
  render: () => ({
    setup() {
      const swatches = Object.entries(MAGIC_VUETIFY_THEME_COLORS.light);
      return { swatches };
    },
    template: `
      <div class="d-flex flex-wrap ga-3">
        <v-chip
          v-for="[name, hex] in swatches"
          :key="name"
          :color="name"
          variant="flat"
        >
          {{ name }} ({{ hex }})
        </v-chip>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LightPalette: Story = {};
