import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { setup, type Preview } from '@storybook/vue3-vite';
import { visAnnotations } from 'storybook-addon-vis';
import { createMagicVuetify } from '../src/lib/vuetify';

const vuetify = createMagicVuetify();

setup((app) => {
  app.use(vuetify);
});

const preview: Preview = {
  tags: ['autodocs', 'snapshot'],
  beforeEach: visAnnotations.beforeEach,
  decorators: [
    (story) => ({
      components: { story },
      template: '<v-app><v-main class="pa-4"><story /></v-main></v-app>',
    }),
  ],
  parameters: {
    a11y: {
      test: 'todo',
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;
