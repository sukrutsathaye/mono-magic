# `proto-ui-contracts` (`libs/ui/proto-ui-contracts`)

> Canonical **Protocol Buffers v3** UI contracts for shared design tokens, enums, and the language-agnostic **XYFlow `PageGraph` AST** (`monomagic.ui.v1`), keeping `scope:ui` strictly isolated from `scope:data-access`.

- **Nx Project**: `proto-ui-contracts`
- **Tags**: `scope:ui`, `type:interfaces`, `lang:proto`

---

## Official Documentation & References

| Topic / Technology | Reference | Why It Is Used Here |
| :--- | :--- | :--- |
| **Atomic Design** | [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/) | Defines the `AtomicTier` (`ATOM`, `MOLECULE`, `ORGANISM`, `TEMPLATE`) hierarchy modeled in `page_graph.proto`. |
| **Protocol Buffers v3** | [Protobuf v3 Language Guide](https://protobuf.dev/programming-guides/proto3/) | Canonical schema language for language-agnostic enums, tokens, and serializable `PageGraphDocument` ASTs. |
| **Buf v2 CLI** | [Buf Documentation](https://buf.build/docs/) | Enforces `STANDARD` lint rules (`v1` package versioning via `PACKAGE_VERSION_SUFFIX`), `FILE` breaking checks, and deterministic codegen. |
| **Protobuf-ES** | [`@bufbuild/protobuf` & `protoc-gen-es`](https://github.com/bufbuild/protobuf-es) | Offline-safe TypeScript code generation wired into `libs/ui/atomic-design-interfaces/src/gen`. |
| **XYFlow** | [XYFlow / React Flow Docs](https://reactflow.dev/) | Visual node-and-edge canvas engine consuming `PageGraphDocument` for the Flow UI Builder. |

---

## Language Codegen Commands & Output Map

All codegen runs **100% locally and offline-safe**:

```bash
# Lint all UI .proto schemas against Buf STANDARD rules
pnpm nx lint proto-ui-contracts

# Check backward compatibility against main
pnpm nx breaking proto-ui-contracts

# Generate TypeScript wire types directly into libs/ui/atomic-design-interfaces/src/gen
pnpm nx run proto-ui-contracts:generate
```

| Target Language | Generator Plugin | Output Directory | Workspace Package & Consumers |
| :--- | :--- | :--- | :--- |
| **TypeScript** | `protoc-gen-es` (`@bufbuild/protoc-gen-es`) | `libs/ui/proto-ui-contracts/generated/ts/` | `@mono-magic/proto-ui-contracts` (consumed by `@mono-magic/atomic-design-interfaces/proto`) |
| **Dart / Kotlin / Rust** *(Planned)* | `protoc-gen-dart` / `protoc-gen-kotlin` / `prost` | `libs/ui/proto-ui-contracts/generated/<lang>/` | `fl-mat`, `kt-compose`, `rs-design-tokens` |

---

## Schema Catalog

| Proto File | Package | Key Symbols |
| :--- | :--- | :--- |
| `proto/monomagic/ui/v1/tokens.proto` | `monomagic.ui.v1` | `MagicColor`, `MagicSize`, `MagicAppearance`, `UiFramework`, `DesignSystem`, `DesignTokenSet` |
| `proto/monomagic/ui/v1/page_graph.proto` | `monomagic.ui.v1` | `AtomicTier`, `CanvasPosition`, `SlotBinding`, `ComponentNode`, `PageNode`, `NavigationEdge`, `PageGraphDocument` |

---

<!-- COVERAGE_TABLE_START -->
## Schema Validation & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever schemas or tests change.

| Project | Validator / Runner | Schemas | Lint Gate | Breaking-Change Gate | Status |
| --- | --- | --- | --- | --- | --- |
| `proto-ui-contracts` | Buf (`buf lint` & `buf breaking`) | 2 `.proto` contracts | `buf lint` (100%) | `buf breaking` | Passing |
<!-- COVERAGE_TABLE_END -->
