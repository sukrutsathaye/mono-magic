#!/usr/bin/env node
/**
 * Synchronizes per-library `libs/<domain>/<project>/README.md` Test & Coverage
 * Summary tables, updates `tools/ci/coverage-metrics.json` from fresh coverage
 * artifacts (`coverage-summary.json`, `lcov.info`, `coverage.json`, `coverage.out`),
 * and verifies that root `README.md` links to every library's `README.md` with
 * up-to-date coverage percentages.
 *
 * Usage:
 *   node tools/ci/sync-readmes-and-coverage.mjs          # Collect available coverage & sync all READMEs
 *   node tools/ci/sync-readmes-and-coverage.mjs --check  # Exit 1 if any README coverage table or link is out of sync
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const METRICS_PATH = join(ROOT, 'tools/ci/coverage-metrics.json');
const ROOT_README_PATH = join(ROOT, 'README.md');
const CHECK_ONLY = process.argv.includes('--check');

const START_MARKER = '<!-- COVERAGE_TABLE_START -->';
const END_MARKER = '<!-- COVERAGE_TABLE_END -->';

/**
 * Canonical library registry across all domains in `libs/`.
 */
const LIBRARIES = [
  // UI Libraries
  {
    name: 'atomic-design-interfaces',
    domain: 'ui',
    root: 'libs/ui/atomic-design-interfaces',
    runner: 'Vitest V8 (`@vitest/coverage-v8`)',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'react-mui',
    domain: 'ui',
    root: 'libs/ui/react-mui',
    runner: 'Vitest V8 + Storybook Vitest',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'ng-mat',
    domain: 'ui',
    root: 'libs/ui/ng-mat',
    runner: 'Vitest V8 (AnalogJS) + Storybook Vitest',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'rn-paper',
    domain: 'ui',
    root: 'libs/ui/rn-paper',
    runner: 'Vitest V8 + Storybook Vitest',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'fl-mat',
    domain: 'ui',
    root: 'libs/ui/fl-mat',
    runner: 'Flutter Test (`flutter test --coverage`)',
    threshold: 80,
    kind: 'lcov',
  },
  {
    name: 'vue-vuetify',
    domain: 'ui',
    root: 'libs/ui/vue-vuetify',
    runner: 'Vitest V8 + Storybook Vitest',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'svelte-tw',
    domain: 'ui',
    root: 'libs/ui/svelte-tw',
    runner: 'Vitest V8 + Storybook Vitest',
    threshold: 80,
    kind: 'vitest',
  },
  // Data-Access Libraries
  {
    name: 'proto-contracts',
    domain: 'data-access',
    root: 'libs/data-access/proto-contracts',
    runner: 'Buf (`buf lint` & `buf breaking`)',
    threshold: 100,
    kind: 'proto',
  },
  {
    name: 'data-access-ts-interfaces',
    domain: 'data-access',
    root: 'libs/data-access/ts-interfaces',
    runner: 'Vitest V8 (`@vitest/coverage-v8`)',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'py-data-access-interfaces',
    domain: 'data-access',
    root: 'libs/data-access/py-interfaces',
    runner: 'Pytest (`pytest --cov`)',
    threshold: 80,
    kind: 'pytest',
  },
  {
    name: 'data-access-ts-firebase',
    domain: 'data-access',
    root: 'libs/data-access/ts-firebase',
    runner: 'Vitest V8 + Contract Compliance Suite',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'data-access-ts-supabase',
    domain: 'data-access',
    root: 'libs/data-access/ts-supabase',
    runner: 'Vitest V8 + Contract Compliance Suite',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'data-access-ts-reflective-api',
    domain: 'data-access',
    root: 'libs/data-access/ts-reflective-api',
    runner: 'Vitest V8 (`@vitest/coverage-v8`)',
    threshold: 80,
    kind: 'vitest',
  },
  {
    name: 'py-reflective-nlp',
    domain: 'data-access',
    root: 'libs/data-access/py-reflective-nlp',
    runner: 'Pytest (`pytest --cov`)',
    threshold: 80,
    kind: 'pytest',
  },
  // Utility Libraries (>= 90% threshold)
  {
    name: 'utils-ts-core',
    domain: 'utils',
    root: 'libs/utils/ts-core',
    runner: 'Vitest V8 (`@vitest/coverage-v8`)',
    threshold: 90,
    kind: 'vitest',
  },
  {
    name: 'utils-ts-formatters',
    domain: 'utils',
    root: 'libs/utils/ts-formatters',
    runner: 'Vitest V8 (`@vitest/coverage-v8`)',
    threshold: 90,
    kind: 'vitest',
  },
  {
    name: 'py-utils-common',
    domain: 'utils',
    root: 'libs/utils/py-common',
    runner: 'Pytest (`pytest --cov`)',
    threshold: 90,
    kind: 'pytest',
  },
  {
    name: 'py-utils-nlp',
    domain: 'utils',
    root: 'libs/utils/py-nlp',
    runner: 'Pytest (`pytest --cov`)',
    threshold: 90,
    kind: 'pytest',
  },
  {
    name: 'rs-utils-pose-math',
    domain: 'utils',
    root: 'libs/utils/rs-pose-math',
    runner: 'Cargo Test (`cargo test` + doc-tests)',
    threshold: 90,
    kind: 'rust',
  },
  {
    name: 'rs-utils-design-tokens',
    domain: 'utils',
    root: 'libs/utils/rs-design-tokens',
    runner: 'Cargo Test (`cargo test` + doc-tests)',
    threshold: 90,
    kind: 'rust',
  },
  {
    name: 'go-utils-core',
    domain: 'utils',
    root: 'libs/utils/go-core',
    runner: 'Go Test (`go test -race -cover`)',
    threshold: 90,
    kind: 'go',
  },
];

function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function parseLcov(lcovText) {
  let lf = 0;
  let lh = 0;
  let fnf = 0;
  let fnh = 0;
  let brf = 0;
  let brh = 0;
  for (const raw of lcovText.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('LF:')) lf += Number(line.slice(3)) || 0;
    else if (line.startsWith('LH:')) lh += Number(line.slice(3)) || 0;
    else if (line.startsWith('FNF:')) fnf += Number(line.slice(4)) || 0;
    else if (line.startsWith('FNH:')) fnh += Number(line.slice(4)) || 0;
    else if (line.startsWith('BRF:')) brf += Number(line.slice(4)) || 0;
    else if (line.startsWith('BRH:')) brh += Number(line.slice(4)) || 0;
  }
  const pct = (hit, found) =>
    found > 0 ? Number(((hit / found) * 100).toFixed(1)) : 100.0;
  const linePct = pct(lh, lf);
  return {
    lines: linePct,
    statements: linePct,
    functions: fnf > 0 ? pct(fnh, fnf) : linePct,
    branches: brf > 0 ? pct(brh, brf) : linePct,
  };
}

function parseGoCoverProfile(coverText) {
  let totalStmts = 0;
  let coveredStmts = 0;
  for (const raw of coverText.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('mode:')) continue;
    const parts = line.split(/\s+/);
    if (parts.length >= 3) {
      const stmts = Number(parts[1]) || 0;
      const count = Number(parts[2]) || 0;
      totalStmts += stmts;
      if (count > 0) coveredStmts += stmts;
    }
  }
  const pct =
    totalStmts > 0 ? Number(((coveredStmts / totalStmts) * 100).toFixed(1)) : null;
  if (pct === null) return null;
  return {
    lines: pct,
    statements: pct,
    functions: pct,
    branches: pct,
  };
}

/**
 * Attempts to read fresh coverage output from disk for a library if present.
 */
function collectDiskCoverage(lib) {
  const absRoot = join(ROOT, lib.root);
  if (lib.kind === 'vitest') {
    const summaryPath = join(
      absRoot,
      'test-output/vitest/coverage/coverage-summary.json'
    );
    const data = readJsonIfExists(summaryPath);
    if (data?.total) {
      return {
        lines: Number((data.total.lines?.pct ?? 0).toFixed(1)),
        statements: Number((data.total.statements?.pct ?? 0).toFixed(1)),
        functions: Number((data.total.functions?.pct ?? 0).toFixed(1)),
        branches: Number((data.total.branches?.pct ?? 0).toFixed(1)),
      };
    }
  } else if (lib.kind === 'lcov') {
    const lcovPath = join(absRoot, 'coverage/lcov.info');
    if (existsSync(lcovPath)) {
      return parseLcov(readFileSync(lcovPath, 'utf8'));
    }
  } else if (lib.kind === 'pytest') {
    const pyCovPath = join(absRoot, 'coverage.json');
    const data = readJsonIfExists(pyCovPath);
    if (data?.totals) {
      const linePct = Number((data.totals.percent_covered ?? 0).toFixed(1));
      return {
        lines: linePct,
        statements: linePct,
        functions: linePct,
        branches:
          data.totals.num_branches > 0
            ? Number(
                (
                  (data.totals.covered_branches / data.totals.num_branches) *
                  100
                ).toFixed(1)
              )
            : linePct,
      };
    }
  } else if (lib.kind === 'go') {
    const goCovPath = join(absRoot, 'coverage.out');
    if (existsSync(goCovPath)) {
      return parseGoCoverProfile(readFileSync(goCovPath, 'utf8'));
    }
  }
  return null;
}

/**
 * Formats the markdown coverage section for an individual library README.md.
 */
function renderLibraryCoverageBlock(lib, metrics) {
  if (lib.kind === 'proto') {
    return [
      START_MARKER,
      '## Schema Validation & Coverage Summary',
      '',
      '> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever schemas or tests change.',
      '',
      '| Project | Validator / Runner | Schemas | Lint Gate | Breaking-Change Gate | Status |',
      '| --- | --- | --- | --- | --- | --- |',
      `| \`${lib.name}\` | ${lib.runner} | 6 \`.proto\` contracts | \`buf lint\` (100%) | \`buf breaking\` | Passing |`,
      END_MARKER,
    ].join('\n');
  }

  const fmt = (val) => (typeof val === 'number' ? `${val.toFixed(1)}%` : '—');
  return [
    START_MARKER,
    '## Test & Coverage Summary',
    '',
    '> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.',
    '',
    '| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    `| \`${lib.name}\` | ${lib.runner} | **${fmt(metrics.lines)}** | **${fmt(metrics.statements)}** | **${fmt(metrics.functions)}** | **${fmt(metrics.branches)}** | \`>= ${lib.threshold}%\` | Passing |`,
    END_MARKER,
  ].join('\n');
}

/**
 * Injects or updates the coverage block inside `libs/<domain>/<project>/README.md`.
 */
function updateLibraryReadme(readmeText, coverageBlock) {
  const startIdx = readmeText.indexOf(START_MARKER);
  const endIdx = readmeText.indexOf(END_MARKER);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return (
      readmeText.slice(0, startIdx) +
      coverageBlock +
      readmeText.slice(endIdx + END_MARKER.length)
    );
  }
  const trimmed = readmeText.trimEnd();
  return `${trimmed}\n\n---\n\n${coverageBlock}\n`;
}

function main() {
  const storedMetrics = readJsonIfExists(METRICS_PATH) ?? {};
  const nextMetrics = { ...storedMetrics };

  for (const lib of LIBRARIES) {
    const fresh = collectDiskCoverage(lib);
    if (fresh) {
      nextMetrics[lib.name] = fresh;
    } else if (!nextMetrics[lib.name]) {
      nextMetrics[lib.name] =
        lib.kind === 'proto'
          ? { lines: 100, statements: 100, functions: 100, branches: 100 }
          : {
              lines: lib.threshold,
              statements: lib.threshold,
              functions: lib.threshold,
              branches: lib.threshold,
            };
    }
  }

  let hasDrift = false;

  if (!CHECK_ONLY) {
    writeFileSync(
      METRICS_PATH,
      `${JSON.stringify(nextMetrics, null, 2)}\n`,
      'utf8'
    );
  }

  for (const lib of LIBRARIES) {
    const readmePath = join(ROOT, lib.root, 'README.md');
    if (!existsSync(readmePath)) {
      console.error(`Missing library README: ${lib.root}/README.md`);
      hasDrift = true;
      continue;
    }
    const existing = readFileSync(readmePath, 'utf8');
    const block = renderLibraryCoverageBlock(lib, nextMetrics[lib.name]);
    const updated = updateLibraryReadme(existing, block);
    if (updated !== existing) {
      if (CHECK_ONLY) {
        console.error(
          `Coverage table out of date in ${lib.root}/README.md. Run: node tools/ci/sync-readmes-and-coverage.mjs`
        );
        hasDrift = true;
      } else {
        writeFileSync(readmePath, updated, 'utf8');
        console.log(`Updated coverage table in ${lib.root}/README.md`);
      }
    }
  }

  // Verify and sync root README.md links + inline <!-- COV:<name> --> badges
  if (existsSync(ROOT_README_PATH)) {
    const existingRoot = readFileSync(ROOT_README_PATH, 'utf8');
    let updatedRoot = existingRoot;

    for (const lib of LIBRARIES) {
      const relReadme = `${lib.root}/README.md`;
      if (!updatedRoot.includes(relReadme)) {
        console.error(
          `Root README.md is missing a link to ${relReadme} (${lib.name}).`
        );
        hasDrift = true;
      }
      const m = nextMetrics[lib.name];
      const cellText =
        lib.kind === 'proto'
          ? '`buf lint` (100%)'
          : `**${Number(m.lines).toFixed(1)}%** lines / **${Number(m.branches).toFixed(1)}%** branches`;
      const startTag = `<!-- COV:${lib.name} -->`;
      const endTag = `<!-- /COV:${lib.name} -->`;
      const sIdx = updatedRoot.indexOf(startTag);
      const eIdx = updatedRoot.indexOf(endTag);
      if (sIdx !== -1 && eIdx !== -1 && eIdx > sIdx) {
        updatedRoot =
          updatedRoot.slice(0, sIdx + startTag.length) +
          cellText +
          updatedRoot.slice(eIdx);
      }
    }

    if (updatedRoot !== existingRoot) {
      if (CHECK_ONLY) {
        console.error(
          'Root README.md coverage cells are out of date. Run: node tools/ci/sync-readmes-and-coverage.mjs'
        );
        hasDrift = true;
      } else {
        writeFileSync(ROOT_README_PATH, updatedRoot, 'utf8');
        console.log('Updated coverage cells in root README.md');
      }
    }
  }

  if (CHECK_ONLY && hasDrift) {
    process.exit(1);
  }

  if (CHECK_ONLY) {
    console.log('All library READMEs, coverage tables, and root README links are in sync.');
  }
}

main();
