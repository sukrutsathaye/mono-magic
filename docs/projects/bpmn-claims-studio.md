# Project Blueprint: Language-Agnostic BPMN 2.0 + DMN Studio & Claims Pipeline

- **Status**: `Blueprint Approved — Scheduled for Phase 4A / Phase 5`
- **Target Phases**: `Phase 3C, Phase 4A, Phase 4C, Phase 5`
- **Primary Domains**: `libs/data-access/proto-contracts`, `libs/features/ts-flow-studio`, `libs/data-access/ts-bpmn-engine`, `libs/data-access/kt-spring-boot`, `apps/bpmn-studio-web`, `apps/api-claims-engine`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: Traditional enterprise BPMN suites (such as Red Hat Kogito / jBPM) lock workflow execution, custom service tasks, and DMN rules strictly to the Java/JVM ecosystem. Modern polyglot teams need a **language-agnostic BPMN 2.0 + DMN visual designer and execution engine** where service tasks can be implemented in TypeScript, Python, Go, Rust, or Kotlin/Java seamlessly.
- **Core Objectives**:
  - Visual BPMN 2.0 workflow & DMN decision-table editor built on `@xyflow/react` (`libs/features/ts-flow-studio`), supporting bidirectional **BPMN 2.0 XML** and **Protobuf Workflow IR** export.
  - Event-driven **Claims Processing Pipeline** powered by **Kafka / Redpanda + Temporal** where polyglot workers (TS, Python, Go, Kotlin) execute service tasks with durable retries, compensation (Saga), SLA timers, and full audit trails.
  - Sub-200ms DMN rule evaluation and zero lost claims under worker restarts.
- **Target Personas & Roles**:
  - **Business Analyst / Process Architect**: Designs BPMN flows and DMN decision tables visually, simulates test payloads, and publishes versioned workflows.
  - **Claims Operations Specialist**: Monitors active claims, handles human-in-the-loop review tasks, and inspects SLA alerts.
  - **Polyglot Engineer**: Registers worker handlers in TS, Python, Go, or Kotlin against generated Protobuf task contracts.
- **Non-Goals / Out of Scope**:
  - Full 100% coverage of obscure BPMN 2.0 choreography/conversation diagram specs in v1 (focus on executable Process Diagrams + DMN Decision Tables).

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Frontend (`react-mui` + `ts-flow-studio`)**: `@xyflow/react` excels at custom BPMN gateways, swimlanes, animated token simulation, and side-by-side DMN decision tables.
- **Orchestration & Messaging (`Kafka / Redpanda + Temporal`)**: Temporal provides native **polyglot SDKs** (TS, Python, Go, Java/Kotlin, Rust) with durable execution and timers, while Kafka/Redpanda handles high-throughput claim ingestion and immutable audit event streams.
- **Backend Workers (`ts-nestjs` + `py-nest` + `kt-spring-boot`)**: Proves true language-agnostic execution — e.g., fraud scoring in Python (`py-ml-core`), policy validation in Kotlin/Spring Boot, notifications in NestJS!

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | `workflow/v1/bpmn.proto` (Workflow IR, DMN tables, TaskEnvelope, AuditEvent) |
| `libs/utils/ts-core` | `utils-ts-core` | `scope:utils`, `type:util`, `lang:ts` | Pure BPMN graph validator (deadlock/unreachable node checks) & DMN expression evaluator |
| `libs/features/ts-flow-studio` | `features-ts-flow-studio` | `scope:features`, `type:feature`, `lang:ts` | Shared `@xyflow/react` canvas shell reused with Flow UI Builder |
| `libs/data-access/ts-bpmn-engine` | `data-access-ts-bpmn-engine` | `scope:data-access`, `type:data-access`, `lang:ts` | BPMN 2.0 XML ↔ Proto Workflow IR serializer + Temporal/Kafka dispatch client |
| `libs/data-access/kt-spring-boot` | `data-access-kt-spring-boot` | `scope:data-access`, `type:data-access`, `lang:kotlin` | Kafka consumer/producer & transactional claims persistence adapter |
| `apps/bpmn-studio-web` | `bpmn-studio-web` | `scope:app`, `type:app`, `lang:ts` | Visual BPMN + DMN designer, live token simulator, and claims audit console |
| `apps/api-claims-engine` | `api-claims-engine` | `scope:app`, `type:app`, `lang:ts` | Workflow compiler/deployer API + Temporal/Kafka polyglot worker coordinator |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `IWorkflowCompiler` separates visual graph editing from BPMN XML / Temporal execution plan compilation.
  - `IDmnRuleEvaluator` is a pure deterministic interface tested identically in TS and Python.
  - `ITaskWorker` contract lets any language register a task queue without coupling to the studio.
- **Performance & Concurrency Design**:
  - Kafka partitioned by `claim_id` for strict per-claim ordering; Temporal handles durable timers, retries, and human-approval signals without polling databases.
  - Local **Docker Compose** stack spins up Redpanda (Kafka-compatible), Temporal dev server, and Postgres in one command.
- **Security & Secret Hygiene**:
  - RBAC roles (`architect`, `operator`, `auditor`) enforced via OIDC/Keycloak; DMN expressions run in a sandboxed AST evaluator (zero `eval()`).

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf (`proto/monomagic/workflow/v1/bpmn.proto`)**: `WorkflowDefinition`, `BpmnNode` (`START`, `END`, `SERVICE_TASK`, `USER_TASK`, `EXCLUSIVE_GATEWAY`, `PARALLEL_GATEWAY`, `TIMER`), `DmnDecisionTable`, `ClaimEvent`, `WorkflowAuditLog`.
- **APIs**: REST/OpenAPI + SSE live execution trace stream (`GET /v1/workflows/{id}/runs/{runId}/events`) + Kafka topics (`claims.submitted`, `claims.decided`, `claims.audit`).

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `Card`, `Tabs`, `Dialog`, `Select`, `TextInput`, `Chip`, `Badge`, `Alert`, `Stepper`, `ButtonToggle`.
- **New Organisms & Templates**: `MagicDataTable` (DMN rule table & audit log), `MagicNotificationFeed` (SLA breach alerts), `MagicAppShellTemplate`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on BPMN XML ↔ IR round-trip serializer & DMN hit-policy evaluator (`UNIQUE`, `FIRST`, `COLLECT`); `>=80%` on studio and workers.
- **Integration**: Testcontainers / Docker Compose test running a real claim through Redpanda + Temporal across a TS worker and a Python worker.
- **E2E (Playwright)**: Build a 4-node claim approval workflow + DMN table in `bpmn-studio-web`, deploy it, submit a test claim, and verify the live audit trail completes.

---

## 7. Phased Milestones

1. **Milestone 1 — Workflow IR & DMN Core**: Add `bpmn.proto`, pure DMN evaluator, and BPMN 2.0 XML serializer.
2. **Milestone 2 — XYFlow BPMN & DMN Studio**: Extend `ts-flow-studio` with BPMN nodes, DMN table editor, and token simulator.
3. **Milestone 3 — Polyglot Execution Plane**: Wire Redpanda + Temporal with Docker Compose and sample TS + Python + Kotlin workers.
4. **Milestone 4 — Claims Pipeline App & E2E**: Assemble `apps/bpmn-studio-web` + `apps/api-claims-engine` with full E2E verification.
