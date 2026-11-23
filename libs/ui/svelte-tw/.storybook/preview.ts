import '../src/lib/styles/tailwind.css';
import type { Preview } from '@storybook/svelte-vite';
import { visAnnotations } from 'storybook-addon-vis';

const preview: Preview = {
  tags: ['autodocs', 'snapshot'],
  beforeEach: visAnnotations.beforeEach,
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
