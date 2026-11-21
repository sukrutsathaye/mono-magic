/// <reference types="vitest/config" />
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
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
  cacheDir: '../../../node_modules/.vite/libs/ui/react-mui',
  plugins: [react()],
  server: {
    fs: {
      allow: [resolve(dirname, '../../../..')],
    },
  },
  test: {
    coverage: {
      provider: 'v8' as const,
      reportsDirectory: './test-output/vitest/coverage',
      include: ['src/lib/**/*.{ts,tsx}'],
      exclude: [
        'src/lib/**/*.stories.{ts,tsx}',
        'src/lib/**/*.spec.{ts,tsx}',
        'src/lib/**/*.test.{ts,tsx}',
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
        test: {
          name: 'react-mui',
          watch: false,
          globals: true,
          environment: 'jsdom',
          include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
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
          name: 'react-mui-storybook',
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