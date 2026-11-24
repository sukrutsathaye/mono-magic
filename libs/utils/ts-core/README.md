# `@mono-magic/utils-ts-core`

Pure, stateless, framework-agnostic TypeScript core primitives (`Result<T, E>`, `AppError`, `ErrorCode`, `invariant`, `retryWithBackoff`, `TypedEventBus`).

- **Nx project**: `utils-ts-core`
- **Tags**: `scope:utils`, `type:util`, `lang:ts`
- **Coverage minimum**: `>= 90%` across lines, statements, functions, and branches.

## Nx Targets

```bash
pnpm nx lint utils-ts-core
pnpm nx typecheck utils-ts-core
pnpm nx test utils-ts-core -- --coverage
```

## Usage

```ts
import { ok, err, AppError, invariant, retryWithBackoff, TypedEventBus } from '@mono-magic/utils-ts-core';

const res = ok(42);
invariant(res.ok, 'Expected ok result');

const bus = new TypedEventBus<{ saved: { id: string } }>();
const unsubscribe = bus.on('saved', ({ id }) => console.log(id));
bus.emit('saved', { id: '123' });
unsubscribe();

const value = await retryWithBackoff(async () => 'done', { maxAttempts: 3, baseDelayMs: 10 });
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `utils-ts-core` | Vitest V8 (`@vitest/coverage-v8`) | **97.3%** | **97.3%** | **100.0%** | **97.9%** | `>= 90%` | Passing |
<!-- COVERAGE_TABLE_END -->
