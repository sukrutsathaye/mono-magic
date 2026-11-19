import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import {
  applicationConfig,
  type Decorator,
  type Preview,
} from '@storybook/angular';
import DocumentationTemplate from './DocumentationTemplate.mdx';
import docJson from './documentation.json';

setCompodocJson(docJson);

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

const PALETTE_CLASSES = [
  'light-theme',
  'dark-theme',
  'rose-red',
  'cyan-orange',
  'orange-red',
  'azure-blue',
  'magenta-violet',
] as const;

const withTheme: Decorator = (storyFn, context) => {
  ensureMaterialIconsFont();
  const selectedTheme =
    (context.globals['theme'] as string | undefined) ?? 'azure-blue';
  if (typeof document !== 'undefined') {
    document.body.classList.remove(...PALETTE_CLASSES);
    document.body.classList.add(selectedTheme);
  }
  return storyFn();
};

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimationsAsync(), provideNativeDateAdapter()],
    }),
    withTheme,
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Material 3 palette class applied to document.body',
      defaultValue: 'azure-blue',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'azure-blue', right: '💙', title: 'Azure Blue (Light)' },
          { value: 'light-theme', right: '☀️', title: 'Violet / Orange (Light)' },
          { value: 'dark-theme', right: '🌙', title: 'Green / Orange (Dark)' },
          { value: 'rose-red', right: '🌹', title: 'Rose Red (Light)' },
          { value: 'cyan-orange', right: '🟦', title: 'Cyan Orange (Dark)' },
          { value: 'orange-red', right: '🟧', title: 'Orange Red (Light)' },
          { value: 'magenta-violet', right: '💜', title: 'Magenta Violet (Dark)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
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
