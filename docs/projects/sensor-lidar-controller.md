# Project Blueprint: Universal Sensor / SICK LiDAR Controller

- **Status**: `Blueprint Approved — Scheduled for Phase 5+`
- **Target Phases**: `Phase 3C, Phase 4C, Phase 5+`
- **Primary Domains**: `libs/data-access/proto-contracts`, `libs/data-access/rs-lidar-driver`, `libs/utils/rs-pose-math`, `apps/api-sensor-hub`, `apps/sensor-console-web`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: Industrial LiDAR scanners (such as SICK TiM/LMS/microScan3) and heterogeneous range/IMU sensors use proprietary binary/ASCII TCP/UDP framing (CoLaA/CoLaB) with tight real-time safety-zone constraints. Engineers need a **memory-safe, zero-GC Hardware Abstraction Layer (HAL)** with a built-in deterministic point-cloud simulator and live 2D/3D web diagnostic console.
- **Core Objectives**:
  - Unified Rust HAL (`rs-lidar-driver`) decoding SICK CoLaA/CoLaB TCP/UDP scan frames into canonical Protobuf `PointCloudFrame` packets at `>=25Hz` with zero heap-thrashing in hot loops.
  - Real-time **Safety Zone Intrusion Detection** (warning & protective polygon zones) with sub-5ms evaluation latency.
  - **Simulator-First HAL**: Synthetic TCP/UDP SICK LiDAR emulator generating deterministic room/obstacle scans + moving obstacles so CI and developers run full diagnostics without physical $2,000+ hardware.
- **Target Personas & Roles**:
  - **Robotics / Field Engineer**: Connects to real or simulated scanners, calibrates mounting offsets, defines safety polygons, inspects live 2D/3D point clouds and health diagnostics.
- **Non-Goals / Out of Scope**:
  - SIL2/PLd hardware safety-relay certification (this is a monitoring, calibration, and robotics integration controller, not a certified safety PLC replacement).

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **HAL & Binary Framing (`rs-*` — Rust)**: Industrial TCP/UDP binary framing, CRC checks, polar-to-Cartesian transforms, and polygon point-in-zone checks require zero-GC deterministic latency and strict memory safety (`no unwrap()`).
- **Web Diagnostic Console (`react-mui`)**: React pairs seamlessly with HTML5 Canvas / WebGL / Three.js for rendering 25–50Hz point clouds alongside MUI parameter inspectors and safety-zone editors.
- **Streaming Hub (`apps/api-sensor-hub` — Rust / Axum or Go)**: Streams compressed Protobuf/WebSocket frames directly from the Rust HAL to browser consoles with minimal serialization overhead.

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | `robotics/v1/lidar.proto` (`PointCloudFrame`, `SafetyZonePolygon`, `IntrusionAlert`, `SensorHealth`) |
| `libs/utils/rs-sensor-math` | `rs-utils-sensor-math` | `scope:utils`, `type:util`, `lang:rust` | Pure polar→Cartesian transforms, ray-casting point-in-polygon, outlier/median filters (`>=90%` cov) |
| `libs/data-access/rs-lidar-driver` | `rs-lidar-driver` | `scope:data-access`, `type:data-access`, `lang:rust` | SICK CoLaA/CoLaB TCP/UDP driver + `SimulatedLidarDriver` implementing `SensorDriver` trait |
| `apps/api-sensor-hub` | `api-sensor-hub` | `scope:app`, `type:app`, `lang:rust` | Axum WebSocket/gRPC server streaming frames & safety-zone alerts |
| `apps/sensor-console-web` | `sensor-console-web` | `scope:app`, `type:app`, `lang:ts` | React + `react-mui` 2D/3D point-cloud visualizer, zone editor, and diagnostics panel |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `pub trait SensorDriver`: Implemented identically by `SickColaDriver`, `GenericUdpLidarDriver`, and `SimulatedLidarDriver` (LSP).
  - `SafetyZoneEvaluator` operates strictly on `rs-sensor-math` primitives with zero network I/O (SRP).
- **Performance & Concurrency Design**:
  - Pre-allocated scan ring buffers in Rust; WebSocket frame decimation/downsampling option for low-bandwidth browser clients; backpressure drops stale frames rather than queuing unbounded memory.
- **Security & Secret Hygiene**:
  - Read-only telemetry vs. authenticated calibration-write endpoints; strict packet-length bounds checking against malformed UDP/TCP frames.

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf (`proto/monomagic/robotics/v1/lidar.proto`)**: `PolarScan`, `PointCloudFrame`, `SafetyZonePolygon`, `ZoneIntrusionEvent`, `SensorCalibrationConfig`.
- **Transport**: Binary WebSocket (`PointCloudFrame`) + REST/OpenAPI calibration & zone CRUD endpoints.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `Card`, `Slider`, `SlideToggle`, `Chip`, `Badge`, `Alert`, `Select`, `ButtonToggle`, `Tabs`, `Dialog`.
- **New Organisms & Templates**: `MagicNotificationFeed` (zone intrusion log), `MagicDataTable` (sensor registry), `MagicAppShellTemplate`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on `rs-sensor-math` (polar math, ray-casting, malformed packet fuzzing); `>=80%` on `rs-lidar-driver` and web console.
- **Hardware-Free Simulator Tests**: Integration tests spin up `SimulatedLidarDriver` over loopback TCP, inject a moving obstacle into a protective polygon, and assert `ZoneIntrusionEvent` fires within `<10ms`.
- **E2E (Playwright)**: Open `sensor-console-web`, connect to simulated scanner, draw a warning zone, trigger simulated intrusion, and verify alert badge + feed entry.

---

## 7. Phased Milestones

1. **Milestone 1 — Protobuf & Sensor Math Crate**: Add `lidar.proto` and `libs/utils/rs-sensor-math` (`cargo test --doc`, `clippy -D warnings`).
2. **Milestone 2 — Rust HAL & Simulator**: Build `libs/data-access/rs-lidar-driver` (SICK CoLa framing + loopback TCP simulator).
3. **Milestone 3 — Streaming Hub**: Build `apps/api-sensor-hub` (WebSocket binary stream + safety-zone API).
4. **Milestone 4 — Web Diagnostic Console & E2E**: Build `apps/sensor-console-web` (`react-mui` + Canvas/WebGL) with Playwright E2E.
