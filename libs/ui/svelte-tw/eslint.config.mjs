import eslintPluginSvelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';
import baseConfig from '../../../eslint.config.mjs';
import svelteConfig from './svelte.config.js';

export default [
  ...baseConfig,
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
  },
  {
    ignores: ['dist', 'storybook-static', 'test-output', '**/out-tsc'],
  },
];
