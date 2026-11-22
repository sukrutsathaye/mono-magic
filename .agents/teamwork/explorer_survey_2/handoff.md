# Survey Explorer 2 Handoff Report — Track B (Polyglot TS Utils, Protobuf/Buf, TS & Python Data-Access Contracts, and Tooling Conventions)

**Summary**: `mono-magic` uses an Nx 24.0.6 TypeScript Solution Setup (`composite: true`, `emitDeclarationOnly: true`, `customConditions: ["mono-magic"]`, `moduleResolution: "nodenext"`) with inferred `lint`, `typecheck`, `test`, and `test-ci` targets, plus pnpm workspace linking (`workspace:*`). Because `nx.json` configures `@nx/vitest` with `testMode: "watch"`, new TS libraries using `@nx/vitest` must either configure `testMode: "run"` or explicitly set `test.watch: false` / explicit `vitest run` if CI/non-watch behavior is needed (note: `atomic-design-interfaces` has `watch: false` in `vitest.config.mts`, which keeps `vitest` non-watching even under `testMode: "watch"`). The environment has Node `v24.22.2`, pnpm `12.18.0`, `uv 0.13.7`, system Python `3.11.2` (no Python `3.12` installed yet — `uv` can download `3.12.16` via `uv sync` with live internet access), and live npm/PyPI registry connectivity for `@bufbuild/buf@1.75.0` and Python packages (`pydantic`, `pytest`, `pytest-cov`, `ruff`, `pyright`).

---

## 1. Observation

### 1.1 Root Nx 24 Workspace & TypeScript Solution Conventions
- **`nx.json`** (`/home/antigravity/sukrutsathaye/mono-magic/nx.json:1-85`):
  - `targetDefaults.test`: `{"cache": true, "dependsOn": ["^build"]}` (lines 4–9).
  - Registered plugins:
    1. `@nx/eslint/plugin` (`targetName: "lint"`, lines 15–18)
    2. `@nx/vitest` (`testTargetName: "test"`, `ciTargetName: "test-ci"`, `testMode: "watch"`, lines 21–26)
    3. `@nx/expo/plugin` (lines 29–42)
    4. `@nx/storybook/plugin` (lines 45–53)
    5. `@nx/js/typescript` (`typecheck.targetName: "typecheck"`, `build.targetName: "build"`, `build.configName: "tsconfig.lib.json"`, `buildDepsName: "buildDeps"`, `watchDepsName: "watch-deps"`, lines 56–68)
- **`tsconfig.base.json`** (`/home/antigravity/sukrutsathaye/mono-magic/tsconfig.base.json:1-34`):
  - `composite: true`, `declarationMap: true`, `emitDeclarationOnly: true`, `importHelpers: true`, `isolatedModules: true`, `lib: ["es2022"]`, `module: "nodenext"`, `moduleResolution: "nodenext"`, `noEmitOnError: true`, `noFallthroughCasesInSwitch: true`, `noImplicitOverride: true`, `noImplicitReturns: true`, `noUnusedLocals: true`, `skipLibCheck: true`, `strict: true`, `target: "es2022"`.
  - `customConditions: ["mono-magic"]` (lines 21–23).
  - `paths` currently maps `@mono-magic/atomic-design-interfaces` and `@mono-magic/ng-mat` (lines 24–31).
- **Root `tsconfig.json`** (`/home/antigravity/sukrutsathaye/mono-magic/tsconfig.json:1-20`):
  - Extends `./tsconfig.base.json`, sets `"files": []`, and lists project references to `./libs/ui/{atomic-design-interfaces,react-mui,ng-mat,rn-paper}`.
- **Root `vitest.config.mts`** (`/home/antigravity/sukrutsathaye/mono-magic/vitest.config.mts:1-8`):
  - `test.projects`: `['**/vite.config.{mjs,js,ts,mts}', '**/vitest.config.{mjs,js,ts,mts}', '!vitest.config.{mjs,js,ts,mts}', '!vite.config.{mjs,js,ts,mts}']`.
- **Root `package.json`** (`/home/antigravity/sukrutsathaye/mono-magic/package.json:1-116`):
  - `"packageManager": "pnpm@12.18.0"`, `"type": "module"`, `"nx": {}`.
  - DevDependencies include `nx: "24.0.6"`, `@nx/js: "^24.0.6"`, `@nx/vitest: "24.0.6"`, `@nx/eslint: "24.0.6"`, `@nx/eslint-plugin: "24.0.6"`, `typescript: "~6.0.0"`, `vitest: "^4.0.8"` (resolved `4.1.12` in lockfile), `@vitest/coverage-v8: "^4.0.8"`, `eslint: "^9.8.0"`, `typescript-eslint: "^8.58.0"`, `tslib: "^2.3.0"`.
  - `@bufbuild/buf` is NOT currently in `package.json` or `node_modules/@bufbuild`.
- **Root `pnpm-workspace.yaml`** (`/home/antigravity/sukrutsathaye/mono-magic/pnpm-workspace.yaml:1-14`):
  - Currently `packages: ["apps/*", "libs/*", "libs/ui/*", "!libs/ui/fl-mat"]` (Track A will update to `["apps/*", "libs/ui/*", "libs/utils/ts-*", "libs/data-access/ts-*", "libs/features/ts-*", "!libs/ui/fl-mat"]` per `implementation_plan.md:26,147`).
- **Root `pyproject.toml`** (`/home/antigravity/sukrutsathaye/mono-magic/pyproject.toml:1-8`):
  - Currently `requires-python = ">=3.12"` and `[tool.uv.workspace] members = ["apps/api-*", "libs/py-*"]` (Track A will update `members` to `["apps/api-*", "libs/*/py-*"]` per `implementation_plan.md:25,146`).
- **Root `eslint.config.mjs`** (`/home/antigravity/sukrutsathaye/mono-magic/eslint.config.mjs:1-56`):
  - Uses ESLint 9 flat config (`@nx/eslint-plugin`), currently permissive (`sourceTag: "*"` -> `onlyDependOnLibsWithTags: ["*"]`); Track A will lock down strict `depConstraints` (`implementation_plan.md:78-86,145`).

### 1.2 Reference TS Library Inspection (`libs/ui/atomic-design-interfaces`)
- Files present: `README.md`, `eslint.config.mjs`, `package.json`, `tsconfig.json`, `tsconfig.lib.json`, `tsconfig.spec.json`, `vitest.config.mts`, `src/` (NO `project.json`!).
- **`package.json`** (`libs/ui/atomic-design-interfaces/package.json:1-22`):
  - `"name": "@mono-magic/atomic-design-interfaces"`, `"private": true`, `"type": "module"`, `"main": "./src/index.ts"`, `"types": "./src/index.ts"`.
  - `"exports": { ".": { "types": "./src/index.ts", "import": "./src/index.ts", "default": "./src/index.ts" }, "./package.json": "./package.json" }`.
  - `"nx": { "name": "atomic-design-interfaces", "tags": ["scope:ui", "type:interfaces"] }`.
- **`tsconfig.json`** (`libs/ui/atomic-design-interfaces/tsconfig.json:1-14`):
  - Extends `../../../tsconfig.base.json`, `"files": []`, `"include": []`, `"references": [{ "path": "./tsconfig.lib.json" }, { "path": "./tsconfig.spec.json" }]`.
- **`tsconfig.lib.json`** (`libs/ui/atomic-design-interfaces/tsconfig.lib.json:1-32`):
  - Extends `../../../tsconfig.base.json`, `rootDir: "src"`, `outDir: "dist"`, `tsBuildInfoFile: "dist/tsconfig.lib.tsbuildinfo"`, `emitDeclarationOnly: true`, `forceConsistentCasingInFileNames: true`, `types: ["node"]`, `include: ["src/**/*.ts"]`, `references: []`, excludes `vitest/vite` configs & `test/spec` files.
- **`tsconfig.spec.json`** (`libs/ui/atomic-design-interfaces/tsconfig.spec.json:1-35`):
  - Extends `../../../tsconfig.base.json`, `outDir: "./out-tsc/vitest"`, `types: ["vitest/globals", "vitest/importMeta", "vite/client", "node", "vitest"]`, `references: [{ "path": "./tsconfig.lib.json" }]`.
- **`eslint.config.mjs`** (`libs/ui/atomic-design-interfaces/eslint.config.mjs:1-11`):
  - Imports `../../../eslint.config.mjs` and ignores `["**/out-tsc"]`.
- **`vitest.config.mts`** (`libs/ui/atomic-design-interfaces/vitest.config.mts:1-19`):
  - `root: import.meta.dirname`, `cacheDir: '../../../node_modules/.vite/libs/ui/atomic-design-interfaces'`, `test: { name: 'atomic-design-interfaces', watch: false, globals: true, environment: 'node', include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], reporters: ['default'], coverage: { reportsDirectory: './test-output/vitest/coverage', provider: 'v8' as const } }`.
- **`src/index.ts`** (`libs/ui/atomic-design-interfaces/src/index.ts:1-6`):
  - Uses ESM `.js` extensions on relative imports (`export * from './lib/common/atomic.interface.js'`) because `tsconfig.base.json` sets `"module": "nodenext"` and `"moduleResolution": "nodenext"`.
- Verified running `pnpm nx test atomic-design-interfaces -- --coverage && pnpm nx typecheck atomic-design-interfaces && pnpm nx lint atomic-design-interfaces` exited 0 (3 tests passed, `vitest v4.1.12`, V8 coverage generated).

### 1.3 Nx Plugin Target Inference & Workspace Package Linking Mechanics
Verified by inspecting `@nx/js`, `@nx/vitest`, `@nx/eslint` plugin source in `node_modules`:
1. **`@nx/js/typescript`** (`node_modules/@nx/js/dist/src/plugins/typescript/plugin.js:176-361` & `util.js:39-188` & `ts-solution-setup.js:41-89`):
   - `isUsingTsSolutionSetup` returns `true` (because `pnpm-workspace.yaml` exists, `tsconfig.json` extends `./tsconfig.base.json` with `files: []`, and `tsconfig.base.json` has `composite: true`).
   - Requires `package.json` or `project.json` in the project directory AND `tsconfig.json` for non-root configs (`plugin.js:240-250`).
   - Infers **`typecheck`**: runs `tsc --build --emitDeclarationOnly` on `tsconfig.json`, `dependsOn: ["^typecheck"]`, `syncGenerators: ["@nx/js:typescript-sync"]`.
   - Infers **`build`** (on `tsconfig.lib.json`) ONLY if `isValidPackageJsonBuildConfig` returns `true` (`plugin.js:328-331`):
     - When `package.json` `exports["."]` points to `./src/index.ts` (source files included by `tsconfig.lib.json`) and `tsconfig.lib.json` has `outDir: "dist"`, `isAnyEntryPointPointingToOutDir` (`util.js:99-137`) returns **`false`**! That is why `atomic-design-interfaces` has NO `build` target (`pnpm nx show project atomic-design-interfaces --json` confirmed only `lint`, `test`, `test-ci`, `test-ci--...`, `typecheck`), whereas `exports["."]` pointing to `./dist/index.js` (or omitting `dist` check via custom condition) enables `build`.
     - If `exports["."]` has `{ "mono-magic": "./src/index.ts", "types": "./dist/index.d.ts", "import": "./dist/index.js", "default": "./dist/index.js" }` AND `outDir: "dist"`, `isAnyEntryPointPointingToOutDir` checks `Object.values(value).some(subValue => isPathInsideOutDir(subValue))` (`util.js:126`) — so having `dist/...` in `default`/`import`/`types` WOULD infer a `build` target (`tsc --build tsconfig.lib.json`), while `tsconfig.base.json` `"customConditions": ["mono-magic"]` resolves imports directly to `./src/index.ts` during dev/test/typecheck!
     - **Important**: Because `nx.json` sets `targetDefaults.test.dependsOn: ["^build"]`, and `atomic-design-interfaces` uses source-only `exports` (`./src/index.ts` for all conditions, no `build` target), either keeping source-only `exports` (no `build` target, matching `atomic-design-interfaces`) OR conditional exports with `mono-magic` + `dist` (enabling `build`) works cleanly with `tsc --build` and `vitest`. See blueprint recommendation below.
2. **`@nx/vitest`** (`node_modules/@nx/vitest/dist/src/plugins/plugin.js:13-386`):
   - Matches `**/{vite,vitest}.config.{js,ts,mjs,mts,cjs,cts}` when sibling `package.json` or `project.json` exists.
   - Infers `test` (`command: "vitest"` because `nx.json` has `testMode: "watch"`, `dependsOn: ["^build"]`, `outputs: ["{projectRoot}/test-output/vitest/coverage"]` when `coverage.reportsDirectory: './test-output/vitest/coverage'`), plus atomized `test-ci` / `test-ci--<spec>`.
   - Note: `vitest` respects `test.watch: false` inside `vitest.config.mts` even when the inferred command is `vitest`.
3. **`@nx/eslint/plugin`** (`node_modules/@nx/eslint/dist/src/plugins/plugin.js:27-352`):
   - Infers `lint` (`command: "eslint ."`, `cwd: projectRoot`) for any project with `project.json` or `package.json` that contains lintable files (`.ts`, `.tsx`, `.js`, etc.) and an `eslint.config.mjs` (or inherits root `eslint.config.mjs`).
   - **Important for non-JS projects (`proto-contracts`, `py-data-access-interfaces`)**: If a project has `project.json` and an explicit `"lint"` target (e.g., `buf lint` or `uv run ruff check .`), `@nx/eslint/plugin` only overrides/contributes if there are non-ignored lintable JS/TS files (`plugin.js:56-73`), AND explicit targets in `project.json` merge over inferred plugin targets anyway. Still, `proto-contracts` and `py-interfaces` should avoid stray `.js/.ts` files or ignore them if unneeded, and explicitly define `lint` in `project.json`.
4. **Workspace Package Linking (`@mono-magic/*`)**:
   - Checked `libs/ui/{react-mui,ng-mat,rn-paper}/node_modules/@mono-magic/`: pnpm creates per-package workspace symlinks (`atomic-design-interfaces -> ../../../atomic-design-interfaces`) when `package.json` declares `"@mono-magic/<pkg>": "workspace:*"` AND the directory matches `pnpm-workspace.yaml`.
   - `tsconfig.base.json` has `"customConditions": ["mono-magic"]` and `"paths": { "@mono-magic/...": [...] }`.

### 1.4 Environment Tools, Caches & Registry Connectivity
Verified read-only commands:
- `node -v`: `v24.22.2`
- `pnpm -v`: `12.18.0` (store at `/home/antigravity/.local/share/pnpm/store/v11`)
- `uv --version`: `uv 0.13.7 (x86_64-unknown-linux-gnu)` (at `/usr/local/bin/uv`)
- `python3 --version`: `Python 3.11.2` (`/usr/bin/python3.11`, `/usr/bin/python` -> `python3.11`)
- `uv python find 3.12`: `error: No interpreter found for Python 3.12 in virtual environments, managed installations, or search path`
- `uv python list`: lists `cpython-3.12.16-linux-x86_64-gnu <download available>` (as well as 3.13, 3.14).
- `.venv`: No `.venv` exists yet at workspace root (`ls -la .venv` -> No such file).
- `ruff`, `pyright`, `pytest`, `buf`: None currently on PATH (`which ruff pyright pytest buf` -> empty).
- System C/proto tools: `/usr/bin/gcc`, `/usr/bin/g++`, `/usr/bin/protoc` (`libprotoc 3.21.12`).
- Network / Registry access (via local proxy `http://127.0.0.1:45003`):
  - `pnpm info @bufbuild/buf --json`: HTTP 200, latest version **`1.75.0`** (`optionalDependencies` includes `@bufbuild/buf-linux-x64: "1.75.0"`, OS is `linux x64`).
  - `curl -sI https://pypi.org/simple/pydantic/`: `HTTP/2 200` (PyPI reachable).
  - `curl -sI https://github.com`: `HTTP/2 200` (GitHub releases / uv managed Python downloads reachable).

### 1.5 Coverage & Data-Access Skill Requirements
- **`.gemini/skills/coverage-and-quality/SKILL.md:17-34`**:
  - JS/TS libraries use `@vitest/coverage-v8`, run via `pnpm nx test <project> -- --coverage` or `pnpm nx run-many -t test -p ... -- --coverage`.
  - Output directory: `<projectRoot>/test-output/vitest/coverage/` (consistent with `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`).
  - Reporters: `['text', 'html', 'lcov', 'json-summary']` (required by `ROADMAP.md:100` & `SKILL.md:32`; note `atomic-design-interfaces/vitest.config.mts` omitted `reporter`/`thresholds` whereas `react-mui/vite.config.mts:49-65` explicitly defines `include`, `exclude`, `thresholds: 80`).
  - Thresholds: `80%` across `lines`, `statements`, `functions`, `branches` globally, and **`>=90%` for `libs/utils/*`** (`implementation_plan.md:133,166`; `ROADMAP.md:172`).
- **`.gemini/skills/data-access-provider/SKILL.md:1-60`**:
  - Note discrepancy with `implementation_plan.md`: `SKILL.md` still references the older single-TS-package name `libs/data-access/data-access-interfaces` and `libs/utils/core` (`Track A` is tasked with updating `SKILL.md` in `implementation_plan.md:141-142` to the new `proto-contracts` + `ts-interfaces` + `py-interfaces` + `ts-core` architecture).
  - Core capability interfaces required: `IAuthProvider`/`BaseAuthProvider`, `IDataRepository<TEntity, TId>`/`BaseDataRepository`, `IStorageProvider`/`BaseStorageProvider`, `IRealtimeProvider`/`BaseRealtimeProvider`, plus `IPaymentProvider`/`BasePaymentProvider` (per `implementation_plan.md:29,193`).
  - Shared Contract Compliance Test Suites exported from `ts-interfaces` and `py-interfaces` so concrete providers pass Liskov Substitution checks.

---

## 2. Logic Chain

1. **TS Package Structure & Target Inference**:
   - Because `nx.json` enables `@nx/js/typescript`, `@nx/vitest`, and `@nx/eslint/plugin`, and `tsconfig.base.json` + `tsconfig.json` implement the Nx TypeScript Solution Setup (`composite: true`, `emitDeclarationOnly: true`, `module: "nodenext"`, `customConditions: ["mono-magic"]`), every new TS library (`libs/utils/ts-core`, `libs/data-access/ts-interfaces`) must follow the exact `atomic-design-interfaces` layout (`package.json` with `"nx": { "name", "tags" }`, `tsconfig.json`, `tsconfig.lib.json`, `tsconfig.spec.json`, `eslint.config.mjs`, `vitest.config.mts`), use `.js` extensions on relative ESM imports, and be added to root `tsconfig.json` `references` + `tsconfig.base.json` `paths` (or rely on pnpm workspace symlinks + `package.json` `exports`).
   - Because `react-mui/vite.config.mts:49-65` and `SKILL.md:31-33` show the standardized coverage block (`reportsDirectory: './test-output/vitest/coverage'`, `provider: 'v8'`, `reporters: ['text', 'html', 'lcov', 'json-summary']`, `include: ['src/lib/**/*.ts']`, `exclude` for `*.spec.ts`, `*.test.ts`, `**/index.ts`, and `thresholds`), setting `90%` thresholds in `libs/utils/ts-core/vitest.config.mts` and `80%` in `libs/data-access/ts-interfaces/vitest.config.mts` enforces `implementation_plan.md:133,166,194` automatically whenever `--coverage` is passed.
   - Because `libs/data-access/ts-interfaces` depends on `@mono-magic/utils-ts-core`, `ts-interfaces/package.json` needs `"@mono-magic/utils-ts-core": "workspace:*"`, `ts-interfaces/tsconfig.lib.json` needs `references: [{ "path": "../../utils/ts-core/tsconfig.lib.json" }]`, and `pnpm install` must run after Track A updates `pnpm-workspace.yaml` so pnpm creates the `node_modules/@mono-magic/utils-ts-core` symlink.
   - Note on `build` target vs `atomic-design-interfaces`: `atomic-design-interfaces` exports `./src/index.ts` for all conditions, so `@nx/js/typescript` does not infer a `build` target (`util.js:99-188`). Keep the same source-first `exports` pattern (`"mono-magic": "./src/index.ts"`, `"types": "./src/index.ts"`, `"import": "./src/index.ts"`, `"default": "./src/index.ts"`) OR if `build` target is ever needed by `nx affected -t ... build`, export `"mono-magic": "./src/index.ts"` alongside `"default": "./dist/index.js"`. However, note that `tsconfig.base.json` sets `"emitDeclarationOnly": true` globally (`tsconfig.base.json:5`)! Running `tsc --build` with `emitDeclarationOnly: true` does NOT emit `.js` files into `dist/`, only `.d.ts` files. Therefore, keeping `exports` pointing to `./src/index.ts` (matching `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`) is the ONLY consistent pattern with `tsconfig.base.json:5` (`emitDeclarationOnly: true`) and ensures `pnpm nx test ...` / `pnpm nx affected -t lint typecheck test build` works without runtime `MODULE_NOT_FOUND` in `dist/`.

2. **Protobuf / Buf (`libs/data-access/proto-contracts`)**:
   - `@bufbuild/buf@1.75.0` is available on npm and installs a native `buf` binary via `@bufbuild/buf-linux-x64` (`pnpm add -D -w @bufbuild/buf`). Note: `pnpm-workspace.yaml` has `allowBuilds`; verify `@bufbuild/buf` doesn't need postinstall build scripts (it ships prebuilt `optionalDependencies` binaries and `install.js`).
   - `proto-contracts` is NOT a pnpm workspace package (`pnpm-workspace.yaml` only includes `libs/data-access/ts-*`), so it MUST have an explicit `project.json` with `name: "proto-contracts"`, `tags: ["scope:data-access", "type:interfaces", "lang:proto"]`, and explicit `lint`, `breaking`, and `generate` targets using `nx:run-commands` invoking `pnpm exec buf ...`.
   - `implementation_plan.md:230` specifically verifies `pnpm nx lint proto-contracts`, and `buf.yaml` v2 is standard for `buf@1.75.0`.

3. **Python Data-Access Contracts (`libs/data-access/py-interfaces`)**:
   - System Python is `3.11.2`, while root `pyproject.toml` requires `>=3.12`. Because internet access to GitHub/PyPI is working (`HTTP/2 200`) and `uv` is `0.13.7`, running `uv sync` (after Track A updates `pyproject.toml` `members` to `["apps/api-*", "libs/*/py-*"]`) will automatically download `cpython-3.12.16` and create `.venv` at workspace root.
   - Track B must add `[dependency-groups] dev` (or workspace dev dependencies) in root `pyproject.toml` or `libs/data-access/py-interfaces/pyproject.toml` for `pytest`, `pytest-cov`, `ruff`, `pyright`, and `pydantic>=2.0`, and configure `project.json` in `libs/data-access/py-interfaces` with Nx project name `py-data-access-interfaces` (`implementation_plan.md:196,233`) and targets `lint` (`uv run ruff check .`), `typecheck` (`uv run pyright`), and `test` (`uv run pytest --cov=py_data_access_interfaces --cov-report=term-missing --cov-fail-under=80`).

---

## 3. Caveats

1. **`SKILL.md` vs `implementation_plan.md` Naming**: `.gemini/skills/data-access-provider/SKILL.md` and `ROADMAP.md` currently use legacy names (`libs/data-access/data-access-interfaces`, `libs/utils/core`, `libs/data-access/py-data-access-interfaces`). Track A is updating those docs to the approved `implementation_plan.md` paths (`libs/utils/ts-core`, `libs/data-access/proto-contracts`, `libs/data-access/ts-interfaces`, `libs/data-access/py-interfaces` with Nx name `py-data-access-interfaces`). Track B should follow `implementation_plan.md` strictly.
2. **`nx affected -t ... build` & `ts-core` / `ts-interfaces`**: Because `tsconfig.base.json` sets `"emitDeclarationOnly": true`, `tsc --build` only emits `.d.ts` files. Keep `package.json` `exports` pointing to `./src/index.ts` (identical to `atomic-design-interfaces/package.json`) so Vitest, ESLint, and TypeScript consume sources directly without needing a JS transpile step.
3. **`@nx/vitest` `testMode: "watch"`**: Because `nx.json:25` sets `"testMode": "watch"`, `@nx/vitest` infers `command: "vitest"` instead of `"vitest run"`. In `vitest.config.mts`, always set `watch: false` (matching `atomic-design-interfaces/vitest.config.mts:8`) so `pnpm nx test <proj>` exits cleanly in CI and agent runs. Also note `@nx/vitest` passes extra CLI args after `--` (e.g., `-- --coverage`).
4. **Protobuf Codegen Target Dependencies**: In `implementation_plan.md:70-71`, `PY_DA --> PROTO` and `TS_DA --> PROTO`. While Track B creates `proto-contracts` with `buf.yaml` + `buf.gen.yaml` and the 6 `.proto` files, verify whether Track B should invoke `buf generate` into `ts-interfaces`/`py-interfaces` or keep hand-authored idiomatic TS/Python traits aligned with the `.proto` schemas (or generate into `gen/`). Note `buf.gen.yaml` remote plugins (`buf.build/bufbuild/es`, `buf.build/protocolbuffers/python`, etc.) vs local plugins: remote Buf BSR plugins require `https://buf.build` access; if generated code is used, check `buf.build` reachability first or keep `generate` configured with `buf.gen.yaml` for BSR remote plugins while `ts-interfaces`/`py-interfaces` define handwritten idiomatic TypeScript/Pydantic v2 contracts (or generated + wrapper).
5. **Nx Daemon Socket Warning**: Running `pnpm nx` prints a benign warning about `/tmp` and `/home` ownership falling back to `.nx/workspace-data/d/*.sock`; commands still exit 0.

---

## 4. Conclusion — Exact Blueprint Recommendations for Track B

### 4.1 `libs/utils/ts-core`
- **Nx Project Name**: `utils-ts-core` (`implementation_plan.md:231` tests `-p utils-ts-core`)
- **npm Package Name**: `@mono-magic/utils-ts-core`
- **Tags**: `["scope:utils", "type:util", "lang:ts"]`
- **No `project.json` needed** (inferred cleanly via `package.json` + `tsconfig.json` + `vitest.config.mts` + `eslint.config.mjs`, identical to `atomic-design-interfaces`; inferred targets: `lint`, `typecheck`, `test`, `test-ci`).
- **`package.json`**:
  ```json
  {
    "name": "@mono-magic/utils-ts-core",
    "version": "0.0.1",
    "private": true,
    "type": "module",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "exports": {
      ".": {
        "mono-magic": "./src/index.ts",
        "types": "./src/index.ts",
        "import": "./src/index.ts",
        "default": "./src/index.ts"
      },
      "./package.json": "./package.json"
    },
    "nx": {
      "name": "utils-ts-core",
      "tags": ["scope:utils", "type:util", "lang:ts"]
    },
    "dependencies": {}
  }
  ```
- **TSConfigs**:
  - `tsconfig.json`: extends `../../../tsconfig.base.json`, `"files": []`, `"include": []`, `"references": [{ "path": "./tsconfig.lib.json" }, { "path": "./tsconfig.spec.json" }]`.
  - `tsconfig.lib.json`: extends `../../../tsconfig.base.json`, `rootDir: "src"`, `outDir: "dist"`, `tsBuildInfoFile: "dist/tsconfig.lib.tsbuildinfo"`, `emitDeclarationOnly: true`, `forceConsistentCasingInFileNames: true`, `types: ["node"]`, `include: ["src/**/*.ts"]`, `references: []`, exclude config/test/spec files.
  - `tsconfig.spec.json`: extends `../../../tsconfig.base.json`, `outDir: "./out-tsc/vitest"`, `types: ["vitest/globals", "vitest/importMeta", "vite/client", "node", "vitest"]`, `references: [{ "path": "./tsconfig.lib.json" }]`.
  - Root `tsconfig.base.json`: add `"@mono-magic/utils-ts-core": ["./libs/utils/ts-core/src/index.ts"]` to `paths`.
  - Root `tsconfig.json`: add `{ "path": "./libs/utils/ts-core" }` to `references`.
- **`eslint.config.mjs`**: extends `../../../eslint.config.mjs` with `ignores: ["**/out-tsc", "**/dist", "**/test-output"]`.
- **`vitest.config.mts`**:
  - `name: 'utils-ts-core'`, `watch: false`, `globals: true`, `environment: 'node'`, `cacheDir: '../../../node_modules/.vite/libs/utils/ts-core'`, `include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']`.
  - `coverage`: `provider: 'v8' as const`, `reportsDirectory: './test-output/vitest/coverage'`, `reporter: ['text', 'html', 'lcov', 'json-summary']`, `include: ['src/lib/**/*.ts']`, `exclude: ['src/lib/**/*.spec.ts', 'src/lib/**/*.test.ts', 'src/lib/**/index.ts']`, `thresholds: { lines: 90, statements: 90, functions: 90, branches: 90 }`.
- **ESM Imports**: All relative imports in `src/` MUST use `.js` extensions (for `moduleResolution: "nodenext"`).

### 4.2 `libs/data-access/proto-contracts`
- **Nx Project Name**: `proto-contracts` (`implementation_plan.md:173,230`)
- **Tags**: `["scope:data-access", "type:interfaces", "lang:proto"]`
- **Root Tooling**: Add `"@bufbuild/buf": "^1.75.0"` to root `package.json` `devDependencies` via `pnpm add -D -w @bufbuild/buf`.
- **`project.json`** (explicit targets required because no JS/Vitest/TS configs):
  - `name`: `"proto-contracts"`, `projectType`: `"library"`, `sourceRoot`: `"libs/data-access/proto-contracts/proto"`, `tags`: `["scope:data-access", "type:interfaces", "lang:proto"]`.
  - Targets (all `executor: "nx:run-commands"`, `options.cwd: "libs/data-access/proto-contracts"`):
    - `lint`: `cache: true`, `inputs: ["{projectRoot}/buf.yaml", "{projectRoot}/proto/**/*.proto"]`, `command: "pnpm exec buf lint"`.
    - `format-check` (optional): `command: "pnpm exec buf format -d --exit-code"`.
    - `breaking`: `cache: true`, `command: "pnpm exec buf breaking --against '.git#branch=main,subdir=libs/data-access/proto-contracts'"` (note: only works after `proto-contracts` exists on `main`, so keep as non-CI optional or handle gracefully).
    - `generate`: `cache: true`, `inputs: ["{projectRoot}/buf.yaml", "{projectRoot}/buf.gen.yaml", "{projectRoot}/proto/**/*.proto"]`, `outputs: ["{projectRoot}/gen"]`, `command: "pnpm exec buf generate"`.
- **Buf Configs** (v2 syntax for `buf@1.75.0`):
  - `buf.yaml`:
    ```yaml
    version: v2
    modules:
      - path: proto
    lint:
      use:
        - STANDARD
    breaking:
      use:
        - FILE
    ```
  - `buf.gen.yaml` (Buf v2 managed mode + remote plugins for TS, Python, Java, Dart, Go):
    ```yaml
    version: v2
    managed:
      enabled: true
      override:
        - file_option: go_package_prefix
          value: github.com/sukrutsathaye/mono-magic/libs/data-access/proto-contracts/gen/go
    plugins:
      - remote: buf.build/bufbuild/es:v2.2.2
        out: gen/ts
        opt: target=ts
      - remote: buf.build/protocolbuffers/pyi:v28.3
        out: gen/py
      - remote: buf.build/protocolbuffers/python:v28.3
        out: gen/py
    ```
    *(Verify remote plugin connectivity or adjust versions if running `buf generate` during Track B; `buf lint` works 100% offline with zero network calls.)*
- **Proto Files** under `libs/data-access/proto-contracts/proto/monomagic/...`:
  - `monomagic/common/v1/{errors,pagination}.proto`
  - `monomagic/auth/v1/auth.proto`
  - `monomagic/storage/v1/storage.proto`
  - `monomagic/realtime/v1/realtime.proto`
  - `monomagic/payments/v1/payments.proto`

### 4.3 `libs/data-access/ts-interfaces`
- **Nx Project Name**: `data-access-ts-interfaces` (`implementation_plan.md:231` tests `-p utils-ts-core,data-access-ts-interfaces`)
- **npm Package Name**: `@mono-magic/data-access-ts-interfaces`
- **Tags**: `["scope:data-access", "type:interfaces", "lang:ts"]`
- **Dependencies**: `"@mono-magic/utils-ts-core": "workspace:*"` in `package.json`; `"references": [{ "path": "../../utils/ts-core/tsconfig.lib.json" }]` in `tsconfig.lib.json` and `tsconfig.spec.json` (`tsconfig.spec.json` references `./tsconfig.lib.json` and `../../utils/ts-core/tsconfig.lib.json`).
- **Implicit Dependency on `proto-contracts`** (optional): add `"implicitDependencies": ["proto-contracts"]` in `package.json` `"nx"` block (or `project.json`) if desired so `proto-contracts` changes mark `data-access-ts-interfaces` affected.
- **`package.json`**:
  ```json
  {
    "name": "@mono-magic/data-access-ts-interfaces",
    "version": "0.0.1",
    "private": true,
    "type": "module",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "exports": {
      ".": {
        "mono-magic": "./src/index.ts",
        "types": "./src/index.ts",
        "import": "./src/index.ts",
        "default": "./src/index.ts"
      },
      "./testing": {
        "mono-magic": "./src/testing.ts",
        "types": "./src/testing.ts",
        "import": "./src/testing.ts",
        "default": "./src/testing.ts"
      },
      "./package.json": "./package.json"
    },
    "nx": {
      "name": "data-access-ts-interfaces",
      "tags": ["scope:data-access", "type:interfaces", "lang:ts"],
      "implicitDependencies": ["proto-contracts"]
    },
    "dependencies": {
      "@mono-magic/utils-ts-core": "workspace:*"
    }
  }
  ```
  *(Note: exposing `./testing` or re-exporting from `.` allows concrete provider packages to import `runDataRepositoryContractTests` etc.; note that if `./testing` imports `vitest`, keeping it as a separate subpath `./testing` avoids pulling `vitest` into runtime bundles of apps/providers, while `tsconfig.lib.json` vs `tsconfig.spec.json` typecheck needs care—if `contract-compliance.ts` accepts generic test-runner callbacks `(name, fn) => void` or uses `vitest` imported cleanly, verify `pnpm nx typecheck data-access-ts-interfaces` passes with `tsconfig.lib.json`! Using Vitest-compatible `describe`/`it`/`expect` parameters or `vitest` in `peerDependencies`/`devDependencies` must pass `tsc --build` on `tsconfig.lib.json` which has `types: ["node"]`.)*
- **Root `tsconfig.base.json`**: add `"@mono-magic/data-access-ts-interfaces": ["./libs/data-access/ts-interfaces/src/index.ts"]` and `"@mono-magic/data-access-ts-interfaces/testing": ["./libs/data-access/ts-interfaces/src/testing.ts"]` (if subpath used).
- **Root `tsconfig.json`**: add `{ "path": "./libs/data-access/ts-interfaces" }`.
- **`vitest.config.mts`**: same as `utils-ts-core` except `name: 'data-access-ts-interfaces'`, `cacheDir: '../../../node_modules/.vite/libs/data-access/ts-interfaces'`, and `thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 }`.

### 4.4 `libs/data-access/py-interfaces`
- **Nx Project Name**: `py-data-access-interfaces` (`implementation_plan.md:196,233`)
- **Python Distribution / Import Name**: `mono-magic-py-data-access-interfaces` (or `py-data-access-interfaces`) with Python package `src/mono_magic_data_access/` (or `src/py_data_access_interfaces/`). Recommend `name = "py-data-access-interfaces"` with `[tool.hatch.build.targets.wheel] packages = ["src/py_data_access_interfaces"]` (using `hatchling` build-system) so `uv sync` installs it cleanly as an editable workspace member.
- **Tags**: `["scope:data-access", "type:interfaces", "lang:py"]`
- **`libs/data-access/py-interfaces/pyproject.toml`**:
  - `requires-python = ">=3.12"`
  - `dependencies = ["pydantic>=2.9,<3"]`
  - `[dependency-groups]` / root `[dependency-groups] dev`: `pytest>=8.0`, `pytest-cov>=6.0`, `ruff>=0.7`, `pyright>=1.1.380`.
  - Configure `[tool.ruff]` (`line-length = 100`, `target-version = "py312"`), `[tool.pyright]` (`pythonVersion = "3.12"`, `typeCheckingMode = "strict"`), and `[tool.pytest.ini_options]` (`testpaths = ["tests"]`).
- **Root `pyproject.toml` (coordinated with Track A)**:
  - Ensure `[tool.uv.workspace] members = ["apps/api-*", "libs/*/py-*"]` (Track A) and add `[dependency-groups] dev = ["pytest>=8.0", "pytest-cov>=6.0", "ruff>=0.7", "pyright>=1.1.380"]` (or in member `pyproject.toml`) so `uv sync` installs dev tooling into the workspace `.venv`.
- **`libs/data-access/py-interfaces/project.json`**:
  - `name`: `"py-data-access-interfaces"`, `projectType`: `"library"`, `sourceRoot`: `"libs/data-access/py-interfaces/src"`, `tags`: `["scope:data-access", "type:interfaces", "lang:py"]`, `implicitDependencies`: `["proto-contracts"]`.
  - Targets (`executor: "nx:run-commands"`, `options.cwd: "libs/data-access/py-interfaces"`):
    - `lint`: `cache: true`, `inputs: ["default", "{workspaceRoot}/pyproject.toml"]`, `command: "uv run ruff check ."`
    - `typecheck`: `cache: true`, `inputs: ["default", "{workspaceRoot}/pyproject.toml"]`, `command: "uv run pyright"`
    - `test`: `cache: true`, `inputs: ["default", "{workspaceRoot}/pyproject.toml"]`, `outputs: ["{projectRoot}/test-output/pytest/coverage"]`, `command: "uv run pytest --cov=src --cov-report=term-missing --cov-report=html:test-output/pytest/coverage --cov-fail-under=80"`

---

## 5. Verification Method
To independently verify the facts and recommendations in this report:
1. Inspect root configs (`nx.json`, `tsconfig.base.json`, `tsconfig.json`, `vitest.config.mts`, `package.json`, `pnpm-workspace.yaml`, `pyproject.toml`, `eslint.config.mjs`) and `libs/ui/atomic-design-interfaces/*`.
2. Run read-only Nx inspection and existing tests:
   ```bash
   pnpm nx show project atomic-design-interfaces --json
   pnpm nx test atomic-design-interfaces -- --coverage
   pnpm nx typecheck atomic-design-interfaces
   pnpm nx lint atomic-design-interfaces
   ```
3. Verify environment & registry status:
   ```bash
   node -v && pnpm -v && uv --version && python3 --version
   pnpm view @bufbuild/buf version
   ```
4. Invalidation conditions: If Track A changes `nx.json` plugins, `tsconfig.base.json` compiler options, or `pyproject.toml` Python version/groups differently from `implementation_plan.md`, re-check Track B's project configs against Track A's final files.
