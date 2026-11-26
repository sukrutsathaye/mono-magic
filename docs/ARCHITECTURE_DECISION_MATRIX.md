# `mono-magic` Frontend & Backend Architecture Decision Matrix

This reference matrix provides an **objective, evidence-based guide** for selecting UI frameworks (`libs/ui/*`) and backend/data-access stacks (`libs/data-access/*`, `apps/api-*`) for every application blueprint in [`docs/projects/`](projects/_TEMPLATE.md).

> [!IMPORTANT]
> **Rule for All Project Blueprints**: Every blueprint in `docs/projects/<slug>.md` MUST cite this matrix in Section 2 to justify *why* its chosen frontend and backend stacks fit the application's latency, platform, ecosystem, and DX constraints.

---

## 1. Frontend & Multiplatform UI Frameworks (`libs/ui/*`)

All UI libraries implement `@mono-magic/atomic-design-interfaces` (and shared enums/tokens from `libs/ui/proto-ui-contracts`), so swapping or pairing frameworks keeps design semantics consistent.

| Library & Stack | Target Platforms | Where It Shines (Advantages) | Where It Lacks (Trade-Offs) | Best-Fit `mono-magic` Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| **`react-mui`**<br/>React 19 + MUI v9 | Web (SPA/SSR) | Largest OSS ecosystem (`@xyflow/react`, LiveKit, MapLibre, WebGL/Three.js, rich data-vis); mature enterprise MUI theming (`sx`/`slotProps`); effortless sharing of TS business logic. | Larger JS runtime bundle than Svelte; requires explicit memoization/care on high-frequency 60fps canvas updates outside React state. | Complex interactive studios (**Flow UI Builder**, **BPMN Studio**), geospatial/WebGL consoles (**EV Truck Dispatch**, **SICK LiDAR Console**), rich admin dashboards. |
| **`ng-mat`**<br/>Angular 22 + Material 22 | Web (Enterprise SPA/SSR) | Batteries-included architecture (DI, Router, Signal Forms, RxJS/Signals, strict TypeScript conventions); scales cleanly across large enterprise teams with predictable structure. | Heavier conceptual surface area & boilerplate for small apps; smaller niche visual-canvas plugin ecosystem than React. | Structured enterprise portals, multi-step commerce/admin consoles (**Hand-Knitted Storefront Admin / Web**), workflow governance portals. |
| **`vue-vuetify`**<br/>Vue 3.5 + Vuetify 3.12 | Web (SPA/SSR) | Ergonomic Single-File Components (`<script setup>`), fine-grained reactivity, rapid UI iteration, rich Material 3 component set out of the box. | Smaller enterprise/specialized canvas ecosystem than React; Vuetify bundle requires careful Vite pre-bundling (`optimizeDeps`). | Content-rich storefronts (**Hand-Knitted Showcase Web**), lightweight internal tools, rapid marketing + interactive catalog apps. |
| **`svelte-tw`**<br/>Svelte 5 (Runes) + Tailwind v4 + Bits UI | Web (Ultra-light SPA/SSR) | Tiny compiled JS bundle, zero virtual DOM overhead, buttery built-in transitions/animations, ultra-clean reactive runes (`$state`, `$derived`). | Smaller third-party widget ecosystem than React/Angular; fewer enterprise turnkey grids/charts without wrapping vanilla JS libs. | Fast consumer web apps, intimate/editorial experiences (**Couples Journal Web**), responsive local-first dashboards (**SmartHome Web**). |
| **`rn-paper`**<br/>Expo 56 / React Native 0.85 + Paper v5 | iOS, Android, Web | Shares 100% TypeScript code with `libs/utils/ts-*` & `libs/data-access/ts-*`; Expo OTA updates; strong camera/WebRTC/LiveKit plugins; native platform feel. | JS bridge/JSI overhead for extreme 60fps custom skeleton/WebGL drawing compared to Flutter/native; native module upgrades require Expo config plugins. | Cross-platform mobile companions (**Hand-Knitted Mobile**, **Reflective Learning Mobile**), rapid TS-unified mobile apps. |
| **`fl-mat`**<br/>Flutter `>=3.50` + Material 3 | iOS, Android, Web, Desktop (macOS/Linux/Win) | Pixel-identical 60/120fps Impeller/Skia rendering across all platforms; unmatched custom `CustomPainter` canvas performance for real-time overlays (pose skeletons, telemetry HUDs) from a single codebase. | Separate Dart language ecosystem (requires `proto-contracts` Dart codegen or REST/gRPC); heavier initial web WASM/CanvasKit payload for SEO-driven public websites. | **Multiplatform graphics & real-time overlay apps (`Quanti-Fit` Live Yoga/Fitness Mobile + Tablet)**, cross-platform mobile apps needing fluid custom drawing. |
| **`kt-compose`** *(Planned)*<br/>Kotlin Jetpack Compose + Material 3 (+ KMP) | Android Native (+ iOS/Desktop via KMP) | First-class access to Android hardware APIs (BLE, CameraX, Foreground Services, WorkManager, Health Connect, Widgets, offline Room/SQLDelight); zero cross-platform abstraction tax. | Android-first UI (unless adopting Compose Multiplatform); requires Gradle-in-Nx build pipeline. | Native Android companion apps (**SmartHome Android / BLE**, **Couples Journal Android**), hardware/sensor/health-integrated mobile apps. |

---

## 2. Backend Frameworks, BaaS & Systems Stacks (`libs/data-access/*`, `apps/api-*`)

All backend providers implement shared Protobuf wire contracts (`libs/data-access/proto-contracts`) and thin language trait interfaces (`ts-interfaces`, `py-interfaces`, `kt-interfaces`).

| Stack / Silo | Language | Where It Shines (Advantages) | Where It Lacks (Trade-Offs) | Best-Fit `mono-magic` Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| **`ts-supabase`**<br/>Supabase (Postgres + Auth + Storage + Realtime) | TypeScript / SQL | Relational Postgres power + Row-Level Security (RLS) for strict multi-tenant/private privacy; instant REST/Realtime/Auth; full **local Docker CLI stack**; zero vendor lock-in (standard Postgres). | Complex long-running compute, ML inference, or custom multi-service orchestration still need dedicated API microservices. | Privacy-first consumer apps (**Couples Journal** via RLS), rapid relational CRUD + auth + storage (**Knitted Storefront** BaaS mode). |
| **`ts-firebase`**<br/>Firebase (Auth + Firestore + Storage + RTDB) | TypeScript | Ultra-fast offline-first mobile sync, push notifications (FCM), effortless local Emulator Suite, zero-ops scaling for document/realtime workloads. | NoSQL query limitations (no joins/complex aggregations); vendor-specific security rules; cost spikes on unindexed high-read patterns. | Offline-first mobile sync, realtime presence/chat prototypes, swappable BaaS benchmark against `ts-supabase`. |
| **`ts-nestjs`**<br/>Full NestJS Wrapper Silo (GraphQL, Swagger/Scalar, Redis, Auth, Prisma, BullMQ, WS, Microservices) | TypeScript (Node 22) | Gold-standard modular DI architecture; unifies REST + OpenAPI/Swagger + GraphQL + WebSockets + Redis + BullMQ in one type-safe TS codebase sharing DTOs with web/mobile clients. | Single-threaded Node event loop is poorly suited for CPU-bound ML, heavy geometry, or raw hardware binary framing. | API Gateways / BFFs (**`Quanti-Fit` BFF**, **Flow UI Builder API**), GraphQL aggregation layers, real-time room/session orchestration. |
| **`py-nest`**<br/>NestJS-Inspired Python Silo (FastAPI + DI + `lifespan` + Swagger/Scalar + Strawberry GraphQL + Redis + SQLModel) | Python `>=3.12` (`uv`) | Unrivaled AI/ML/NLP/RL/Data ecosystem (PyTorch, ONNX, FastEmbed, spaCy, LangGraph, Gymnasium, Polars, DuckDB); async ASGI performance + automatic OpenAPI/Scalar docs + modular NestJS-style DI (`py-nest[graphql,redis,auth]`). | GIL limits pure-Python CPU parallelism (requires `multiprocessing`, C/Rust extensions, or ONNX/PyTorch native kernels); higher memory footprint than Go/Rust. | AI/NLP/ML/RL microservices (**`api-reflective-learning`**, **`api-pose-coach`**, **EV Routing / RL**, **ML Data Pipeline**), Home Assistant bridges. |
| **`kt-spring-boot`** / **`java-spring-boot`**<br/>Spring Boot 3 (Kotlin/Java 21 + Keycloak + Postgres + Kafka + MinIO) | Kotlin / Java 21 | Battle-tested enterprise transactional integrity, JVM throughput, first-class Kafka/Temporal/Keycloak/JPA/Flyway ecosystem, strong static typing & observability. | Slower cold start and higher RAM baseline than Go/Rust (unless GraalVM native); heavier setup for tiny prototypes. | Enterprise transactional cores (**Commerce & Order Fulfillment**, **Fleet Dispatch API**, **Kafka/Temporal Claims Workers**). |
| **`go-*`**<br/>Go `>=1.24` (`go-utils-core`, gRPC, MQTT, WS) | Go | Tiny static binaries, goroutine concurrency for tens of thousands of simultaneous WebSocket/MQTT/telemetry streams, predictable low-latency GC, fast compile times. | Less expressive generics/type system than Rust/TS; smaller ML/AI ecosystem. | High-concurrency telemetry & event routers (**`api-realtime-telemetry`** for `Quanti-Fit` LiveKit/pose streams, MQTT/IoT edge brokers). |
| **`rs-*`**<br/>Rust (`rs-pose-math`, `rs-design-tokens`, `rs-lidar-driver`) | Rust | Zero-GC deterministic latency, memory safety, fearless concurrency, compiles to native binaries, C-ABI FFI (Python/Kotlin/Flutter), AND **WebAssembly (WASM)** for browser execution. | Steeper learning curve and slower compile times; overkill for standard CRUD web APIs. | Industrial hardware drivers (**SICK LiDAR TCP/UDP HAL**), 60fps pose-math / WASM kernels (**`rs-pose-math`**), design-token compilers, high-speed parsers. |

---

## 3. Quick Selection Heuristic

1. **Need real-time 60fps custom canvas/pose overlays across iOS + Android + Tablet?** → **`fl-mat` (Flutter)** + **`rs-pose-math`**.
2. **Need rich node-graph / diagramming / map / WebGL web studio?** → **`react-mui`** + **`@xyflow/react`** (`ts-flow-studio`) / MapLibre.
3. **Need fast, lightweight consumer web app or local-first dashboard?** → **`svelte-tw`** (or **`vue-vuetify`** for Material storefronts).
4. **Need native Android hardware/BLE/sensors/background services?** → **`kt-compose` (Kotlin)**.
5. **Need AI, NLP, LangGraph agents, PyTorch, or Reinforcement Learning?** → **`py-nest` (FastAPI + `uv`)** + `py-agent-graph` / `py-ml-core` / `py-rl-core`.
6. **Need a unified GraphQL + REST/Swagger + Redis + WebSocket BFF?** → **`ts-nestjs`**.
7. **Need strict privacy/RLS CRUD + Auth + Storage out of the box?** → **`ts-supabase`** (swappable with `ts-firebase`).
8. **Need zero-GC hardware binary protocols or WASM math kernels?** → **Rust (`rs-*`)**; **high-concurrency telemetry fan-out?** → **Go (`go-*`)**.
