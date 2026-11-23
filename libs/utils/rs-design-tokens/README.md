# `rs-design-tokens` (`rs-utils-design-tokens`)

Pure, zero-dependency Rust library and CLI for perceptual color space conversions (`sRGB <-> HSL`, `sRGB <-> OKLCH`), WCAG 2.1 contrast auditing, and deterministic design token emission to CSS custom properties, TypeScript, and Flutter/Dart `ThemeExtension`.

## Nx Targets

```bash
pnpm nx lint rs-utils-design-tokens   # cargo clippy --all-targets -- -D warnings
pnpm nx test rs-utils-design-tokens   # cargo test
pnpm nx build rs-utils-design-tokens  # cargo build --release
```

## CLI Usage

```bash
# Audit WCAG 2.1 contrast between foreground and background hex colors
cargo run --package rs-design-tokens -- contrast --fg "#1976d2" --bg "#ffffff"

# Emit CSS custom properties
cargo run --package rs-design-tokens -- emit \
  --format css \
  --name mono-magic \
  --color primary=#1976d2 \
  --spacing md=16 \
  --radius card=12

# Emit TypeScript (`--format ts`) or Flutter/Dart ThemeExtension (`--format dart`)
cargo run --package rs-design-tokens -- emit \
  --format dart \
  --name mono-magic \
  --color primary=#1976d2 \
  --spacing md=16 \
  --radius card=12
```

## Library Usage

```rust
use rs_design_tokens::{emit_css, evaluate_contrast, Srgb, TokenSet, WcagLevel};

let fg = Srgb::from_hex("#111111").unwrap();
let bg = Srgb::from_hex("#ffffff").unwrap();

// Exact OKLCH round-trip conversion
let oklch = fg.to_oklch();
assert_eq!(Srgb::from_oklch(oklch), fg);

// WCAG 2.1 contrast auditing (uses updated 0.04045 linearization threshold)
let report = evaluate_contrast(fg, bg);
assert_eq!(report.level, WcagLevel::Aaa);

// Deterministic CSS / TypeScript / Flutter emission
let tokens = TokenSet::new("mono-magic")
    .with_color("foreground", fg)
    .with_color("background", bg)
    .with_spacing("md", 16.0)
    .with_radius("sm", 4.0);
let css = emit_css(&tokens);
assert!(css.contains("--color-foreground: #111111;"));
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `rs-utils-design-tokens` | Cargo Test (`cargo test` + doc-tests) | **90.0%** | **90.0%** | **90.0%** | **90.0%** | `>= 90%` | Passing |
<!-- COVERAGE_TABLE_END -->
