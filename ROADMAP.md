# mono-magic Roadmap

This roadmap tracks the architectural evolution and feature delivery of **`mono-magic`**. It combines:
1. A **High-Level Chronological Phase Timeline** enforcing bottom-up dependencies (e.g., `Molecules -> Core Organisms -> Domain Organisms -> Templates`, and `Utils + Data-Access Contracts -> Concrete Providers -> Applications`).
2. **Detailed Domain Checklists** with explicit deliverable acceptance criteria per item.

---

## 1. Architectural Vision & Core Principles

- **Contract-First Engineering**:
  - **UI Layer (`libs/ui/*`)**: Every component tier is specified first in framework-agnostic TypeScript interfaces inside `@mono-magic/atomic-design-interfaces` (`libs/ui/atomic-design-interfaces`, tagged `scope:ui`, `type:interfaces`) and mirrored in Dart models for Flutter (`libs/ui/fl-mat`), ensuring consistent props, variants, accessibility semantics, and behavior across every framework.
  - **Data-Access Layer (`libs/data-access/*`)**: Every backend capability (Authentication, Database/CRUD Repository, File/Media Storage, Realtime PubSub/Streams, Payments/Orders) is defined first via vendor-agnostic interfaces and abstract base classes in `libs/data-access/data-access-interfaces` (`scope:data-access`, `type:interfaces`) before implementing concrete BaaS or backend wrappers (Firebase, Supabase, NestJS, Spring Boot + Keycloak + Postgres, AWS, GCP, Azure).
- **Clean Domain Boundaries (`libs/utils/*` vs. Domain Contracts)**:
  - Domain contracts remain inside their respective domain directories (`libs/ui/atomic-design-interfaces`, `libs/data-access/data-access-interfaces`).
  - `libs/utils/*` (`scope:utils`, `type:util`) is reserved strictly for pure, stateless, framework- and vendor-agnostic helper libraries (`utils/core`, `utils/formatters`, `utils/pose-math`, `utils/design-tokens`, `utils/py-common`).
- **Bottom-Up Atomic Design Progression**:
  - New UI components are built strictly in tier order (`Atoms -> Molecules -> Core Organisms -> Domain Organisms -> Templates`) so higher-order components always compose tested, visually baselined primitives.
- **Polyglot Right-Tool-for-the-Job**:
  - Build microservices and shared modules in TypeScript/NestJS, Python (`uv`), Java/Kotlin (Spring Boot), Go, or Rust wherever each language excels, orchestrated uniformly by Nx.

---

## 2. High-Level Chronological Phase Timeline

```mermaid
flowchart TD
  P0["Phase 0: Foundation (Completed)<br/>Nx + pnpm + uv + Flutter, 4 UI Libs, 11 Atoms + 5 Molecules, GH Pages Portal"]
  P1["Phase 1: Maintenance, Visual Baselines & Coverage Portal<br/>README/ROADMAP/.gemini, Committed __baselines__, Unit + Storybook Coverage on GH Pages"]
  P2M["Phase 2A: Wave 2 Molecules (All 4 UI Libs)<br/>Dialog, Toast/Alert, Tabs, Accordion, Avatar, ListItem, Stepper, Pagination, DatePicker, Rating"]
  P2O1["Phase 2B: Wave 1 Core Organisms (All 4 UI Libs)<br/>Navbar/AppHeader, Sidebar/Drawer, AuthForm, DataTable, NotificationFeed"]
  P2O2["Phase 2C: Wave 2 Domain Organisms & Templates (All 4 UI Libs)<br/>ProductCatalogGrid, CartDrawer, CheckoutForm, VideoParticipantGrid, PoseTelemetryPanel + 3 Templates"]
  P3U["Phase 3A: Pure Shared Utils (libs/utils/*)<br/>core, formatters, pose-math, design-tokens, py-common"]
  P3C["Phase 3B: Data-Access Contracts (libs/data-access/data-access-interfaces)<br/>Auth, Repository, Storage, Realtime, Payments"]
  P3B["Phase 3C: BaaS, NestJS, Spring Boot & Cloud Wrappers<br/>Firebase, Supabase, NestJS Modules, Spring Boot + Keycloak + Postgres, AWS/GCP/Azure"]
  P4["Phase 4: Ecosystem Integrations & Additional UI Frameworks<br/>LiveKit, PoseNet/MediaPipe, Vue, Svelte, Tailwind/shadcn, Go/Rust/Python Microservices"]
  P5["Phase 5: Flagship Applications (apps/*)<br/>Live Conferencing Yoga App & Hand-Knitted Articles Showcase App"]

  P0 --> P1
  P1 --> P2M
  P2M --> P2O1
  P2O1 --> P2O2
  P1 --> P3U
  P1 --> P3C
  P3U --> P3B
  P3C --> P3B
  P2O2 --> P4
  P3B --> P4
  P4 --> P5
```

| Phase | Milestone | Primary Directories | Dependencies | Status |
| --- | --- | --- | --- | --- |
| **Phase 0** | Monorepo Foundation, 4 UI Libraries (11 Atoms + 5 Molecules), GH Pages Portal | `libs/ui/*`, `tools/ci/*`, `.github/workflows/*` | — | Completed |
| **Phase 1** | Docs, `.gemini/` Orchestration, Committed Visual Baselines & Coverage Portal | `README.md`, `ROADMAP.md`, `.gemini/*`, `libs/ui/*` | Phase 0 | In Progress |
| **Phase 2A** | Atomic Design Expansion — Wave 2 Molecules (10 Molecules × 4 UI Libs) | `libs/ui/atomic-design-interfaces`, `libs/ui/{react-mui,ng-mat,rn-paper,fl-mat}` | Phase 1 | Planned |
| **Phase 2B** | Atomic Design Expansion — Wave 1 Core Organisms (5 Organisms × 4 UI Libs) | `libs/ui/atomic-design-interfaces`, `libs/ui/{react-mui,ng-mat,rn-paper,fl-mat}` | Phase 2A | Planned |
| **Phase 2C** | Atomic Design Expansion — Wave 2 Domain Organisms & Page Templates | `libs/ui/atomic-design-interfaces`, `libs/ui/{react-mui,ng-mat,rn-paper,fl-mat}` | Phase 2B | Planned |
| **Phase 3A** | Pure Shared Utilities (`core`, `formatters`, `pose-math`, `design-tokens`, `py-common`) | `libs/utils/*` | Phase 1 | Planned |
| **Phase 3B** | Contract-First Data-Access Interfaces & Compliance Test Harness | `libs/data-access/data-access-interfaces` | Phase 3A | Planned |
| **Phase 3C** | Data-Access Implementations (Firebase, Supabase, NestJS, Spring Boot, Cloud SDKs) | `libs/data-access/*` | Phase 3B | Planned |
| **Phase 4A** | Open-Source Realtime & ML Integrations (LiveKit, PoseNet / MediaPipe, Payments) | `libs/features/*`, `libs/data-access/*` | Phase 2C, 3C | Planned |
| **Phase 4B** | Additional UI Frameworks & Design Systems (Vue, Svelte, Tailwind + `shadcn/ui`) | `libs/ui/{vue-*,svelte-*,react-shadcn}` | Phase 2C | Planned |
| **Phase 4C** | Polyglot Microservices (Python FastAPI/ML, Go/Rust Realtime Workers, Spring Boot) | `apps/api-*`, `libs/data-access/*` | Phase 3C | Planned |
| **Phase 5A** | Flagship App 1: Live Conferencing Yoga App with PoseNet Mistake Detection | `apps/yoga-live*` | Phase 2C, 4A, 4C | Planned |
| **Phase 5B** | Flagship App 2: Hand-Knitted Articles Showcase & Ordering Platform | `apps/knitted-showcase*` | Phase 2C, 3C | Planned |

---

## 3. Detailed Domain Checklists & Acceptance Criteria

### Track 1: Maintenance, AI Orchestration, Visual Baselines & Coverage (`Phase 0` – `Phase 1`)

#### Completed Foundation (`Phase 0`)
- [x] **Polyglot Workspace Setup**: Nx `24.0.6`, `pnpm@12.18.0`, `uv` (`Python >=3.12`), and Flutter (`>=3.50`) with Nx Cloud CI and self-healing workflow.
- [x] **Atomic Design Contracts (`@mono-magic/atomic-design-interfaces`)**: Shared common types (`MagicColor`, `MagicSize`, `MagicAppearance`) plus contracts for 11 Atoms and 5 Molecules.
- [x] **4 Core UI Libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`)**:
  - 11 Atoms: `Badge`, `Button`, `ButtonToggle`, `CheckBox`, `Chip`, `ProgressIndicator`, `RadioButton`, `SlideToggle`, `Slider`, `TextInput`, `ToolTip`.
  - 5 Molecules: `Card`, `FormField`, `Menu`, `SearchBar`, `Select`.
- [x] **Unified GitHub Pages Showcase Portal**: Automated discovery, build, and deployment via `tools/ci/storybook-pages.mjs` and `.github/workflows/storybook-gh-pages.yml` to `https://sukrutsathaye.github.io/mono-magic/`.

#### Documentation & `.gemini/` AI Orchestrator (`Phase 1.1`)
- [x] **Update `README.md`**: Fix Nx project names (`atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, `fl-mat`), replace stale `pnpm nx storybook ui-fl-mat` with `pnpm nx widgetbook fl-mat`, document all 11 Atoms & 5 Molecules, link deployed GitHub Pages showcases, and explain `storybook-addon-vis` baseline creation (`-- -u`).
- [x] **Create `ROADMAP.md`**: Establish chronological phases + domain checklists with acceptance criteria.
- [x] **Configure `.gemini/` & `.agents/` Orchestration**:
  - Add `GEMINI.md` and update `AGENTS.md` with domain boundaries and workflows.
  - Add 5 custom skills in `.gemini/skills/` (`polyglot-ui-component`, `storybook-visual-testing`, `coverage-and-quality`, `data-access-provider`, `roadmap-tracker`) and register `.gemini/skills` + `storybook-addon-vis/skills` in `.agents/skills.json`.
  - Add 5 custom commands in `.gemini/commands/*.toml` and 3 specialist agent profiles in `.gemini/agents/*.md`.

#### Storybook Visual Regression Baseline Setup (`Phase 1.2`)
- [ ] **Commit & Share Visual Baselines Across Environments**:
  - *Acceptance Criteria*:
    - Update `.gitignore` and `.storybook/main.ts` / `vite.config.mts` in `react-mui`, `ng-mat`, and `rn-paper` so baseline images (`__baselines__/`) are tracked in Git (while `__results__/` and `__diffs__/` remain gitignored) and resolved consistently in both local development and CI.
    - Add an explicit Nx target (`update-snapshots` or `test-storybook -u`) to regenerate baselines across all Storybook projects.
    - Generate and commit initial baseline PNGs for all stories in `react-mui`, `ng-mat`, and `rn-paper` so `pnpm nx run-many -t test-storybook -p react-mui,ng-mat,rn-paper` passes on a fresh clone and every story displays its baseline snapshot in the Storybook Web **Vis** panel.

#### Unit Test & Storybook Test Coverage Reporting (`Phase 1.3`)
- [ ] **Standardize Unit Test Coverage Across JS/TS & Flutter**:
  - *Acceptance Criteria*:
    - Configure `@vitest/coverage-v8` consistently across `atomic-design-interfaces`, `react-mui`, `ng-mat`, and `rn-paper` with `reporters: ['text', 'html', 'lcov', 'json-summary']`, uniform `include`/`exclude` globs, and enforced **80% thresholds** (`lines`, `statements`, `functions`, `branches`).
    - Configure `fl-mat` `test` target (or `test-coverage` target) to run `flutter test --coverage` and produce `coverage/lcov.info` plus an HTML coverage report.
- [ ] **Configure Storybook Browser Test Coverage**:
  - *Acceptance Criteria*:
    - Add a `test-storybook-coverage` target (or `--coverage` configuration on `test-storybook`) for `react-mui-storybook`, `ng-mat-storybook`, and `rn-paper-storybook` outputting HTML, LCOV, and `json-summary` reports to `test-output/storybook/coverage`.
- [ ] **Publish Coverage Reports to GitHub Pages Showcase Portal**:
  - *Acceptance Criteria*:
    - Extend `tools/ci/storybook-pages.mjs` and `.github/workflows/storybook-gh-pages.yml` to collect Unit Test and Storybook Test HTML coverage reports (plus coverage percentage badges from `coverage-summary.json` / `lcov.info`) and link them directly from each project card on the GitHub Pages portal (`https://sukrutsathaye.github.io/mono-magic/`).

---

### Track 2: Polyglot UI Libraries & Atomic Design Expansion (`Phase 2` & `Phase 4B`)

> [!IMPORTANT]
> **Strict Chronological Dependency Rule**:
> Every component must be designed in `@mono-magic/atomic-design-interfaces` first, implemented across all 4 core UI libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`) with unit tests (>=80% coverage), Storybook/Widgetbook stories, and visual baselines (`__baselines__`), and completed in chronological tier order: **Wave 2 Molecules $\rightarrow$ Wave 1 Core Organisms $\rightarrow$ Wave 2 Domain Organisms $\rightarrow$ Page Templates**.

#### Phase 2A — Wave 2 Molecules (Core UI Molecules)
- [ ] **`Dialog` / `Modal` (`MagicDialog`)**: Header, scrollable body, action footer, sizes (`sm`, `md`, `lg`, `fullscreen`), dismiss/backdrop behavior, focus trap & ARIA dialog roles.
- [ ] **`Toast` / `Snackbar` / `Alert` (`MagicAlert` & `MagicToast`)**: Severity variants (`info`, `success`, `warning`, `error`), dismissible action button, auto-hide duration, live region announcements (used for real-time PoseNet posture notifications and order alerts).
- [ ] **`Tabs` (`MagicTabs`)**: Horizontal/vertical tab bar, icon + label + badge tabs, keyboard arrow navigation, lazy/eager tab panels.
- [ ] **`Accordion` / `ExpansionPanel` (`MagicAccordion`)**: Single and multi-expand modes, header summary + icon + disabled state (used for product care details and yoga session breakdowns).
- [ ] **`Avatar` (`MagicAvatar`)**: Image, initials fallback, icon mode, status indicator dot (`online`, `busy`, `offline`), and `MagicAvatarGroup` stack.
- [ ] **`ListItem` (`MagicListItem`)**: Leading avatar/icon, primary/secondary text, trailing action/badge, selectable/interactive states.
- [ ] **`Stepper` (`MagicStepper`)**: Horizontal/vertical step indicator, completed/active/error states, linear/non-linear navigation (used for multi-step checkout and onboarding).
- [ ] **`Pagination` & `Breadcrumbs` (`MagicPagination`, `MagicBreadcrumbs`)**: Page size selector, page range navigation, and hierarchical breadcrumb trail.
- [ ] **`DatePicker` & `TimePicker` (`MagicDatePicker`)**: Single date, date range, min/max constraints, form-field integration (used for booking live yoga sessions and delivery estimates).
- [ ] **`Rating` (`MagicRating`)**: Interactive and read-only star/icon rating, half-step precision, review count label (used for hand-knitted item reviews and class ratings).

#### Phase 2B — Wave 1 Core Organisms (Composing Atoms + Wave 1/2 Molecules)
- [ ] **`Navbar` / `AppHeader` (`MagicNavbar`)**:
  - *Composes*: `Button`, `SearchBar`, `Badge`, `Avatar`, `Menu`, `ToolTip`.
  - *Acceptance Criteria*: Responsive top app bar with brand slot, navigation links, integrated `MagicSearchBar`, notification/cart badge triggers, and user profile `MagicMenu`.
- [ ] **`NavigationDrawer` / `Sidebar` (`MagicSidebar`)**:
  - *Composes*: `ListItem`, `Badge`, `Accordion`, `Button`, `ToolTip`.
  - *Acceptance Criteria*: Persistent, collapsible mini-rail, and modal drawer variants with nested navigation groups and active route highlighting.
- [ ] **`AuthForm` (`MagicAuthForm`)**:
  - *Composes*: `Card`, `FormField`, `TextInput`, `CheckBox`, `Button`, `Alert`, `Tabs`.
  - *Acceptance Criteria*: Supports Sign-In, Sign-Up, Forgot Password, and OAuth/Social provider buttons with validation states and loading indicators.
- [ ] **`DataTable` (`MagicDataTable`)**:
  - *Composes*: `CheckBox`, `Button`, `SearchBar`, `Select`, `Chip`, `Pagination`, `ProgressIndicator`, `Menu`.
  - *Acceptance Criteria*: Typed column definitions, client/server sorting, row selection, search/filter toolbar, empty/loading states, and pagination footer.
- [ ] **`NotificationFeed` / `AlertPanel` (`MagicNotificationFeed`)**:
  - *Composes*: `Card`, `ListItem`, `Avatar`, `Badge`, `Chip`, `Button`, `Tabs`.
  - *Acceptance Criteria*: Filterable real-time activity/alert stream (unread/all/critical) with action callbacks (powers teacher posture-mistake alerts in the Yoga app and order status updates in the Storefront app).

#### Phase 2C — Wave 2 Domain Organisms & Templates (Composing Atoms + Molecules + Core Organisms)
- [ ] **E-Commerce Organisms**:
  - `ProductCatalogGrid` (`MagicProductCatalogGrid`): Filterable/sortable responsive grid of product cards composing `Card`, `Chip`, `Rating`, `Badge`, `Button`, `SearchBar`, `Select`, and `Pagination`.
  - `CartDrawer` (`MagicCartDrawer`): Slide-over shopping cart composing `ListItem`, `Button`, quantity steppers, promo code `FormField`, and subtotal summary.
  - `CheckoutForm` (`MagicCheckoutForm`): Multi-step checkout organism composing `Stepper`, `FormField`, `TextInput`, `Select`, `RadioButton`, and `Card`.
- [ ] **Live Conferencing & Telemetry Organisms**:
  - `VideoParticipantGrid` / `MediaStage` (`MagicMediaStage`): Responsive speaker/grid video stage with participant tiles, mute/camera/screen-share `ButtonToggle` control bar, connection quality `Badge`, and pose-overlay canvas slot.
  - `PoseTelemetrySidePanel` (`MagicPoseTelemetryPanel`): Real-time student posture accuracy meter (`ProgressIndicator`, `Slider`, `Chip`), active joint-angle warnings (`Alert`), and instant teacher feedback actions.
- [ ] **Page Templates (`src/lib/templates/`)**:
  - `AppShellTemplate` (`MagicAppShellTemplate`): Composes `Navbar`, `NavigationDrawer`, main content region, and `Toast` viewport.
  - `StorefrontTemplate` (`MagicStorefrontTemplate`): Composes `Navbar`, facet filter sidebar, `ProductCatalogGrid`, and `CartDrawer`.
  - `LiveSessionTemplate` (`MagicLiveSessionTemplate`): Composes session header, `VideoParticipantGrid` stage, collapsible `PoseTelemetrySidePanel` + `NotificationFeed`, and bottom media control bar.

#### Phase 4B — Additional UI Frameworks & Design Systems (`libs/ui/*`)
- [ ] **`react-shadcn` (`libs/ui/react-shadcn`)**: React 19 + Tailwind CSS + `shadcn/ui` (Radix primitives) implementing `@mono-magic/atomic-design-interfaces` + Storybook.
- [ ] **`vue-ui` (`libs/ui/vue-vuetify` or `libs/ui/vue-shadcn`)**: Vue 3 + Vuetify 3 / `shadcn-vue` implementing `@mono-magic/atomic-design-interfaces` + Storybook.
- [ ] **`svelte-ui` (`libs/ui/svelte-ui`)**: Svelte 5 + Tailwind / `shadcn-svelte` implementing `@mono-magic/atomic-design-interfaces` + Storybook.

---

### Track 3: Pure Shared Utilities (`libs/utils/*` — `Phase 3A`)

> [!NOTE]
> All libraries in `libs/utils/*` must remain **stateless, framework-agnostic, and vendor-agnostic** (`scope:utils`, `type:util`).

- [ ] **`@mono-magic/utils-core` (`libs/utils/core`)**:
  - *Acceptance Criteria*: Functional `Result<T, E>` / `AppError` primitives, retry with exponential backoff + jitter, debounce/throttle, typed EventBus, and invariant helpers with 90%+ unit test coverage.
- [ ] **`@mono-magic/utils-formatters` (`libs/utils/formatters`)**:
  - *Acceptance Criteria*: Locale-aware currency/price/tax formatting, physical unit & dimension converters (yarn weight/length/gauge, clothing sizes), and date/duration/countdown formatters.
- [ ] **`@mono-magic/utils-pose-math` (`libs/utils/pose-math`)**:
  - *Acceptance Criteria*: Pure 2D/3D keypoint vector geometry (joint angle calculation between 3 landmarks, cosine similarity against reference yoga pose vectors, confidence filtering, and One-Euro / EMA temporal smoothing filters).
- [ ] **`@mono-magic/utils-design-tokens` (`libs/utils/design-tokens`)**:
  - *Acceptance Criteria*: Pure WCAG 2.1 contrast-ratio calculators, color-space conversions, and design-token transformers outputting CSS custom properties, React/RN theme objects, and Dart theme tokens.
- [ ] **`py-utils-common` (`libs/utils/py-common`)**:
  - *Acceptance Criteria*: `uv`-managed Python utility package providing structured JSON logging, correlation-ID middleware helpers, standardized error envelopes, and Pydantic base settings.

---

### Track 4: Contract-First Data-Access Layer & Backend Wrappers (`libs/data-access/*` — `Phase 3B–3C`)

```mermaid
classDiagram
  class IAuthProvider {
    <<interface>>
    +signInWithEmail(credentials) Result~AuthSession, DataAccessError~
    +signInWithOAuth(provider) Result~AuthSession, DataAccessError~
    +signOut() Result~void, DataAccessError~
    +onAuthStateChanged(listener) Unsubscribe
    +verifyToken(token) Result~UserClaims, DataAccessError~
  }
  class IDataRepository~T, ID~ {
    <<interface>>
    +findById(id: ID) Result~T, DataAccessError~
    +findMany(query: QuerySpec~T~) Result~PaginatedResult~T~, DataAccessError~
    +create(data: CreateDto~T~) Result~T, DataAccessError~
    +update(id: ID, data: UpdateDto~T~) Result~T, DataAccessError~
    +delete(id: ID) Result~void, DataAccessError~
  }
  class IStorageProvider {
    <<interface>>
    +upload(bucket, path, payload, meta) Result~StorageFile, DataAccessError~
    +getSignedUrl(bucket, path, expiresIn) Result~string, DataAccessError~
    +delete(bucket, path) Result~void, DataAccessError~
  }
  class IRealtimeProvider {
    <<interface>>
    +publish(channel, event, payload) Result~void, DataAccessError~
    +subscribe(channel, handler) Unsubscribe
  }

  IAuthProvider <|.. FirebaseDataAccess
  IDataRepository <|.. FirebaseDataAccess
  IStorageProvider <|.. FirebaseDataAccess
  IRealtimeProvider <|.. FirebaseDataAccess

  IAuthProvider <|.. SupabaseDataAccess
  IDataRepository <|.. SupabaseDataAccess
  IStorageProvider <|.. SupabaseDataAccess
  IRealtimeProvider <|.. SupabaseDataAccess

  IAuthProvider <|.. NestJsDataAccess
  IDataRepository <|.. NestJsDataAccess

  IAuthProvider <|.. SpringBootKeycloakPostgresDataAccess
  IDataRepository <|.. SpringBootKeycloakPostgresDataAccess
```

#### Phase 3B — Data-Access Contracts (`libs/data-access/data-access-interfaces`)
- [ ] **`@mono-magic/data-access-interfaces` (`libs/data-access/data-access-interfaces`)**:
  - *Acceptance Criteria*:
    - Define vendor-agnostic TypeScript interfaces and abstract base classes (`IAuthProvider`, `BaseAuthProvider`, `IDataRepository<T, ID>`, `BaseDataRepository<T, ID>`, `IStorageProvider`, `IRealtimeProvider`, `IPaymentProvider`) plus portable query/filter/pagination DTOs (`QuerySpec`, `PaginatedResult`, `DataAccessError`).
    - Provide a reusable **Contract Compliance Test Suite** (`runDataRepositoryContractTests`, `runAuthProviderContractTests`) that every concrete provider implementation must pass.
    - Mirror core contracts for Dart (`libs/data-access/fl-data-access-interfaces`), Python (`libs/data-access/py-data-access-interfaces`), and JVM/Java/Kotlin.

#### Phase 3C.1 — BaaS Wrappers (Firebase & Supabase)
- [ ] **`@mono-magic/data-access-firebase` (`libs/data-access/firebase`)**:
  - *Acceptance Criteria*: Implements `IAuthProvider` (Firebase Auth), `IDataRepository` (Cloud Firestore with converter & query mapping), `IStorageProvider` (Cloud Storage), and `IRealtimeProvider` (Firestore/RTDB listeners), passing the shared contract compliance suite against Firebase Emulator / mocks.
- [ ] **`@mono-magic/data-access-supabase` (`libs/data-access/supabase`)**:
  - *Acceptance Criteria*: Implements `IAuthProvider` (Supabase Auth), `IDataRepository` (PostgREST / Postgres), `IStorageProvider` (Supabase Storage), and `IRealtimeProvider` (Supabase Realtime channels), passing the identical contract compliance suite.

#### Phase 3C.2 — NestJS Backend Wrappers (`libs/data-access/nestjs-*`)
- [ ] **`@mono-magic/data-access-nestjs` (`libs/data-access/nestjs-core` & wrappers)**:
  - *Acceptance Criteria*: Reusable NestJS dynamic modules and decorators following official NestJS idioms:
    - Auth/OIDC/JWT Guards & Passport strategies implementing `IAuthProvider`
    - Prisma / TypeORM PostgreSQL repository adapters implementing `IDataRepository`
    - Caching (Redis), Configuration (`@nestjs/config`), OpenAPI/Swagger, Queues (`BullMQ`), and WebSockets/Microservice transport wrappers.

#### Phase 3C.3 — Enterprise Java/Kotlin Spring Boot Data-Access (`libs/data-access/spring-boot-*`)
- [ ] **`spring-boot-data-access` (`libs/data-access/spring-boot-starter`)**:
  - *Acceptance Criteria*: Spring Boot 3 (Java 21 / Kotlin) module providing the same domain capabilities as the Firebase/Supabase wrappers using open-source self-hosted infrastructure:
    - **Keycloak** OIDC / OAuth2 Resource Server & Admin client adapter (`IAuthProvider` equivalent)
    - **PostgreSQL** + Spring Data JPA / jOOQ + Flyway migrations (`IDataRepository` equivalent)
    - **MinIO / S3-compatible** object storage adapter (`IStorageProvider` equivalent)
    - **Redis / WebSocket / STOMP** pub-sub adapter (`IRealtimeProvider` equivalent)
    - Exposed via REST/OpenAPI + gRPC so any frontend or microservice can swap between Firebase, Supabase, NestJS, and Spring Boot seamlessly.

#### Phase 3C.4 — Cloud Provider Wrappers (AWS, GCP, Azure)
- [ ] **`@mono-magic/data-access-aws` (`libs/data-access/aws`)**: Adapters for Amazon Cognito, DynamoDB / RDS, S3, and EventBridge/IoT WebSockets.
- [ ] **`@mono-magic/data-access-gcp` (`libs/data-access/gcp`)**: Adapters for Google Identity Platform, Firestore / Cloud SQL / Spanner, Cloud Storage, and Pub/Sub.
- [ ] **`@mono-magic/data-access-azure` (`libs/data-access/azure`)**: Adapters for Microsoft Entra ID, Cosmos DB / Azure Postgres, Blob Storage, and Web PubSub.

---

### Track 5: Realtime, ML Integrations & Polyglot Microservices (`Phase 4A` & `Phase 4C`)

- [ ] **LiveKit Conferencing Integration (`libs/data-access/livekit` & `libs/features/live-room`)**:
  - *Acceptance Criteria*: Server-side room management & JWT access token generator (TS/NestJS, Python, and Go/Spring Boot compatible) + client-side room connection, track publishing, and data-channel telemetry hooks integrating with `MagicMediaStage`.
- [ ] **PoseNet / MediaPipe Pose Analysis Integration (`libs/features/pose-detection` & `apps/api-pose-analyzer`)**:
  - *Acceptance Criteria*:
    - Client-side real-time pose landmark extractor (TensorFlow.js PoseNet / MoveNet / MediaPipe Pose for Web, React Native, and Flutter).
    - Reference pose library (Downward Dog, Warrior II, Tree Pose, Plank, etc.) using `@mono-magic/utils-pose-math` to detect joint-angle deviations and emit structured mistake events over LiveKit data channels / `IRealtimeProvider`.
- [ ] **Polyglot Microservices (`apps/api-*`)**:
  - [ ] **Python (`uv` — `apps/api-pose-coach`)**: FastAPI + PyTorch/MediaPipe service for server-side pose session analytics, biomechanical progress scoring, and personalized correction summaries.
  - [ ] **Go / Rust (`apps/api-realtime-telemetry`)**: High-throughput, low-latency telemetry aggregator and webhook/event router for live conferencing rooms.
  - [ ] **Java / Kotlin (`apps/api-commerce-core`)**: Spring Boot + Keycloak + PostgreSQL backend service for catalog inventory, custom knitting order workflows, and payment orchestration.
  - [ ] **NestJS (`apps/api-gateway`)**: TypeScript BFF / API Gateway unifying REST/GraphQL/WebSocket endpoints for web and mobile clients.

---

### Track 6: Flagship Applications (`apps/*` — `Phase 5`)

#### Phase 5A — Live Conferencing Yoga App (`apps/yoga-live`)
- [ ] **Interactive Live Yoga Classroom (`apps/yoga-live-web` & `apps/yoga-live-mobile`)**:
  - *Composes*: `LiveSessionTemplate`, `VideoParticipantGrid`, `PoseTelemetrySidePanel`, `NotificationFeed`, `DatePicker`, `AuthForm`, `@mono-magic/utils-pose-math`, LiveKit integration, and pluggable `data-access`.
  - *Acceptance Criteria*:
    - Multi-participant live video conferencing powered by LiveKit.
    - Real-time client-side PoseNet/MoveNet skeleton tracking overlaying joint alignment feedback on the student's video feed.
    - Automated posture mistake detection that notifies the instructor via `MagicNotificationFeed` and `MagicPoseTelemetryPanel` (e.g., *"Student A: Left knee angle 15° off in Warrior II"*) with one-click audio/visual cue feedback.
    - Class scheduling, post-session posture accuracy report cards, and historical progress charts.

#### Phase 5B — Hand-Knitted Articles Showcase & Ordering Platform (`apps/knitted-showcase`)
- [ ] **Artisanal Hand-Knitted Storefront & Custom Order Studio (`apps/knitted-showcase-web` & `apps/knitted-showcase-mobile`)**:
  - *Composes*: `StorefrontTemplate`, `AppShellTemplate`, `ProductCatalogGrid`, `CartDrawer`, `CheckoutForm`, `Dialog`, `Tabs`, `Rating`, `Accordion`, `@mono-magic/utils-formatters`, and pluggable `data-access` (Supabase/Firebase or Spring Boot/NestJS).
  - *Acceptance Criteria*:
    - Curated showcase gallery for hand-knitted garments and accessories with high-resolution media, yarn composition badges (`Chip`), and customer reviews (`Rating`).
    - Interactive customization selector (yarn material, color palette swatches, custom measurements/sizes with `@mono-magic/utils-formatters`).
    - Real-time cart drawer (`MagicCartDrawer`), multi-step checkout (`MagicCheckoutForm` + `MagicStepper`), and live order crafting status tracker (e.g., *Yarn Selected $\rightarrow$ In Knitting $\rightarrow$ Blocking & QC $\rightarrow$ Shipped*).
