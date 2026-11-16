import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
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

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/ui/rn-paper',
  plugins: [rnPaperWebPlugin(), react()],
  define: {
    __DEV__: false,
  },
  optimizeDeps: {
    rolldownOptions: {
      plugins: [rnPaperWebPlugin()],
      resolve: {
        extensions: webExtensions,
      },
    },
  },
  resolve: {
    alias: {
      'react-native': reactNativeWebEntry,
      'react-native-paper': reactNativePaperEntry,
      'react-native-safe-area-context': safeAreaContextEntry,
    },
    extensions: webExtensions,
  },
  test: {
    name: 'rn-paper',
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    server: {
      deps: {
        inline: [
          /react-native-paper/,
          /react-native-safe-area-context/,
          /react-native-web/,
        ],
      },
    },
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
