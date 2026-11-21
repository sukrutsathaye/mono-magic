import Box from '@mui/material/Box';
import type { Decorator, Preview } from '@storybook/react-vite';
import { visAnnotations } from 'storybook-addon-vis';
import {
  MAGIC_PALETTE_DEFINITIONS,
  MagicMuiThemeProvider,
  type MagicPaletteName,
} from '../src/lib/theme/mui-theme';
import DocumentationTemplate from './DocumentationTemplate.mdx';

const ensureMaterialIconsFont = (): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const id = 'magic-material-icons-font';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(link);
  }
};

const isMagicPaletteName = (value: unknown): value is MagicPaletteName =>
  typeof value === 'string' && value in MAGIC_PALETTE_DEFINITIONS;

const withMagicTheme: Decorator = (Story, context) => {
  ensureMaterialIconsFont();
  const rawTheme = context.globals['theme'];
  const selectedPalette: MagicPaletteName = isMagicPaletteName(rawTheme)
    ? rawTheme
    : 'azure-blue';
  const paletteDef = MAGIC_PALETTE_DEFINITIONS[selectedPalette];

  if (typeof document !== 'undefined') {
    document.body.style.backgroundColor = paletteDef.surface;
    document.body.style.color = paletteDef.onSurface;
  }

  return (
    <MagicMuiThemeProvider palette={selectedPalette}>
      <Box
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          p: 2,
          borderRadius: 1,
        }}
      >
        <Story />
      </Box>
    </MagicMuiThemeProvider>
  );
};

const preview: Preview = {
  tags: ['autodocs', 'snapshot'],
  beforeEach: visAnnotations.beforeEach,
  decorators: [withMagicTheme],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Material 3 palette applied via MagicMuiThemeProvider',
      defaultValue: 'azure-blue',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'azure-blue', right: '💙', title: 'Azure Blue (Light)' },
          {
            value: 'light-theme',
            right: '☀️',
            title: 'Violet / Orange (Light)',
          },
          { value: 'dark-theme', right: '🌙', title: 'Green / Orange (Dark)' },
          { value: 'rose-red', right: '🌹', title: 'Rose Red (Light)' },
          { value: 'cyan-orange', right: '🟦', title: 'Cyan Orange (Dark)' },
          { value: 'orange-red', right: '🟧', title: 'Orange Red (Light)' },
          {
            value: 'magenta-violet',
            right: '💜',
            title: 'Magenta Violet (Dark)',
          },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    a11y: {
      // Switch to 'error' once existing component axe-core violations are resolved
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
      page: DocumentationTemplate,
    },
  },
};

export default preview;
