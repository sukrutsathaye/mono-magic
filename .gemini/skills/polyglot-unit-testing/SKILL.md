---
name: polyglot-unit-testing
description: >-
  Writes, audits, and executes comprehensive unit and contract compliance tests
  across TypeScript/JavaScript (Vitest V8 for Node, React 19, Angular 22, React Native Paper,
  Vue 3, Svelte 5), Python (uv / pytest / pytest-asyncio), Flutter/Dart (flutter_test),
  Rust (cargo test), and Go (go test -race -cover), enforcing >=80% standard coverage
  (>=90% for libs/utils/*) and syncing README coverage tables.
---

# Polyglot Unit Testing Playbook

Use this skill whenever writing, extending, or auditing unit tests for any library (`libs/*`) or application (`apps/*`) in `mono-magic`. Every code change MUST ship with comprehensive unit tests and updated coverage tables.

---

## 1. Mandatory Coverage Thresholds & Quality Rules

1. **Coverage Gates**:
   - **Pure Utilities (`libs/utils/*`)**: **`>= 90%`** across `lines`, `statements`, `functions`, and `branches`.
   - **UI, Data-Access, Features & Apps (`libs/ui/*`, `libs/data-access/*`, `libs/features/*`, `apps/*`)**: **`>= 80%`** across `lines`, `statements`, `functions`, and `branches`.
2. **What Every Unit Test Suite Must Cover**:
   - **Happy paths & default props/arguments**.
   - **All variants, modes, and state transitions** (controlled vs. uncontrolled, async loading, success, retry/recovery).
   - **Boundary & edge cases** (empty collections, `0`, negative numbers, `NaN`/`Infinity`, Unicode/whitespace strings, null/undefined optional fields, maximum bounds).
   - **Explicit error paths**: Verify `Result<T, E>` failure variants (`isErr()`, `ErrorCode`, `DataAccessError` mapping) without throwing untyped exceptions.
   - **Accessibility & keyboard semantics (UI)**: Verify ARIA roles, labels, `aria-disabled`, `aria-expanded`, `aria-invalid`, keyboard triggers (`Enter`, `Space`, `Escape`, `Arrow*`), and Flutter `Semantics`.
3. **Zero Gate Circumvention**:
   - Never lower coverage thresholds, skip tests (`it.skip`, `@pytest.mark.skip`), or exclude production source files from coverage globs.

---

## 2. Language & Framework Playbooks

### A. TypeScript — Pure Utils & Data-Access (`Vitest` + `@vitest/coverage-v8`)
- **Projects**: `atomic-design-interfaces`, `utils-ts-core`, `utils-ts-formatters`, `data-access-ts-interfaces`, `data-access-ts-firebase`, `data-access-ts-supabase`, `data-access-ts-reflective-api`
- **Conventions**:
  - Co-locate `*.spec.ts` alongside the source module under `src/lib/`.
  - For `libs/data-access/ts-*` concrete providers, **always** run the shared **Contract Compliance Test Suite** from `@mono-magic/data-access-ts-interfaces/testing` (`runAuthProviderContractTests`, `runDataRepositoryContractTests`, `runStorageProviderContractTests`, `runRealtimeProviderContractTests`) in addition to provider-specific unit tests (query mapper, error mapper, edge cases).
  - Use deterministic in-memory transports/fakes or `vi.fn()` spies; never make live network calls in unit tests.
- **Command**:
  ```bash
  pnpm nx test <project> -- --coverage
  ```

### B. React 19 + MUI v9 (`react-mui`) & React Native Paper (`rn-paper`)
- **Conventions**:
  - Co-locate `<component>.spec.tsx` inside `src/lib/<tier>/<component>/`.
  - Use `@testing-library/react` (`render`, `screen`, `fireEvent`, `userEvent`) wrapped in `MagicMuiThemeProvider` (for `react-mui`) or `MagicPaperProvider` (for `rn-paper`).
  - Test both **controlled** (`value` + `onChange`) and **uncontrolled** (`defaultValue`) modes, all visual variants/sizes/colors, `disabled` / `disabledInteractive` / `loading`, custom slots, and ref forwarding.
- **Command**:
  ```bash
  pnpm nx test react-mui -- --coverage
  pnpm nx test rn-paper -- --coverage
  ```

### C. Angular 22 + Angular Material (`ng-mat`)
- **Conventions**:
  - Co-locate `<component>.component.spec.ts` inside `src/lib/<tier>/<component>/`.
  - Use `TestBed.configureTestingModule({ imports: [Magic<Component>Component] })` via `@analogjs/vitest-angular`.
  - Set Signal inputs via `fixture.componentRef.setInput('propName', value)` followed by `fixture.detectChanges()`.
  - For form controls, include a host component test verifying `ControlValueAccessor` / `ReactiveFormsModule` (`FormControl` value sync, `disabled` state, touched/dirty transitions).
- **Command**:
  ```bash
  pnpm nx test ng-mat -- --coverage
  ```

### D. Vue 3 + Vuetify 3 (`vue-vuetify`) & Svelte 5 + Tailwind (`svelte-tw`)
- **Conventions**:
  - **`vue-vuetify`**: Mount components with `@vue/test-utils` (`mount(Magic<Component>, { props, slots })`) using the shared Vuetify test plugin setup. Assert emitted events via `wrapper.emitted()`.
  - **`svelte-tw`**: Render Svelte 5 components with `@testing-library/svelte` (`render(Magic<Component>, { props })`). Test callback props (`onclick`, `onchange`), reactive state updates, and ARIA attributes.
- **Command**:
  ```bash
  pnpm nx test vue-vuetify -- --coverage
  pnpm nx test svelte-tw -- --coverage
  ```

### E. Flutter / Dart (`fl-mat`)
- **Conventions**:
  - Place widget tests in `libs/ui/fl-mat/test/<tier>/<snake_name>_test.dart`.
  - Use `testWidgets`, wrapping the widget under test in `MaterialApp(home: Scaffold(body: ...))`.
  - Exercise taps (`tester.tap`), text entry (`tester.enterText`), drags, keyboard keys (`tester.sendKeyEvent`), and animations (`tester.pumpAndSettle()`).
  - Assert both visual widget presence (`find.byType`, `find.text`, `find.byIcon`) and accessibility semantics (`tester.getSemantics`).
- **Command**:
  ```bash
  pnpm nx test-coverage fl-mat
  ```

### F. Python `>=3.12` (`uv` / `pytest` / `pytest-asyncio`)
- **Projects**: `py-utils-common`, `py-utils-nlp`, `py-data-access-interfaces`, `py-reflective-nlp`, `apps/api-*`
- **Conventions**:
  - Place tests in `libs/<domain>/py-<name>/tests/test_<module>.py`.
  - Use `pytest.mark.parametrize` for exhaustive input/output matrices and `@pytest.mark.asyncio` for async protocols.
  - Concrete data-access providers MUST execute `assert_repository_contract` / `assert_auth_contract` from `py_data_access_interfaces.testing`.
  - FastAPI services (`apps/api-*`) MUST include ASGI tests using `httpx.AsyncClient(transport=httpx.ASGITransport(app=app))`.
- **Command**:
  ```bash
  pnpm nx test <py-project>
  ```

### G. Rust (`cargo test`) & Go (`go test`)
- **Rust (`rs-utils-pose-math`, `rs-utils-design-tokens`)**:
  - Include unit tests in `#[cfg(test)] mod tests` and executable doc-tests in `///` rustdoc comments.
  - Test `#[repr(C)]` memory layout invariants (`size_of`, `align_of`), numerical stability (`NaN`, zero-vectors, collinear points), and `Result`/`Error` variants.
  - Run: `pnpm nx test <rs-project>`
- **Go (`go-utils-core`)**:
  - Co-locate `<module>_test.go` in the package directory.
  - Write table-driven tests (`tests := []struct{ name string; ... }`) with `t.Run(tc.name, func(t *testing.T) { t.Parallel() ... })`.
  - Run: `pnpm nx test <go-project>`

---

## 3. Post-Test Coverage Table Sync (Mandatory)

Whenever new functions or unit tests are written or modified:
1. Run the project's test target with coverage enabled.
2. Run the automated README & coverage table synchronizer:
   ```bash
   node tools/ci/sync-readmes-and-coverage.mjs
   ```
3. Verify that both the individual library's `libs/<domain>/<project>/README.md` (`## Test & Coverage Summary` table) and the root [README.md](../../../README.md) coverage column reflect the updated test counts and coverage percentages.
