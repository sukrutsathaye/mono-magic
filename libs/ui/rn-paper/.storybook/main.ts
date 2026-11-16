import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  typescript: {
    reactDocgen: false,
  },
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      builder: {
        viteConfigPath: fileURLToPath(
          new URL('../vite.config.mts', import.meta.url)
        ),
      },
    },
  },
  viteFinal: async (viteConfig) => {
    viteConfig.define = {
      ...viteConfig.define,
      __DEV__: false,
    };
    return viteConfig;
  },
};

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default config;
