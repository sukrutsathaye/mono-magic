#!/usr/bin/env node
/**
 * Modular helper for discovering, building, and assembling all workspace
 * showcases (Storybooks and Flutter Widgetbooks) plus Unit and Storybook
 * coverage reports and coverage percentage badges into a single static
 * GitHub Pages bundle (`dist/storybook-pages`).
 *
 * Subcommands:
 *   discover [--names | --matrix]   Print discovered projects as JSON
 *   build <project> [--out <dir>]   Build one project into dist/storybook-pages/<project>
 *   assemble [--out <dir>]          Generate portal index.html and .nojekyll
 */
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, posix, resolve } from 'node:path';

const WORKSPACE_ROOT = process.cwd();
const DEFAULT_OUT_DIR = resolve(WORKSPACE_ROOT, 'dist/storybook-pages');
const MAIN_CONFIG_RE = /^main\.(ts|tsx|js|jsx|mjs|mts|cjs|cts)$/;
const IGNORED_DIRS = new Set([
  '.git',
  '.nx',
  '.angular',
  '.dart_tool',
  '.widget_preview',
  'node_modules',
  'dist',
  'build',
  'out-tsc',
  'coverage',
  'test-output',
  'storybook-static',
]);

function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function readExcludedPaths() {
  const workspaceFile = join(WORKSPACE_ROOT, 'pnpm-workspace.yaml');
  if (!existsSync(workspaceFile)) {
    return new Set();
  }
  const content = readFileSync(workspaceFile, 'utf8');
  const excluded = new Set();
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*-\s*["']?!([^"']+)["']?\s*$/);
    if (match) {
      excluded.add(match[1].replace(/\/+$/, ''));
    }
  }
  return excluded;
}

function resolveProjectIdentity(absDir, relDir) {
  const projectJson = readJsonIfExists(join(absDir, 'project.json'));
  const packageJson = readJsonIfExists(join(absDir, 'package.json'));
  const name =
    projectJson?.name ??
    packageJson?.nx?.name ??
    packageJson?.name?.replace(/^@[^/]+\//, '') ??
    posix.basename(relDir);
  const packageName = packageJson?.name ?? `@mono-magic/${name}`;
  const tags = projectJson?.tags ?? packageJson?.nx?.tags ?? [];
  return { projectJson, packageJson, name, packageName, tags };
}

function findShowcaseProjects() {
  const excluded = readExcludedPaths();
  const projects = [];

  function walk(absDir, relDir) {
    const entries = readdirSync(absDir, { withFileTypes: true });
    const storybookDir = entries.find(
      (entry) => entry.isDirectory() && entry.name === '.storybook',
    );
    const hasWidgetbook =
      relDir &&
      existsSync(join(absDir, 'pubspec.yaml')) &&
      existsSync(join(absDir, 'lib/widgetbook.dart'));

    const isNodeExcluded = Boolean(relDir && excluded.has(relDir));

    if (storybookDir && relDir && !isNodeExcluded) {
      const sbFiles = readdirSync(join(absDir, '.storybook'));
      if (sbFiles.some((name) => MAIN_CONFIG_RE.test(name))) {
        const { projectJson, name, packageName, tags } = resolveProjectIdentity(
          absDir,
          relDir,
        );
        const buildTarget = projectJson?.targets?.['build-storybook'];
        const configuredOutputDir = buildTarget?.options?.outputDir;
        const outputDir =
          configuredOutputDir ?? posix.join(relDir, 'storybook-static');
        const hasCiConfig = Boolean(buildTarget?.configurations?.ci);
        const hasCompodoc = existsSync(
          join(absDir, '.storybook/tsconfig.doc.json'),
        );

        projects.push({
          name,
          type: 'storybook',
          packageName,
          root: relDir,
          tags,
          outputDir,
          hasCiConfig,
          hasCompodoc,
        });
      }
    } else if (hasWidgetbook) {
      const { projectJson, name, packageName, tags } = resolveProjectIdentity(
        absDir,
        relDir,
      );
      const buildTarget = projectJson?.targets?.['build-widgetbook'];
      if (buildTarget) {
        projects.push({
          name,
          type: 'widgetbook',
          packageName,
          root: relDir,
          tags,
          outputDir: posix.join(relDir, 'build/web'),
          hasCiConfig: Boolean(buildTarget?.configurations?.ci),
          hasCompodoc: false,
        });
      }
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      if (entry.name === '.storybook' || entry.name.startsWith('.')) {
        continue;
      }
      const nextRel = relDir ? posix.join(relDir, entry.name) : entry.name;
      walk(join(absDir, entry.name), nextRel);
    }
  }

  for (const top of ['apps', 'libs']) {
    const absTop = join(WORKSPACE_ROOT, top);
    if (existsSync(absTop)) {
      walk(absTop, top);
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

function runCommand(cmd, args) {
  execFileSync(cmd, args, {
    cwd: WORKSPACE_ROOT,
    stdio: 'inherit',
  });
}

function normalizeWidgetbookBaseHref(projectName) {
  const rawBasePath = (process.env['PAGES_BASE_PATH'] ?? '').trim();
  const cleanPrefix = rawBasePath.replace(/^\/+|\/+$/g, '');
  return cleanPrefix ? `/${cleanPrefix}/${projectName}/` : `/${projectName}/`;
}

/**
 * Parse LCOV text into line/function/branch summary percentages and per-file entries.
 */
function parseLcovContent(lcovText) {
  let linesFound = 0;
  let linesHit = 0;
  let funcsFound = 0;
  let funcsHit = 0;
  let branchesFound = 0;
  let branchesHit = 0;
  const files = [];
  let currentFile = null;

  for (const rawLine of lcovText.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('SF:')) {
      currentFile = {
        file: line.slice(3),
        lf: 0,
        lh: 0,
        fnf: 0,
        fnh: 0,
        brf: 0,
        brh: 0,
      };
    } else if (line.startsWith('LF:')) {
      const val = Number(line.slice(3)) || 0;
      linesFound += val;
      if (currentFile) currentFile.lf = val;
    } else if (line.startsWith('LH:')) {
      const val = Number(line.slice(3)) || 0;
      linesHit += val;
      if (currentFile) currentFile.lh = val;
    } else if (line.startsWith('FNF:')) {
      const val = Number(line.slice(4)) || 0;
      funcsFound += val;
      if (currentFile) currentFile.fnf = val;
    } else if (line.startsWith('FNH:')) {
      const val = Number(line.slice(4)) || 0;
      funcsHit += val;
      if (currentFile) currentFile.fnh = val;
    } else if (line.startsWith('BRF:')) {
      const val = Number(line.slice(4)) || 0;
      branchesFound += val;
      if (currentFile) currentFile.brf = val;
    } else if (line.startsWith('BRH:')) {
      const val = Number(line.slice(4)) || 0;
      branchesHit += val;
      if (currentFile) currentFile.brh = val;
    } else if (line === 'end_of_record' && currentFile) {
      files.push(currentFile);
      currentFile = null;
    }
  }

  const pct = (hit, found) =>
    found > 0 ? Number(((hit / found) * 100).toFixed(1)) : 100;

  return {
    lines: { total: linesFound, covered: linesHit, pct: pct(linesHit, linesFound) },
    functions: {
      total: funcsFound,
      covered: funcsHit,
      pct: pct(funcsHit, funcsFound),
    },
    branches: {
      total: branchesFound,
      covered: branchesHit,
      pct: pct(branchesHit, branchesFound),
    },
    statements: {
      total: linesFound,
      covered: linesHit,
      pct: pct(linesHit, linesFound),
    },
    files,
  };
}

/**
 * Render a standalone HTML coverage report from parsed LCOV data (used for Flutter `lcov.info`).
 */
function renderLcovHtmlReport(projectName, parsedLcov) {
  const rows = parsedLcov.files
    .map((f) => {
      const linePct = f.lf > 0 ? ((f.lh / f.lf) * 100).toFixed(1) : '100.0';
      return `        <tr>
          <td class="file">${escapeHtml(f.file)}</td>
          <td>${linePct}%</td>
          <td>${f.lh} / ${f.lf}</td>
        </tr>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(projectName)} Coverage Report</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; margin: 2rem; color: #111827; background: #f9fafb; }
      h1 { margin-bottom: 0.25rem; }
      .summary { display: flex; gap: 1rem; margin: 1rem 0 1.5rem; flex-wrap: wrap; }
      .stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.75rem 1rem; }
      table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
      th, td { text-align: left; padding: 0.6rem 0.85rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
      th { background: #f3f4f6; }
      .file { font-family: ui-monospace, SFMono-Regular, monospace; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(projectName)} — Unit &amp; Widget Coverage</h1>
    <div class="summary">
      <div class="stat"><strong>Lines:</strong> ${parsedLcov.lines.pct}% (${parsedLcov.lines.covered}/${parsedLcov.lines.total})</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Line Coverage</th>
          <th>Covered / Total</th>
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </body>
</html>
`;
}

/**
 * Read unit or storybook coverage summary for a project and stage its HTML report
 * into `<destDir>/coverage/<kind>/` when present.
 */
function stageProjectCoverage(project, destDir) {
  const projectAbsDir = resolve(WORKSPACE_ROOT, project.root);
  const coverageMeta = {
    unit: null,
    storybook: null,
  };

  // 1. Vitest unit coverage (`test-output/vitest/coverage`)
  const vitestCovDir = join(projectAbsDir, 'test-output/vitest/coverage');
  const vitestSummary = readJsonIfExists(
    join(vitestCovDir, 'coverage-summary.json'),
  );
  if (vitestSummary?.total) {
    const unitDest = join(destDir, 'coverage/unit');
    mkdirSync(unitDest, { recursive: true });
    cpSync(vitestCovDir, unitDest, { recursive: true });
    const hasHtml = existsSync(join(unitDest, 'index.html'));
    coverageMeta.unit = {
      linesPct: Number((vitestSummary.total.lines?.pct ?? 0).toFixed(1)),
      statementsPct: Number(
        (vitestSummary.total.statements?.pct ?? 0).toFixed(1),
      ),
      functionsPct: Number(
        (vitestSummary.total.functions?.pct ?? 0).toFixed(1),
      ),
      branchesPct: Number((vitestSummary.total.branches?.pct ?? 0).toFixed(1)),
      reportPath: hasHtml ? `./${project.name}/coverage/unit/` : null,
    };
  }

  // 2. Flutter LCOV unit coverage (`coverage/lcov.info`)
  const flutterLcovPath = join(projectAbsDir, 'coverage/lcov.info');
  if (!coverageMeta.unit && existsSync(flutterLcovPath)) {
    const parsed = parseLcovContent(readFileSync(flutterLcovPath, 'utf8'));
    const unitDest = join(destDir, 'coverage/unit');
    mkdirSync(unitDest, { recursive: true });
    cpSync(flutterLcovPath, join(unitDest, 'lcov.info'));
    const existingHtml = join(projectAbsDir, 'coverage/html/index.html');
    if (existsSync(existingHtml)) {
      cpSync(join(projectAbsDir, 'coverage/html'), unitDest, {
        recursive: true,
      });
    } else {
      writeFileSync(
        join(unitDest, 'index.html'),
        renderLcovHtmlReport(project.name, parsed),
      );
    }
    coverageMeta.unit = {
      linesPct: parsed.lines.pct,
      statementsPct: parsed.statements.pct,
      functionsPct: parsed.functions.pct,
      branchesPct: parsed.branches.pct,
      reportPath: `./${project.name}/coverage/unit/`,
    };
  }

  // 3. Storybook browser coverage (`test-output/storybook/coverage`)
  const sbCovDir = join(projectAbsDir, 'test-output/storybook/coverage');
  const sbSummary = readJsonIfExists(join(sbCovDir, 'coverage-summary.json'));
  if (sbSummary?.total) {
    const sbDest = join(destDir, 'coverage/storybook');
    mkdirSync(sbDest, { recursive: true });
    cpSync(sbCovDir, sbDest, { recursive: true });
    const hasHtml = existsSync(join(sbDest, 'index.html'));
    coverageMeta.storybook = {
      linesPct: Number((sbSummary.total.lines?.pct ?? 0).toFixed(1)),
      statementsPct: Number((sbSummary.total.statements?.pct ?? 0).toFixed(1)),
      functionsPct: Number((sbSummary.total.functions?.pct ?? 0).toFixed(1)),
      branchesPct: Number((sbSummary.total.branches?.pct ?? 0).toFixed(1)),
      reportPath: hasHtml ? `./${project.name}/coverage/storybook/` : null,
    };
  }

  return coverageMeta;
}

function buildProject(projectName, outDir, options = {}) {
  const project = findShowcaseProjects().find((p) => p.name === projectName);
  if (!project) {
    console.error(`Unknown showcase project: "${projectName}"`);
    process.exit(1);
  }

  if (options.withCoverage) {
    if (project.type === 'widgetbook') {
      runCommand('pnpm', ['exec', 'nx', 'run', `${project.name}:test-coverage`]);
    } else {
      runCommand('pnpm', [
        'exec',
        'nx',
        'run',
        `${project.name}:test`,
        '--',
        '--coverage',
      ]);
      if (options.withStorybookCoverage) {
        runCommand('pnpm', [
          'exec',
          'nx',
          'run',
          `${project.name}:test-storybook-coverage`,
        ]);
      }
    }
  }

  if (project.type === 'widgetbook') {
    const nxTarget = project.hasCiConfig
      ? `${project.name}:build-widgetbook:ci`
      : `${project.name}:build-widgetbook`;
    const baseHref = normalizeWidgetbookBaseHref(project.name);
    runCommand('pnpm', [
      'exec',
      'nx',
      'run',
      nxTarget,
      `--args=--base-href=${baseHref}`,
    ]);
  } else {
    if (project.hasCompodoc) {
      runCommand('pnpm', [
        'exec',
        'compodoc',
        '-p',
        `${project.root}/.storybook/tsconfig.doc.json`,
        '-e',
        'json',
        '-d',
        `${project.root}/.storybook`,
        '--silent',
      ]);
    }

    const nxTarget = project.hasCiConfig
      ? `${project.name}:build-storybook:ci`
      : `${project.name}:build-storybook`;
    runCommand('pnpm', ['exec', 'nx', 'run', nxTarget]);
  }

  const builtAbsDir = resolve(WORKSPACE_ROOT, project.outputDir);
  if (!existsSync(join(builtAbsDir, 'index.html'))) {
    console.error(
      `Expected built showcase index.html at "${builtAbsDir}", but it was not found.`,
    );
    process.exit(1);
  }

  const destDir = join(outDir, project.name);
  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });
  cpSync(builtAbsDir, destDir, { recursive: true });

  const coverage = stageProjectCoverage(project, destDir);

  writeFileSync(
    join(destDir, '.metadata.json'),
    JSON.stringify(
      {
        name: project.name,
        type: project.type,
        packageName: project.packageName,
        root: project.root,
        tags: project.tags,
        coverage,
      },
      null,
      2,
    ),
  );
  console.log(`Staged ${project.name} (${project.type}) -> ${destDir}`);
}

function summarizeSite(projectDir, type) {
  if (type === 'widgetbook' || existsSync(join(projectDir, 'flutter_bootstrap.js'))) {
    return 'Widgetbook · Flutter Web';
  }
  const indexJson = readJsonIfExists(join(projectDir, 'index.json'));
  const entries = indexJson?.entries ? Object.values(indexJson.entries) : [];
  const stories = entries.filter((e) => e.type === 'story').length;
  const docs = entries.filter((e) => e.type === 'docs').length;
  if (stories > 0) {
    return `Storybook · ${stories} stories${docs > 0 ? ` · ${docs} docs` : ''}`;
  }
  return 'Storybook';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatCoverageBadgeClass(pct) {
  if (pct >= 90) return 'cov-badge cov-high';
  if (pct >= 80) return 'cov-badge cov-pass';
  return 'cov-badge cov-low';
}

function renderCoverageBadgesHtml(site) {
  const items = [];
  const unit = site.coverage?.unit;
  const sb = site.coverage?.storybook;

  if (unit && typeof unit.linesPct === 'number') {
    const cls = formatCoverageBadgeClass(unit.linesPct);
    const label = `Unit Coverage: ${unit.linesPct}%`;
    if (unit.reportPath) {
      items.push(
        `<a class="${cls}" href="${escapeHtml(unit.reportPath)}" title="View Unit Test Coverage Report">${escapeHtml(label)}</a>`,
      );
    } else {
      items.push(`<span class="${cls}">${escapeHtml(label)}</span>`);
    }
  }

  if (sb && typeof sb.linesPct === 'number') {
    const cls = formatCoverageBadgeClass(sb.linesPct);
    const label = `Storybook Coverage: ${sb.linesPct}%`;
    if (sb.reportPath) {
      items.push(
        `<a class="${cls}" href="${escapeHtml(sb.reportPath)}" title="View Storybook Browser Coverage Report">${escapeHtml(label)}</a>`,
      );
    } else {
      items.push(`<span class="${cls}">${escapeHtml(label)}</span>`);
    }
  }

  if (items.length === 0) {
    return '';
  }

  return `<div class="coverage-badges">${items.join('')}</div>`;
}

function renderPortalHtml(sites) {
  const cards = sites
    .map((site) => {
      const badges = site.tags
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join('');
      const coverageHtml = renderCoverageBadgesHtml(site);
      return `      <article class="card">
        <a class="card-main" href="./${encodeURIComponent(site.name)}/">
          <div class="card-header">
            <h2>${escapeHtml(site.name)}</h2>
            <span class="arrow" aria-hidden="true">→</span>
          </div>
          <p class="pkg">${escapeHtml(site.packageName)}</p>
          <p class="stats">${escapeHtml(site.summary)}</p>
        </a>
        ${coverageHtml}
        ${badges ? `<div class="tags">${badges}</div>` : ''}
      </article>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>mono-magic Component Showcases &amp; Coverage Portal</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #f6f7fb;
        --card: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --border: #e5e7eb;
        --accent: #2563eb;
        --tag-bg: #eef2ff;
        --tag-fg: #3730a3;
        --cov-high-bg: #dcfce7;
        --cov-high-fg: #166534;
        --cov-pass-bg: #dbeafe;
        --cov-pass-fg: #1e40af;
        --cov-low-bg: #fee2e2;
        --cov-low-fg: #991b1b;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #0b1020;
          --card: #131a2e;
          --text: #f3f4f6;
          --muted: #9ca3af;
          --border: #25304d;
          --accent: #60a5fa;
          --tag-bg: #1e293b;
          --tag-fg: #93c5fd;
          --cov-high-bg: #064e3b;
          --cov-high-fg: #6ee7b7;
          --cov-pass-bg: #1e3a8a;
          --cov-pass-fg: #93c5fd;
          --cov-low-bg: #7f1d1d;
          --cov-low-fg: #fca5a5;
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem 1.25rem;
      }
      main { width: 100%; max-width: 960px; }
      header { margin-bottom: 2rem; }
      h1 { margin: 0 0 0.5rem; font-size: 2rem; letter-spacing: -0.02em; }
      header p { margin: 0; color: var(--muted); }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
        gap: 1rem;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        padding: 1.25rem;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--card);
        color: inherit;
        transition: border-color 150ms ease, transform 150ms ease;
      }
      .card:hover {
        border-color: var(--accent);
        transform: translateY(-2px);
      }
      .card-main {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        color: inherit;
        text-decoration: none;
      }
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .card-header h2 { margin: 0; font-size: 1.2rem; }
      .arrow { color: var(--accent); font-size: 1.1rem; }
      .pkg { margin: 0; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.85rem; color: var(--muted); }
      .stats { margin: 0.25rem 0 0; font-size: 0.9rem; font-weight: 500; }
      .coverage-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.25rem;
      }
      .cov-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        text-decoration: none;
      }
      a.cov-badge:hover {
        text-decoration: underline;
      }
      .cov-high {
        background: var(--cov-high-bg);
        color: var(--cov-high-fg);
      }
      .cov-pass {
        background: var(--cov-pass-bg);
        color: var(--cov-pass-fg);
      }
      .cov-low {
        background: var(--cov-low-bg);
        color: var(--cov-low-fg);
      }
      .tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.25rem; }
      .tag {
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        font-size: 0.75rem;
        background: var(--tag-bg);
        color: var(--tag-fg);
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>mono-magic Component Showcases &amp; Coverage Portal</h1>
        <p>Select a Storybook or Flutter Widgetbook to browse components, controls, interactive stories, and unit/browser coverage reports.</p>
      </header>
      <section class="grid">
${cards}
      </section>
    </main>
  </body>
</html>
`;
}

function assemblePages(outDir) {
  if (!existsSync(outDir)) {
    console.error(`Output directory "${outDir}" does not exist.`);
    process.exit(1);
  }

  const projectMap = new Map(
    findShowcaseProjects().map((project) => [project.name, project]),
  );

  const sites = readdirSync(outDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(join(outDir, entry.name, 'index.html')),
    )
    .map((entry) => {
      const dir = join(outDir, entry.name);
      const metadataPath = join(dir, '.metadata.json');
      const projectInfo = projectMap.get(entry.name);
      const metadata = readJsonIfExists(metadataPath) ?? projectInfo;
      let coverage = metadata?.coverage ?? null;
      if ((!coverage || (!coverage.unit && !coverage.storybook)) && projectInfo) {
        coverage = stageProjectCoverage(projectInfo, dir);
      }
      rmSync(metadataPath, { force: true });
      return {
        name: entry.name,
        packageName: metadata?.packageName ?? entry.name,
        tags: metadata?.tags ?? [],
        summary: summarizeSite(dir, metadata?.type),
        coverage,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (sites.length === 0) {
    console.error(`No built showcases found under "${outDir}".`);
    process.exit(1);
  }

  writeFileSync(join(outDir, 'index.html'), renderPortalHtml(sites));
  writeFileSync(join(outDir, '.nojekyll'), '');
  console.log(
    `Assembled ${sites.length} showcases (${sites.map((s) => s.name).join(', ')}) in ${outDir}`,
  );
}

function parseOutDir(args) {
  const outIdx = args.indexOf('--out');
  if (outIdx !== -1 && args[outIdx + 1]) {
    return resolve(WORKSPACE_ROOT, args[outIdx + 1]);
  }
  return DEFAULT_OUT_DIR;
}

const [, , command, ...rest] = process.argv;

switch (command) {
  case 'discover': {
    const projects = findShowcaseProjects();
    if (rest.includes('--matrix')) {
      console.log(
        JSON.stringify(projects.map(({ name, type }) => ({ name, type }))),
      );
    } else if (rest.includes('--names')) {
      console.log(JSON.stringify(projects.map((p) => p.name)));
    } else {
      console.log(JSON.stringify(projects, null, 2));
    }
    break;
  }
  case 'build': {
    const projectName = rest.find((arg) => !arg.startsWith('--'));
    if (!projectName) {
      console.error(
        'Usage: storybook-pages.mjs build <project> [--with-coverage] [--with-storybook-coverage] [--out <dir>]',
      );
      process.exit(1);
    }
    buildProject(projectName, parseOutDir(rest), {
      withCoverage: rest.includes('--with-coverage'),
      withStorybookCoverage: rest.includes('--with-storybook-coverage'),
    });
    break;
  }
  case 'assemble': {
    assemblePages(parseOutDir(rest));
    break;
  }
  default: {
    console.error(
      'Usage: storybook-pages.mjs <discover [--names | --matrix] | build <project> [--with-coverage] [--with-storybook-coverage] | assemble> [--out <dir>]',
    );
    process.exit(1);
  }
}
