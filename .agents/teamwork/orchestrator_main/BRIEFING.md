# BRIEFING — 2026-11-21T01:22:00Z

## Mission
Deliver full `ng-mat` component parity (all 16 Atomic Design components, ergonomic wrappers, theming, Storybook 10 / Widgetbook v3 autodocs/knobs, visual regression setup, >=80% coverage) across `libs/ui/react-mui`, `libs/ui/rn-paper`, and `libs/ui/fl-mat` on isolated branches (`ui/react-mui-setup`, `ui/rn-paper-setup`, `ui/fl-mat-setup`) and open 3 Ready-for-Review PRs against `main`.

## 🔒 My Identity
- Archetype: teamwork_project_orchestrator (dispatch-only)
- Roles: orchestrator, user_liaison, human_reporter, successor
- Level: Top-level Project Orchestrator
- Working directory: `/home/antigravity/sukrutsathaye/mono-magic`
- State folder: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/orchestrator_main`
- Original parent: Sentinel
- Original parent conversation ID: `a4b443ce358eaf54088a4731a17ee366`

## 🔒 My Workflow
- **Pattern**: Project Pattern (Survey → Assess → Decompose & Delegate to library Sub-Orchestrators → Cross-library E2E/Parity Verification & PR Delivery)
- **Scope document**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/PROJECT.md`
1. **Survey**: Spawn 3 Explorers in parallel to map `ng-mat` baseline, `atomic-design-interfaces`, existing `react-mui`/`rn-paper`/`fl-mat` codebases, CI/worktree/Flutter/GitHub environment.
2. **Decompose & Delegate**: Write `PROJECT.md` with complete Feature Inventory, Architecture, Interface Contracts, and Code Layout. Delegate each library track (`react-mui`, `rn-paper`, `fl-mat`) to an isolated `teamwork_sub_orchestrator` operating in its own `git worktree` (`/home/antigravity/sukrutsathaye/wt-react-mui`, `wt-rn-paper`, `wt-fl-mat`), plus an E2E/Parity Verification track. Each sub-orchestrator runs the Project Pattern Iteration Loop (Explorer → Worker → parallel 2 Reviewers + 2 Challengers + 1 Forensic Auditor → Gate) per milestone, using `flash` tier for straightforward atoms/stories/docs/test expansion and `inherit` for architecture/infra/complex components/verification.
3. **On failure**: Retry → Replace → Skip (never Auditor) → Redistribute → Redesign.
4. **Succession**: Self-succeed at 20 spawns (currently 0 / 20).
- **Work items**:
  1. Step 0: Survey (`ng-mat` baseline, `react-mui` & `rn-paper`, `fl-mat` & env) [done]
  2. Step 1-2A: Synthesize `PROJECT.md` & define `teamwork_sub_orchestrator` [done]
  3. Track 1 (M1): `libs/ui/react-mui` (`ui/react-mui-setup` → PR #1) [in-progress]
  4. Track 2 (M2): `libs/ui/rn-paper` (`ui/rn-paper-setup` → PR #2) [in-progress]
  5. Track 3 (M3): `libs/ui/fl-mat` (`ui/fl-mat-setup` → PR #3) [in-progress]
  6. Track 4 (M4): Cross-Library E2E/CI/Parity Verification & Worktree Cleanup [pending]
  7. Final Report to Sentinel [pending]
- **Current phase**: 2 (Decompose & Delegate — Parallel Library Sub-Orchestrators Executing)
- **Current focus**: Monitoring M1 (`react-mui`), M2 (`rn-paper`), M3 (`fl-mat`)

## 🔒 Key Constraints
- DISPATCH-ONLY: never write source code, never run build/test commands, never explore code directly.
- Strict `ng-mat` parity: refactor `MagicTextInput` into bare `TextInputControlProps`, require `MagicFormField` for labels/hints/errors, refactor `MagicSearchBar` to compose `MagicFormField` + `MagicTextInput` + `MagicButton`.
- Keep `.gitignore` untouched; mirror `ng-mat`'s `snapshotRootDir` and do NOT commit PNG baselines.
- Keep `.agents/teamwork/` untracked and NEVER committed to git in main or any worktree.
- Always run Nx commands via `pnpm exec nx`.
- Clean atomic Conventional Commits (`BREAKING CHANGE:` footer on `MagicTextInput` refactor).
- Model tiering: use `flash` / `flash_lite` for simpler/boilerplate tasks (straightforward atoms, story galleries, docs, unit test expansion); keep `inherit` for architecture, theming, Storybook/Vis infra, complex components, and verification.
- Forensic Auditor verdict is a BINARY VETO — never advance on INTEGRITY VIOLATION.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: `a4b443ce358eaf54088a4731a17ee366`
- Updated: 2026-11-21T01:32:30Z

## Key Decisions Made
- Store shared `PROJECT.md` under `.agents/teamwork/PROJECT.md` so it stays completely untracked and never pollutes git working trees or branches.
- Use isolated git worktrees at `/home/antigravity/sukrutsathaye/wt-react-mui`, `wt-rn-paper`, and `wt-fl-mat` per the approved `implementation_plan.md`; keep worktrees alive until M4 confirms CI green, then remove cleanly.
- Verified Flutter `3.50.0` can be installed locally into `~/flutter` and system `/usr/bin/chromium` launches cleanly headless for Playwright `test-storybook`.
- `react-mui` & `rn-paper` add `project.json` isolating `test` (jsdom CI-safe) from `test-storybook` (Playwright) while keeping inferred `build-storybook` (`storybook-static`) compatible with `tools/ci/storybook-pages.mjs`.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_baseline | teamwork_preview_explorer | Survey `ng-mat` baseline, `atomic-design-interfaces`, repo/CI/git/pnpm/gh env | completed | `fa546d407bc9ce026fe5bcbefc0b1239` |
| explorer_survey_react_rn | teamwork_preview_explorer | Survey `react-mui` and `rn-paper` existing files, configs, Storybook/Vitest/MUI/Paper setup | completed | `e8f373b91eab63fe88dfdfad3600c13b` |
| explorer_survey_flutter | teamwork_preview_explorer | Survey `fl-mat` existing files, `pubspec.yaml`, Widgetbook v3 API, Flutter SDK availability | completed | `b84c38944cb564f9b11c08c574b3e385` |
| sub_orch_react_mui | teamwork_sub_orchestrator | M1: `libs/ui/react-mui` full parity, verification & PR #1 | in-progress | `ad1818474f850d6fc377cd56dad80c65` |
| sub_orch_rn_paper | teamwork_sub_orchestrator | M2: `libs/ui/rn-paper` full parity, verification & PR #2 | in-progress | `f49c911b8a65de890a14bae7500dca4d` |
| sub_orch_fl_mat | teamwork_sub_orchestrator | M3: `libs/ui/fl-mat` full parity, verification & PR #3 | in-progress | `b851158dba1ad7b061c37c52ea01a238` |

## Succession Status
- Succession required: no
- Spawn count: 6 / 20
- Pending subagents: `ad1818474f850d6fc377cd56dad80c65`, `f49c911b8a65de890a14bae7500dca4d`, `b851158dba1ad7b061c37c52ea01a238`
- Predecessor: none
- Successor spawned: not yet spawned
- Successor generation: none
- Successor state folder: none

## Active Timers
- Heartbeat cron: `ebfed8123aa4623566770de48e20c027/task-9`
- Safety timer: none

## Artifact Index
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/ORIGINAL_REQUEST.md` — immutable original user request
- `/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b39c754e-2c2f-442d-b476-7fed0f448c4f/implementation_plan.md` — user-approved implementation plan
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/PROJECT.md` — master architecture, feature inventory, milestones & interface contracts
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_baseline/handoff.md` — Survey 1 report (`ng-mat`, interfaces, 7 palettes, CI)
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_react_rn/handoff.md` — Survey 2 report (`react-mui` & `rn-paper` pitfalls & configs)
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_flutter/handoff.md` — Survey 3 report (`fl-mat`, Flutter 3.50 & Widgetbook 3.25 APIs)
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/orchestrator_main/DISPATCH.md` — Sentinel dispatch record
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/orchestrator_main/progress.md` — liveness & checkpoint tracker
