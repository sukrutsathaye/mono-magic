---
name: grill-me
description: >-
  Deep, structured architectural interview skill. Walks systematically through
  every branch of the design tree (problem/scope, domain boundaries, contracts,
  stack choices, data/state, failure modes, performance, security, UX/DX, and
  testing) asking one thorough question at a time — and ALWAYS briefly explaining
  all options (what each does + pros/cons) before presenting the question.
---

# Deep `/grill-me` Architectural Interview Playbook

Use this skill whenever the user invokes `/grill-me` or asks to stress-test, design, or blueprint a feature, library, or project before implementation.

---

## 1. Core Interview Rules

1. **Go Deep — Never Rush to a Plan**:
   - Do **not** stop after 2–3 high-level questions. Walk thoroughly down every relevant branch of the design tree until all major ambiguities, trade-offs, and cross-component dependencies are resolved:
     1. **Problem, Personas & Non-Goals** (what problem, who uses it, what is explicitly out of scope)
     2. **Stack & Framework Fit** (consult [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../../../docs/ARCHITECTURE_DECISION_MATRIX.md) when choosing UI/backend stacks)
     3. **Domain Boundaries & Reuse** (strict 4-domain `libs/{ui,utils,data-access,features}` + `apps/*` mapping; check existing OSS wrappers before building custom)
     4. **Contracts & Schemas** (Protobuf `.proto` wire DTOs/RPCs, UI contracts, API/event protocols)
     5. **Data Model, State & Concurrency** (storage, caching, queues, singletons, offline/realtime sync, simulators/HAL)
     6. **Edge Cases, Failure Modes & Security** (auth/authz, privacy/RLS, rate limits, retries, fallback degradation)
     7. **UX, Visuals & Developer Experience** (organisms/templates, local Docker setup, observability)
     8. **Testing, Coverage & Phased Delivery** (contract compliance suites, visual baselines, E2E journeys, milestone slicing)
2. **Explore Codebase First**:
   - Never ask the user a question that can be answered directly by reading `REPO_INDEX.md` or inspecting the codebase.
3. **One Question at a Time**:
   - Use `ask_question` with a single focused question per turn so each answer informs the next branch of the design tree.
4. **Mandatory Option Breakdown Before Every Question**:
   - **BEFORE calling `ask_question`**, write a brief, scannable breakdown of **all options** (typically 3–4 concrete choices) directly in your message text:
     - **Option 1 (Recommended)**: What it is + key pros + key trade-off + why it is recommended.
     - **Option 2**: What it is + key pros + key trade-off.
     - **Option 3**: What it is + key pros + key trade-off.
     - **Option 4** *(when helpful)*: Distinct alternative + key pros + key trade-off.
   - Keep each option summary to 1–2 crisp lines so the user can compare them effortlessly and make an informed decision.
5. **Respect User Pushback & Curiosities**:
   - If the user asks a "why" or "what if" question in their answer, answer it honestly with concrete trade-offs before advancing to the next branch.
6. **Exit Condition**:
   - Only move to authoring the Implementation Plan or `docs/projects/<slug>.md` blueprint once all active branches have clear, agreed decisions (or the user explicitly asks to wrap up and generate the plan/blueprint).
