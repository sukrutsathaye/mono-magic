# Portfolio Backlog & Deferred Project Ideas

This index tracks **8 additional portfolio & domain projects** queued for `mono-magic` beyond the Phase 5A–5D Flagship Applications in [ROADMAP.md](ROADMAP.md).

> [!IMPORTANT]
> **Design-First Gate (`Needs Deep-Dive Design`)**:
> None of these projects may skip directly to scaffolding or implementation. Before any project below moves into active roadmap phases, it MUST undergo its own dedicated `/grill-me` architectural & optimization planning session and produce a completed blueprint document in `docs/projects/<project-slug>.md` using [the project blueprint template](docs/projects/_TEMPLATE.md).

---

## Project Backlog Index

| # | Project Title | Status | Summary & Core Capabilities | Candidate `libs/<domain>/<lang>-<name>` & `apps/*` Touchpoints | Deep-Dive Blueprint |
| --- | --- | --- | --- | --- | --- |
| **1** | **SmartHome / Home Assistant + MQTT Automation Hub** | `Status: Needs Deep-Dive Design` | Local-first IoT device orchestration, MQTT telemetry broker bridging, Home Assistant rule triggers, energy dashboards, and cross-platform mobile/web controls. | `libs/data-access/ts-mqtt`, `libs/data-access/py-home-assistant`, `libs/features/ts-smarthome`, `apps/smarthome-web`, `apps/api-iot-bridge` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **2** | **Universal Sensor / SICK LiDAR Controller** | `Status: Needs Deep-Dive Design` | Hardware abstraction layer for industrial sensors and SICK LiDAR scanners (TCP/UDP point-cloud streaming, calibration diagnostics, safety zone monitoring, real-time 2D/3D visualization). | `libs/data-access/proto-contracts`, `libs/data-access/rust-lidar-driver` (or `py-sensor-hal`), `libs/utils/ts-sensor-math`, `apps/api-sensor-hub`, `apps/sensor-console-web` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **3** | **ROS Path Planning & Autonomous Navigation Studio** | `Status: Needs Deep-Dive Design` | ROS 2 / Nav2 path-planning simulator, A*/RRT*/DWA planner comparison, occupancy grid editor, waypoint mission runner, and live telemetry replay. | `libs/utils/py-path-math`, `libs/utils/ts-geometry`, `libs/data-access/py-ros-bridge`, `libs/features/ts-mission-planner`, `apps/api-ros-planner`, `apps/ros-studio-web` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **4** | **OSM EV Truck Routing & Fleet Dispatch Engine** | `Status: Needs Deep-Dive Design` | OpenStreetMap-based commercial EV truck routing accounting for elevation, payload weight, battery SoC curves, charger availability, HOS constraints, and multi-stop dispatch. | `libs/utils/py-ev-routing`, `libs/utils/ts-geo-math`, `libs/data-access/py-osm-graph`, `libs/data-access/java-spring-boot-fleet`, `apps/api-ev-routing`, `apps/ev-dispatch-web` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **5** | **Web3 / Ethereum + ROS-Smart-Contract Bridge + Hyperledger FireFly / Besu** | `Status: Needs Deep-Dive Design` | Auditable robot task settlement and supply-chain provenance bridging ROS telemetry events into EVM smart contracts (Ethereum / Hyperledger Besu) orchestrated via Hyperledger FireFly. | `libs/data-access/proto-contracts`, `libs/data-access/ts-web3-evm`, `libs/data-access/ts-firefly-bridge`, `libs/data-access/py-ros-bridge`, `apps/api-web3-ros-bridge`, `apps/provenance-portal-web` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **6** | **BPMN Editor + Business Rules Engine + Kafka Claims Pipeline** | `Status: Needs Deep-Dive Design` | Visual BPMN 2.0 workflow & DMN decision-table designer integrated with an event-driven Kafka claims processing pipeline, audit log, and SLA alerting. | `libs/ui/*` (diagram/rule organisms), `libs/data-access/java-spring-boot-kafka`, `libs/data-access/ts-bpmn-engine`, `libs/features/ts-workflow-studio`, `apps/api-claims-engine`, `apps/bpmn-studio-web` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **7** | **Python Multiprocessing Scraping / Cleaning / Training Pipeline** | `Status: Needs Deep-Dive Design` | High-throughput parallel data pipeline using multiprocessing/worker pools, schema validation, deduplication, deterministic dataset versioning, and model training/eval orchestration. | `libs/utils/py-nlp`, `libs/utils/py-common`, `libs/data-access/py-pipeline-store`, `apps/api-ml-pipeline` (or CLI/worker runners) | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |
| **8** | **Autonomous Playwright Visual-Crawl QA Explorer** | `Status: Needs Deep-Dive Design` | Agentic Playwright crawler that explores running web/Storybook apps, detects console/network errors, checks WCAG accessibility violations, captures visual regression diffs, and emits reproducible test scripts. | `libs/utils/ts-core`, `libs/data-access/ts-playwright-crawler`, `libs/features/ts-qa-explorer`, `apps/api-qa-crawler`, `apps/qa-explorer-web` | [Create from `_TEMPLATE.md`](docs/projects/_TEMPLATE.md) |

---

## Intake Workflow for Each Backlog Project

1. **Trigger Deep-Dive Design (`/grill-me`)**: Resolve domain boundaries, throughput/latency targets, hardware/broker constraints, security model, and UI Atomic Design gaps.
2. **Author Project Blueprint**: Copy [`docs/projects/_TEMPLATE.md`](docs/projects/_TEMPLATE.md) to `docs/projects/<project-slug>.md`, fill all sections completely, and confirm compliance with [engineering-standards](.gemini/skills/engineering-standards/SKILL.md).
3. **Update Status & Schedule**: Change the table status above from `Needs Deep-Dive Design` to `Blueprint Approved — Scheduled for Phase X` and add concrete checklist deliverables to [ROADMAP.md](ROADMAP.md).
