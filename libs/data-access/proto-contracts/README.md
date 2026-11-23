# `proto-contracts` (`libs/data-access/proto-contracts`)

Canonical **Protocol Buffers v3** wire contracts for `mono-magic`'s polyglot data-access layer, validated with [`@bufbuild/buf`](https://buf.build/) (`v2` configuration).

## Purpose & Architecture

`proto-contracts` is the wire-level source of truth in `mono-magic`'s **Hybrid `buf` + Idiomatic Language Traits** architecture:

- Defines vendor-agnostic wire DTOs, error envelopes, query/pagination specs, authentication claims/sessions, storage metadata, realtime pub/sub envelopes, and payment intents.
- Mirrored by idiomatic language trait libraries:
  - TypeScript: [`@mono-magic/data-access-ts-interfaces`](../ts-interfaces) (`libs/data-access/ts-interfaces`)
  - Python: [`py-data-access-interfaces`](../py-interfaces) (`libs/data-access/py-interfaces`)
- Nx tags: `scope:data-access`, `type:interfaces`, `lang:proto`.

## Directory Layout

```text
libs/data-access/proto-contracts/
├── buf.yaml                                  # Buf v2 module, STANDARD lint, FILE breaking rules
├── buf.gen.yaml                              # Buf v2 managed code-generation template
├── project.json                              # Nx targets: lint, breaking, generate
├── README.md
└── proto/
    └── monomagic/
        ├── common/v1/
        │   ├── errors.proto                  # ErrorCode, DataAccessError
        │   └── pagination.proto              # SortDirection, SortSpec, FilterOperator, FilterSpec, QuerySpec, PageInfo
        ├── auth/v1/
        │   └── auth.proto                    # OAuthProvider, UserClaims, AuthSession, SignInRequest
        ├── storage/v1/
        │   └── storage.proto                 # StorageObjectMeta, SignedUrlResponse
        ├── realtime/v1/
        │   └── realtime.proto                # RealtimeEnvelope, PresenceState
        └── payments/v1/
            └── payments.proto                # Money, PaymentStatus, PaymentIntent
```

## Nx Targets & Usage

```bash
# Lint all Protobuf schemas against Buf STANDARD rules
pnpm nx lint proto-contracts

# Check backward compatibility against main (skips cleanly until main contains baseline .proto schemas)
pnpm nx breaking proto-contracts

# Validate compilation & run Buf codegen template (buf.gen.yaml)
# Note: use `nx run proto-contracts:generate` (not `nx generate`, which invokes Nx schematic generators)
pnpm nx run proto-contracts:generate
```

### Enabling Language Stub Generation

`buf.gen.yaml` ships with `plugins: []` so `pnpm nx run proto-contracts:generate` validates compilation deterministically offline without requiring external BSR access or local `protoc-gen-*` binaries. To emit language stubs (TypeScript, Python, Java, Dart), uncomment or add plugins under `plugins:` in `buf.gen.yaml` and output into `../../../dist/libs/data-access/proto-contracts/<lang>`.

---

<!-- COVERAGE_TABLE_START -->
## Schema Validation & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever schemas or tests change.

| Project | Validator / Runner | Schemas | Lint Gate | Breaking-Change Gate | Status |
| --- | --- | --- | --- | --- | --- |
| `proto-contracts` | Buf (`buf lint` & `buf breaking`) | 6 `.proto` contracts | `buf lint` (100%) | `buf breaking` | Passing |
<!-- COVERAGE_TABLE_END -->
