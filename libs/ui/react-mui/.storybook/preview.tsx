import type { Preview } from '@storybook/react';
import { MagicMuiThemeProvider } from '../src/lib/theme/mui-theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MagicMuiThemeProvider>
        <Story />
      </MagicMuiThemeProvider>
    ),
  ],
};

export default preview;
