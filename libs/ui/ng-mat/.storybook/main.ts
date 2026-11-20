import type { StorybookConfig } from '@storybook/angular-vite';
import { defineStorybookVis } from 'storybook-addon-vis/node';

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    defineStorybookVis(),
  ],
  framework: {
    name: '@storybook/angular-vite',
    options: {},
  },
};

export default config;
