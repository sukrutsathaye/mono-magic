# Project Blueprint: SmartHome / Home Assistant + MQTT Automation Hub

- **Status**: `Blueprint Approved — Scheduled for Phase 5+`
- **Target Phases**: `Phase 3C, Phase 4C, Phase 5+`
- **Primary Domains**: `libs/data-access/proto-contracts`, `libs/data-access/ts-mqtt`, `libs/data-access/py-home-assistant`, `libs/features/ts-smarthome`, `libs/ui/*`, `apps/smarthome-web`, `apps/api-iot-bridge`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: Smart home setups fragment across proprietary cloud hubs, opaque YAML rules, and slow dashboards. Users need a **local-first, privacy-respecting MQTT + Home Assistant orchestration hub** with real-time energy dashboards, visual automation triggers, and a zero-hardware Docker simulator for deterministic testing.
- **Core Objectives**:
  - Sub-100ms local LAN device command & telemetry round-trip over MQTT v5 (`Eclipse Mosquitto` / `EMQX`).
  - Bidirectional bridge with **Home Assistant** REST/WebSocket APIs plus a **Simulator-First HAL** (`SimulatedDeviceFleet`) that emulates thermostats, smart plugs, lighting, and solar inverters in Docker/CI.
  - Real-time energy consumption & automation rule execution with full offline resilience.
- **Target Personas & Roles**:
  - **Homeowner / Admin**: Controls rooms/devices, builds threshold/schedule automation rules, monitors energy usage.
  - **Household Member / Guest**: Scoped room-level controls without rule-editing or system access.
- **Non-Goals / Out of Scope**:
  - Cloud-dependent proprietary vendor OAuth bridges that require external SaaS relays.

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Web Dashboard (`svelte-tw`)**: Runs effortlessly on low-power wall tablets / Raspberry Pi kiosks with minimal bundle size and instant reactive toggle/slider updates.
- **Native Android Companion (`kt-compose`)**: Ideal for local BLE provisioning, Wi-Fi LAN discovery (mDNS/NSD), and Android Quick Settings Tiles.
- **IoT Bridge & Rule Engine (`go` / `py-nest`)**: Go excels at holding persistent MQTT broker fan-out connections; `py-nest` (`py-home-assistant`) integrates cleanly with Home Assistant's Python ecosystem.

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | `iot/v1/mqtt.proto` (`DeviceState`, `DeviceCommand`, `EnergySample`, `AutomationRule`) |
| `libs/data-access/ts-mqtt` | `data-access-ts-mqtt` | `scope:data-access`, `type:data-access`, `lang:ts` | MQTT v5 client implementing `IRealtimeProvider` + Docker Mosquitto simulator |
| `libs/data-access/py-home-assistant` | `py-home-assistant` | `scope:data-access`, `type:data-access`, `lang:py` | Async Home Assistant WS/REST adapter + deterministic mock simulator |
| `libs/features/ts-smarthome` | `features-ts-smarthome` | `scope:features`, `type:feature`, `lang:ts` | Room/device state store, energy aggregator, rule builder view-model |
| `libs/ui/*` | `svelte-tw`, `kt-compose`, `atomic-design-interfaces` | `scope:ui` | `SlideToggle`, `Slider`, `Card`, `Tabs`, `Alert`, `MagicAppShellTemplate`, `MagicNotificationFeed` |
| `apps/api-iot-bridge` | `api-iot-bridge` | `scope:app`, `type:app`, `lang:py` | FastAPI (`py-nest`) + MQTT bridge, rule engine, and energy time-series API |
| `apps/smarthome-web` | `smarthome-web` | `scope:app`, `type:app`, `lang:ts` | Local-first Svelte 5 wall-panel & desktop hub |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `IDeviceTransport` abstracts MQTT, Home Assistant WS, and `InMemoryDeviceSimulator` so all dashboards & rule engines pass identical contract compliance tests.
  - `IAutomationTrigger` / `IAutomationAction` allow adding new sensor triggers or notification actions without modifying the rule evaluator (OCP).
- **Performance & Concurrency Design**:
  - MQTT QoS 1 for commands, QoS 0 for high-frequency wattage telemetry; Redis/in-memory ring buffer batches energy rollups before persisting.
- **Security & Secret Hygiene**:
  - TLS + username/password ACLs on Mosquitto broker; Home Assistant long-lived tokens injected strictly via environment variables.

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf (`proto/monomagic/iot/v1/mqtt.proto`)**: `DeviceDescriptor`, `DeviceTelemetry`, `DeviceCommand`, `AutomationRule`, `EnergyReading`.
- **Topics & APIs**: MQTT `monomagic/home/{room}/{device}/{state|cmd}` + WebSocket/SSE live stream to web/mobile clients.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `SlideToggle`, `Slider`, `Card`, `Chip`, `Badge`, `Tabs`, `Alert`, `Dialog`, `Select`.
- **New Organisms & Templates**: `MagicNavbar`, `MagicSidebar`, `MagicNotificationFeed`, `MagicAppShellTemplate`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on rule evaluation & energy aggregation; `>=80%` on `ts-mqtt`, `py-home-assistant`, and UI views.
- **Simulator-First Integration**: Docker Compose spins up Eclipse Mosquitto + `SimulatedDeviceFleet` to verify end-to-end toggle → MQTT → state echo with zero physical hardware.
- **E2E (Playwright)**: Toggle virtual living-room light & thermostat threshold in `smarthome-web`, verify rule fires and alert appears in `MagicNotificationFeed`.

---

## 7. Phased Milestones

1. **Milestone 1 — IoT Contracts & Simulator HAL**: Add `mqtt.proto`, `libs/data-access/ts-mqtt`, and Docker Mosquitto simulator.
2. **Milestone 2 — Home Assistant Bridge & Rule Engine**: Build `py-home-assistant` and `apps/api-iot-bridge`.
3. **Milestone 3 — Local-First Web Hub**: Assemble `apps/smarthome-web` (`svelte-tw`) with energy charts and Playwright E2E.
4. **Milestone 4 — Native Android Companion**: Optional `kt-compose` companion with BLE/mDNS discovery.
