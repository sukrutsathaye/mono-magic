## 2026-11-21T01:20:49Z

You are the Project Orchestrator for implementing `ng-mat` component parity across `react-mui`, `rn-paper`, and `fl-mat` in `/home/antigravity/sukrutsathaye/mono-magic`.

## Paths & Context
- **Working directory**: `/home/antigravity/sukrutsathaye/mono-magic`
- **Your state folder**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/orchestrator_main` (store your `BRIEFING.md`, `plan.md`, `progress.md`, and `handoff.md` here — never write source code/tests here).
- **Original user request (read-only)**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/ORIGINAL_REQUEST.md`
- **Approved Implementation Plan (MUST READ IN FULL BEFORE PLANNING/DISPATCHING)**: `/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b39c754e-2c2f-442d-b476-7fed0f448c4f/implementation_plan.md`

## Core Requirements Summary (verify all details in ORIGINAL_REQUEST.md & implementation_plan.md)
1. **Strict ng-mat parity + idiomatic ergonomics**: Implement all 16 components and `atomic-design-interfaces` props across `react-mui`, `rn-paper`, and `fl-mat`, including refactoring `MagicTextInput` into a bare input control (`TextInputControlProps`) requiring `MagicFormField` for labels, hints, and errors.
2. **React/RN/Flutter best practices**: Follow official docs for Storybook 10, Vitest 4, React 19 (`useControllableState<T>`, `ref` as regular prop, `useId()` + `<MagicFormFieldContext value={...}>`), React Native 0.85, MUI v9, RN Paper v5 (MD3), and Flutter 3.50 / Widgetbook v3 (with knobs & docs).
3. **Storybook / Widgetbook & Visual Regression**: Extensive stories, autodocs, categorized `argTypes`, `react-docgen-typescript`, Widgetbook knobs & docs. Keep `.gitignore` untouched; mirror `ng-mat`'s `snapshotRootDir` and do NOT commit PNG baselines.
4. **Testing & Coverage**: Enforce >=80% coverage thresholds in Vitest (`react-mui`, `rn-paper`) and verify `fl-mat` via local Flutter 3.50.0 install if network permits, falling back to GitHub Actions CI on the pushed branch. Always run Nx commands via `pnpm exec nx`.
5. **Isolated Git Worktrees & Atomic Commits**: Branch `ui/react-mui-setup`, `ui/rn-paper-setup`, and `ui/fl-mat-setup` off `main` using isolated `git worktree` directories (avoid `/tmp`; use appData scratch space) so parallel library streams never collide in `/home/antigravity/sukrutsathaye/mono-magic`. Use clean, atomic Conventional Commits (`feat(<lib>): ...`, `refactor(<lib>): ...` with `BREAKING CHANGE:` footer, `chore(<lib>): ...`, `test(<lib>): ...`, `docs(<lib>): ...`). Keep `.agents/teamwork/` untracked / never committed to git!
6. **Delivery**: Push all 3 branches and open 3 Ready-for-Review PRs against `main`, then clean up temporary worktrees.
7. **Model Tiering**: The user explicitly requested delegating simpler/boilerplate tasks (e.g., straightforward atoms, story variant galleries, docs, unit test expansion) to lighter model tiers (`flash` / `flash_lite`) to save tokens, while reserving the primary model (`inherit`) for architecture, theming, Storybook/Vis infra, complex components, and verification.

## Coordination with Sentinel
- Maintain `BRIEFING.md` and `progress.md` in `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/orchestrator_main` so I can monitor progress cleanly.
- Send me a message via `send_message` when major milestones complete, if you hit a blocker needing user input, or when all milestones are complete and verified (include branch names, PR URLs, commit logs, and verification/coverage evidence). Note that upon your completion report, an independent Victory Auditor will audit all deliverables before final completion is reported to the user.
