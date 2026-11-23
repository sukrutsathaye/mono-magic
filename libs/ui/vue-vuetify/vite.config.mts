/// <reference types="vitest/config" />
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright';
import { chromium } from 'playwright';
import { storybookVis } from 'storybook-addon-vis/vitest-plugin';
import { defineConfig } from 'vite';
import vuetify from 'vite-plugin-vuetify';

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
  cacheDir: '../../../node_modules/.vite/libs/ui/vue-vuetify',
  plugins: [vue(), vuetify({ autoImport: true })],
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
      include: ['src/lib/**/*.{ts,vue}'],
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
          name: 'vue-vuetify',
          watch: false,
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
          reporters: ['default'],
          server: {
            deps: {
              inline: ['vuetify'],
            },
          },
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
            'vuetify',
            'vuetify/components',
            'vuetify/directives',
            'vuetify/iconsets/mdi',
            'vuetify/components/VBtn',
            'vuetify/components/VIcon',
            'vuetify/components/VTextField',
            'vuetify/components/VTooltip',
            'vuetify/components/VAvatar',
            'vuetify/components/VBadge',
            'vuetify/components/VBtnToggle',
            'vuetify/components/VCheckbox',
            'vuetify/components/VChip',
            'vuetify/components/VChipGroup',
            'vuetify/components/VImg',
            'vuetify/components/VProgressCircular',
            'vuetify/components/VProgressLinear',
            'vuetify/components/VRadio',
            'vuetify/components/VRadioGroup',
            'vuetify/components/VRangeSlider',
            'vuetify/components/VSlider',
            'vuetify/components/VSwitch',
          ],
        },
        test: {
          name: 'vue-vuetify-storybook',
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
