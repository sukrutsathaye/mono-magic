# Project Blueprint: Quanti-Fit — Interactive Live Coaching & Learning Platform (`Phase 5A`)

- **Status**: `Blueprint Approved — Scheduled for Phase 5A`
- **Target Phases**: `Phase 2C, Phase 3C, Phase 4A, Phase 4C, Phase 5A`
- **Primary Domains**: `libs/utils/rs-pose-math`, `libs/data-access/ts-livekit`, `libs/data-access/ts-nestjs`, `libs/data-access/py-nest`, `libs/features/ts-pose-detection`, `libs/ui/*`, `apps/quanti-fit-*`, `apps/api-pose-coach`, `apps/api-realtime-telemetry`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: Existing live fitness/yoga and online tutoring platforms stream passive video without biomechanical posture verification, real-time instructor alerts, or integrated study tools (smart whiteboards, automatic transcripts, and short-form instructional reels).
- **Core Objectives**:
  - Multi-participant low-latency video sessions powered by **LiveKit** supporting **Yoga, Gym/Fitness** (with real-time on-device skeleton tracking & posture-mistake alerts to instructors) AND **Multi-Subject Tutoring** (Math, Science, Languages with Smart Whiteboard & auto-transcripts).
  - On-device pose analysis at `>=30fps` using **`rs-pose-math`** (compiled to WASM for web & FFI/native for mobile) so raw camera frames never leave the student's device — only lightweight landmark/mistake telemetry streams over LiveKit data channels.
  - Integrated **Reels** feed, class scheduling, live chat, and **Payments / Subscriptions** (`IPaymentProvider`).
- **Target Personas & Roles**:
  - **Student / Practitioner**: Joins live sessions on mobile/tablet/web, sees real-time posture overlay & feedback, browses reels, books classes.
  - **Coach / Instructor**: Monitors multi-student grid, receives prioritized posture-mistake alerts (`MagicPoseTelemetryPanel`), draws on Smart Whiteboard, publishes reels.
  - **Admin**: Manages instructor onboarding, payouts, and session analytics.
- **Non-Goals / Out of Scope**:
  - Medical/clinical diagnosis or HIPAA-certified physical therapy prescriptions.

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Primary Multiplatform Client (`fl-mat` — Flutter)**: Quanti-Fit is a **multiplatform mobile/tablet-first** app requiring smooth 60fps real-time `CustomPainter` pose skeleton overlays over live camera/WebRTC feeds across iOS, Android, and tablets. Flutter's Impeller engine outperforms JS-bridged canvas drawing while maintaining 1:1 Atomic Design parity.
- **Web Instructor & Studio Client (`react-mui`)**: Best ecosystem for multi-participant LiveKit grids, Smart Whiteboard (`tldraw`/canvas), and dense telemetry dashboards.
- **BFF & Room Orchestration (`ts-nestjs` — GraphQL + Swagger + Redis)**: Unifies class catalog, scheduling, payments, and LiveKit JWT token issuance with Redis session/presence caching.
- **Telemetry Fan-Out (`go` — `apps/api-realtime-telemetry`)**: Goroutines handle thousands of concurrent 10Hz pose-telemetry packets and LiveKit webhooks at sub-10ms latency.
- **Biomechanical Analytics (`py-nest` — `apps/api-pose-coach`)**: FastAPI + `py-ml-core` computes post-session biomechanical progress scores, transcript summaries, and personalized correction reports.

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/utils/rs-pose-math` | `rs-utils-pose-math` | `scope:utils`, `type:util`, `lang:rust` | Pure 2D/3D joint angles, cosine similarity, One-Euro temporal smoothing (native + WASM/FFI) |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | `realtime/v1/realtime.proto`, `payments/v1/payments.proto`, `fitness/v1/pose.proto` |
| `libs/data-access/ts-livekit` | `data-access-ts-livekit` | `scope:data-access`, `type:data-access`, `lang:ts` | LiveKit room management, JWT access tokens, data-channel transport |
| `libs/data-access/ts-nestjs` | `data-access-ts-nestjs` | `scope:data-access`, `type:data-access`, `lang:ts` | Modular NestJS GraphQL, Swagger, Redis, Auth, Prisma wrappers |
| `libs/features/ts-live-room` | `features-ts-live-room` | `scope:features`, `type:feature`, `lang:ts` | Room state, whiteboard sync, transcript aggregation, pose-alert throttling |
| `libs/ui/*` | `fl-mat`, `react-mui`, `atomic-design-interfaces` | `scope:ui` | `MagicMediaStage`, `MagicPoseTelemetryPanel`, `MagicNotificationFeed`, `MagicLiveSessionTemplate` |
| `apps/quanti-fit-mobile` | `quanti-fit-mobile` | `scope:app`, `type:app`, `lang:dart` | Flutter multiplatform student/coach app (iOS/Android/Tablet) |
| `apps/quanti-fit-web` | `quanti-fit-web` | `scope:app`, `type:app`, `lang:ts` | React + MUI instructor console & web classroom |
| `apps/api-realtime-telemetry` | `api-realtime-telemetry` | `scope:app`, `type:app`, `lang:go` | Go WebSocket/LiveKit telemetry aggregator & webhook router |
| `apps/api-pose-coach` | `api-pose-coach` | `scope:app`, `type:app`, `lang:py` | Python `py-nest` service for session analytics & coaching summaries |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `IPoseDetector` abstracts MediaPipe / MoveNet / TensorFlow.js so detection engines swap without touching `rs-pose-math` or UI.
  - `IReferencePoseRule` allows adding new Yoga/Gym exercises (Downward Dog, Squat, Warrior II, Plank) via declarative angle tolerances (OCP).
- **Performance & Concurrency Design**:
  - Debounced mistake alerts (minimum 1.5s hold duration before notifying coach) prevent alert fatigue.
  - One-Euro smoothing in `rs-pose-math` eliminates landmark jitter without lag.
- **Security & Secret Hygiene**:
  - Short-lived scoped LiveKit JWTs issued only to enrolled participants; video never recorded without explicit consent flags.

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf**: `PoseLandmark`, `JointAngleDeviation`, `PostureAlertEvent`, `SessionSummaryReport`.
- **APIs**: GraphQL (`ts-nestjs`) for scheduling/reels/subscriptions, LiveKit WebRTC + DataChannel for live video/telemetry, REST/OpenAPI on `api-pose-coach`.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `ButtonToggle`, `Badge`, `ProgressIndicator`, `Slider`, `Chip`, `Alert`, `Avatar`, `DatePicker`, `Tabs`, `Toast`.
- **New Organisms & Templates**: `MagicMediaStage`, `MagicPoseTelemetryPanel`, `MagicNotificationFeed`, `MagicLiveSessionTemplate`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on `rs-pose-math` & pose rule evaluation; `>=80%` on `ts-livekit`, `ts-live-room`, Flutter widgets, and Go/Python services.
- **Deterministic Pose Replay Tests**: Feed recorded JSON landmark streams through `rs-pose-math` to verify exact mistake alert triggers without needing a physical webcam in CI.
- **E2E**: Playwright instructor+student session journey (mocked LiveKit media track) + Flutter integration tests + Go race-detector tests.

---

## 7. Phased Milestones

1. **Milestone 1 — Pose Math WASM/FFI & LiveKit Wrapper**: Expose `rs-pose-math` to TS/Dart and build `libs/data-access/ts-livekit`.
2. **Milestone 2 — Live Session Organisms & Telemetry Service**: Ship `MagicMediaStage`, `MagicPoseTelemetryPanel`, `MagicLiveSessionTemplate`, and Go `api-realtime-telemetry`.
3. **Milestone 3 — BFF & Coaching Analytics**: Wire `ts-nestjs` (GraphQL/Redis/Payments) + `api-pose-coach` (FastAPI).
4. **Milestone 4 — Multiplatform App Assembly & E2E**: Deliver `apps/quanti-fit-mobile` (Flutter) & `apps/quanti-fit-web` (React) with full E2E verification.
