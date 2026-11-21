/// <reference types="vitest/config" />
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { chromium } from 'playwright';
import { storybookVis } from 'storybook-addon-vis/vitest-plugin';
import { defineConfig, type Plugin } from 'vite';

const require = createRequire(import.meta.url);
const projectDir = import.meta.dirname;
const reactNativeWebEntry = join(
  dirname(require.resolve('react-native-web/package.json')),
  'dist/index.js'
);
const reactNativePaperEntry = join(
  dirname(require.resolve('react-native-paper/package.json')),
  'lib/module/index.js'
);
const safeAreaContextEntry = join(
  dirname(require.resolve('react-native-safe-area-context/package.json')),
  'lib/module/index.js'
);
const VIRTUAL_VECTOR_ICONS_ID = '\0virtual:expo-vector-icons-stub';

function rnPaperWebPlugin(): Plugin {
  return {
    name: 'rn-paper-web',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith('@expo/vector-icons')) {
        return VIRTUAL_VECTOR_ICONS_ID;
      }
      return null;
    },
    load(id) {
      if (id === VIRTUAL_VECTOR_ICONS_ID) {
        return 'export default null;';
      }
      return null;
    },
    transform(code, id) {
      if (
        id.includes('react-native-paper') &&
        id.includes('MaterialCommunityIcon')
      ) {
        return code
          .replace(
            "require('@expo/vector-icons/MaterialCommunityIcons')",
            '({ default: null })'
          )
          .replace(
            "require('@react-native-vector-icons/material-design-icons')",
            '({ default: null })'
          )
          .replace(
            "require('react-native-vector-icons/MaterialCommunityIcons')",
            '({ default: null })'
          );
      }
      return null;
    },
  };
}

function resolveChromiumExecutablePath(): string | undefined {
  const envPath = process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'];
  if (envPath && existsSync(envPath)) {
    return envPath;
  }
  try {
    const bundledPath = chromium.executablePath();
    if (bundledPath && existsSync(bundledPath)) {
      return undefined;
    }
  } catch {
    // Fall back to system Chromium when Playwright's bundled browser is absent.
  }
  if (existsSync('/usr/bin/chromium')) {
    return '/usr/bin/chromium';
  }
  return undefined;
}

const chromiumExecutablePath = resolveChromiumExecutablePath();
const launchOptions = chromiumExecutablePath
  ? { executablePath: chromiumExecutablePath }
  : undefined;

const webExtensions = [
  '.web.tsx',
  '.web.ts',
  '.web.jsx',
  '.web.js',
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.json',
];

const rolldownOptions = {
  plugins: [rnPaperWebPlugin()],
  resolve: {
    extensions: webExtensions,
  },
};

export default defineConfig(() => ({
  root: projectDir,
  cacheDir: '../../../node_modules/.vite/libs/ui/rn-paper',
  plugins: [rnPaperWebPlugin(), react()],
  define: {
    __DEV__: false,
  },
  optimizeDeps: {
    rolldownOptions,
  },
  resolve: {
    alias: {
      'react-native': reactNativeWebEntry,
      'react-native-paper': reactNativePaperEntry,
      'react-native-safe-area-context': safeAreaContextEntry,
    },
    extensions: webExtensions,
  },
  server: {
    fs: {
      allow: [
        resolve(projectDir, '../../..'),
        resolve(projectDir, '../../../../mono-magic'),
      ],
    },
  },
  test: {
    watch: false,
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
      include: ['src/lib/**/*.{ts,tsx}'],
      exclude: [
        '**/*.stories.*',
        '**/*.spec.*',
        '**/*.test.*',
        '**/index.ts',
        'src/test-setup.ts',
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
          name: 'rn-paper',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['src/test-setup.ts'],
          include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          server: {
            deps: {
              inline: [
                /react-native-paper/,
                /react-native-safe-area-context/,
                /react-native-web/,
              ],
            },
          },
        },
      },
      {
        extends: true as const,
        plugins: [
          storybookTest({
            configDir: resolve(projectDir, '.storybook'),
          }),
          storybookVis(),
        ],
        optimizeDeps: {
          rolldownOptions,
          exclude: ['storybook-addon-vis', 'vitest-plugin-vis'],
          include: [
            'storybook-addon-vis > vitest-plugin-vis > ssim.js',
            'storybook-addon-vis > vitest-plugin-vis > pngjs',
          ],
        },
        test: {
          name: 'rn-paper-storybook',
          browser: {
            enabled: true,
            headless: true,
            api: { allowWrite: true },
            provider: playwright(launchOptions ? { launchOptions } : undefined),
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
