# Milestone M3 Scope & File Ownership Plan

## Exclusive Owned Scope (M3 Total)
- Root files:
  - `package.json` (add `@bufbuild/buf` devDependency)
  - `pnpm-lock.yaml`
  - `tsconfig.base.json`
  - `tsconfig.json`
  - `pyproject.toml` (only add `[dependency-groups] dev` if needed — preserve `[tool.uv.workspace] members = ["apps/api-*", "libs/*/py-*"]`)
  - `uv.lock`
- `libs/utils/ts-core/*` (F9)
- `libs/data-access/proto-contracts/*` (F10)
- `libs/data-access/ts-interfaces/*` (F11)
- `libs/data-access/py-interfaces/*` (F12)

## Stage Decomposition (Prevents Lockfile / Tsconfig / Workspace Races)

### Stage 0 — Baseline Exploration (1x `flash` Explorer)
- Inspect existing directory state (`libs/`, `.npmrc`, `libs/ui/*` configs, git status/branches), verify pnpm strict dependency rules for `vitest` / `@bufbuild/buf`, check `buf.build` reachability & `uv` workspace config details.

### Stage 1 — Foundation Utils & Protobuf Wire Contracts (1x `pro` Worker)
- Exclusive file ownership:
  - `package.json`, `pnpm-lock.yaml`
  - `tsconfig.base.json` (add `@mono-magic/utils-ts-core`)
  - `tsconfig.json` (add `./libs/utils/ts-core`)
  - `libs/utils/ts-core/*` (F9)
  - `libs/data-access/proto-contracts/*` (F10)
- Runs `pnpm add -D -w @bufbuild/buf`, `pnpm install`, `pnpm nx lint proto-contracts`, and `pnpm nx run-many -t lint typecheck test -p utils-ts-core -- --coverage`.

### Stage 2 — Idiomatic Polyglot Contracts & Compliance Suites (2x parallel `pro` Workers with ZERO file overlap)
- **Worker 2A (`ts-interfaces`, `pro`)**:
  - Exclusive file ownership:
    - `libs/data-access/ts-interfaces/*` (F11)
    - `tsconfig.base.json` (add `@mono-magic/data-access-ts-interfaces` & `@mono-magic/data-access-ts-interfaces/testing`)
    - `tsconfig.json` (add `./libs/data-access/ts-interfaces`)
    - `pnpm-lock.yaml` (via `pnpm install`)
  - Consumes Stage 1 read-only (`libs/utils/ts-core`, `libs/data-access/proto-contracts`).
- **Worker 2B (`py-interfaces`, `pro`)**:
  - Exclusive file ownership:
    - `libs/data-access/py-interfaces/*` (F12)
    - Root `pyproject.toml` (only adding `[dependency-groups] dev` if needed; preserve `members = ["apps/api-*", "libs/*/py-*"]`)
    - `uv.lock` (via `uv sync`)
  - Consumes Stage 1 read-only (`libs/data-access/proto-contracts`).

### Stage 3 — Parallel Verification Wave (All `flash` Verifiers)
Strictly after Stage 2 completes:
- **Reviewer 1 (Primary, `flash`)**: Full Track B uncached verification suite (`pnpm nx lint proto-contracts`, `pnpm nx run-many -t lint typecheck test -p utils-ts-core,data-access-ts-interfaces -- --coverage`, `uv sync`, `pnpm nx run-many -t lint typecheck test -p py-data-access-interfaces`) + code quality review.
- **Reviewer 2 (Secondary, `flash`)**: Target-scoped inspection & SOLID / TSDoc / Docstring / README / schema parity / boundary compliance review (no overlapping build/test runs against Reviewer 1).
- **Challenger 1 (`flash`)**: Isolated temp-dir adversarial probes (`mktemp -d`) testing TS `ts-core` + `ts-interfaces` edge cases, `AbortSignal`, `Result` immutability, boundary imports, compliance suite failure detection when given a buggy repository/auth adapter.
- **Challenger 2 (`flash`)**: Isolated temp-dir adversarial probes (`mktemp -d`) testing `proto-contracts` (`buf lint`, invalid proto detection, enum/field parity) and `py-interfaces` (Pydantic validation, frozen immutability, `Protocol` structural typing, compliance suite catching buggy provider implementations).
- **Forensic Auditor (`flash`)**: Non-skippable anti-cheating & authenticity verification + target-scoped checks (no coverage excludes, no mocked assertions, real tests, genuine SOLID design, zero `any` / suppressed lints).
