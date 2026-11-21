# Original User Request

## Initial Request — 2026-11-21T01:19:40Z
Add components to react-mui, rn-paper and fl-mat by considering the components already added in ng-mat as baseline.
The objective is to write meaningful wrappers around these components to make the API even easier to use. I want extensive stories for all components, almost 80% coverage with unit tests and storybook autodocs. Each agent can checkout main and create branches like ui/react-mui-setup, ui/rn-paper-setup etc. You can delegate easier/simpler tasks to hydrogen. So that less tokens are spent overall. We already have a good baseline with ng-mat and we would like to have atleast the same components in these libs as well.

---
Relevant approved context from this conversation (the user already completed a design interview and explicitly approved the implementation plan below):

Approved Implementation Plan File:
/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b39c754e-2c2f-442d-b476-7fed0f448c4f/implementation_plan.md
(Please read this file in full before executing.)

User's confirmed answers & additional instructions (quoted):
1. MagicTextInput & MagicFormField architecture:
> "Strict ng-mat parity — refactor MagicTextInput into a bare input control (TextInputControlProps) across all 3 libs and require MagicFormField for labels, hints, and errors"

2. Cross-platform feature parity & ergonomics:
> "(Recommended) Pragmatic parity + idiomatic ergonomics — implement all 16 components and atomic-design-interfaces props; accept string icon names (via Material Icons font / icon map) AND native nodes (ReactNode / IconData); build lightweight pure-RN wrappers for missing RN Paper primitives (Slider, Select via Menu) without adding native-only packages"

3. Storybook & Widgetbook scope:
> "I want full ng-mat parity but follow flutter best practices for widgetbook. Currently knobs areand docs are missing"

4. Coverage & Flutter verification:
> "(Recommended) Enforce >=80% coverage thresholds in Vitest (react-mui, rn-paper) and verify fl-mat via local Flutter 3.50.0 install if network permits, falling back to GitHub Actions CI on the pushed branch"

5. Branch & PR delivery:
> "Push all 3 branches and open 3 Ready-for-Review PRs against main"
Branches: `ui/react-mui-setup`, `ui/rn-paper-setup`, `ui/fl-mat-setup` (use isolated `git worktree` directories branched off `main` so parallel agents never collide in `/home/antigravity/sukrutsathaye/mono-magic`, and clean up temporary worktrees after pushing).

6. Visual regression baselines & .gitignore:
> "Should this be commited to git? When i setup visual tests for ng-mat, i kinda added these folders to .gitignore if baselines need to be committed, then you will have to remove the .gitignore lines from main"
Confirmed resolution in the approved plan: Keep `.gitignore` untouched (lines 34-37 already ignore `**/__vis__/local`, `__diffs__`, `__results__`), mirror `ng-mat`'s `snapshotRootDir: ({ ci, platform }) => resolve(visRootDir, ci ? platform : 'local')`, and do NOT commit PNG baselines on the feature branches.

7. React / React Native controls & official docs best practices:
> "We have used signals api for angular component controls. What will we be using for react and react-native? Also make a note to follow the official documentation of storybook, vitest, react, react-native, mui and rn paper for best practices. I want to leverage all controls which come ootb as well as some meaningful controls/params as done in ng-mat"
Confirmed resolution in the approved plan: Use React 19 `useControllableState<T>` (controlled + uncontrolled), React 19 `ref` as a regular prop, `useId()` + `<MagicFormFieldContext value={...}>`, native form/RHF compatibility, OOTB escape hatches (`sx`, `slotProps`, `style`, `FocusNode`, `TextEditingController`), `react-docgen-typescript` + categorized `argTypes`, and follow official docs for Storybook 10, Vitest 4, React 19, React Native 0.85, MUI v9, RN Paper v5 (MD3), and Flutter 3.50 / Widgetbook v3.

8. Atomic commits & commit message hygiene:
> "One last thing: make sure you do atomic commits (you can group similar files, or lines which do what the commit msg says) use best practices with committ messages as well."
Confirmed resolution in the approved plan: Use small, logical, lint-clean atomic commits following Conventional Commits (`feat(<lib>): ...`, `refactor(<lib>): ...` with `BREAKING CHANGE:` footer, `chore(<lib>): ...`, `test(<lib>): ...`, `docs(<lib>): ...`) as detailed in the plan.

9. Repository location: `/home/antigravity/sukrutsathaye/mono-magic` (baseline in `libs/ui/ng-mat` and `libs/ui/atomic-design-interfaces`; `pnpm` package manager; always run Nx commands via `pnpm exec nx`).
10. Model tiering ("hydrogen"): Delegate simpler/boilerplate tasks (straightforward atoms, story variant galleries, docs, unit test expansion) to lighter model tiers (`flash` / `flash_lite`) while keeping primary model for architecture, theming, Storybook/Vis infra, complex components, and verification.
