/// <reference types="vitest/config" />
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { playwright } from '@vitest/browser-playwright';
import { chromium } from 'playwright';
import { storybookVis } from 'storybook-addon-vis/vitest-plugin';
import { defineConfig } from 'vite';

const dirname = import.meta.dirname;

function resolvePlaywrightOptions() {
  const envPath = process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'];
  if (envPath && existsSync(envPath)) {
    return { launchOptions: { executablePath: envPath } };
  }

  let bundledPath: string | undefined;
  try {
    bundledPath = chromium.executablePath();
  } catch {
    bundledPath = undefined;
  }

  if (bundledPath && existsSync(bundledPath)) {
    return {};
  }

  if (existsSync('/usr/bin/chromium')) {
    return { launchOptions: { executablePath: '/usr/bin/chromium' } };
  }

  return {};
}

const playwrightOptions = resolvePlaywrightOptions();

export default defineConfig(() => ({
  root: dirname,
  cacheDir: '../../../node_modules/.vite/libs/ui/svelte-tw',
  plugins: [svelte(), tailwindcss()],
  server: {
    fs: {
      allow: [resolve(dirname, '../../../..')],
    },
  },
  test: {
    coverage: {
      provider: 'v8' as const,
      reportsDirectory: './test-output/vitest/coverage',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reporters: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/lib/**/*.{ts,svelte}'],
      exclude: [
        'src/lib/**/*.stories.{ts,svelte}',
        'src/lib/**/*StoryDemo.svelte',
        'src/lib/**/ThemePreview.svelte',
        'src/lib/**/*.spec.ts',
        'src/lib/**/*.test.ts',
        'src/lib/**/index.ts',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
    projects: [
      {
        extends: true as const,
        plugins: [svelteTesting()],
        resolve: {
          conditions: ['browser'],
        },
        test: {
          name: 'svelte-tw',
          watch: false,
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
          reporters: ['default'],
        },
      },
      {
        extends: true as const,
        plugins: [
          storybookTest({
            configDir: resolve(dirname, '.storybook'),
          }),
          storybookVis(),
        ],
        optimizeDeps: {
          exclude: ['storybook-addon-vis', 'vitest-plugin-vis'],
          include: [
            'storybook-addon-vis > vitest-plugin-vis > ssim.js',
            'storybook-addon-vis > vitest-plugin-vis > pngjs',
          ],
        },
        test: {
          name: 'svelte-tw-storybook',
          browser: {
            enabled: true,
            headless: true,
            api: { allowWrite: true },
            provider: playwright(playwrightOptions),
            instances: [
              {
                browser: 'chromium' as const,
                viewport: { width: 1280, height: 720 },
              },
            ],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
}));
