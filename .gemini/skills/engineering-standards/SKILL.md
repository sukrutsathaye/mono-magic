---
name: engineering-standards
description: >-
  Enforces mono-magic's mandatory SOLID architecture, clean code, performance hygiene,
  documentation gates, unit/E2E testing thresholds, and libs/<domain>/<lang>-<name>
  naming & tagging conventions across TypeScript, Python, Dart, Java, Go, and Rust.
  Use before designing, scaffolding, implementing, or reviewing any library or application.
---

# Engineering Standards (SOLID, Clean Code, Testing & Documentation)

Use this skill as a **mandatory quality baseline** whenever creating, refactoring, or reviewing any package under `libs/*` or `apps/*`.

## 1. Strict 4-Domain `libs/` Structure & Naming / Tagging Standard

### Directory Layout
`libs/` contains **exclusively 4 domain directories**:
1. `libs/ui/` — Presentation-only Atomic Design contracts and framework implementations (existing project names `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, `fl-mat` remain unchanged; future additions follow `<framework>-<ds>`).
2. `libs/utils/` — Pure, stateless, framework- and vendor-agnostic helpers (`ts-core`, `ts-formatters`, `ts-pose-math`, `ts-design-tokens`, `py-common`, `py-nlp`). Zero HTTP calls, zero DB/SDK state, zero domain contracts.
3. `libs/data-access/` — Wire schemas (`proto-contracts`), idiomatic provider interfaces + compliance suites (`ts-interfaces`, `py-interfaces`, future `dart-interfaces`, `java-interfaces`), and concrete BaaS/backend adapters (`ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`, `py-reflective-nlp`, `ts-reflective-api`, `ts-livekit`).
4. `libs/features/` — Domain feature state, view-models, and composition modules (`ts-*`, `py-*`) wiring `ui`, `data-access`, and `utils`.

### Naming & Nx Tags
- Every new non-UI library MUST follow: `libs/<domain>/<lang>-<name>` (e.g., `libs/utils/ts-core`, `libs/data-access/py-interfaces`, `libs/features/ts-reflective-learning`).
- Every Nx project MUST carry canonical tags:
  - `scope:<ui|utils|data-access|features|app>`
  - `type:<interfaces|util|data-access|feature|ui|app>`
  - `lang:<ts|py|java|dart|proto|rust|go>`
- Module boundaries enforced in [eslint.config.mjs](../../../eslint.config.mjs):
  - `scope:utils` -> `["scope:utils"]`
  - `scope:ui` -> `["scope:ui", "scope:utils"]`
  - `scope:data-access` -> `["scope:data-access", "scope:utils"]`
  - `scope:features` -> `["scope:features", "scope:ui", "scope:data-access", "scope:utils"]`
  - `scope:app` -> `["scope:features", "scope:ui", "scope:data-access", "scope:utils"]`
  - `type:interfaces` -> `["type:interfaces", "type:util"]`

---

## 2. Concrete SOLID Principles in `mono-magic`

1. **Single Responsibility Principle (SRP)**:
   - Keep pure math/text/formatting/error primitives in `libs/utils/*`.
   - Keep external I/O, HTTP clients, ML model lifecycles, and persistence in `libs/data-access/*`.
   - Keep visual rendering and accessibility semantics in `libs/ui/*` (presentation only; never import vendor SDKs).
   - Keep feature orchestration/state in `libs/features/*`, and keep `apps/*` as thin deployable entrypoints (routing, DI container/FastAPI `lifespan`, env config).
2. **Open/Closed Principle (OCP)**:
   - Extend capabilities via `typing.Protocol`, TypeScript `interface`, or abstract base classes/strategies (e.g., adding a new `ContentSourceProvider` for Markdown/EPUB/PDF or a new `IDataRepository` adapter for Supabase/Spring Boot) rather than modifying core orchestrators with `if/elif` or `switch (provider)` branches.
3. **Liskov Substitution Principle (LSP)**:
   - Every concrete data-access provider MUST pass the shared **Contract Compliance Test Suite** exported by `ts-interfaces` / `py-interfaces` (`runDataRepositoryContractTests`, `runAuthProviderContractTests`, `runStorageProviderContractTests`, `assert_repository_contract`, `assert_auth_contract`) with identical semantics—no hidden vendor-specific exceptions or differing return shapes.
4. **Interface Segregation Principle (ISP)**:
   - Keep contracts small and capability-focused: `IAuthProvider`, `IDataRepository<TEntity, TId>`, `IStorageProvider`, `IRealtimeProvider`, `IPaymentProvider`. Never bundle unrelated capabilities into a monolithic `IBackendClient` interface.
5. **Dependency Inversion Principle (DIP)**:
   - High-level modules (`apps/*`, `libs/features/*`) MUST depend exclusively on `type:interfaces` contracts (`@mono-magic/data-access-ts-interfaces`, `py-data-access-interfaces`, `@mono-magic/atomic-design-interfaces`), receiving concrete adapters via constructor/function injection, Angular DI, React Context, or FastAPI `Depends(...)`.

---

## 3. Clean Code & Performance Hygiene

- **Immutability by Default**: Use `readonly` properties and `ReadonlyArray<T>` in TypeScript; `@dataclass(frozen=True, slots=True)` or immutable Pydantic v2 models in Python; `final` / `const` constructors in Dart. Never mutate arguments or iterate-and-`.pop()`/`remove()` collections in place.
- **Explicit Typed Errors (`Result<T, E>`)**: Return `Result<T, DataAccessError>` / `AppError` (with canonical `ErrorCode`) at data-access boundaries instead of throwing untyped exceptions or leaking raw SDK error objects.
- **Strict Type Safety**:
  - TypeScript: `strict: true`, zero `any` (use `unknown` + narrowing or generics).
  - Python: full parameter and return type annotations verified with `pyright` (`from __future__ import annotations`).
  - Dart: sound null safety, zero `dynamic` unless decoding raw JSON at boundary.
- **Zero Hardcoded Secrets or Magic Numbers**: Read credentials and endpoints from typed config/environment schemas (`pydantic-settings`, `@nestjs/config`); extract threshold constants with descriptive names.
- **Performance & Scalability Hygiene**:
  - Avoid N+1 queries (batch DB reads/writes, use `Promise.all` / `asyncio.gather` with bounded concurrency).
  - Reuse singleton HTTP clients (`httpx.AsyncClient`), DB connection pools, and ML/NLP models (`spaCy`, `fastembed`) via FastAPI `lifespan` or DI singletons—never instantiate models per request.
  - Batch NLP/vector work (`nlp.pipe(texts, batch_size=32)`, vectorized `numpy` operations) and offload CPU-bound embedding/model inference with `asyncio.to_thread`.
- **Accessibility (WCAG 2.1 AA)**: Every UI component must expose proper ARIA roles/labels, keyboard navigation, focus management, and Flutter `Semantics` labels, verified via `@storybook/addon-a11y`.

---

## 4. Documentation Gates

- **TypeScript / JavaScript**: JSDoc/TSDoc comments on all exported interfaces, type aliases, functions, classes, and public properties/methods.
- **Python**: Google-style docstrings on all public modules, classes, `Protocol` methods, functions, and Pydantic schema fields.
- **Flutter / Dart**: Dartdoc (`///`) comments on all public widgets, classes, enums, and constructor parameters.
- **Library / App `README.md`**: Every library under `libs/` and application under `apps/` MUST include a `README.md` documenting purpose, installation/Nx targets, architecture/contract dependencies, and usage examples.

---

## 5. Testing & Coverage Gates

- **Standard Coverage Minimum**: `>=80%` across `lines`, `statements`, `functions`, and `branches` for `libs/data-access/*`, `libs/ui/*`, `libs/features/*`, and `apps/*`.
- **Pure Utility Strict Minimum**: `>=90%` across `lines`, `statements`, `functions`, and `branches` for `libs/utils/*` (`ts-*` and `py-*`).
- **Contract Compliance Tests**: All data-access providers must invoke the shared compliance suite from `@mono-magic/data-access-ts-interfaces/testing` or `py_data_access_interfaces.testing`.
- **End-to-End (E2E) Tests Required for `apps/*`**:
  - Web apps: Playwright E2E suite verifying real user journeys against running services/mocks.
  - Python FastAPI services (`apps/api-*`): ASGI end-to-end tests using `httpx.AsyncClient` + `ASGITransport` with full `lifespan` context.
  - Mobile apps: integration test suites.
- **Never Circumvent Gates**: Do not exclude source files from coverage or lower thresholds to pass CI; write genuine, behavior-verifying tests.
