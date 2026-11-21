import type { Decorator, Preview } from '@storybook/react';
import { View } from 'react-native';
import { visAnnotations } from 'storybook-addon-vis';
import {
  createMagicPaperTheme,
  MAGIC_PAPER_PALETTE_OPTIONS,
  MAGIC_PAPER_THEMES,
  MagicPaperProvider,
  type MagicPaperPaletteName,
} from '../src/lib/theme/paper-theme';
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

function resolvePalette(raw: unknown): MagicPaperPaletteName {
  if (typeof raw === 'string' && raw in MAGIC_PAPER_THEMES) {
    return raw as MagicPaperPaletteName;
  }
  return 'azure-blue';
}

const withMagicPaperTheme: Decorator = (Story, context) => {
  ensureMaterialIconsFont();
  const palette = resolvePalette(context.globals['theme']);
  const theme = createMagicPaperTheme(palette);

  if (typeof document !== 'undefined' && document.body) {
    document.body.style.backgroundColor = theme.colors.background;
  }

  return (
    <MagicPaperProvider palette={palette}>
      <View
        style={{
          backgroundColor: theme.colors.background,
          padding: 16,
        }}
      >
        <Story />
      </View>
    </MagicPaperProvider>
  );
};

const preview: Preview = {
  tags: ['autodocs', 'snapshot'],
  beforeEach: visAnnotations.beforeEach,
  decorators: [withMagicPaperTheme],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Material 3 palette applied via MagicPaperProvider',
      defaultValue: 'azure-blue',
      toolbar: {
        icon: 'paintbrush',
        items: MAGIC_PAPER_PALETTE_OPTIONS.map(({ value, right, title }) => ({
          value,
          right,
          title,
        })),
        dynamicTitle: true,
      },
    },
  },
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
      page: DocumentationTemplate,
    },
  },
};

export default preview;
