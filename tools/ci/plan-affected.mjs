#!/usr/bin/env node
/**
 * Classifies Nx affected projects into language-specific runner buckets so
 * GitHub Actions only provisions the toolchains actually needed for a PR/push.
 *
 * Usage:
 *   node tools/ci/plan-affected.mjs [--base <ref>] [--head <ref>] [--github-output]
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const WORKSPACE_ROOT = process.cwd();

function getArgValue(args, flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function getAffectedProjects(base, head) {
  const nxArgs = ['exec', 'nx', 'show', 'projects', '--affected', '--json'];
  if (base) nxArgs.push(`--base=${base}`);
  if (head) nxArgs.push(`--head=${head}`);
  const out = execFileSync('pnpm', nxArgs, {
    cwd: WORKSPACE_ROOT,
    encoding: 'utf8',
    env: { ...process.env, NX_NO_CLOUD: 'true' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(out.trim() || '[]');
  return Array.isArray(parsed) ? parsed : [];
}

function readProjectConfig(projectName) {
  try {
    const out = execFileSync(
      'pnpm',
      ['exec', 'nx', 'show', 'project', projectName, '--json'],
      {
        cwd: WORKSPACE_ROOT,
        encoding: 'utf8',
        env: { ...process.env, NX_NO_CLOUD: 'true' },
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function classifyProject(name, config) {
  if (name === 'mono-magic' || config?.root === '.') {
    return null;
  }
  const tags = new Set(config?.tags ?? []);
  const root = config?.root ?? '';

  if (tags.has('lang:dart') || tags.has('framework:flutter') || name.startsWith('fl-') || existsSync(join(WORKSPACE_ROOT, root, 'pubspec.yaml'))) {
    return 'flutter';
  }
  if (tags.has('lang:py') || name.startsWith('py-') || existsSync(join(WORKSPACE_ROOT, root, 'pyproject.toml')) && !tags.has('lang:proto')) {
    return 'python';
  }
  if (tags.has('lang:rust') || name.startsWith('rs-') || existsSync(join(WORKSPACE_ROOT, root, 'Cargo.toml'))) {
    return 'rust';
  }
  if (tags.has('lang:go') || name.startsWith('go-') || existsSync(join(WORKSPACE_ROOT, root, 'go.mod'))) {
    return 'go';
  }
  if (tags.has('lang:proto') || name.startsWith('proto-') || existsSync(join(WORKSPACE_ROOT, root, 'buf.yaml'))) {
    return 'proto';
  }
  if (
    tags.has('lang:ts') ||
    readJsonIfExists(join(WORKSPACE_ROOT, root, 'package.json'))
  ) {
    return 'ts';
  }
  return 'ts';
}

function main() {
  const args = process.argv.slice(2);
  const base = getArgValue(args, '--base') ?? process.env['NX_BASE'] ?? null;
  const head = getArgValue(args, '--head') ?? process.env['NX_HEAD'] ?? null;
  const writeGithubOutput = args.includes('--github-output');

  const affected = getAffectedProjects(base, head);
  const buckets = {
    ts: [],
    flutter: [],
    python: [],
    rust: [],
    go: [],
    proto: [],
  };

  for (const name of affected) {
    const config = readProjectConfig(name);
    const bucket = classifyProject(name, config);
    if (bucket && buckets[bucket]) {
      buckets[bucket].push(name);
    }
  }

  for (const key of Object.keys(buckets)) {
    buckets[key].sort();
  }

  const summary = {
    affectedCount: affected.length,
    ...Object.fromEntries(
      Object.entries(buckets).map(([k, list]) => [k, list.join(',')]),
    ),
  };

  if (writeGithubOutput && process.env['GITHUB_OUTPUT']) {
    const lines = Object.entries(summary)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    appendFileSync(process.env['GITHUB_OUTPUT'], `${lines}\n`);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
