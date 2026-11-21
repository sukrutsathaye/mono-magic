---
name: roadmap-tracker
description: >-
  Reads, plans, validates, and updates milestone progress in ROADMAP.md. Use when the user
  asks what to work on next, wants to plan a task from the roadmap, or finishes a roadmap
  deliverable and needs to check off items in ROADMAP.md.
---

# Roadmap Tracker Workflow

Use this skill whenever inspecting, planning, or updating progress in [ROADMAP.md](../../../ROADMAP.md).

## 1. Checking Status & Suggesting Next Tasks

1. Read [ROADMAP.md](../../../ROADMAP.md).
2. Respect the strict dependency graph in **Section 2 (High-Level Chronological Phase Timeline)**:
   - **Phase 1** (Committed Visual Baselines & Unit/Storybook Coverage Portal) unblocks reliable quality gates for Phase 2+.
   - **Phase 2 (Atomic Design Expansion)** MUST proceed chronologically:
     1. `Phase 2A: Wave 2 Molecules`
     2. `Phase 2B: Wave 1 Core Organisms` (depends on Wave 1 & 2 Molecules)
     3. `Phase 2C: Wave 2 Domain Organisms & Templates` (depends on Core Organisms)
   - **Phase 3 (Utilities & Data-Access)** MUST proceed contract-first:
     1. `Phase 3A: Pure Shared Utils (libs/utils/*)`
     2. `Phase 3B: Data-Access Contracts (libs/data-access/data-access-interfaces)`
     3. `Phase 3C: Concrete BaaS / NestJS / Spring Boot / Cloud Wrappers`
   - **Phase 4 & 5** compose Phases 2 and 3 into ecosystem integrations (LiveKit, PoseNet), additional UI frameworks (Vue, Svelte, Tailwind/shadcn), and flagship apps (`apps/yoga-live`, `apps/knitted-showcase`).

---

## 2. Verifying Deliverable Acceptance Criteria Before Marking `[x]`

Never mark a checklist item `[x]` in `ROADMAP.md` until all acceptance criteria for that item are verified:
1. For **UI Components**:
   - Contract defined in `@mono-magic/atomic-design-interfaces`
   - Implemented in all 4 core libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`)
   - `lint`, `typecheck`, `test` (>=80% coverage), `test-storybook`, `build-storybook`, and `build-widgetbook` all pass
2. For **Utils & Data-Access Libraries**:
   - Contract/unit tests (>=80% coverage), `lint`, and `typecheck` pass
   - Concrete data-access providers pass the shared contract compliance suite
3. Update the item checkbox from `- [ ]` to `- [x]` and update the Phase status table in Section 2 if all items in a phase are complete.
