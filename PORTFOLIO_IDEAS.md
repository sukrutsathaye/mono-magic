# Portfolio Backlog & Project Blueprints Index

This index tracks the **portfolio & studio projects** in `mono-magic` beyond the Phase 5A–5D Flagship Applications in [ROADMAP.md](ROADMAP.md) (which also have full blueprints in `docs/projects/`).

> [!IMPORTANT]
> **Design-First Gate (`Needs Deep-Dive Design`)**:
> No project may skip directly to scaffolding or implementation. Before any project moves into active roadmap phases, it MUST undergo a dedicated `/grill-me` architectural session (referencing [`docs/ARCHITECTURE_DECISION_MATRIX.md`](docs/ARCHITECTURE_DECISION_MATRIX.md)) and produce a completed blueprint in `docs/projects/<project-slug>.md` using [the project blueprint template](docs/projects/_TEMPLATE.md).

---

## Project Blueprints & Backlog Index

| # | Project Title | Status | Summary & Core Capabilities | Candidate `libs/<domain>/<lang>-<name>` & `apps/*` Touchpoints | Deep-Dive Blueprint |
| --- | --- | --- | --- | --- | --- |
| **0** | **XYFlow Visual Atomic Page & Navigation Builder** | `Blueprint Approved — Scheduled for Phase 4A / 5` | LangGraph-inspired `@xyflow/react` visual canvas composing Atoms, Molecules, Organisms, and Page Templates, wiring navigation via edges, switching target Framework/DS, and exporting `PageGraph` Protobuf AST + starter code for all 7 UI libs. | `libs/ui/proto-ui-contracts`, `libs/features/ts-flow-studio`, `libs/features/ts-page-codegen`, `apps/flow-ui-builder-web` | [`flow-ui-builder.md`](docs/projects/flow-ui-builder.md) |
| **1** | **SmartHome / Home Assistant + MQTT Automation Hub** | `Blueprint Approved — Scheduled for Phase 5+` | Local-first IoT device orchestration, MQTT v5 telemetry broker bridging, Home Assistant rule triggers, energy dashboards, and Simulator-First HAL (`Mosquitto` Docker simulator). | `libs/data-access/ts-mqtt`, `libs/data-access/py-home-assistant`, `libs/features/ts-smarthome`, `apps/smarthome-web`, `apps/api-iot-bridge` | [`smarthome-mqtt-hub.md`](docs/projects/smarthome-mqtt-hub.md) |
| **2** | **Universal Sensor / SICK LiDAR Controller** | `Blueprint Approved — Scheduled for Phase 5+` | Memory-safe Rust HAL for SICK CoLaA/CoLaB LiDAR scanners (TCP/UDP point-cloud streaming, safety-zone intrusion detection, loopback TCP simulator, live 2D/3D web console). | `libs/data-access/proto-contracts`, `libs/utils/rs-sensor-math`, `libs/data-access/rs-lidar-driver`, `apps/api-sensor-hub`, `apps/sensor-console-web` | [`sensor-lidar-controller.md`](docs/projects/sensor-lidar-controller.md) |
| **3** | **ROS 2 Path Planning & Autonomous Navigation Studio** | `Deferred — Future Phase (Needs Deep-Dive Design)` | ROS 2 / Nav2 path-planning simulator, A*/RRT*/DWA planner comparison, occupancy grid editor, waypoint mission runner, and live telemetry replay. | `libs/utils/py-path-math`, `libs/data-access/py-ros-bridge`, `libs/features/ts-mission-planner`, `apps/api-ros-planner`, `apps/ros-studio-web` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **4** | **OSM EV Truck Routing & Fleet Dispatch Engine** | `Blueprint Approved — Scheduled for Phase 5+` | Physics-based OpenStreetMap EV truck routing accounting for elevation, payload weight, battery SoC charging curves, HOS mandates, and `py-rl-core` RL fleet dispatch optimization. | `libs/utils/py-ev-routing`, `libs/data-access/py-osm-graph`, `libs/data-access/py-rl-core`, `libs/data-access/kt-spring-boot`, `apps/api-ev-routing`, `apps/ev-dispatch-web` | [`osm-ev-truck-routing.md`](docs/projects/osm-ev-truck-routing.md) |
| **5** | **Applied-Crypto / ZK Attestation & Hyperledger FireFly / Besu Bridge** | `Deferred — Future Phase (Needs Deep-Dive Design)` | Privacy-preserving Zero-Knowledge Proof (Noir/RISC Zero) hardware/DePIN attestation and enterprise supply-chain provenance via EVM / Hyperledger Besu & FireFly. | `libs/data-access/proto-contracts`, `libs/data-access/ts-web3-evm`, `libs/data-access/ts-firefly-bridge`, `apps/api-web3-bridge`, `apps/provenance-portal-web` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **6** | **Language-Agnostic BPMN 2.0 + DMN Studio & Kafka/Temporal Claims Pipeline** | `Blueprint Approved — Scheduled for Phase 4A / 5` | `@xyflow/react` BPMN 2.0 workflow & DMN decision-table designer exporting standard BPMN XML + Proto Workflow IR, executing polyglot service tasks (TS/Py/Go/Rust/Kotlin) over Kafka/Redpanda + Temporal. | `libs/features/ts-flow-studio`, `libs/data-access/ts-bpmn-engine`, `libs/data-access/kt-spring-boot`, `apps/api-claims-engine`, `apps/bpmn-studio-web` | [`bpmn-claims-studio.md`](docs/projects/bpmn-claims-studio.md) |
| **7** | **Python Multiprocessing Scraping / Cleaning / ML & RL Training Pipeline** | `Blueprint Approved — Scheduled for Phase 4C / 5+` | High-throughput parallel Polars/DuckDB/multiprocessing ETL, deterministic dataset versioning, and `py-ml-core` + `py-rl-core` + `py-agent-graph` training/eval feeding `reflective-learning`, `quanti-fit`, and `osm-ev-truck-routing`. | `libs/utils/py-nlp`, `libs/utils/py-common`, `libs/data-access/py-ml-core`, `libs/data-access/py-rl-core`, `libs/data-access/py-agent-graph`, `apps/api-ml-pipeline` | [`ml-rl-data-pipeline.md`](docs/projects/ml-rl-data-pipeline.md) |
| **8** | **Autonomous Playwright Visual-Crawl QA Explorer** | `Blueprint Approved — Scheduled for Phase 4A` | Opinionated wrapper around Playwright + `@axe-core/playwright` + optional Stagehand/Playwright MCP that dogfoods `mono-magic` Storybooks & Flagship Apps, detects console/network/a11y/visual issues, and emits runnable `.spec.ts` tests. | `libs/utils/ts-core`, `libs/data-access/ts-playwright-crawler`, `libs/features/ts-qa-explorer`, `apps/qa-explorer-web` | [`playwright-qa-explorer.md`](docs/projects/playwright-qa-explorer.md) |

---

## Flagship Application Blueprints (`Phase 5A–5D`)

- **Phase 5A — Quanti-Fit Live Coaching & Learning Platform**: [`docs/projects/quanti-fit.md`](docs/projects/quanti-fit.md)
- **Phase 5B — Hand-Knitted Articles Showcase & Ordering Platform**: [`docs/projects/knitted-showcase.md`](docs/projects/knitted-showcase.md)
- **Phase 5C — Reflective Learning App**: [`docs/projects/reflective-learning.md`](docs/projects/reflective-learning.md)
- **Phase 5D — Couples Relationship Journal App**: [`docs/projects/couples-journal.md`](docs/projects/couples-journal.md)
