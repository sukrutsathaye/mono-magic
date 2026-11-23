import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/utils/ts-formatters',
  test: {
    name: 'utils-ts-formatters',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8' as const,
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reporters: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './test-output/vitest/coverage',
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
}));
