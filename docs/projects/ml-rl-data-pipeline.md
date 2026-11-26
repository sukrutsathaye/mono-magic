# Project Blueprint: Python Multiprocessing Scraping, Cleaning, ML & RL Training Pipeline

- **Status**: `Blueprint Approved — Scheduled for Phase 4C / Phase 5+`
- **Target Phases**: `Phase 3C, Phase 4C, Phase 5+`
- **Primary Domains**: `libs/utils/py-common`, `libs/utils/py-nlp`, `libs/data-access/py-ml-core`, `libs/data-access/py-rl-core`, `libs/data-access/py-agent-graph`, `apps/api-ml-pipeline`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: ML, NLP, and RL workloads across `mono-magic` (`reflective-learning` grading/question models, `quanti-fit` pose classifiers, `osm-ev-truck-routing` RL policies) need a shared, reproducible, high-throughput Python pipeline for parallel scraping/ingestion, deterministic cleaning/deduplication, dataset versioning, training, and experiment evaluation.
- **Core Objectives**:
  - **High-Throughput Multiprocessing ETL**: Parallel worker pools + **Polars / DuckDB** for fast columnar cleaning, MinHash/exact deduplication, and Pydantic v2 schema validation.
  - **Modular ML / RL / Agentic Silos**: Power `mono-magic` directly via reusable `uv` libraries:
    - `py-ml-core`: PyTorch / scikit-learn / ONNX Runtime export + MLflow experiment tracking.
    - `py-rl-core`: Gymnasium + Stable-Baselines3 training & deterministic policy evaluation.
    - `py-agent-graph`: LangChain / LangGraph structured extraction & synthetic evaluation pipelines.
  - **Deterministic Reproducibility**: Content-hashed dataset manifests, seeded training runs, and local MLflow/MinIO Docker setup.
- **Target Personas & Roles**:
  - **ML / Data Engineer**: Defines declarative pipeline stages, launches multiprocessing jobs via CLI or FastAPI control plane, inspects MLflow metrics and ONNX model artifacts.
- **Non-Goals / Out of Scope**:
  - Multi-node distributed Kubernetes GPU cluster scheduling in v1 (focus on single-machine multi-core + optional GPU, with clean interfaces for future Ray scaling).

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Pipeline & ML/RL Core (`py-nest` + `uv` isolated optional extras)**: Python is the undisputed ecosystem for Polars, DuckDB, PyTorch, ONNX, MLflow, LangGraph, and Gymnasium. Isolating heavy ML/RL dependencies in dedicated `uv` workspace packages keeps core repo CI fast.
- **Optional Monitoring UI (`react-mui`)**: Reuses `MagicDataTable`, `ProgressIndicator`, and `Tabs` to trigger runs and view experiment comparisons.

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/utils/py-common` | `py-utils-common` | `scope:utils`, `type:util`, `lang:py` | Structured logging, correlation IDs, Pydantic settings, error envelopes |
| `libs/utils/py-nlp` | `py-utils-nlp` | `scope:utils`, `type:util`, `lang:py` | Text cleaning, segmentation, keyword extraction, similarity math |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | `ai/v1/ai.proto` (`LLMService`, `VectorStoreService`, `AgentGraphService`, `TrainingRunMeta`) |
| `libs/data-access/py-ml-core` | `py-ml-core` | `scope:data-access`, `type:data-access`, `lang:py` | PyTorch/sklearn trainers, ONNX exporter, MLflow tracker wrapper |
| `libs/data-access/py-rl-core` | `py-rl-core` | `scope:data-access`, `type:data-access`, `lang:py` | Gymnasium env base, Stable-Baselines3 runner, reward/eval harness |
| `libs/data-access/py-agent-graph` | `py-agent-graph` | `scope:data-access`, `type:data-access`, `lang:py` | Opinionated LangChain/LangGraph wrapper with structured outputs & tool DI |
| `apps/api-ml-pipeline` | `api-ml-pipeline` | `scope:app`, `type:app`, `lang:py` | CLI + `py-nest` FastAPI control plane for launching & tracking jobs |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `IDataSource` → `IRecordTransformer` → `IDatasetSink` → `IModelTrainer` protocols allow composing arbitrary pipelines without coupling stages.
  - `IExperimentTracker` swaps between `InMemoryTracker` (unit tests) and `MlflowTracker` (local Docker / production).
- **Performance & Concurrency Design**:
  - `ProcessPoolExecutor` / Polars Rust-backed multi-threaded engine bypasses the Python GIL for CPU-bound cleaning and feature extraction.
  - Streaming chunked Parquet reads/writes keep memory bounded regardless of dataset size.
- **Security & Secret Hygiene**:
  - Polite robots.txt & rate-limited scraping; strict SSRF URL allowlists; API keys for LLM providers loaded only from env settings.

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf (`proto/monomagic/ai/v1/ai.proto`)**: `DatasetManifest`, `PipelineRunStatus`, `ModelArtifact`, `EvaluationMetric`, `LLMCompletionRequest`, `AgentGraphRun`.
- **APIs**: `POST /v1/pipelines/{name}/run`, `GET /v1/pipelines/runs/{id}/events` (SSE progress), `GET /v1/models`.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `Card`, `ProgressIndicator`, `Chip`, `Badge`, `Tabs`, `Alert`, `Button`.
- **New Organisms & Templates**: `MagicDataTable` (dataset & experiment run comparison table), `MagicAppShellTemplate`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on cleaning/dedup/versioning transforms; `>=80%` on `py-ml-core`, `py-rl-core`, `py-agent-graph`, and `api-ml-pipeline`.
- **Fast Deterministic CI**: Unit & E2E tests use tiny synthetic datasets, `InMemoryTracker`, and mock LLM/tiny CartPole RL fixtures so full `pytest` completes in seconds without GPUs or network calls.
- **ASGI E2E**: `httpx.AsyncClient` + `ASGITransport` verifies end-to-end scrape-fixture → clean → dedup → train → ONNX export → eval report.

---

## 7. Phased Milestones

1. **Milestone 1 — AI/ML Protobuf & Core Protocols**: Add `ai.proto` and wire generated Python types into `py-interfaces`.
2. **Milestone 2 — Modular AI/ML/RL Silos**: Build `py-agent-graph`, `py-ml-core`, and `py-rl-core` with isolated `uv` deps & `>=80%` coverage.
3. **Milestone 3 — Multiprocessing ETL & Control Plane**: Build `apps/api-ml-pipeline` (Polars/DuckDB + MLflow Docker Compose).
4. **Milestone 4 — Dogfood Across `mono-magic`**: Export models/policies consumed by `reflective-learning`, `quanti-fit`, and `osm-ev-truck-routing`.
