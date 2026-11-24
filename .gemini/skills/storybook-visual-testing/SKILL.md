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

To generate initial baselines or accept intentional visual changes (after authoring stories per [`interactive-stories`](../interactive-stories/SKILL.md)):

```bash
# Update baselines for a single UI library
pnpm nx test-storybook react-mui -- -u
pnpm nx test-storybook ng-mat -- -u
pnpm nx test-storybook rn-paper -- -u
pnpm nx test-storybook vue-vuetify -- -u
pnpm nx test-storybook svelte-tw -- -u

# Filter to a specific component story when updating baselines
pnpm nx test-storybook react-mui -- -u src/lib/atoms/button/button.stories.tsx
```

Then verify all visual tests pass without `-u`:

```bash
pnpm nx run-many -t test-storybook -p react-mui,ng-mat,rn-paper,vue-vuetify,svelte-tw
```

If a visual comparison fails, use the `review-image-snapshot-failures` skill (registered from `node_modules/storybook-addon-vis/skills`) to inspect `*.regions.json` and `*.review.png` before opening full PNGs.

---

## 3. Building & Assembling the GitHub Pages Showcase & Coverage Portal

`tools/ci/storybook-pages.mjs` discovers all Storybooks (`react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, `svelte-tw`), Flutter Widgetbooks (`fl-mat`), and non-UI library coverage suites (`utils/*`, `data-access/*`, `atomic-design-interfaces`) and assembles them into `dist/storybook-pages`:

```bash
# 1. Discover showcase & coverage projects
node tools/ci/storybook-pages.mjs discover
node tools/ci/storybook-pages.mjs discover-coverage

# 2. Build individual showcases into dist/storybook-pages/<project>
node tools/ci/storybook-pages.mjs build react-mui --with-coverage --with-storybook-coverage
node tools/ci/storybook-pages.mjs build ng-mat --with-coverage --with-storybook-coverage
node tools/ci/storybook-pages.mjs build rn-paper --with-coverage --with-storybook-coverage
node tools/ci/storybook-pages.mjs build vue-vuetify --with-coverage --with-storybook-coverage
node tools/ci/storybook-pages.mjs build svelte-tw --with-coverage --with-storybook-coverage
node tools/ci/storybook-pages.mjs build fl-mat --with-coverage

# 3. Build non-UI library coverage reports into dist/storybook-pages/coverage/<project>
node tools/ci/storybook-pages.mjs build-coverage

# 4. Assemble the landing portal (dist/storybook-pages/index.html & .nojekyll)
node tools/ci/storybook-pages.mjs assemble
```

Deployed GitHub Pages URLs:
- Portal: `https://sukrutsathaye.github.io/mono-magic/`
- React MUI Storybook: `https://sukrutsathaye.github.io/mono-magic/react-mui/`
- Angular Material Storybook: `https://sukrutsathaye.github.io/mono-magic/ng-mat/`
- React Native Paper Storybook: `https://sukrutsathaye.github.io/mono-magic/rn-paper/`
- Flutter Material 3 Widgetbook: `https://sukrutsathaye.github.io/mono-magic/fl-mat/`
- Vue Vuetify Storybook: `https://sukrutsathaye.github.io/mono-magic/vue-vuetify/`
- Svelte Tailwind Storybook: `https://sukrutsathaye.github.io/mono-magic/svelte-tw/`
- Non-UI Library Coverage Reports: `https://sukrutsathaye.github.io/mono-magic/coverage/<project>/`
