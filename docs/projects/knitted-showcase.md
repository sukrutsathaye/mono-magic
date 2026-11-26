# Project Blueprint: Artisanal Hand-Knitted Showcase & Ordering Platform (`Phase 5B`)

- **Status**: `Blueprint Approved — Scheduled for Phase 5B`
- **Target Phases**: `Phase 2C, Phase 3C, Phase 4C, Phase 5B`
- **Primary Domains**: `libs/utils/ts-formatters`, `libs/data-access/ts-supabase`, `libs/data-access/kt-spring-boot`, `libs/ui/*`, `apps/knitted-showcase-web`, `apps/knitted-showcase-mobile`, `apps/api-commerce-core`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: Independent hand-knitting artisans lack a tailored e-commerce experience that handles custom yarn weights, color palettes, bespoke body measurements, and transparent multi-stage crafting status tracking (*Yarn Selected → In Knitting → Blocking & QC → Shipped*).
- **Core Objectives**:
  - Curated storefront showcasing hand-knitted garments/accessories with high-res galleries, yarn composition tags, and verified customer reviews.
  - Interactive custom order studio (yarn material, color swatches, gauge/size converters powered by `@mono-magic/utils-ts-formatters`).
  - Pluggable backend demonstrating `mono-magic`'s **BaaS-to-Enterprise swapability**: runs seamlessly on **`ts-supabase`** for lean solo-artisan deployments OR **`kt-spring-boot` (`apps/api-commerce-core` + Keycloak + Postgres + MinIO)** for enterprise scale via identical `ts-interfaces`.
- **Target Personas & Roles**:
  - **Buyer**: Browses showcase, customizes garment, checks out via `IPaymentProvider`, tracks live crafting milestones.
  - **Artisan / Maker**: Publishes catalog pieces, updates crafting status with progress photos, manages custom order queue.
- **Non-Goals / Out of Scope**:
  - Multi-vendor marketplace payouts or automated third-party warehouse 3PL integrations in v1.

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Web Storefront (`vue-vuetify` or `ng-mat`)**: `vue-vuetify` gives crisp SFC iteration and Material 3 polish for a rich visual storefront (while `ng-mat` is ideal if paired with a structured enterprise artisan admin console).
- **Mobile Companion (`rn-paper` — Expo)**: Shares 100% TypeScript `@mono-magic/utils-ts-formatters` & `ts-interfaces` with web, ideal for buyers tracking orders and artisans snapping quick knitting progress photos.
- **Backend (`ts-supabase` ↔ `kt-spring-boot` swap)**: Proves `IDataRepository`, `IAuthProvider`, `IStorageProvider`, and `IPaymentProvider` LSP swapability between a rapid Postgres BaaS and an enterprise Kotlin/Spring Boot 3 + Keycloak + MinIO transactional core.

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/utils/ts-formatters` | `utils-ts-formatters` | `scope:utils`, `type:util`, `lang:ts` | Currency/tax, yarn weight/length/gauge converters, clothing size calculators |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | `payments/v1/payments.proto`, `commerce/v1/order.proto` |
| `libs/data-access/ts-supabase` | `data-access-ts-supabase` | `scope:data-access`, `type:data-access`, `lang:ts` | Default solo-artisan Postgres/Auth/Storage provider |
| `libs/data-access/kt-spring-boot` | `data-access-kt-spring-boot` | `scope:data-access`, `type:data-access`, `lang:kotlin` | Enterprise Keycloak + Postgres/Flyway + MinIO provider |
| `libs/features/ts-commerce` | `features-ts-commerce` | `scope:features`, `type:feature`, `lang:ts` | Cart state, customization pricing rules, order status state machine |
| `libs/ui/*` | `vue-vuetify`, `ng-mat`, `rn-paper`, `atomic-design-interfaces` | `scope:ui` | `MagicProductCatalogGrid`, `MagicCartDrawer`, `MagicCheckoutForm`, `MagicStorefrontTemplate` |
| `apps/knitted-showcase-web` | `knitted-showcase-web` | `scope:app`, `type:app`, `lang:ts` | Web storefront & artisan order tracker |
| `apps/knitted-showcase-mobile` | `knitted-showcase-mobile` | `scope:app`, `type:app`, `lang:ts` | Expo + `rn-paper` mobile storefront & artisan photo uploader |
| `apps/api-commerce-core` | `api-commerce-core` | `scope:app`, `type:app`, `lang:kotlin` | Optional Spring Boot 3 enterprise commerce API |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `libs/features/ts-commerce` depends strictly on `IDataRepository`, `IStorageProvider`, and `IPaymentProvider` — zero Supabase or Spring Boot imports.
  - Crafting status transitions enforced by a pure finite state machine (`YARN_SELECTED → IN_KNITTING → BLOCKING_QC → SHIPPED → DELIVERED`).
- **Performance & Concurrency Design**:
  - Optimistic cart updates; signed CDN/MinIO image URLs with responsive thumbnails; idempotency keys on checkout payment intents.
- **Security & Secret Hygiene**:
  - Payment secrets live strictly server-side; signed webhook verification; strict buyer-scoped RLS on orders.

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf**: `ProductItem`, `YarnSpec`, `CustomMeasurementSpec`, `OrderRecord`, `CraftingMilestone`, `PaymentIntent`.
- **APIs**: OpenAPI/Swagger (`api-commerce-core`) or PostgREST (`ts-supabase`) + payment webhook endpoint.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `Card`, `Chip`, `Rating`, `Badge`, `Button`, `SearchBar`, `Select`, `Pagination`, `Stepper`, `Accordion`, `Dialog`, `Tabs`, `FormField`, `RadioButton`.
- **New Organisms & Templates**: `MagicProductCatalogGrid`, `MagicCartDrawer`, `MagicCheckoutForm`, `MagicStorefrontTemplate`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on `utils-ts-formatters` & pricing/state-machine logic; `>=80%` on UI organisms, `ts-commerce`, and backend adapters.
- **Contract Compliance**: Identical `runDataRepositoryContractTests` + `runPaymentProviderContractTests` run against both `ts-supabase` and `api-commerce-core`.
- **E2E**: Playwright browse → customize yarn/size → checkout → artisan status update → buyer milestone view.

---

## 7. Phased Milestones

1. **Milestone 1 — Commerce Contracts & Feature Core**: Add `order.proto`, `IPaymentProvider` Stripe/mock adapter, and `libs/features/ts-commerce`.
2. **Milestone 2 — E-Commerce UI Organisms**: Ship `ProductCatalogGrid`, `CartDrawer`, `CheckoutForm`, and `StorefrontTemplate`.
3. **Milestone 3 — Enterprise Kotlin Spring Boot Option**: Build `apps/api-commerce-core` (Keycloak + Postgres + MinIO).
4. **Milestone 4 — Web & Mobile Storefront Assembly**: Assemble `knitted-showcase-web` + `knitted-showcase-mobile` with Playwright & mobile E2E.
