---
name: rust-go-systems
description: >-
  Standards and runbook for developing Rust crates (libs/*/rs-*, apps/*) and Go modules
  (libs/*/go-*, apps/*) inside mono-magic's Cargo and Go workspaces, covering Nx targets,
  strict linting (clippy -D warnings, go vet), FFI/WASM readiness (#[repr(C)]),
  error handling, unit/doc testing, and coverage reporting.
---

# Rust & Go Systems Engineering Runbook

Use this skill whenever creating, extending, or reviewing any Rust crate (`libs/*/rs-*`, `apps/*`) or Go module (`libs/*/go-*`, `apps/*`) in `mono-magic`. Follow [engineering-standards](../engineering-standards/SKILL.md) alongside this runbook.

---

## 1. Rust Workspace Standards (`Cargo.toml`)

Root [Cargo.toml](../../../Cargo.toml) manages all Rust crates in a unified workspace:

```toml
[workspace]
resolver = "2"
members = [
  "libs/utils/rs-pose-math",
  "libs/utils/rs-design-tokens",
]
```

### A. Naming, Tagging & Architecture
- **Directory**: `libs/<domain>/rs-<name>` (e.g., `libs/utils/rs-pose-math`, `libs/utils/rs-design-tokens`).
- **Nx Project Name**: `rs-<domain>-<name>` (e.g., `rs-utils-pose-math`) with tags `["scope:<domain>", "type:<type>", "lang:rust"]`.
- **FFI / WebAssembly Readiness**:
  - Mark core numeric/data structs (`Vec2`, `Vec3`, `Landmark`, token structs) with `#[repr(C)]` and `#[derive(Debug, Clone, Copy, PartialEq)]` so they can be shared zero-copy across C-ABI FFI, Python (`PyO3`), Flutter (`flutter_rust_bridge`), and WebAssembly (`wasm-bindgen`).
- **Safety & Error Handling**:
  - Zero `unwrap()` or `expect()` in production library code (`src/*.rs` outside `#[cfg(test)]`).
  - Return explicit typed `Result<T, <Domain>Error>` or `Option<T>` for invalid inputs, division by zero, or non-finite floats (`!val.is_finite()`).

### B. Required Nx Targets (`project.json`)
```json
{
  "name": "rs-utils-pose-math",
  "projectType": "library",
  "sourceRoot": "libs/utils/rs-pose-math/src",
  "tags": ["scope:utils", "type:util", "lang:rust"],
  "targets": {
    "lint": {
      "command": "cargo clippy -p rs-pose-math --all-targets -- -D warnings && cargo fmt -p rs-pose-math -- --check"
    },
    "test": {
      "command": "cargo test -p rs-pose-math"
    },
    "build": {
      "command": "cargo build -p rs-pose-math --release"
    }
  }
}
```

---

## 2. Go Workspace Standards (`go.work`)

Root [go.work](../../../go.work) links all Go modules (`go 1.24+`):

```go
go 1.24.0

use (
	./libs/utils/go-core
)
```

### A. Naming, Tagging & Architecture
- **Directory**: `libs/<domain>/go-<name>` (e.g., `libs/utils/go-core`).
- **Nx Project Name**: `go-<domain>-<name>` (e.g., `go-utils-core`) with tags `["scope:<domain>", "type:<type>", "lang:go"]`.
- **Clean Go Idioms**:
  - Propagate `context.Context` as the first parameter for any cancellable, timed, or I/O-bound operation (`Retry`, worker pools, RPC handlers).
  - Return explicit typed/sentinel errors (`errors.New`, `fmt.Errorf("...: %w", err)`) inspectable via `errors.Is` and `errors.As`.
  - Ensure concurrency safety (`sync.RWMutex`, channels, atomic primitives) and verify every package with `go test -race`.

### B. Required Nx Targets (`project.json`)
```json
{
  "name": "go-utils-core",
  "projectType": "library",
  "sourceRoot": "libs/utils/go-core",
  "tags": ["scope:utils", "type:util", "lang:go"],
  "targets": {
    "lint": {
      "command": "cd libs/utils/go-core && go vet ./... && test -z \"$(gofmt -l .)\""
    },
    "test": {
      "command": "cd libs/utils/go-core && go test -v -race -coverprofile=coverage.out ./..."
    },
    "build": {
      "command": "cd libs/utils/go-core && go build ./..."
    }
  }
}
```

---

## 3. Documentation & Coverage Gates

1. Document every exported Rust symbol with `///` (including `# Examples` tested via `cargo test --doc`) and every exported Go symbol with `// <Identifier> ...` Godoc comments.
2. Maintain `>=90%` unit test coverage for `libs/utils/{rs-*,go-*}` and `>=80%` for `libs/data-access/{rs-*,go-*}` and `apps/*`.
3. After adding or modifying functions or tests, run `node tools/ci/sync-readmes-and-coverage.mjs` to update the crate/module `README.md` and root `README.md` coverage tables.
