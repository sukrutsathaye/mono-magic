#!/usr/bin/env node
/**
 * Generates a compact, agent-friendly REPO_INDEX.md at the workspace root.
 *
 * Purpose:
 *   Prevent AI agents (/teamwork workers, subagents, fresh sessions) from
 *   burning tokens on full-repo `find`/`ls -R`/recursive reads.
 *
 * Usage:
 *   node tools/ci/generate-repo-index.mjs          # Write REPO_INDEX.md
 *   node tools/ci/generate-repo-index.mjs --check  # Exit 1 if REPO_INDEX.md is stale
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const OUTPUT_PATH = join(ROOT, 'REPO_INDEX.md');
const CHECK_ONLY = process.argv.includes('--check');

const SKIP_TARGETS = new Set([
  'nx-release-publish',
  'build-deps',
  'watch-deps',
  'static-storybook',
]);

function shouldIncludeTarget(targetName) {
  return !SKIP_TARGETS.has(targetName) && !targetName.startsWith('test-ci--');
}

/**
 * Loads the Nx project graph via `pnpm nx graph --file=<tmp>` in a single call.
 * @returns {{ nodes: Record<string, any>, dependencies: Record<string, any[]> }}
 */
function loadNxGraph() {
  const dir = mkdtempSync(join(tmpdir(), 'nx-index-'));
  const graphFile = join(dir, 'graph.json');
  try {
    execFileSync('pnpm', ['nx', 'graph', `--file=${graphFile}`], {
      cwd: ROOT,
      stdio: 'pipe',
      env: { ...process.env, NX_DAEMON: 'false' },
    });
    const raw = JSON.parse(readFileSync(graphFile, 'utf8'));
    return raw.graph ?? raw;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Classifies a project into its architectural domain based on root path.
 * @param {string} projectRoot
 * @returns {string}
 */
function getDomain(projectRoot) {
  if (projectRoot === '.') return 'root';
  if (projectRoot.startsWith('libs/ui/')) return 'ui';
  if (projectRoot.startsWith('libs/data-access/')) return 'data-access';
  if (projectRoot.startsWith('libs/utils/')) return 'utils';
  if (projectRoot.startsWith('libs/features/')) return 'features';
  if (projectRoot.startsWith('apps/')) return 'app';
  return 'other';
}

/**
 * Determines the primary entrypoint file for a project if it exists.
 * @param {string} projectRoot
 * @returns {string}
 */
function findEntrypoint(projectRoot) {
  const candidates = [
    'src/index.ts',
    'lib/fl_mat.dart',
    'src/lib.rs',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'buf.yaml',
    'package.json',
  ];
  for (const rel of candidates) {
    if (existsSync(join(ROOT, projectRoot, rel))) {
      return `${projectRoot === '.' ? '' : `${projectRoot}/`}${rel}`;
    }
  }
  return projectRoot;
}

/**
 * Reads immediate subdirectories/files for compact module/component listing.
 * @param {string} dirPath
 * @returns {string[]}
 */
function listBasenames(dirPath) {
  if (!existsSync(dirPath)) return [];
  return readdirSync(dirPath, { withFileTypes: true })
    .filter(
      (d) =>
        !d.name.startsWith('.') &&
        d.name !== '__pycache__' &&
        !d.name.endsWith('.spec.ts') &&
        !d.name.endsWith('.test.ts') &&
        !d.name.endsWith('_test.go')
    )
    .map((d) =>
      d.isDirectory() ? d.name : d.name.replace(/\.(ts|tsx|dart|py|proto|rs|go)$/, '')
    )
    .sort();
}

/**
 * Collects Atomic Design component names for UI libraries.
 * @param {string} projectRoot
 * @returns {string}
 */
function summarizeUiComponents(projectRoot) {
  const baseDir = existsSync(join(ROOT, projectRoot, 'src/lib'))
    ? join(ROOT, projectRoot, 'src/lib')
    : join(ROOT, projectRoot, 'lib/src');
  if (!existsSync(baseDir)) return '';

  const tiers = ['atoms', 'molecules', 'organisms', 'templates'];
  const parts = [];
  for (const tier of tiers) {
    const items = listBasenames(join(baseDir, tier));
    if (items.length > 0) {
      parts.push(`**${tier}**: ${items.join(', ')}`);
    }
  }
  return parts.join(' | ');
}

/**
 * Collects proto files or src/lib modules for non-UI libraries (TS, Python, Rust, Go).
 * @param {string} projectRoot
 * @returns {string}
 */
function summarizeModules(projectRoot) {
  const protoDir = join(ROOT, projectRoot, 'proto');
  if (existsSync(protoDir)) {
    const protos = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.proto')) protos.push(relative(join(ROOT, projectRoot), full));
      }
    };
    walk(protoDir);
    return protos.length ? `protos: ${protos.sort().join(', ')}` : '';
  }

  const tsLib = join(ROOT, projectRoot, 'src/lib');
  if (existsSync(tsLib)) {
    const items = listBasenames(tsLib);
    return items.length ? `modules: ${items.join(', ')}` : '';
  }

  const rsLib = join(ROOT, projectRoot, 'src/lib.rs');
  if (existsSync(rsLib)) {
    const items = listBasenames(join(ROOT, projectRoot, 'src')).filter((m) => m !== 'lib');
    return items.length ? `modules: ${items.join(', ')}` : 'modules: lib';
  }

  const goMod = join(ROOT, projectRoot, 'go.mod');
  if (existsSync(goMod)) {
    const items = readdirSync(join(ROOT, projectRoot), { withFileTypes: true })
      .filter(
        (d) =>
          !d.name.startsWith('.') &&
          ((d.isFile() && d.name.endsWith('.go') && !d.name.endsWith('_test.go')) ||
            (d.isDirectory() && d.name !== 'vendor' && d.name !== 'testdata'))
      )
      .map((d) => (d.isDirectory() ? d.name : d.name.replace(/\.go$/, '')))
      .sort();
    return items.length ? `modules: ${items.join(', ')}` : '';
  }

  const pySrc = join(ROOT, projectRoot, 'src');
  if (existsSync(pySrc)) {
    const pkgs = readdirSync(pySrc, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_'));
    const mods = [];
    for (const pkg of pkgs) {
      for (const item of listBasenames(join(pySrc, pkg.name))) {
        if (item !== '__init__' && item !== 'py.typed') mods.push(`${pkg.name}/${item}`);
      }
    }
    return mods.length ? `modules: ${mods.join(', ')}` : '';
  }

  return '';
}

/**
 * Extracts YAML-ish frontmatter name & description from a markdown file.
 * @param {string} filePath
 * @returns {{ name: string, description: string }}
 */
function readFrontmatter(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { name: '', description: '' };
  const fm = match[1];
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const blockMatch = fm.match(/^description:[ \t]*>-\n((?:[ \t]+.+\n?)+)/m);
  const descSingle = blockMatch ? null : fm.match(/^description:[ \t]*(.+)$/m);
  const description = blockMatch
    ? blockMatch[1].replace(/\n[ \t]+/g, ' ').trim()
    : descSingle
      ? descSingle[1].trim()
      : '';
  return {
    name: nameMatch ? nameMatch[1].trim() : '',
    description: description.replace(/^['"]|['"]$/g, ''),
  };
}

/**
 * Builds the markdown contents of REPO_INDEX.md.
 * @returns {string}
 */
function buildIndex() {
  const graph = loadNxGraph();
  const nodes = Object.values(graph.nodes || {})
    .map((n) => ({
      name: n.name,
      root: n.data?.root ?? '.',
      domain: getDomain(n.data?.root ?? '.'),
      tags: (n.data?.tags ?? []).filter((t) => !t.startsWith('npm:')),
      targets: Object.keys(n.data?.targets ?? {})
        .filter(shouldIncludeTarget)
        .sort(),
      entrypoint: findEntrypoint(n.data?.root ?? '.'),
      pkg: n.data?.metadata?.js?.packageName ?? '',
    }))
    .sort((a, b) => {
      const order = { ui: 0, 'data-access': 1, utils: 2, features: 3, app: 4, other: 5, root: 6 };
      return (order[a.domain] - order[b.domain]) || a.name.localeCompare(b.name);
    });

  const lines = [];
  lines.push('# mono-magic Repository Index');
  lines.push('');
  lines.push('> **Auto-generated** by `node tools/ci/generate-repo-index.mjs`. Do NOT hand-edit.');
  lines.push('> **Agents & `/teamwork` workers**: Read this file FIRST instead of running `find`, `ls -R`, or repo-wide `grep`.');
  lines.push('');
  lines.push('## 1. Quick-Start & Guardrails');
  lines.push('');
  lines.push('- **Package Manager / Task Runner**: `pnpm nx <target> <project>` (Node/TS), `uv` (Python >=3.12), `flutter` (>=3.50), `cargo` (Rust), `go` (Go >=1.24).');
  lines.push('- **Git & Branching (`main -> dev`)**: Always sync `dev` with `origin/main` before starting any task, branch `<type>/<scope>-<slug>` from `dev`, open all PRs against `dev`, and merge verified PRs into `dev` (`dev -> main` is owner-only).');
  lines.push('- **Rules & Standards**: [AGENTS.md](AGENTS.md), [GEMINI.md](GEMINI.md), [.gemini/skills/engineering-standards/SKILL.md](.gemini/skills/engineering-standards/SKILL.md), [.gemini/skills/token-budget-guardrails/SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md).');
  lines.push('- **Verification & Post-Task Commands**:');
  lines.push('  - Affected only: `pnpm nx affected -t lint typecheck test`');
  lines.push('  - Single project: `pnpm nx test <project>` / `pnpm nx lint <project>` / `pnpm nx typecheck <project>`');
  lines.push('  - Refresh this index: `node tools/ci/generate-repo-index.mjs` (or `--check` in CI)');
  lines.push('  - Sync README coverage tables: `node tools/ci/sync-readmes-and-coverage.mjs` (or `--check` in CI)');
  lines.push('');
  lines.push('## 2. Nx Projects Catalog');
  lines.push('');
  lines.push('| Project | Domain | Path | Tags | Entrypoint | Targets |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const p of nodes) {
    const tags = p.tags.length ? p.tags.map((t) => `\`${t}\``).join(' ') : '—';
    const targets = p.targets.length ? p.targets.join(', ') : '—';
    const entry = `\`${p.entrypoint}\``;
    lines.push(`| \`${p.name}\` | ${p.domain} | \`${p.root}\` | ${tags} | ${entry} | ${targets} |`);
  }

  lines.push('');
  lines.push('## 3. Module & Component Map');
  lines.push('');
  for (const p of nodes) {
    if (p.domain === 'root') continue;
    const summary = p.domain === 'ui' ? summarizeUiComponents(p.root) : summarizeModules(p.root);
    if (summary) {
      lines.push(`- **\`${p.name}\`** (\`${p.root}\`): ${summary}`);
    }
  }

  // Skills
  const skillsDir = join(ROOT, '.gemini/skills');
  if (existsSync(skillsDir)) {
    lines.push('');
    lines.push('## 4. Workspace Skills, Agents & Docs');
    lines.push('');
    lines.push('### Skills (`.gemini/skills/`)');
    const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    for (const s of skillDirs) {
      const skillMd = join(skillsDir, s, 'SKILL.md');
      if (existsSync(skillMd)) {
        const { description } = readFrontmatter(skillMd);
        const shortDesc = description.length > 140 ? `${description.slice(0, 137)}...` : description;
        lines.push(`- **\`${s}\`** ([SKILL.md](.gemini/skills/${s}/SKILL.md)): ${shortDesc}`);
      }
    }
  }

  // Agents
  const agentsDir = join(ROOT, '.gemini/agents');
  if (existsSync(agentsDir)) {
    lines.push('');
    lines.push('### Specialist Agents (`.gemini/agents/`)');
    for (const f of readdirSync(agentsDir).filter((x) => x.endsWith('.md')).sort()) {
      const { name } = readFrontmatter(join(agentsDir, f));
      lines.push(`- **\`${name || f.replace(/\.md$/, '')}\`**: [.gemini/agents/${f}](.gemini/agents/${f})`);
    }
  }

  // Commands
  const cmdsDir = join(ROOT, '.gemini/commands');
  if (existsSync(cmdsDir)) {
    const cmds = readdirSync(cmdsDir).filter((x) => x.endsWith('.toml')).sort();
    if (cmds.length) {
      lines.push('');
      lines.push(`### Custom Slash Commands (\`.gemini/commands/\`): ${cmds.map((c) => `\`/${c.replace(/\.toml$/, '')}\``).join(', ')}`);
    }
  }

  // Docs
  const docsProjectsDir = join(ROOT, 'docs/projects');
  const docLinks = [];
  if (existsSync(join(ROOT, 'ROADMAP.md'))) docLinks.push('[ROADMAP.md](ROADMAP.md)');
  if (existsSync(join(ROOT, 'PORTFOLIO_IDEAS.md'))) docLinks.push('[PORTFOLIO_IDEAS.md](PORTFOLIO_IDEAS.md)');
  if (existsSync(docsProjectsDir)) {
    for (const f of readdirSync(docsProjectsDir).filter((x) => x.endsWith('.md') && !x.startsWith('_')).sort()) {
      docLinks.push(`[docs/projects/${f}](docs/projects/${f})`);
    }
  }
  if (docLinks.length) {
    lines.push('');
    lines.push(`### Roadmaps & Blueprints: ${docLinks.join(' | ')}`);
  }

  lines.push('');
  return lines.join('\n');
}

const content = buildIndex();

if (CHECK_ONLY) {
  const existing = existsSync(OUTPUT_PATH) ? readFileSync(OUTPUT_PATH, 'utf8') : '';
  if (existing !== content) {
    console.error('REPO_INDEX.md is out of date. Run: node tools/ci/generate-repo-index.mjs');
    process.exit(1);
  }
  console.log('REPO_INDEX.md is up to date.');
  process.exit(0);
}

writeFileSync(OUTPUT_PATH, content, 'utf8');
console.log(`Generated ${relative(ROOT, OUTPUT_PATH)} (${content.split('\n').length} lines).`);
