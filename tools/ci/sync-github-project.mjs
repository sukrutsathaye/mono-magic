#!/usr/bin/env node
/**
 * Syncs all 85 Agile mono-magic Roadmap issues (#39-#123) into GitHub Project #3
 * (https://github.com/users/sukrutsathaye/projects/3):
 *   1. Adds finished "Iteration 0 (Foundation)" (2026-10-01 -> 2026-11-25) to the Iteration field.
 *   2. Creates custom Start date, Target date, Phase, and Track fields.
 *   3. Adds all 85 issues and sets Status, Priority, Size, Estimate (Fibonacci story points),
 *      Iteration (Iteration 0 for completed items, Iteration 1 Backlog for next-up Sprint 1 tasks),
 *      Phase, Track, Start date, and Target date.
 *
 * Prerequisites (run once locally):
 *   gh auth refresh -s project
 * Usage:
 *   node sync-project-3.mjs
 */
import { execFileSync } from "node:child_process";

const PROJECT_ID = "PVT_kwHOAspns84BtXPA";
const ITEMS = [
  {
    "number": 39,
    "id": 6632189996,
    "node_id": "I_kwDOVunSQc8AAAABi08wLA",
    "title": "[Phase 0] Monorepo Foundation, 4 UI Libraries & GH Pages Portal",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/39",
    "isEpic": true,
    "status": "Done",
    "priority": "P0",
    "size": "XL",
    "phase": "Phase 0",
    "track": "Track 1: Governance",
    "startDate": "2026-10-01",
    "targetDate": "2026-10-15",
    "estimate": 8,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 40,
    "id": 6632190670,
    "node_id": "I_kwDOVunSQc8AAAABi08yzg",
    "title": "[Phase 1] Governance, .gemini/ Orchestration, Visual Baselines & Coverage Portal",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/40",
    "isEpic": true,
    "status": "Done",
    "priority": "P0",
    "size": "L",
    "phase": "Phase 1",
    "track": "Track 1: Governance",
    "startDate": "2026-10-16",
    "targetDate": "2026-11-01",
    "estimate": 5,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 41,
    "id": 6632191286,
    "node_id": "I_kwDOVunSQc8AAAABi081Ng",
    "title": "[Phase 2A] Atomic Design Expansion — Wave 2 Molecules (All 4 UI Libs)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/41",
    "isEpic": true,
    "status": "Done",
    "priority": "P0",
    "size": "XL",
    "phase": "Phase 2A",
    "track": "Track 2: UI Libraries",
    "startDate": "2026-11-02",
    "targetDate": "2026-11-12",
    "estimate": 8,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 42,
    "id": 6632191917,
    "node_id": "I_kwDOVunSQc8AAAABi083rQ",
    "title": "[Phase 3A] Pure Shared Utilities (libs/utils/*)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/42",
    "isEpic": true,
    "status": "Done",
    "priority": "P0",
    "size": "L",
    "phase": "Phase 3A",
    "track": "Track 3: Pure Utils",
    "startDate": "2026-11-13",
    "targetDate": "2026-11-18",
    "estimate": 5,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 43,
    "id": 6632192533,
    "node_id": "I_kwDOVunSQc8AAAABi086FQ",
    "title": "[Phase 1B] Skills Compliance & Cross-Library Remediation (Waves 1–4)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/43",
    "isEpic": true,
    "status": "Backlog",
    "priority": "P0",
    "size": "XL",
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-11-26",
    "targetDate": "2026-12-09",
    "estimate": 8
  },
  {
    "number": 44,
    "id": 6632192957,
    "node_id": "I_kwDOVunSQc8AAAABi087vQ",
    "title": "[Phase 1B] Wave 1 — Governance, Canonical Nx Tags & Systems Hygiene",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/44",
    "parentNumber": 43,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "S",
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-11-26",
    "targetDate": "2026-11-28",
    "estimate": 2
  },
  {
    "number": 45,
    "id": 6632193485,
    "node_id": "I_kwDOVunSQc8AAAABi089zQ",
    "title": "[Phase 1B] Wave 2 — Data-Access Wire Contract Parity & LSP Completeness",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/45",
    "parentNumber": 43,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "M",
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-11-29",
    "targetDate": "2026-12-01",
    "estimate": 3
  },
  {
    "number": 46,
    "id": 6632194014,
    "node_id": "I_kwDOVunSQc8AAAABi08_3g",
    "title": "[Phase 1B] Wave 3 — UI Root Framework Superset & 7-Category Story Matrix",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/46",
    "parentNumber": 43,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "L",
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-02",
    "targetDate": "2026-12-05",
    "estimate": 5
  },
  {
    "number": 47,
    "id": 6632194690,
    "node_id": "I_kwDOVunSQc8AAAABi09Cgg",
    "title": "[Phase 1B] Wave 4 — Documentation, Measured Coverage Gates & Vue/Svelte Molecule Parity",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/47",
    "parentNumber": 43,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-06",
    "targetDate": "2026-12-09",
    "estimate": 8
  },
  {
    "number": 48,
    "id": 6632195263,
    "node_id": "I_kwDOVunSQc8AAAABi09Evw",
    "title": "[Phase 2B] Atomic Design Expansion — Wave 1 Core Organisms (5 Organisms × 4 UI Libs)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/48",
    "isEpic": true,
    "status": "Backlog",
    "priority": "P0",
    "size": "XL",
    "phase": "Phase 2B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 2",
    "startDate": "2026-12-10",
    "targetDate": "2026-12-23",
    "estimate": 8
  },
  {
    "number": 49,
    "id": 6632195710,
    "node_id": "I_kwDOVunSQc8AAAABi09Gfg",
    "title": "[Phase 2B] Navbar / AppHeader (MagicNavbar)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/49",
    "parentNumber": 48,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "M",
    "phase": "Phase 2B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 2",
    "startDate": "2026-12-10",
    "targetDate": "2026-12-12",
    "estimate": 3
  },
  {
    "number": 50,
    "id": 6632196222,
    "node_id": "I_kwDOVunSQc8AAAABi09Ifg",
    "title": "[Phase 2B] NavigationDrawer / Sidebar (MagicSidebar)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/50",
    "parentNumber": 48,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "M",
    "phase": "Phase 2B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 2",
    "startDate": "2026-12-12",
    "targetDate": "2026-12-15",
    "estimate": 3
  },
  {
    "number": 51,
    "id": 6632196789,
    "node_id": "I_kwDOVunSQc8AAAABi09KtQ",
    "title": "[Phase 2B] AuthForm (MagicAuthForm)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/51",
    "parentNumber": 48,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "M",
    "phase": "Phase 2B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 2",
    "startDate": "2026-12-15",
    "targetDate": "2026-12-17",
    "estimate": 3
  },
  {
    "number": 52,
    "id": 6632197293,
    "node_id": "I_kwDOVunSQc8AAAABi09MrQ",
    "title": "[Phase 2B] DataTable (MagicDataTable)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/52",
    "parentNumber": 48,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 2B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 2",
    "startDate": "2026-12-17",
    "targetDate": "2026-12-20",
    "estimate": 5
  },
  {
    "number": 53,
    "id": 6632197838,
    "node_id": "I_kwDOVunSQc8AAAABi09Ozg",
    "title": "[Phase 2B] NotificationFeed / AlertPanel (MagicNotificationFeed)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/53",
    "parentNumber": 48,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "phase": "Phase 2B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 2",
    "startDate": "2026-12-21",
    "targetDate": "2026-12-23",
    "estimate": 3
  },
  {
    "number": 54,
    "id": 6632198406,
    "node_id": "I_kwDOVunSQc8AAAABi09RBg",
    "title": "[Phase 3B] Hybrid Data-Access Contracts & Compliance Harness",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/54",
    "isEpic": true,
    "status": "In progress",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 3B",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 1",
    "startDate": "2026-11-18",
    "targetDate": "2026-12-23",
    "estimate": 5
  },
  {
    "number": 55,
    "id": 6632198828,
    "node_id": "I_kwDOVunSQc8AAAABi09SrA",
    "title": "[Phase 3B] proto-contracts (libs/data-access/proto-contracts)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/55",
    "parentNumber": 54,
    "isEpic": false,
    "status": "Done",
    "priority": "P0",
    "size": "M",
    "phase": "Phase 3B",
    "track": "Track 4: Data-Access",
    "startDate": "2026-11-18",
    "targetDate": "2026-11-20",
    "estimate": 3,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 56,
    "id": 6632199713,
    "node_id": "I_kwDOVunSQc8AAAABi09WIQ",
    "title": "[Phase 3B] @mono-magic/data-access-ts-interfaces (libs/data-access/ts-interfaces)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/56",
    "parentNumber": 54,
    "isEpic": false,
    "status": "Done",
    "priority": "P0",
    "size": "M",
    "phase": "Phase 3B",
    "track": "Track 4: Data-Access",
    "startDate": "2026-11-20",
    "targetDate": "2026-11-22",
    "estimate": 3,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 57,
    "id": 6632200662,
    "node_id": "I_kwDOVunSQc8AAAABi09Z1g",
    "title": "[Phase 3B] py-data-access-interfaces (libs/data-access/py-interfaces)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/57",
    "parentNumber": 54,
    "isEpic": false,
    "status": "Done",
    "priority": "P0",
    "size": "M",
    "phase": "Phase 3B",
    "track": "Track 4: Data-Access",
    "startDate": "2026-11-22",
    "targetDate": "2026-11-24",
    "estimate": 3,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 58,
    "id": 6632201518,
    "node_id": "I_kwDOVunSQc8AAAABi09dLg",
    "title": "[Phase 3B] Future Language Interface Mirrors (dart-interfaces & java-interfaces)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/58",
    "parentNumber": 54,
    "isEpic": false,
    "status": "In progress",
    "priority": "P2",
    "size": "M",
    "phase": "Phase 3B",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 1",
    "startDate": "2026-12-16",
    "targetDate": "2026-12-23",
    "estimate": 3
  },
  {
    "number": 59,
    "id": 6632202088,
    "node_id": "I_kwDOVunSQc8AAAABi09faA",
    "title": "[Phase 2C] Atomic Design Expansion — Wave 2 Domain Organisms & Page Templates",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/59",
    "isEpic": true,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 3",
    "startDate": "2026-12-24",
    "targetDate": "2027-01-20",
    "estimate": 8
  },
  {
    "number": 60,
    "id": 6632202529,
    "node_id": "I_kwDOVunSQc8AAAABi09hIQ",
    "title": "[Phase 2C] E-Commerce Organisms (ProductCatalogGrid, CartDrawer, CheckoutForm)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/60",
    "parentNumber": 59,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 3",
    "startDate": "2026-12-24",
    "targetDate": "2026-12-30",
    "estimate": 5
  },
  {
    "number": 61,
    "id": 6632203030,
    "node_id": "I_kwDOVunSQc8AAAABi09jFg",
    "title": "[Phase 2C] Live Conferencing & Telemetry Organisms (MediaStage, PoseTelemetryPanel)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/61",
    "parentNumber": 59,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 3",
    "startDate": "2026-12-31",
    "targetDate": "2027-01-06",
    "estimate": 5
  },
  {
    "number": 62,
    "id": 6632203547,
    "node_id": "I_kwDOVunSQc8AAAABi09lGw",
    "title": "[Phase 2C] Reflective Learning Organisms (7 Organisms)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/62",
    "parentNumber": 59,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-07",
    "targetDate": "2027-01-13",
    "estimate": 8
  },
  {
    "number": 63,
    "id": 6632204131,
    "node_id": "I_kwDOVunSQc8AAAABi09nYw",
    "title": "[Phase 2C] Page Templates (7 Templates under src/lib/templates/)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/63",
    "parentNumber": 59,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-14",
    "targetDate": "2027-01-20",
    "estimate": 8
  },
  {
    "number": 64,
    "id": 6632204702,
    "node_id": "I_kwDOVunSQc8AAAABi09png",
    "title": "[Phase 3C] Data-Access Implementations (BaaS, NestJS, py-nest, Redis, AI/ML, Spring Boot, Cloud SDKs)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/64",
    "isEpic": true,
    "status": "In progress",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 1",
    "startDate": "2026-11-20",
    "targetDate": "2027-01-20",
    "estimate": 8
  },
  {
    "number": 65,
    "id": 6632205075,
    "node_id": "I_kwDOVunSQc8AAAABi09rEw",
    "title": "[Phase 3C.1] @mono-magic/data-access-ts-firebase (libs/data-access/ts-firebase)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/65",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Done",
    "priority": "P0",
    "size": "L",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "startDate": "2026-11-20",
    "targetDate": "2026-11-22",
    "estimate": 5,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 66,
    "id": 6632206054,
    "node_id": "I_kwDOVunSQc8AAAABi09u5g",
    "title": "[Phase 3C.1] @mono-magic/data-access-ts-supabase (libs/data-access/ts-supabase)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/66",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Done",
    "priority": "P0",
    "size": "L",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "startDate": "2026-11-22",
    "targetDate": "2026-11-24",
    "estimate": 5,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 67,
    "id": 6632206870,
    "node_id": "I_kwDOVunSQc8AAAABi09yFg",
    "title": "[Phase 3C.4] py-reflective-nlp (libs/data-access/py-reflective-nlp)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/67",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Done",
    "priority": "P0",
    "size": "L",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "startDate": "2026-11-23",
    "targetDate": "2026-11-25",
    "estimate": 5,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 68,
    "id": 6632207985,
    "node_id": "I_kwDOVunSQc8AAAABi092cQ",
    "title": "[Phase 3C.4] @mono-magic/data-access-ts-reflective-api (libs/data-access/ts-reflective-api)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/68",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Done",
    "priority": "P0",
    "size": "M",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "startDate": "2026-11-24",
    "targetDate": "2026-11-25",
    "estimate": 3,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 69,
    "id": 6632208913,
    "node_id": "I_kwDOVunSQc8AAAABi096EQ",
    "title": "[Phase 3C.2] @mono-magic/data-access-ts-nestjs (libs/data-access/ts-nestjs)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/69",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 2",
    "startDate": "2026-12-10",
    "targetDate": "2026-12-18",
    "estimate": 8
  },
  {
    "number": 70,
    "id": 6632209510,
    "node_id": "I_kwDOVunSQc8AAAABi098Zg",
    "title": "[Phase 3C.2] py-nest (libs/data-access/py-nest)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/70",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 2",
    "startDate": "2026-12-14",
    "targetDate": "2026-12-23",
    "estimate": 5
  },
  {
    "number": 71,
    "id": 6632210071,
    "node_id": "I_kwDOVunSQc8AAAABi09-lw",
    "title": "[Phase 3C.2] Caching & Distributed Locks (ts-redis & py-redis)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/71",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 3",
    "startDate": "2026-12-24",
    "targetDate": "2026-12-30",
    "estimate": 3
  },
  {
    "number": 72,
    "id": 6632210614,
    "node_id": "I_kwDOVunSQc8AAAABi0-Atg",
    "title": "[Phase 3C.2] AI, ML, RL & Agentic Silos (py-agent-graph, py-ml-core, py-rl-core, ts-ai-sdk)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/72",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "XL",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 3",
    "startDate": "2026-12-31",
    "targetDate": "2027-01-06",
    "estimate": 8
  },
  {
    "number": 73,
    "id": 6632211199,
    "node_id": "I_kwDOVunSQc8AAAABi0-C_w",
    "title": "[Phase 3C.2] Kotlin Native / KMP Track (kt-core & kt-interfaces)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/73",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "M",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 4",
    "startDate": "2027-01-07",
    "targetDate": "2027-01-11",
    "estimate": 3
  },
  {
    "number": 74,
    "id": 6632211732,
    "node_id": "I_kwDOVunSQc8AAAABi0-FFA",
    "title": "[Phase 3C.3] Enterprise Java/Kotlin Spring Boot Data-Access (java-spring-boot-starter)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/74",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 4",
    "startDate": "2027-01-07",
    "targetDate": "2027-01-16",
    "estimate": 8
  },
  {
    "number": 75,
    "id": 6632212240,
    "node_id": "I_kwDOVunSQc8AAAABi0-HEA",
    "title": "[Phase 3C.4] @mono-magic/data-access-ts-aws (libs/data-access/ts-aws)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/75",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "L",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 4",
    "startDate": "2027-01-14",
    "targetDate": "2027-01-18",
    "estimate": 5
  },
  {
    "number": 76,
    "id": 6632212767,
    "node_id": "I_kwDOVunSQc8AAAABi0-JHw",
    "title": "[Phase 3C.4] @mono-magic/data-access-ts-gcp (libs/data-access/ts-gcp)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/76",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "L",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 4",
    "startDate": "2027-01-15",
    "targetDate": "2027-01-19",
    "estimate": 5
  },
  {
    "number": 77,
    "id": 6632213444,
    "node_id": "I_kwDOVunSQc8AAAABi0-LxA",
    "title": "[Phase 3C.4] @mono-magic/data-access-ts-azure (libs/data-access/ts-azure)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/77",
    "parentNumber": 64,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "L",
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 4",
    "startDate": "2027-01-16",
    "targetDate": "2027-01-20",
    "estimate": 5
  },
  {
    "number": 78,
    "id": 6632214017,
    "node_id": "I_kwDOVunSQc8AAAABi0-OAQ",
    "title": "[Phase 4B] Additional UI Frameworks & Design Systems (vue-vuetify, svelte-tw, react-shadcn)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/78",
    "isEpic": true,
    "status": "In progress",
    "priority": "P2",
    "size": "XL",
    "phase": "Phase 4B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 1",
    "startDate": "2026-11-20",
    "targetDate": "2027-01-20",
    "estimate": 8
  },
  {
    "number": 79,
    "id": 6632214392,
    "node_id": "I_kwDOVunSQc8AAAABi0-PeA",
    "title": "[Phase 4B] vue-vuetify — 11 Atoms + Storybook (libs/ui/vue-vuetify)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/79",
    "parentNumber": 78,
    "isEpic": false,
    "status": "Done",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 4B",
    "track": "Track 2: UI Libraries",
    "startDate": "2026-11-20",
    "targetDate": "2026-11-23",
    "estimate": 5,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 80,
    "id": 6632215347,
    "node_id": "I_kwDOVunSQc8AAAABi0-TMw",
    "title": "[Phase 4B] svelte-tw — 11 Atoms + Storybook (libs/ui/svelte-tw)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/80",
    "parentNumber": 78,
    "isEpic": false,
    "status": "Done",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 4B",
    "track": "Track 2: UI Libraries",
    "startDate": "2026-11-23",
    "targetDate": "2026-11-25",
    "estimate": 5,
    "iteration": "Iteration 0 (Foundation)"
  },
  {
    "number": 81,
    "id": 6632216100,
    "node_id": "I_kwDOVunSQc8AAAABi0-WJA",
    "title": "[Phase 4B] react-shadcn (libs/ui/react-shadcn)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/81",
    "parentNumber": 78,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "XL",
    "phase": "Phase 4B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-07",
    "targetDate": "2027-01-20",
    "estimate": 8
  },
  {
    "number": 82,
    "id": 6632216785,
    "node_id": "I_kwDOVunSQc8AAAABi0-Y0Q",
    "title": "[Phase 4A] Open-Source Realtime, Pose Analysis & Feature Integrations",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/82",
    "isEpic": true,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 4A",
    "track": "Track 5: Microservices & ML",
    "iteration": "Iteration 5",
    "startDate": "2027-01-21",
    "targetDate": "2027-02-17",
    "estimate": 8
  },
  {
    "number": 83,
    "id": 6632217105,
    "node_id": "I_kwDOVunSQc8AAAABi0-aEQ",
    "title": "[Phase 4A] LiveKit Conferencing Integration (ts-livekit & ts-live-room)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/83",
    "parentNumber": 82,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 4A",
    "track": "Track 5: Microservices & ML",
    "iteration": "Iteration 5",
    "startDate": "2027-01-21",
    "targetDate": "2027-02-03",
    "estimate": 5
  },
  {
    "number": 84,
    "id": 6632217635,
    "node_id": "I_kwDOVunSQc8AAAABi0-cIw",
    "title": "[Phase 4A] PoseNet / MediaPipe Pose Analysis Integration (ts-pose-detection & api-pose-analyzer)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/84",
    "parentNumber": 82,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 4A",
    "track": "Track 5: Microservices & ML",
    "startDate": "2027-02-04",
    "targetDate": "2027-02-17",
    "estimate": 5
  },
  {
    "number": 85,
    "id": 6632218184,
    "node_id": "I_kwDOVunSQc8AAAABi0-eSA",
    "title": "[Phase 4C] Polyglot Microservices (apps/api-*)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/85",
    "isEpic": true,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 4C",
    "track": "Track 5: Microservices & ML",
    "iteration": "Iteration 5",
    "startDate": "2027-01-21",
    "targetDate": "2027-03-03",
    "estimate": 8
  },
  {
    "number": 86,
    "id": 6632218599,
    "node_id": "I_kwDOVunSQc8AAAABi0-f5w",
    "title": "[Phase 4C] Python FastAPI Service — apps/api-pose-coach",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/86",
    "parentNumber": 85,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 4C",
    "track": "Track 5: Microservices & ML",
    "iteration": "Iteration 5",
    "startDate": "2027-01-21",
    "targetDate": "2027-02-03",
    "estimate": 5
  },
  {
    "number": 87,
    "id": 6632219186,
    "node_id": "I_kwDOVunSQc8AAAABi0-iMg",
    "title": "[Phase 4C] Python FastAPI Service — apps/api-reflective-learning",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/87",
    "parentNumber": 85,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "L",
    "phase": "Phase 4C",
    "track": "Track 5: Microservices & ML",
    "iteration": "Iteration 5",
    "startDate": "2027-01-21",
    "targetDate": "2027-02-03",
    "estimate": 5
  },
  {
    "number": 88,
    "id": 6632219813,
    "node_id": "I_kwDOVunSQc8AAAABi0-kpQ",
    "title": "[Phase 4C] Go / Rust Service — apps/api-realtime-telemetry",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/88",
    "parentNumber": 85,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 4C",
    "track": "Track 5: Microservices & ML",
    "startDate": "2027-02-04",
    "targetDate": "2027-02-17",
    "estimate": 5
  },
  {
    "number": 89,
    "id": 6632220430,
    "node_id": "I_kwDOVunSQc8AAAABi0-nDg",
    "title": "[Phase 4C] Java / Kotlin Spring Boot Service — apps/api-commerce-core",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/89",
    "parentNumber": 85,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 4C",
    "track": "Track 5: Microservices & ML",
    "startDate": "2027-02-11",
    "targetDate": "2027-02-24",
    "estimate": 5
  },
  {
    "number": 90,
    "id": 6632221134,
    "node_id": "I_kwDOVunSQc8AAAABi0-pzg",
    "title": "[Phase 4C] NestJS API Gateway — apps/api-gateway",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/90",
    "parentNumber": 85,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "phase": "Phase 4C",
    "track": "Track 5: Microservices & ML",
    "startDate": "2027-02-18",
    "targetDate": "2027-03-03",
    "estimate": 5
  },
  {
    "number": 91,
    "id": 6632221903,
    "node_id": "I_kwDOVunSQc8AAAABi0-szw",
    "title": "[Phase 5] Flagship Applications (5A Quanti-Fit, 5B Storefront, 5C Reflective Learning, 5D Couples Journal)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/91",
    "isEpic": true,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 5",
    "track": "Track 6: Flagship Apps",
    "startDate": "2027-03-04",
    "targetDate": "2027-06-30",
    "estimate": 8
  },
  {
    "number": 92,
    "id": 6632222246,
    "node_id": "I_kwDOVunSQc8AAAABi0-uJg",
    "title": "[Phase 5A] Quanti-Fit Interactive Live Coaching & Learning Platform (apps/yoga-live-*)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/92",
    "parentNumber": 91,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 5A",
    "track": "Track 6: Flagship Apps",
    "startDate": "2027-03-04",
    "targetDate": "2027-04-07",
    "estimate": 8
  },
  {
    "number": 93,
    "id": 6632222871,
    "node_id": "I_kwDOVunSQc8AAAABi0-wlw",
    "title": "[Phase 5B] Hand-Knitted Articles Showcase & Ordering Platform (apps/knitted-showcase-*)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/93",
    "parentNumber": 91,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "phase": "Phase 5B",
    "track": "Track 6: Flagship Apps",
    "startDate": "2027-04-08",
    "targetDate": "2027-05-05",
    "estimate": 8
  },
  {
    "number": 94,
    "id": 6632223584,
    "node_id": "I_kwDOVunSQc8AAAABi0-zYA",
    "title": "[Phase 5C] Reflective Learning App (apps/reflective-learning-*)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/94",
    "parentNumber": 91,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "XL",
    "phase": "Phase 5C",
    "track": "Track 6: Flagship Apps",
    "startDate": "2027-05-06",
    "targetDate": "2027-06-02",
    "estimate": 8
  },
  {
    "number": 95,
    "id": 6632224155,
    "node_id": "I_kwDOVunSQc8AAAABi0-1mw",
    "title": "[Phase 5D] Couples Relationship Journal App (apps/couples-journal-*)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/95",
    "parentNumber": 91,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "XL",
    "phase": "Phase 5D",
    "track": "Track 6: Flagship Apps",
    "startDate": "2027-06-03",
    "targetDate": "2027-06-30",
    "estimate": 8
  },
  {
    "number": 96,
    "id": 6632361501,
    "node_id": "I_kwDOVunSQc8AAAABi1HOHQ",
    "title": "[1B.1a] Add canonical Nx tags across all UI & data-access projects",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/96",
    "parentNumber": 44,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "S",
    "estimate": 2,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-11-26",
    "targetDate": "2026-11-27"
  },
  {
    "number": 97,
    "id": 6632362215,
    "node_id": "I_kwDOVunSQc8AAAABi1HQ5w",
    "title": "[1B.1b] Remove production .expect() in rs-pose-math & add rustfmt/gofmt lint gates",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/97",
    "parentNumber": 44,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "S",
    "estimate": 2,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-11-27",
    "targetDate": "2026-11-28"
  },
  {
    "number": 98,
    "id": 6632362679,
    "node_id": "I_kwDOVunSQc8AAAABi1HStw",
    "title": "[1B.1c] Add __future__ annotations to py-interfaces & clean up TS Vitest configs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/98",
    "parentNumber": 44,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "XS",
    "estimate": 1,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-11-28",
    "targetDate": "2026-11-28"
  },
  {
    "number": 99,
    "id": 6632363228,
    "node_id": "I_kwDOVunSQc8AAAABi1HU3A",
    "title": "[1B.2a] Mirror reflective.proto DTOs & protocols into py-interfaces and refactor py-reflective-nlp",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/99",
    "parentNumber": 45,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-11-29",
    "targetDate": "2026-11-30"
  },
  {
    "number": 100,
    "id": 6632363809,
    "node_id": "I_kwDOVunSQc8AAAABi1HXIQ",
    "title": "[1B.2b] Add Realtime & Payment contract test suites to ts-interfaces and wire into Firebase/Supabase",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/100",
    "parentNumber": 45,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-01",
    "targetDate": "2026-12-02"
  },
  {
    "number": 101,
    "id": 6632364337,
    "node_id": "I_kwDOVunSQc8AAAABi1HZMQ",
    "title": "[1B.3a] Enforce Root Framework Superset attr forwarding in vue-vuetify & svelte-tw atoms",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/101",
    "parentNumber": 46,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-02",
    "targetDate": "2026-12-03"
  },
  {
    "number": 102,
    "id": 6632365054,
    "node_id": "I_kwDOVunSQc8AAAABi1Hb_g",
    "title": "[1B.3b] Close contract gaps in react-mui (slotProps), ng-mat (CVA) & rn-paper (onClick/portal)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/102",
    "parentNumber": 46,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "L",
    "estimate": 5,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-03",
    "targetDate": "2026-12-05"
  },
  {
    "number": 103,
    "id": 6632365562,
    "node_id": "I_kwDOVunSQc8AAAABi1Hd-g",
    "title": "[1B.3c] Upgrade UI stories & Widgetbook to 7-Category State Matrix + regenerate __vis__/ baselines",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/103",
    "parentNumber": 46,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P0",
    "size": "L",
    "estimate": 5,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-05",
    "targetDate": "2026-12-07"
  },
  {
    "number": 104,
    "id": 6632366132,
    "node_id": "I_kwDOVunSQc8AAAABi1HgNA",
    "title": "[1B.4a] Complete inline docs, Rust doc-tests/#[repr(C)] & Go %w/table-driven tests",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/104",
    "parentNumber": 47,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-07",
    "targetDate": "2026-12-08"
  },
  {
    "number": 105,
    "id": 6632366752,
    "node_id": "I_kwDOVunSQc8AAAABi1HioA",
    "title": "[1B.4b] Bring all per-package README.md files up to project-readme-standard",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/105",
    "parentNumber": 47,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-08",
    "targetDate": "2026-12-09"
  },
  {
    "number": 106,
    "id": 6632367349,
    "node_id": "I_kwDOVunSQc8AAAABi1Hk9Q",
    "title": "[1B.4c] Replace placeholder coverage metrics with measured gates across all 21 libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/106",
    "parentNumber": 47,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 1B",
    "track": "Track 1: Governance",
    "iteration": "Iteration 1",
    "startDate": "2026-12-08",
    "targetDate": "2026-12-09"
  },
  {
    "number": 107,
    "id": 6632367984,
    "node_id": "I_kwDOVunSQc8AAAABi1HncA",
    "title": "[1B.4d] Implement all 17 Molecules in libs/ui/vue-vuetify (tests, 7-Category stories & baselines)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/107",
    "parentNumber": 47,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "estimate": 8,
    "phase": "Phase 1B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 2",
    "startDate": "2026-12-10",
    "targetDate": "2026-12-16"
  },
  {
    "number": 108,
    "id": 6632368470,
    "node_id": "I_kwDOVunSQc8AAAABi1HpVg",
    "title": "[1B.4e] Implement all 17 Molecules in libs/ui/svelte-tw (tests, 7-Category stories & baselines)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/108",
    "parentNumber": 47,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "XL",
    "estimate": 8,
    "phase": "Phase 1B",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 2",
    "startDate": "2026-12-17",
    "targetDate": "2026-12-23"
  },
  {
    "number": 109,
    "id": 6632369043,
    "node_id": "I_kwDOVunSQc8AAAABi1Hrkw",
    "title": "[2C.1a] ProductCatalogGrid (MagicProductCatalogGrid) across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/109",
    "parentNumber": 60,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 3",
    "startDate": "2026-12-24",
    "targetDate": "2026-12-26"
  },
  {
    "number": 110,
    "id": 6632369743,
    "node_id": "I_kwDOVunSQc8AAAABi1HuTw",
    "title": "[2C.1b] CartDrawer (MagicCartDrawer) across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/110",
    "parentNumber": 60,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 3",
    "startDate": "2026-12-26",
    "targetDate": "2026-12-28"
  },
  {
    "number": 111,
    "id": 6632370275,
    "node_id": "I_kwDOVunSQc8AAAABi1HwYw",
    "title": "[2C.1c] CheckoutForm (MagicCheckoutForm) across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/111",
    "parentNumber": 60,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 3",
    "startDate": "2026-12-28",
    "targetDate": "2026-12-30"
  },
  {
    "number": 112,
    "id": 6632370849,
    "node_id": "I_kwDOVunSQc8AAAABi1HyoQ",
    "title": "[2C.2a] VideoParticipantGrid / MediaStage (MagicMediaStage) across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/112",
    "parentNumber": 61,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "estimate": 5,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 3",
    "startDate": "2026-12-31",
    "targetDate": "2027-01-03"
  },
  {
    "number": 113,
    "id": 6632371499,
    "node_id": "I_kwDOVunSQc8AAAABi1H1Kw",
    "title": "[2C.2b] PoseTelemetrySidePanel (MagicPoseTelemetryPanel) across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/113",
    "parentNumber": 61,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 3",
    "startDate": "2027-01-04",
    "targetDate": "2027-01-06"
  },
  {
    "number": 114,
    "id": 6632372043,
    "node_id": "I_kwDOVunSQc8AAAABi1H3Sw",
    "title": "[2C.3a] TopicCatalogGrid & ChapterReader across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/114",
    "parentNumber": 62,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-07",
    "targetDate": "2027-01-09"
  },
  {
    "number": 115,
    "id": 6632372612,
    "node_id": "I_kwDOVunSQc8AAAABi1H5hA",
    "title": "[2C.3b] McqQuizRunner & SubjectiveQuizRunner across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/115",
    "parentNumber": 62,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "estimate": 5,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-09",
    "targetDate": "2027-01-11"
  },
  {
    "number": 116,
    "id": 6632373125,
    "node_id": "I_kwDOVunSQc8AAAABi1H7hQ",
    "title": "[2C.3c] KeywordCurationDeck, QuestionCurationPanel & TopicIngestionPanel across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/116",
    "parentNumber": 62,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "estimate": 5,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-11",
    "targetDate": "2027-01-13"
  },
  {
    "number": 117,
    "id": 6632373814,
    "node_id": "I_kwDOVunSQc8AAAABi1H-Ng",
    "title": "[2C.4a] AppShellTemplate & StorefrontTemplate across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/117",
    "parentNumber": 63,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-14",
    "targetDate": "2027-01-16"
  },
  {
    "number": 118,
    "id": 6632374412,
    "node_id": "I_kwDOVunSQc8AAAABi1IAjA",
    "title": "[2C.4b] LiveSessionTemplate across 4 UI libs",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/118",
    "parentNumber": 63,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-16",
    "targetDate": "2027-01-18"
  },
  {
    "number": 119,
    "id": 6632374995,
    "node_id": "I_kwDOVunSQc8AAAABi1IC0w",
    "title": "[2C.4c] Reflective Learning Templates (TopicLibrary, StudyReader, Assessment, CurationWorkspace)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/119",
    "parentNumber": 63,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P1",
    "size": "L",
    "estimate": 5,
    "phase": "Phase 2C",
    "track": "Track 2: UI Libraries",
    "iteration": "Iteration 4",
    "startDate": "2027-01-18",
    "targetDate": "2027-01-20"
  },
  {
    "number": 120,
    "id": 6632375547,
    "node_id": "I_kwDOVunSQc8AAAABi1IE-w",
    "title": "[3C.2a] py-agent-graph (LangChain/LangGraph DI wrapper)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/120",
    "parentNumber": 72,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 3",
    "startDate": "2026-12-31",
    "targetDate": "2027-01-02"
  },
  {
    "number": 121,
    "id": 6632376157,
    "node_id": "I_kwDOVunSQc8AAAABi1IHXQ",
    "title": "[3C.2b] py-ml-core (PyTorch/ONNX/MLflow)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/121",
    "parentNumber": 72,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 3",
    "startDate": "2027-01-02",
    "targetDate": "2027-01-04"
  },
  {
    "number": 122,
    "id": 6632376763,
    "node_id": "I_kwDOVunSQc8AAAABi1IJuw",
    "title": "[3C.2c] py-rl-core (Gymnasium + Stable-Baselines3)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/122",
    "parentNumber": 72,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 3",
    "startDate": "2027-01-04",
    "targetDate": "2027-01-05"
  },
  {
    "number": 123,
    "id": 6632377272,
    "node_id": "I_kwDOVunSQc8AAAABi1ILuA",
    "title": "[3C.2d] ts-ai-sdk (TypeScript AI SDK adapter)",
    "url": "https://github.com/sukrutsathaye/mono-magic/issues/123",
    "parentNumber": 72,
    "isEpic": false,
    "status": "Backlog",
    "priority": "P2",
    "size": "M",
    "estimate": 3,
    "phase": "Phase 3C",
    "track": "Track 4: Data-Access",
    "iteration": "Iteration 3",
    "startDate": "2027-01-05",
    "targetDate": "2027-01-06"
  }
];

function gql(query, variables = {}) {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [k, v] of Object.entries(variables)) {
    if (v === undefined || v === null) continue;
    args.push("-f", `${k}=${v}`);
  }
  const out = execFileSync("gh", args, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  const parsed = JSON.parse(out);
  if (parsed.errors?.length) throw new Error(JSON.stringify(parsed.errors));
  return parsed.data;
}

function fetchFields() {
  const data = gql(`query($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        fields(first: 40) {
          nodes {
            ... on ProjectV2Field { id name dataType }
            ... on ProjectV2IterationField {
              id name dataType
              configuration {
                duration
                startDay
                iterations { id title startDate duration }
                completedIterations { id title startDate duration }
              }
            }
            ... on ProjectV2SingleSelectField { id name dataType options { id name } }
          }
        }
      }
    }
  }`, { id: PROJECT_ID });
  return new Map(data.node.fields.nodes.filter(Boolean).map((f) => [f.name, f]));
}

function ensureFinishedIteration(fields) {
  const iterField = fields.get("Iteration");
  if (!iterField) return;
  const allIters = [
    ...(iterField.configuration?.completedIterations ?? []),
    ...(iterField.configuration?.iterations ?? []),
  ];
  if (allIters.some((i) => i.title === "Iteration 0 (Foundation)")) {
    console.log("  = Iteration 0 (Foundation) already exists");
    return;
  }
  console.log("  + Adding finished Iteration 0 (Foundation) (2026-10-01 -> 2026-11-25)...");
  const nextIters = [
    { title: "Iteration 0 (Foundation)", startDate: "2026-10-01", duration: 56 },
    ...allIters.map((i) => ({ id: i.id, title: i.title, startDate: i.startDate, duration: i.duration })),
  ];
  const iterLiterals = nextIters
    .map((i) => {
      const idPart = i.id ? `id: "${i.id}", ` : "";
      return `{ ${idPart}title: "${i.title}", startDate: "${i.startDate}", duration: ${i.duration} }`;
    })
    .join(", ");
  gql(`mutation($fieldId: ID!) {
    updateProjectV2Field(input: {
      fieldId: $fieldId,
      iterationConfiguration: {
        startDate: "2026-10-01",
        duration: 14,
        iterations: [${iterLiterals}]
      }
    }) {
      projectV2Field { ... on ProjectV2IterationField { id name } }
    }
  }`, { fieldId: iterField.id });
}

function ensureField(fields, name, dataType, options) {
  if (fields.has(name)) return fields.get(name);
  console.log(`  + Creating field: ${name} (${dataType})`);
  if (dataType === "DATE") {
    gql(`mutation($projectId: ID!, $name: String!) {
      createProjectV2Field(input: { projectId: $projectId, dataType: DATE, name: $name }) {
        projectV2Field { ... on ProjectV2Field { id name } }
      }
    }`, { projectId: PROJECT_ID, name });
  } else if (dataType === "SINGLE_SELECT") {
    const optsLiteral = options.map((o) => `{ name: "${o.name}", color: ${o.color}, description: "" }`).join(", ");
    gql(`mutation($projectId: ID!, $name: String!) {
      createProjectV2Field(input: {
        projectId: $projectId,
        dataType: SINGLE_SELECT,
        name: $name,
        singleSelectOptions: [${optsLiteral}]
      }) {
        projectV2Field { ... on ProjectV2SingleSelectField { id name } }
      }
    }`, { projectId: PROJECT_ID, name });
  }
  return fetchFields().get(name);
}

console.log("1. Configuring Iteration 0 (Foundation) & custom Roadmap fields on Project #3...");
let fields = fetchFields();
ensureFinishedIteration(fields);
ensureField(fields, "Start date", "DATE");
ensureField(fields, "Target date", "DATE");
ensureField(fields, "Phase", "SINGLE_SELECT", [
  { name: "Phase 0", color: "GRAY" },
  { name: "Phase 1", color: "GRAY" },
  { name: "Phase 1B", color: "RED" },
  { name: "Phase 2A", color: "GRAY" },
  { name: "Phase 2B", color: "ORANGE" },
  { name: "Phase 2C", color: "YELLOW" },
  { name: "Phase 3A", color: "GRAY" },
  { name: "Phase 3B", color: "BLUE" },
  { name: "Phase 3C", color: "BLUE" },
  { name: "Phase 4A", color: "PURPLE" },
  { name: "Phase 4B", color: "PURPLE" },
  { name: "Phase 4C", color: "PURPLE" },
  { name: "Phase 5", color: "GREEN" },
  { name: "Phase 5A", color: "GREEN" },
  { name: "Phase 5B", color: "GREEN" },
  { name: "Phase 5C", color: "GREEN" },
  { name: "Phase 5D", color: "GREEN" },
]);
ensureField(fields, "Track", "SINGLE_SELECT", [
  { name: "Track 1: Governance", color: "PURPLE" },
  { name: "Track 2: UI Libraries", color: "BLUE" },
  { name: "Track 3: Pure Utils", color: "GREEN" },
  { name: "Track 4: Data-Access", color: "ORANGE" },
  { name: "Track 5: Microservices & ML", color: "YELLOW" },
  { name: "Track 6: Flagship Apps", color: "PINK" },
]);
fields = fetchFields();

const fieldOptionId = (fieldName, optionName) => {
  const f = fields.get(fieldName);
  if (!f || !optionName) return null;
  if (f.options) return f.options.find((o) => o.name === optionName)?.id ?? null;
  const allIters = [
    ...(f.configuration?.completedIterations ?? []),
    ...(f.configuration?.iterations ?? []),
  ];
  return allIters.find((i) => i.title === optionName)?.id ?? null;
};

function updateField(itemId, fieldName, valueLiteral) {
  const f = fields.get(fieldName);
  if (!f) return;
  gql(`mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value: { ${valueLiteral} }
    }) { projectV2Item { id } }
  }`, { projectId: PROJECT_ID, itemId, fieldId: f.id });
}

console.log(`2. Syncing ${ITEMS.length} Agile issues & Roadmap fields...`);
for (const item of ITEMS) {
  const res = gql(`mutation($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item { id }
    }
  }`, { projectId: PROJECT_ID, contentId: item.node_id });
  const itemId = res.addProjectV2ItemById.item.id;

  const statusId = fieldOptionId("Status", item.status);
  if (statusId) updateField(itemId, "Status", `singleSelectOptionId: "${statusId}"`);

  const priorityId = fieldOptionId("Priority", item.priority);
  if (priorityId) updateField(itemId, "Priority", `singleSelectOptionId: "${priorityId}"`);

  const sizeId = fieldOptionId("Size", item.size);
  if (sizeId) updateField(itemId, "Size", `singleSelectOptionId: "${sizeId}"`);

  if (typeof item.estimate === "number") updateField(itemId, "Estimate", `number: ${item.estimate}`);

  const phaseId = fieldOptionId("Phase", item.phase);
  if (phaseId) updateField(itemId, "Phase", `singleSelectOptionId: "${phaseId}"`);

  const trackId = fieldOptionId("Track", item.track);
  if (trackId) updateField(itemId, "Track", `singleSelectOptionId: "${trackId}"`);

  const iterId = fieldOptionId("Iteration", item.iteration);
  if (iterId) updateField(itemId, "Iteration", `iterationId: "${iterId}"`);

  if (item.startDate) updateField(itemId, "Start date", `date: "${item.startDate}"`);
  if (item.targetDate) updateField(itemId, "Target date", `date: "${item.targetDate}"`);

  console.log(`  ✓ #${item.number} [${item.status} | ${item.iteration ?? "Unscheduled"} | ${item.estimate ?? "-"}pt] ${item.title}`);
}

console.log("\nDone! All 85 Agile items synced to Project #3.");
console.log("  • Current iteration board: https://github.com/users/sukrutsathaye/projects/3/views/1");
console.log("  • Roadmap timeline:        https://github.com/users/sukrutsathaye/projects/3/views/4");
