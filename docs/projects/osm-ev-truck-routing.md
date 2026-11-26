# Project Blueprint: OSM EV Truck Routing & Fleet Dispatch Engine

- **Status**: `Blueprint Approved — Scheduled for Phase 5+`
- **Target Phases**: `Phase 3C, Phase 4C, Phase 5+`
- **Primary Domains**: `libs/utils/py-ev-routing`, `libs/data-access/py-osm-graph`, `libs/data-access/py-rl-core`, `libs/data-access/kt-spring-boot`, `apps/api-ev-routing`, `apps/ev-dispatch-web`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: Standard road routers (OSRM/Google Maps) ignore heavy commercial electric-truck constraints: road elevation grades, gross vehicle + payload weight, regenerative braking recovery, non-linear DC fast-charging State-of-Charge (SoC) curves, charger queue wait times, and driver Hours-of-Service (HOS) rest mandates.
- **Core Objectives**:
  - Physics-based EV truck energy consumption model (`Wh/km` accounting for mass, rolling resistance, aerodynamic drag, and elevation delta from OpenStreetMap + DEM elevation tiles).
  - Constrained shortest-path & charging-stop optimizer (**A* / Contraction Hierarchies + `py-rl-core` RL dispatch policy** for dynamic multi-stop fleet re-routing under live charger congestion).
  - **Simulator-First Local OSM Fixture**: Runs deterministically on a compact local `.osm.pbf` region + simulated charger availability feed in Docker/CI.
- **Target Personas & Roles**:
  - **Fleet Dispatcher**: Plans multi-stop EV truck routes, compares energy/time/cost trade-offs, monitors fleet SoC telemetry.
  - **Routing / ML Researcher**: Benchmarks classic graph heuristics vs. `py-rl-core` Gymnasium RL dispatch agents.
- **Non-Goals / Out of Scope**:
  - Turn-by-turn in-cab voice navigation app in v1 (focus on dispatch planning, route optimization, and telemetry simulation).

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Web Dispatch Console (`react-mui`)**: React + MapLibre GL JS + deck.gl + MUI v9 is the strongest stack for interactive geospatial routes, elevation/SoC profile charts, and fleet tables.
- **Physics, OSM Graph & RL Optimization (`py-nest` + `py-rl-core`)**: Python dominates geospatial graph analysis (`osmnx`/`networkx`/`scipy`), physics modeling, and Reinforcement Learning (`Gymnasium` + `Stable-Baselines3`).
- **Transactional Fleet & Dispatch Core (`kt-spring-boot` optional)**: Kotlin Spring Boot + Postgres/PostGIS + Redis handles fleet orders, HOS compliance ledgers, and live charger state caching cleanly.

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | `routing/v1/ev_route.proto` (`TruckProfile`, `ChargerNode`, `RouteLeg`, `EvRoutePlan`) |
| `libs/utils/py-ev-routing` | `py-utils-ev-routing` | `scope:utils`, `type:util`, `lang:py` | Pure EV energy physics (`kWh` over grade/mass/speed), charging curve math, HOS rest rules (`>=90%` cov) |
| `libs/data-access/py-osm-graph` | `py-osm-graph` | `scope:data-access`, `type:data-access`, `lang:py` | Local OSM `.pbf`/graph loader, elevation lookup, charger availability provider + simulator |
| `libs/data-access/py-rl-core` | `py-rl-core` | `scope:data-access`, `type:data-access`, `lang:py` | Gymnasium EV-fleet dispatch environment & Stable-Baselines3 policy trainer/evaluator |
| `apps/api-ev-routing` | `api-ev-routing` | `scope:app`, `type:app`, `lang:py` | `py-nest` FastAPI + OpenAPI/Scalar routing & simulation service |
| `apps/ev-dispatch-web` | `ev-dispatch-web` | `scope:app`, `type:app`, `lang:ts` | React + `react-mui` + MapLibre GL dispatch console & SoC/elevation viewer |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `IRouteOptimizer` protocol implemented by `ConstrainedAStarOptimizer` (deterministic baseline) and `RlFleetDispatchOptimizer` (`py-rl-core`) so strategies can be A/B benchmarked interchangeably (LSP/OCP).
  - `IEnergyModel` allows plugging in different truck drivetrains/battery chemistries without touching graph search.
- **Performance & Concurrency Design**:
  - Pre-loaded OSM road graph cached in FastAPI `lifespan` singleton; CPU-bound path searches offloaded via `asyncio.to_thread` / process pool; Redis caches frequent OD-pair route segments.
- **Security & Secret Hygiene**:
  - Input bounds on waypoint counts and payload mass to prevent DoS graph explosions; zero hardcoded map/charger API keys.

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf (`proto/monomagic/routing/v1/ev_route.proto`)**: `TruckProfile`, `ChargerStation`, `RouteRequest`, `RouteSegment`, `ChargingStop`, `EvRoutePlan`.
- **APIs**: `POST /v1/routes/plan`, `POST /v1/routes/compare-optimizers`, `GET /v1/chargers/simulated`.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `Card`, `Slider` (payload weight & initial SoC), `Select`, `Chip`, `Badge`, `Stepper` (multi-stop itinerary), `Tabs`, `Alert`.
- **New Organisms & Templates**: `MagicDataTable` (fleet & charger table), `MagicSidebar`, `MagicAppShellTemplate`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on `py-utils-ev-routing` (uphill/downhill regen physics, SoC charging curves, HOS intervals); `>=80%` on `py-osm-graph`, `py-rl-core`, and `ev-dispatch-web`.
- **Deterministic Fixture Tests**: Sample 50-node synthetic highway graph with elevation & 4 fast chargers verifies `ConstrainedAStarOptimizer` never drops below `10%` reserve SoC.
- **E2E**: ASGI E2E (`httpx.AsyncClient`) + Playwright route-planning journey on `ev-dispatch-web`.

---

## 7. Phased Milestones

1. **Milestone 1 — EV Physics & Contracts**: Add `ev_route.proto` and `libs/utils/py-ev-routing` with `>=90%` physics tests.
2. **Milestone 2 — OSM Loader & Deterministic Optimizer**: Build `libs/data-access/py-osm-graph` + A* charger-aware router + local fixture graph.
3. **Milestone 3 — RL Dispatch Policy**: Wire `libs/data-access/py-rl-core` Gymnasium environment & benchmark vs. A*.
4. **Milestone 4 — Dispatch Web Console & E2E**: Build `apps/api-ev-routing` and `apps/ev-dispatch-web` with MapLibre & Playwright E2E.
