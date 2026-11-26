# `proto-contracts` (`libs/data-access/proto-contracts`)

> Canonical **Protocol Buffers v3** wire contracts for `mono-magic`'s polyglot data-access layer, validated with [`@bufbuild/buf`](https://buf.build/) (`v2`) and compiled **offline-safe** directly into language interface libraries.

- **Nx Project**: `proto-contracts`
- **Tags**: `scope:data-access`, `type:interfaces`, `lang:proto`

---

## Official Documentation & References

| Topic / Technology | Reference | Why It Is Used Here |
| :--- | :--- | :--- |
| **Protocol Buffers v3** | [Protobuf v3 Language Guide](https://protobuf.dev/programming-guides/proto3/) | Canonical schema definition language for vendor-agnostic wire DTOs, enums, and RPC envelopes. |
| **Buf v2 CLI** | [Buf Documentation](https://buf.build/docs/) | Enforces `STANDARD` lint rules (including `v1` major-version package suffixes via `PACKAGE_VERSION_SUFFIX`) and `FILE` backward-compatibility checks. |
| **Protobuf-ES** | [`@bufbuild/protobuf` & `protoc-gen-es`](https://github.com/bufbuild/protobuf-es) | Local, offline-safe TypeScript ES + `.d.ts` generator wired directly into `libs/data-access/ts-interfaces/src/gen`. |
| **Python Protobuf (`grpcio-tools`)** | [Protocol Buffers Python Reference](https://protobuf.dev/reference/python/) | Local, offline-safe Python `*_pb2.py` + `*_pb2.pyi` stub generator wired directly into `libs/data-access/py-interfaces/src/py_data_access_interfaces/gen`. |

---

## Language Codegen Commands & Output Map

All codegen runs **100% locally and offline-safe** (zero external Buf Schema Registry network dependency required in CI):

```bash
# 1. Lint all Protobuf schemas against Buf STANDARD rules
pnpm nx lint proto-contracts

# 2. Check backward compatibility against main
pnpm nx breaking proto-contracts

# 3. Generate real TypeScript & Python wire types directly into ts-interfaces and py-interfaces
# Note: use `nx run proto-contracts:generate` (not `nx generate`, which invokes Nx schematic generators)
pnpm nx run proto-contracts:generate
```

| Target Language | Generator Plugin / Tool | Output Directory | Workspace Package & Consumers |
| :--- | :--- | :--- | :--- |
| **TypeScript** | `protoc-gen-es` (`@bufbuild/protoc-gen-es`) | `libs/data-access/proto-contracts/generated/ts/` | `@mono-magic/proto-contracts` (consumed by `@mono-magic/data-access-ts-interfaces/proto`) |
| **Python** | `uv run --package py-data-access-interfaces python -m grpc_tools.protoc` (`--python_out` + `--pyi_out`) | `libs/data-access/proto-contracts/generated/py/` | `py-proto-contracts` (consumed by `py-data-access-interfaces.proto`) |
| **Kotlin / Java / Go / Rust / Dart** *(Extensible)* | `protoc-gen-kotlin` / `protoc-gen-go` / `prost` / `protoc-gen-dart` | `libs/data-access/proto-contracts/generated/<lang>/` | Added as each language interface library is scaffolded |

> **Why `v1` in package names?** Buf's `STANDARD` lint rule (`PACKAGE_VERSION_SUFFIX`) requires major-version suffixes (`monomagic.common.v1`, `monomagic.ai.v1`) so future breaking schema evolutions can ship cleanly under `v2` without breaking existing `v1` consumers.

---

## Schema Catalog

| Proto File | Package | Key Symbols |
| :--- | :--- | :--- |
| `proto/monomagic/common/v1/errors.proto` | `monomagic.common.v1` | `ErrorCode`, `DataAccessError` |
| `proto/monomagic/common/v1/pagination.proto` | `monomagic.common.v1` | `SortDirection`, `SortSpec`, `FilterOperator`, `FilterSpec`, `QuerySpec`, `PageInfo` |
| `proto/monomagic/auth/v1/auth.proto` | `monomagic.auth.v1` | `OAuthProvider`, `UserClaims`, `AuthSession`, `SignInRequest` |
| `proto/monomagic/storage/v1/storage.proto` | `monomagic.storage.v1` | `StorageObjectMeta`, `SignedUrlResponse` |
| `proto/monomagic/realtime/v1/realtime.proto` | `monomagic.realtime.v1` | `RealtimeEnvelope`, `PresenceState` |
| `proto/monomagic/payments/v1/payments.proto` | `monomagic.payments.v1` | `Money`, `PaymentStatus`, `PaymentIntent` |
| `proto/monomagic/cache/v1/cache.proto` | `monomagic.cache.v1` | `CacheEntry`, `LockLease`, `CacheStats` |
| `proto/monomagic/ai/v1/ai.proto` | `monomagic.ai.v1` | `ChatRole`, `ChatMessage`, `LLMCompletionRequest`, `LLMCompletionResponse`, `EmbeddingVector`, `VectorSearchResult`, `AgentGraphRun` |
| `proto/monomagic/reflective/v1/reflective.proto` | `monomagic.reflective.v1` | `ContentSourceType`, `BloomLevel`, `TopicRecord`, `McqQuestion`, `SubjectiveGradeResult` |

---

<!-- COVERAGE_TABLE_START -->
## Schema Validation & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever schemas or tests change.

| Project | Validator / Runner | Schemas | Lint Gate | Breaking-Change Gate | Status |
| --- | --- | --- | --- | --- | --- |
| `proto-contracts` | Buf (`buf lint` & `buf breaking`) | 6 `.proto` contracts | `buf lint` (100%) | `buf breaking` | Passing |
<!-- COVERAGE_TABLE_END -->
