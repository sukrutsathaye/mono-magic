#!/usr/bin/env node
/**
 * Modular helper for discovering, building, and assembling all workspace
 * showcases (Storybooks and Flutter Widgetbooks) into a single static
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

function buildProject(projectName, outDir) {
  const project = findShowcaseProjects().find((p) => p.name === projectName);
  if (!project) {
    console.error(`Unknown showcase project: "${projectName}"`);
    process.exit(1);
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
  writeFileSync(
    join(destDir, '.metadata.json'),
    JSON.stringify(
      {
        name: project.name,
        type: project.type,
        packageName: project.packageName,
        root: project.root,
        tags: project.tags,
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

function renderPortalHtml(sites) {
  const cards = sites
    .map((site) => {
      const badges = site.tags
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join('');
      return `      <a class="card" href="./${encodeURIComponent(site.name)}/">
        <div class="card-header">
          <h2>${escapeHtml(site.name)}</h2>
          <span class="arrow" aria-hidden="true">→</span>
        </div>
        <p class="pkg">${escapeHtml(site.packageName)}</p>
        <p class="stats">${escapeHtml(site.summary)}</p>
        ${badges ? `<div class="tags">${badges}</div>` : ''}
      </a>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>mono-magic Component Showcases</title>
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
      main { width: 100%; max-width: 920px; }
      header { margin-bottom: 2rem; }
      h1 { margin: 0 0 0.5rem; font-size: 2rem; letter-spacing: -0.02em; }
      header p { margin: 0; color: var(--muted); }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.25rem;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--card);
        color: inherit;
        text-decoration: none;
        transition: border-color 150ms ease, transform 150ms ease;
      }
      .card:hover {
        border-color: var(--accent);
        transform: translateY(-2px);
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
      .tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.5rem; }
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
        <h1>mono-magic Component Showcases</h1>
        <p>Select a Storybook or Flutter Widgetbook to browse components, controls, and documentation.</p>
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
      const metadata = readJsonIfExists(metadataPath) ?? projectMap.get(entry.name);
      rmSync(metadataPath, { force: true });
      return {
        name: entry.name,
        packageName: metadata?.packageName ?? entry.name,
        tags: metadata?.tags ?? [],
        summary: summarizeSite(dir, metadata?.type),
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
      console.error('Usage: storybook-pages.mjs build <project> [--out <dir>]');
      process.exit(1);
    }
    buildProject(projectName, parseOutDir(rest));
    break;
  }
  case 'assemble': {
    assemblePages(parseOutDir(rest));
    break;
  }
  default: {
    console.error(
      'Usage: storybook-pages.mjs <discover [--names | --matrix] | build <project> | assemble> [--out <dir>]',
    );
    process.exit(1);
  }
}
