# Project Blueprint: Couples Relationship Journal App (`Phase 5D`)

- **Status**: `Blueprint Approved — Scheduled for Phase 5D`
- **Target Phases**: `Phase 2B/2C, Phase 3C, Phase 5D`
- **Primary Domains**: `libs/utils/ts-core`, `libs/data-access/ts-supabase`, `libs/data-access/ts-firebase`, `libs/features/ts-journal`, `libs/ui/*`, `apps/couples-journal-web`, `apps/couples-journal-mobile`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: Generic note-taking apps lack private two-person pairing, guided daily relationship prompts, shared-vs-private reflection boundaries, mood check-ins, and milestone timelines designed for couples.
- **Core Objectives**:
  - **Paired Private Workspace**: Cryptographically random invite-code linking between exactly two partners, with strict Row-Level Security (RLS) ensuring zero cross-couple data leakage.
  - **Private vs. Shared Entries**: Each partner can write private drafts or publish shared reflections, attach photo memories (`IStorageProvider`), log daily mood check-ins, and answer guided prompts with realtime partner sync (`IRealtimeProvider`).
  - Instant, calm, sub-100ms interactive UX with zero clutter.
- **Target Personas & Roles**:
  - **Partner A & Partner B**: Equal co-owners of a paired workspace; each has exclusive read/write access to their own private entries and shared access to published couple entries.
- **Non-Goals / Out of Scope**:
  - Public social feeds, group workspaces (>2 users), or clinical therapy diagnostics.

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Web App (`svelte-tw`)**: Couples Journal is an intimate, fast, editorial consumer web app where tiny bundle size, smooth native transitions, and distraction-free responsiveness matter most — Svelte 5 + Tailwind v4 shines here.
- **Mobile App (`kt-compose` Android Native + `fl-mat` cross-platform option)**: Ideal showcase for our new **Kotlin Jetpack Compose (`libs/ui/kt-compose`)** native Android app with home-screen mood widgets, local Room offline cache, and biometric lock (while `fl-mat` provides iOS parity).
- **Backend (`ts-supabase` default, `ts-firebase` swappable)**: Supabase Postgres **Row-Level Security (RLS)** enforces pair-scoped and private-entry isolation directly at the database engine layer, paired with Supabase Realtime & Storage (and swappable with `ts-firebase` via `ts-interfaces`).

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/utils/ts-core` | `utils-ts-core` | `scope:utils`, `type:util`, `lang:ts` | `Result<T, E>`, invite token validation, streak calculations |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | `journal/v1/journal.proto` (`CoupleWorkspace`, `JournalEntry`, `DailyPrompt`, `MoodCheckIn`) |
| `libs/data-access/ts-supabase` | `data-access-ts-supabase` | `scope:data-access`, `type:data-access`, `lang:ts` | Primary Auth + Postgres RLS + Realtime + Photo Storage adapter |
| `libs/data-access/ts-firebase` | `data-access-ts-firebase` | `scope:data-access`, `type:data-access`, `lang:ts` | Swappable BaaS alternative proving LSP parity |
| `libs/features/ts-journal` | `features-ts-journal` | `scope:features`, `type:feature`, `lang:ts` | Pairing flow, prompt scheduler, private/shared entry visibility state |
| `libs/ui/*` | `svelte-tw`, `kt-compose`, `fl-mat`, `atomic-design-interfaces` | `scope:ui` | `MagicAppShellTemplate`, `MagicAuthForm`, `Card`, `Dialog`, `Tabs`, `DatePicker`, `Toast` |
| `apps/couples-journal-web` | `couples-journal-web` | `scope:app`, `type:app`, `lang:ts` | Svelte 5 + Tailwind consumer web app |
| `apps/couples-journal-android` | `couples-journal-android` | `scope:app`, `type:app`, `lang:kotlin` | Native Android Jetpack Compose app with offline sync & biometric lock |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `ts-journal` depends solely on `IAuthProvider`, `IDataRepository`, `IStorageProvider`, and `IRealtimeProvider`.
  - Prompt sources implement `IPromptProvider` (curated local packs, seasonal packs, optional AI prompt generator).
- **Performance & Concurrency Design**:
  - Optimistic local writes with background sync; lazy-loaded compressed photo thumbnails via signed storage URLs.
- **Security & Secret Hygiene**:
  - **Strict Privacy Isolation**: Automated security tests verify Partner A can NEVER read Partner B's `visibility = PRIVATE` entries and Couple X can NEVER query Couple Y's workspace or storage bucket.
  - Expiring single-use 15-minute pairing invite codes; optional client-side biometric/PIN lock on mobile.

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf**: `CoupleWorkspace`, `InviteCode`, `JournalEntry` (`visibility: PRIVATE | SHARED`), `MoodCheckIn`, `MilestoneMemory`.
- **Realtime**: Channel `couple:<workspace_id>` publishing `entry.shared`, `mood.updated`, and `prompt.answered` events via `RealtimeEnvelope`.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `Card`, `Dialog`, `Tabs`, `DatePicker`, `Toast`, `Avatar`, `Chip`, `FormField`, `TextInput`, `SlideToggle`.
- **New Organisms & Templates**: `MagicAuthForm`, `MagicAppShellTemplate`, `MagicNavbar`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=80%` across `ts-journal`, `svelte-tw` views, and `kt-compose` screens.
- **Privacy & RLS Isolation Suite**: Dedicated integration tests against local Supabase Docker / Firebase Emulator verifying cross-couple and private-entry access denials.
- **E2E**: Playwright two-browser-context test (Partner A creates workspace & invites Partner B → Partner B joins → Partner A posts private vs. shared entry → verify Partner B sees shared entry live and cannot access private entry).

---

## 7. Phased Milestones

1. **Milestone 1 — Contracts & Privacy Schema**: Add `journal.proto`, Supabase RLS migrations, and `libs/features/ts-journal`.
2. **Milestone 2 — Web App (`svelte-tw`)**: Assemble `apps/couples-journal-web` with realtime sync and Playwright two-partner E2E tests.
3. **Milestone 3 — Kotlin Native Android App (`kt-compose`)**: Build `apps/couples-journal-android` with `kt-interfaces` + offline cache.
4. **Milestone 4 — BaaS Swap Verification**: Run compliance & smoke suite against `ts-firebase` to prove zero vendor lock-in.
