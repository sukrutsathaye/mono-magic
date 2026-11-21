/// <reference types="vitest/config" />
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookAngularVitest } from '@storybook/angular-vite/vitest';
import { playwright } from '@vitest/browser-playwright';
import { chromium } from 'playwright';
import { storybookVis } from 'storybook-addon-vis/vitest-plugin';
import { defineConfig } from 'vite';

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
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/ui/ng-mat',
  test: {
    projects: [
      {
        plugins: [
          angular({
            tsconfig: join(import.meta.dirname, 'tsconfig.vitest.json'),
          }),
        ],
        test: {
          name: 'ng-mat',
          watch: false,
          globals: true,
          environment: 'jsdom',
          include: [
            '{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
          ],
          setupFiles: ['src/test-setup.ts'],
          reporters: ['default'],
          coverage: {
            reportsDirectory: './test-output/vitest/coverage',
            provider: 'v8' as const,
          },
        },
      },
      {
        plugins: [
          storybookAngularVitest({
            styles: [join(import.meta.dirname, 'src/theme/styles.scss')],
            tsConfig: join(import.meta.dirname, '.storybook/tsconfig.json'),
          }),
          storybookTest({
            configDir: join(import.meta.dirname, '.storybook'),
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
          name: 'ng-mat-storybook',
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
