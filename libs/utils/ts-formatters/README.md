# `@mono-magic/utils-ts-formatters`

Pure, stateless, framework-agnostic TypeScript formatting and conversion utilities for currency/tax, date/time/countdowns, and fiber-crafting/apparel sizing.

- **Nx project**: `utils-ts-formatters`
- **Tags**: `scope:utils`, `type:util`, `lang:ts`
- **Coverage minimum**: `>= 90%` across lines, statements, functions, and branches.

## Nx Targets

```bash
pnpm nx lint utils-ts-formatters
pnpm nx typecheck utils-ts-formatters
pnpm nx test utils-ts-formatters --coverage
```

## Modules & Usage

### Currency & Tax (`currency.ts`)

```ts
import { formatCurrency, calculateTax, roundCurrency } from '@mono-magic/utils-ts-formatters';

formatCurrency(1234.5, 'USD', 'en-US'); // "$1,234.50"
calculateTax(100, 0.0825);
// { subtotal: 100, taxAmount: 8.25, total: 108.25, taxRate: 0.0825, inclusive: false }
calculateTax(110, 0.1, { inclusive: true });
// { subtotal: 100, taxAmount: 10, total: 110, taxRate: 0.1, inclusive: true }
roundCurrency(1.005, 2, 'half-up'); // 1.01
```

### Date, Duration & Countdown (`datetime.ts`)

```ts
import { formatDate, formatDuration, formatCountdown } from '@mono-magic/utils-ts-formatters';

formatDate('2026-01-15T00:00:00Z', 'en-US', { dateStyle: 'medium', timeZone: 'UTC' });
formatDuration(5025); // "1h 23m 45s"
formatDuration(5025, { style: 'long' }); // "1 hour, 23 minutes, 45 seconds"
formatCountdown(1_700_090_000_000, 1_700_000_000_000);
// { totalMs: 90000000, days: 1, hours: 1, minutes: 0, seconds: 0, isExpired: false, formatted: "1d 01:00:00" }
```

### Crafting & Apparel Sizing (`crafting.ts`)

```ts
import {
  getYarnWeightInfo,
  convertYarnWeight,
  metersToYards,
  yardsToMeters,
  convertLength,
  stitchesPerInchToCm,
  stitchesPerCmToInch,
  calculateGaugeDimensions,
  convertClothingSize,
} from '@mono-magic/utils-ts-formatters';

getYarnWeightInfo(4).name; // "Medium"
convertYarnWeight('Worsted').category; // 4
metersToYards(91.44); // 100
convertLength(12, 'in', 'ft'); // 1
calculateGaugeDimensions(100, 140, 20, 28);
// { widthCm: 50, heightCm: 50, widthInches: 19.685..., heightInches: 19.685... }
convertClothingSize(8, 'US', 'UK', 'womens'); // "12"
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `utils-ts-formatters` | Vitest V8 (`@vitest/coverage-v8`) | **100.0%** | **100.0%** | **100.0%** | **100.0%** | `>= 90%` | Passing |
<!-- COVERAGE_TABLE_END -->
