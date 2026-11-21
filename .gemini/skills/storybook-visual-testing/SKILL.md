---
name: storybook-visual-testing
description: >-
  Manages Storybook Vitest browser testing, storybook-addon-vis visual regression baselines
  (__vis__/*/__baselines__), visual failure diff triage, and building/assembling the unified
  GitHub Pages showcase portal (tools/ci/storybook-pages.mjs). Use when running test-storybook,
  fixing missing baseline errors, updating visual snapshots (-u), or building Storybook and
  Widgetbook showcases.
---

# Storybook Visual Testing & Showcase Portal Runbook

Use this skill when running or troubleshooting Storybook interaction/visual tests (`storybook-addon-vis`) or building the unified GitHub Pages showcase portal.

## 1. How `storybook-addon-vis` Resolves Snapshots

Each Storybook UI library (`react-mui`, `ng-mat`, `rn-paper`) configures:
- **Vitest Browser Mode**: `storybookTest()` + `storybookVis()` in `libs/ui/<project>/vite.config.mts` (project name: `<project>-storybook`).
- **Storybook Server Channel**: `defineStorybookVis()` in `libs/ui/<project>/.storybook/main.ts`.
- **Auto-Snapshot Setup**: `vis.setup({ animations: 'disabled', auto: ... })` in `libs/ui/<project>/.storybook/vitest.setup.ts`.

### Directory Layout
Snapshots live under `libs/ui/<project>/__vis__/<local|platform>/`:
- `__baselines__/lib/<tier>/<component>/<file>.stories.<ext>/<story-id>-auto.png` — Expected baseline image.
- `__results__/lib/<tier>/<component>/<file>.stories.<ext>/<story-id>-auto.png` — Image captured during the latest test run.
- `__diffs__/lib/<tier>/<component>/<file>.stories.<ext>/<story-id>-auto.png` — Pixel/SSIM diff image when comparison fails (alongside `*.review.png` and `*.regions.json`).

### Why Missing Baselines Fail in Both Terminal and Storybook Web
1. **Terminal (`pnpm nx test-storybook <project>`)**:
   - Without `-u` (`--update`), `vitest-plugin-vis` renders each story into `__results__/`, checks `__baselines__/`, and throws `Snapshot ... has no baseline image` if `__baselines__/` is missing.
2. **Storybook Web (`Vis` Panel)**:
   - `VisPanel` in `storybook-addon-vis` explicitly filters out stories that only have a `result` image without a `baseline` or `diff` image (`results.some(r => r.type !== 'result')`), rendering `"There is no snapshots for this story"` until `__baselines__/` exists.

---

## 2. Creating & Updating Baselines

To generate initial baselines or accept intentional visual changes:

```bash
# Update baselines for a single UI library
pnpm nx test-storybook react-mui -- -u
pnpm nx test-storybook ng-mat -- -u
pnpm nx test-storybook rn-paper -- -u

# Filter to a specific component story when updating baselines
pnpm nx test-storybook react-mui -- -u src/lib/atoms/button/button.stories.tsx
```

Then verify all visual tests pass without `-u`:

```bash
pnpm nx run-many -t test-storybook -p react-mui,ng-mat,rn-paper
```

If a visual comparison fails, use the `review-image-snapshot-failures` skill (registered from `node_modules/storybook-addon-vis/skills`) to inspect `*.regions.json` and `*.review.png` before opening full PNGs.

---

## 3. Building & Assembling the GitHub Pages Showcase Portal

`tools/ci/storybook-pages.mjs` discovers all Storybooks (`react-mui`, `ng-mat`, `rn-paper`) and Flutter Widgetbooks (`fl-mat`) and assembles them into `dist/storybook-pages`:

```bash
# 1. Discover showcase projects
node tools/ci/storybook-pages.mjs discover

# 2. Build individual showcases into dist/storybook-pages/<project>
node tools/ci/storybook-pages.mjs build react-mui
node tools/ci/storybook-pages.mjs build ng-mat
node tools/ci/storybook-pages.mjs build rn-paper
node tools/ci/storybook-pages.mjs build fl-mat

# 3. Assemble the landing portal (dist/storybook-pages/index.html & .nojekyll)
node tools/ci/storybook-pages.mjs assemble
```

Deployed GitHub Pages URLs:
- Portal: `https://sukrutsathaye.github.io/mono-magic/`
- React MUI Storybook: `https://sukrutsathaye.github.io/mono-magic/react-mui/`
- Angular Material Storybook: `https://sukrutsathaye.github.io/mono-magic/ng-mat/`
- React Native Paper Storybook: `https://sukrutsathaye.github.io/mono-magic/rn-paper/`
- Flutter Material 3 Widgetbook: `https://sukrutsathaye.github.io/mono-magic/fl-mat/`
