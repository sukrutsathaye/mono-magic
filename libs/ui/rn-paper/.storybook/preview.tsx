import type { Preview } from '@storybook/react';
import { MagicPaperProvider } from '../src/lib/theme/paper-theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MagicPaperProvider>
        <Story />
      </MagicPaperProvider>
    ),
  ],
};

export default preview;
