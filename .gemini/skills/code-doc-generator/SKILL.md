---
name: code-doc-generator
description: >-
  Generates and audits thorough inline code documentation (TSDoc/JSDoc, Google-style
  Python docstrings, Dartdoc, Rustdoc, Godoc, Protobuf comments) for every written or
  modified symbol, and updates the owning package's libs/<domain>/<project>/README.md
  (architecture, component/API catalog tables, usage examples, and coverage summary).
---

# Code Documentation Generator Playbook

Use this skill whenever new code is written or existing code is modified in any package under `libs/*` or `apps/*`. No task is complete until every public symbol is documented in code and the package's own `README.md` reflects the change.

---

## 1. Per-Language Inline Documentation Standards

### A. TypeScript / JavaScript (`TSDoc` / `JSDoc`)
- **Required on**: Every exported `interface`, `type`, `enum`, `class`, React/Angular/Vue/Svelte component, custom hook, directive, constant, function, and interface property.
- **Format**:
  ```ts
  /**
   * Computes retry delay with exponential backoff and full jitter.
   *
   * @param attempt - Zero-based retry attempt index (`>= 0`).
   * @param options - Backoff configuration (`baseDelayMs`, `maxDelayMs`, `factor`).
   * @returns Computed wait duration in milliseconds.
   *
   * @example
   * ```ts
   * const delayMs = computeBackoffDelay(2, { baseDelayMs: 100, maxDelayMs: 5000 });
   * ```
   */
  ```
- For UI components (`libs/ui/*`), document which `@mono-magic/atomic-design-interfaces` contract the component implements, which lower-tier atoms it composes, and its Material 3 / WCAG accessibility semantics.

### B. Python (`Google-Style Docstrings`)
- **Required on**: Every module (top-of-file docstring), public `class`, `typing.Protocol`, `@dataclass`, Pydantic `BaseModel` (plus `Field(..., description="...")`), and public function/method.
- **Format**:
  ```python
  """Module summary explaining domain responsibility and architectural boundary."""


  def segment_sentences(text: str, *, min_words: int = 3) -> list[str]:
      """Splits raw text into normalized sentences filtered by minimum word count.

      Args:
          text: Raw input passage to segment.
          min_words: Minimum words required to retain a sentence.

      Returns:
          Immutable list of cleaned sentence strings in document order.

      Raises:
          ValueError: If `min_words` is less than 1.
      """
  ```

### C. Flutter / Dart (`Dartdoc ///`)
- **Required on**: Every `library;` directive, public `StatelessWidget` / `StatefulWidget`, model class, `enum` (and every enum value), typedef, public method, and constructor field.
- **Format**: Use `///` with square-bracket symbol references (e.g., `/// Renders a Material 3 [MagicDialog] composing [MagicButton] actions.`). Never use `/** ... */` block comments in Dart.

### D. Rust (`Rustdoc //!` and `///`)
- **Required on**: Crate/module headers (`//!`), every `pub struct`, `pub enum`, `pub trait`, struct field, enum variant, and `pub fn`.
- **Format**:
  - Include `# Examples` with compilable code blocks (verified automatically by `cargo test --doc`).
  - Include `# Errors` on any function returning `Result<T, E>` and `# Panics` if any invariant can panic.

### E. Go (`Godoc //`)
- **Required on**: Package header (`// Package <name> provides ...`) and every exported type, struct field, constant, and function.
- **Format**: Every doc comment MUST start with the exact name of the exported identifier (e.g., `// RetryWithBackoff executes fn until it succeeds or ctx is canceled.`).

### F. Protobuf (`libs/data-access/proto-contracts`)
- **Required on**: Every `service`, `rpc`, `message`, `enum`, enum value, and message field using leading `//` comments so `buf lint` passes with zero comment warnings.

---

## 2. Per-Package `libs/<domain>/<project>/README.md` Standard

Every library under `libs/<domain>/<project>/` and application under `apps/<app>/` MUST maintain a detailed `README.md` containing:

1. **Title & Architectural Summary**:
   - Package name, Nx project name, domain tags (`scope:*`, `type:*`, `lang:*`), and responsibility boundary.
2. **Component Catalog or Public API Table**:
   - For `libs/ui/*`: Complete tables of all implemented **Atoms**, **Molecules**, **Organisms**, and **Templates** with contract interface names and concise descriptions.
   - For `libs/utils/*` and `libs/data-access/*`: Complete table/list of exported modules, interfaces/protocols, structs/classes, and functions.
3. **Nx Targets & Commands**:
   - Copy-pasteable `pnpm nx lint <project>`, `pnpm nx typecheck <project>`, `pnpm nx test <project>`, and showcase commands.
4. **Test & Coverage Summary Table** (`<!-- COVERAGE_TABLE_START -->` ... `<!-- COVERAGE_TABLE_END -->`):
   - Automatically updated via `node tools/ci/sync-readmes-and-coverage.mjs` whenever functions or tests are added/modified:
     | Metric | Coverage / Value | Threshold | Status |
     | --- | --- | --- | --- |
5. **Usage Examples**:
   - Idiomatic, copy-pasteable code snippets demonstrating real composition, error handling (`Result<T, E>`), and theming/DI wiring.

---

## 3. Execution Checklist for the Doc Generator

1. Inspect all newly created or modified source files in `git diff`.
2. Add or update inline doc comments (`TSDoc`, `Google docstrings`, `Dartdoc`, `Rustdoc`, `Godoc`, `Proto`) for every public symbol.
3. Update the package's `libs/<domain>/<project>/README.md` with any new components, modules, functions, or usage examples.
4. Run `node tools/ci/sync-readmes-and-coverage.mjs` to refresh the package's `## Test & Coverage Summary` table.
5. Run `pnpm nx lint <project>` (and `cargo test --doc` for Rust) to verify doc formatting and doc-tests pass.
