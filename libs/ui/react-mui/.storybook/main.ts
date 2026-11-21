import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { defineStorybookVis } from 'storybook-addon-vis/node';
import { trimCommonFolder } from 'storybook-addon-vis/vitest-plugin';

const storybookDir =
  typeof __dirname === 'string'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));
const visRootDir = resolve(storybookDir, '../__vis__');

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    defineStorybookVis({
      visProjects: [
        {
          snapshotRootDir: ({ ci, platform }) =>
            relative(
              process.cwd(),
              resolve(visRootDir, ci ? platform : 'local'),
            ) || '.',
          snapshotSubpath: ({ subpath }) =>
            trimCommonFolder(
              subpath
                .replace(/^\.\//, '')
                .replace(/^libs\/ui\/react-mui\//, '')
                .replace(/^\.\.\//, ''),
            ),
        },
      ],
    }),
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.mts',
      },
    },
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: './tsconfig.lib.json',
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
};

export default config;
