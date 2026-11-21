# Survey Explorer 2 Handoff — `libs/ui/react-mui` & `libs/ui/rn-paper`

> **Core Summary**: Both `libs/ui/react-mui` (`@mono-magic/react-mui`) and `libs/ui/rn-paper` (`@mono-magic/rn-paper`) currently contain only 3 legacy components (`MagicButton`, composite `MagicTextInput`, `MagicSearchBar`), minimal Storybook 10 configs with `addons: []`, and single-project Vitest 4 jsdom configs; baseline `lint`, `typecheck`, and `test` pass on both. Key architectural/tooling findings that must be handled during setup: (1) neither library has an Nx `build` target (source-exported TS libs), (2) Playwright's bundled Chromium is absent on this VM but `/usr/bin/chromium` (v156) launches cleanly headless, (3) `ci.yml` runs `pnpm nx affected -t lint test build` without Playwright so `test` must isolate the jsdom unit project from `test-storybook`, (4) Vitest 4 requires `coverage` at top-level `test.coverage` rather than inside `test.projects[]`, (5) `tools/ci/storybook-pages.mjs` only reads `project.json` for custom `build-storybook` `outputDir`, and (6) `react-docgen-typescript` requires explicit `tsconfigPath: './tsconfig.lib.json'` because both projects use solution-style `tsconfig.json` files with `"files": []`.

---

## 1. Observation

### 1.1 Workspace & Installed Package Versions (Verified in `node_modules` & Root `package.json`)

Checked via `/home/antigravity/sukrutsathaye/mono-magic/package.json` and direct `node` resolution against `node_modules` and `node_modules/.pnpm`:

| Package | Root `package.json` Range | Resolved Version in `node_modules` | Direct Root Dep? |
| --- | --- | --- | --- |
| `react` / `react-dom` | `^19.0.0` | `19.3.1` | Yes (`dependencies`) |
| `typescript` | `~6.0.0` | `6.0.3` | Yes (`devDependencies`) |
| `vite` | `^8.0.0` | `8.3.8` | Yes (`devDependencies`) |
| `@vitejs/plugin-react` | `^6.0.0` | `6.x` (no `./package.json` export) | Yes (`devDependencies`) |
| `@mui/material` | `^9.5.0` | `9.5.0` | Yes (`dependencies`) |
| `@mui/icons-material` | — | **Not installed** | **No** |
| `@emotion/react` / `@emotion/styled` | `^11.14.0` / `^11.14.1` | `11.14.0` / `11.14.1` | Yes (`dependencies`) |
| `react-native` | `0.85.3` | `0.85.3` | Yes (`dependencies`) |
| `react-native-web` | `^0.21.4` | `0.21.4` | Yes (`dependencies`) |
| `react-native-paper` | `^5.15.4` | `5.15.4` | Yes (`dependencies`) |
| `react-native-safe-area-context` | `^5.11.1` | `5.11.1` | Yes (`dependencies`) |
| `storybook` | `^10.6.2` | `10.6.7` | Yes (`devDependencies`) |
| `@storybook/react` / `@storybook/react-vite` | `^10.6.2` | `10.6.7` | Yes (`devDependencies`) |
| `@storybook/addon-docs` | `^10.6.7` | `10.6.7` | Yes (`devDependencies`) |
| `@storybook/addon-a11y` | `^10.6.7` | `10.6.7` | Yes (`devDependencies`) |
| `@storybook/addon-vitest` | `^10.6.7` | `10.6.7` | Yes (`devDependencies`) |
| `storybook-addon-vis` | `^4.8.0` | `4.8.0` | Yes (`devDependencies`) |
| `vitest` | `^4.0.8` | `4.1.12` | Yes (`devDependencies`) |
| `@vitest/coverage-v8` | `^4.0.8` | `4.1.12` | Yes (`devDependencies`) |
| `@vitest/browser` / `@vitest/browser-playwright` | `^4.1.12` | `4.1.12` | Yes (`devDependencies`) |
| `playwright` | `^1.65.1` | `1.65.1` | Yes (`devDependencies`) |
| `jsdom` | `^27.1.0` | `27.x` | Yes (`devDependencies`) |
| `@testing-library/react` / `@testing-library/dom` | `16.3.0` / `10.4.0` | `16.3.0` / `10.4.0` | Yes (`devDependencies`) |
| `@testing-library/user-event` | — | Transitive only (`14.6.10` in `.pnpm`, **not** directly resolvable from root) | **No** (use `userEvent` from `storybook/test` in stories, `fireEvent` from `@testing-library/react` in specs) |
| `react-docgen` / `react-docgen-typescript` / `@joshwooding/vite-plugin-react-docgen-typescript` | — | Transitive deps of `@storybook/react-vite` (`8.0.4`, `2.4.0`, `0.7.0`) | Bundled by `@storybook/react-vite` |
| `eslint` / `eslint-plugin-react` / `eslint-plugin-react-hooks` / `eslint-plugin-jsx-a11y` | `^9.8.0` / `^7.35.0` / `5.0.0` / `6.10.1` | `9.39.5` / `7.37.5` / `5.0.0` / `6.10.1` | Yes (`devDependencies`) |

- `storybook/test` verified exports: `fn: function`, `expect: function`, `userEvent: object`, `within: function`, `waitFor: function`, `fireEvent: function`.

---

### 1.2 Playwright Chromium Availability on VM

- `playwright.chromium.executablePath()` returned:
  `/home/antigravity/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome` -> **`exists: false`**.
- System binaries present:
  - `/usr/bin/chromium` -> `Chromium 156.0.8078.79 built on Debian GNU/Linux 12 (bookworm)`
  - `/usr/bin/google-chrome` -> `Chromium 156.0.8078.79 built on Debian GNU/Linux 12 (bookworm)`
- Direct launch test succeeded without extra flags:
  `chromium.launch({ executablePath: "/usr/bin/chromium", headless: true })` -> `Launched /usr/bin/chromium successfully! version: 156.0.8078.79`.
- `@vitest/browser-playwright`'s `playwright(options)` accepts `launchOptions?: Omit<LaunchOptions, "tracesDir">` (confirmed in `@vitest/browser-playwright/dist/index.d.ts`).

---

### 1.3 Complete Inventory of `libs/ui/react-mui/`

#### Config & Tooling Files
- **`libs/ui/react-mui/package.json`** (22 lines):
  - `name`: `"@mono-magic/react-mui"`, `main`/`types`/`exports["."]`: `"./src/index.ts"`.
  - `nx`: `{ "name": "react-mui", "tags": ["scope:ui", "framework:react", "ds:material"] }`.
  - `dependencies`: `{ "@mono-magic/atomic-design-interfaces": "workspace:*" }`.
  - **No `project.json`** exists.
- **`libs/ui/react-mui/tsconfig.json`** (17 lines): Solution-style (`"files": [], "include": []`), references `./tsconfig.lib.json`, `./tsconfig.spec.json`, `./tsconfig.storybook.json`.
- **`libs/ui/react-mui/tsconfig.lib.json`** (60 lines): `outDir: "dist"`, `rootDir: "src"`, `jsx: "react-jsx"`, `module: "esnext"`, `moduleResolution: "bundler"`, `lib: ["es2022", "dom", "dom.iterable"]`, `types: ["node", "@nx/react/typings/cssmodule.d.ts", "@nx/react/typings/image.d.ts"]`. References `../atomic-design-interfaces/tsconfig.lib.json`.
- **`libs/ui/react-mui/tsconfig.spec.json`** (38 lines): `outDir: "./out-tsc/vitest"`, `jsx: "react-jsx"`, `types: ["vitest/globals", "vitest/importMeta", "vite/client", "node", "vitest"]`, includes `vite.config.mts`, `src/**/*.spec.tsx`, etc. References `./tsconfig.lib.json`.
- **`libs/ui/react-mui/tsconfig.storybook.json`** (41 lines): `outDir: "out-tsc/storybook"`, **`jsx: "preserve"`** (differs from `react-jsx`), **no `types` array**, includes `src/**/*.stories.*` and `.storybook/*.{js,ts,tsx}`, references `./tsconfig.lib.json`. Note: has NO `*.mdx` declaration file (unlike `libs/ui/ng-mat/.storybook/typings.d.ts`).
- **`libs/ui/react-mui/vite.config.mts`** (24 lines): Single Vitest config (`name: 'react-mui'`, `environment: 'jsdom'`, `globals: true`, `watch: false`, `include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]`, `coverage: { reportsDirectory: './test-output/vitest/coverage', provider: 'v8' }`).
- **`libs/ui/react-mui/eslint.config.mjs`** (26 lines): Composes `...nx.configs["flat/react"]` + `...baseConfig`; ignores `dist`, `storybook-static`, `test-output`, `**/out-tsc`.
- **`libs/ui/react-mui/.storybook/main.ts`** (42 lines): `stories: ['../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))']`, `addons: []`, `framework: @storybook/react-vite` with `builder.viteConfigPath: 'vite.config.mts'`.
- **`libs/ui/react-mui/.storybook/preview.tsx`** (15 lines): Wraps `<Story />` in `<MagicMuiThemeProvider>`. No `tags`, no `globalTypes`, no `a11y`, no `docs`, no `visAnnotations`.
- **`libs/ui/react-mui/README.md`** (8 lines): Default Nx scaffold stub.

#### Existing Source Files (`libs/ui/react-mui/src/`)
- `src/index.ts`: Re-exports `./lib/theme/mui-theme`, `./lib/atoms`, `./lib/molecules`, `./lib/organisms`, `./lib/templates`.
- `src/lib/theme/mui-theme.tsx` (45 lines): Single static `magicMuiTheme = createTheme({ palette: { mode: 'light', primary: '#6750A4', secondary: '#625B71', error: '#B3261E' }, shape: { borderRadius: 12 }, components: { MuiButton: ... } })` and `MagicMuiThemeProvider({ children })` rendering `<ThemeProvider><CssBaseline />{children}</ThemeProvider>`.
- `src/lib/atoms/button/button.tsx` (73 lines): Wraps `@mui/material/Button` only. Implements `variant` (`filled`/`elevated`->`contained`, `tonal`/`outlined`->`outlined`, `text`->`text`), `color` (`tertiary` mapped to `secondary`, `neutral` mapped to `inherit`), `size` (`xs`/`sm`->`small`, `md`->`medium`, `lg`/`xl`->`large`), `disabled`, `loading`, `fullWidth`, `type`, `onClick`. Missing `kind`, `shape`, `leadingIcon`, `trailingIcon`, `disabledInteractive`, `disableRipple`, `loadingLabel`, `children`, `sx`, `slotProps`, `ref`.
- `src/lib/atoms/text-input/text-input.tsx` (76 lines): Legacy composite wrapper around `@mui/material/TextField` extending `TextInputAtomProps` (contains `label`, `helperText`, `errorText`, `variant`), uses `slotProps={{ input: { readOnly }, htmlInput: { ... } }}`. Must be refactored to bare `TextInputControlProps` + `MagicFormFieldContext`.
- `src/lib/molecules/search-bar/search-bar.tsx` (80 lines): Composes `Box (component="form")` + `Stack` + legacy `MagicTextInput` + `MagicButton` with local `useState(query ?? '')`.
- `src/lib/organisms/index.ts` & `src/lib/templates/index.ts`: Empty `export {};` placeholders.
- Existing stories (3 files: `button.stories.tsx`, `text-input.stories.tsx`, `search-bar.stories.tsx`): Basic CSF3 without `tags: ['autodocs']`, categorized `argTypes`, JSDoc, or `play` functions.
- Existing specs (3 files: `button.spec.tsx` [2 tests], `text-input.spec.tsx` [2 tests], `search-bar.spec.tsx` [1 test]): All 5 tests pass under Vitest 4.1.12 jsdom.

#### Nx Inferred Targets for `react-mui` (`pnpm exec nx show project react-mui --json`)
Targets: `lint`, `test`, `test-ci`, `test-ci--<spec>` (3 atomized targets), `build-storybook`, `storybook`, `static-storybook`, `build-deps`, `watch-deps`, `typecheck`, `nx-release-publish`.
- **Notable absences**:
  - **No `build` target** (because `package.json` exports `./src/index.ts` directly and `tsconfig.base.json` sets `"emitDeclarationOnly": true`, so `@nx/js/typescript` infers only `typecheck`).
  - **No `test-storybook` target** (must be explicitly added, matching `libs/ui/ng-mat/project.json:68-74`).
- `build-storybook` runs `storybook build` in `libs/ui/react-mui`, outputting to `libs/ui/react-mui/storybook-static` by default.

---

### 1.4 Complete Inventory of `libs/ui/rn-paper/`

#### Config & Tooling Files
- **`libs/ui/rn-paper/package.json`** (26 lines):
  - `name`: `"@mono-magic/rn-paper"`, `main`/`types`/`exports["."]`: `"./src/index.ts"`.
  - `nx`: `{ "name": "rn-paper", "tags": ["scope:ui", "framework:expo", "ds:paper"] }`.
  - `peerDependencies`: `{ "react": "^19.2.0", "react-native": "0.85.3" }`.
  - `dependencies`: `{ "@mono-magic/atomic-design-interfaces": "workspace:*" }`.
  - **No `project.json`** exists.
- **`libs/ui/rn-paper/tsconfig.json`** (23 lines): Solution-style (`"files": [], "include": []`), references `./tsconfig.lib.json`, `./tsconfig.spec.json`, `./tsconfig.storybook.json`.
- **`libs/ui/rn-paper/tsconfig.lib.json`** (51 lines): `outDir: "dist"`, `rootDir: "src"`, `jsx: "react-jsx"`, `module: "esnext"`, `moduleResolution: "bundler"`, `types: ["node"]`, excludes `src/test-setup.ts`, stories, tests. References `../atomic-design-interfaces/tsconfig.lib.json`.
- **`libs/ui/rn-paper/tsconfig.spec.json`** (44 lines): `outDir: "./out-tsc/vitest"`, `jsx: "react-jsx"`, `types: ["vitest/globals", "vitest/importMeta", "vite/client", "node", "vitest"]`, `files: ["src/test-setup.ts"]`. References `./tsconfig.lib.json` and `../atomic-design-interfaces/tsconfig.lib.json`.
- **`libs/ui/rn-paper/tsconfig.storybook.json`** (39 lines): `outDir: "out-tsc/storybook"`, `jsx: "react-jsx"`, **no `types` array**, includes `src/**/*.stories.*` and `.storybook/*.{js,ts,tsx}`. References `./tsconfig.lib.json` and `../atomic-design-interfaces/tsconfig.lib.json`. No `*.mdx` declaration file.
- **`libs/ui/rn-paper/vite.config.mts`** (119 lines):
  - Defines `rnPaperWebPlugin()` (`enforce: 'pre'`):
    1. `resolveId`: intercepts `@expo/vector-icons*` -> virtual module `\0virtual:expo-vector-icons-stub` (`export default null;`).
    2. `transform`: rewrites the 3 CJS `require(...)` calls inside `react-native-paper/lib/module/components/MaterialCommunityIcon.js` (`@expo/vector-icons/MaterialCommunityIcons`, `@react-native-vector-icons/material-design-icons`, `react-native-vector-icons/MaterialCommunityIcons`) to `({ default: null })`.
  - Defines `webExtensions = ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json']`.
  - Uses Vite 8 Rolldown syntax: `optimizeDeps: { rolldownOptions: { plugins: [rnPaperWebPlugin()], resolve: { extensions: webExtensions } } }`.
  - `resolve.alias`: maps `'react-native'` -> `react-native-web/dist/index.js`, `'react-native-paper'` -> `react-native-paper/lib/module/index.js`, `'react-native-safe-area-context'` -> `react-native-safe-area-context/lib/module/index.js`.
  - `define: { __DEV__: false }`.
  - `test`: single jsdom project (`name: 'rn-paper'`, `setupFiles: ['src/test-setup.ts']`, `server.deps.inline: [/react-native-paper/, /react-native-safe-area-context/, /react-native-web/]`, `coverage: { reportsDirectory: './test-output/vitest/coverage', provider: 'v8' }`).
- **`libs/ui/rn-paper/src/test-setup.ts`** (29 lines): Monkey-patches `Module._resolveFilename` in Node/jsdom so `require('react-native')` resolves to `react-native-web` and `@expo/vector-icons*` throws `MODULE_NOT_FOUND` (matching Paper's `try/catch` fallback).
- **`libs/ui/rn-paper/eslint.config.mjs`** (30 lines): Composes `...nx.configs["flat/react"]` + `...baseConfig`; ignores `.expo`, `web-build`, `cache`, `dist`, `storybook-static`, `out-tsc`, `test-output`, `**/out-tsc`.
- **`libs/ui/rn-paper/.storybook/main.ts`** (35 lines): `addons: []`, **`typescript: { reactDocgen: false }`**, `builder.viteConfigPath` points to `../vite.config.mts`, `viteFinal` ensures `__DEV__: false`.
- **`libs/ui/rn-paper/.storybook/preview.tsx`** (15 lines): Wraps `<Story />` in `<MagicPaperProvider>`.
- **`libs/ui/rn-paper/README.md`** (8 lines): Default Nx stub (incorrectly mentions Jest instead of Vitest).

#### Existing Source Files (`libs/ui/rn-paper/src/`)
- `src/index.ts`: Re-exports `./lib/theme/paper-theme`, `./lib/atoms`, `./lib/molecules`, `./lib/organisms`, `./lib/templates`.
- `src/lib/theme/paper-theme.tsx` (53 lines): Single static `magicPaperTheme` extending `MD3LightTheme` (`primary: '#1976d2'`, `secondary: '#9c27b0'`, `tertiary: '#0288d1'`, `error: '#d32f2f'`, `roundness: 8`). `defaultSettings.icon` renders a plain `<Text>{typeof name === 'string' ? name : '•'}</Text>` (raw icon name string, not Material Icons font!).
- `src/lib/atoms/button/button.tsx` (94 lines): Wraps `PaperButton` only (`mode`, `compact`, `disabled`, `loading`, `icon`, `contentStyle`, `style`, `onPress`, hardcoded `magicPaperTheme` reference instead of `useTheme()`!). Missing `kind` (`icon`/`fab`/`mini-fab`/`extended-fab`), `shape`, `trailingIcon`, `disabledInteractive`, `loadingLabel`, `children`.
- `src/lib/atoms/text-input/text-input.tsx` (67 lines): Legacy composite wrapper around `PaperTextInput` + `HelperText` extending `TextInputAtomProps`. Must be refactored to bare `TextInputControlProps` + `MagicFormFieldContext`.
- `src/lib/molecules/search-bar/search-bar.tsx` (74 lines): Composes `View` + legacy `MagicTextInput` + `MagicButton` with local `useState(query ?? '')`.
- `src/lib/organisms/index.ts` & `src/lib/templates/index.ts`: Empty `export {};` placeholders.
- Existing specs (3 files, 6 tests total): All 6 tests pass under Vitest 4.1.12 jsdom.

#### Nx Inferred Targets for `rn-paper` (`pnpm exec nx show project rn-paper --json`)
Targets: `lint`, `test`, `test-ci`, `test-ci--<spec>` (3 atomized targets), `build-storybook`, `storybook`, `static-storybook`, `build-deps`, `watch-deps`, `typecheck`, `nx-release-publish`.
- Same two notable absences as `react-mui`: **no `build` target** and **no `test-storybook` target**.

---

### 1.5 Verified Component Exports & API Surfaces

#### `@mui/material` v9.5.0 (Verified via ESM import & `.d.ts` inspection)
- **All required components are exported**: `Badge`, `Button`, `IconButton`, `Fab`, `ToggleButton`, `ToggleButtonGroup`, `Checkbox`, `FormControlLabel`, `FormGroup`, `Chip`, `LinearProgress`, `CircularProgress`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `Tooltip`, `Card`, `CardHeader`, `CardMedia`, `CardContent`, `CardActions`, `FormControl`, `InputLabel`, `OutlinedInput`, `FilledInput`, `Input`, `FormHelperText`, `InputAdornment`, `TextField`, `Menu`, `MenuItem`, `ListItemIcon`, `ListItemText`, `Divider`, `Select`, `ListSubheader`, `Icon`, `Avatar`, `Box`, `Stack`, `Typography`, `createTheme`, `ThemeProvider`, `CssBaseline`, `useTheme`.
- **MUI v9 breaking APIs confirmed**:
  - `Button` AND `IconButton` both natively support `loading?: boolean | null`, `loadingIndicator?: ReactNode`, `loadingPosition?: 'start' | 'end' | 'center'` (no `@mui/lab` needed).
  - `TextField` **removed** deprecated `InputProps` (only `slotProps: { input, htmlInput, inputLabel, formHelperText, select }`).
  - `Menu` **removed** deprecated `MenuListProps` and `PaperProps` (use `slotProps: { list, paper, root, transition, backdrop }`).
  - `Tooltip` uses `slotProps: { popper, transition, tooltip, arrow }`.
  - `Select` still accepts `MenuProps?: Partial<MenuProps>` and `inputProps` (extending `OutlinedInputProps` / `FilledInputProps` / `InputProps`).
  - `Palette` / `PaletteOptions` and every component's `*PropsColorOverrides` (`ButtonPropsColorOverrides`, `BadgePropsColorOverrides`, `ChipPropsColorOverrides`, `SwitchPropsColorOverrides`, `SliderPropsColorOverrides`, etc.) support standard TypeScript module augmentation (`declare module '@mui/material/styles'`).

#### `react-native-paper` v5.15.4 & `react-native-web` v0.21.4 (Verified via `lib/typescript/*.d.ts` & runtime import)
- **All expected Paper components are exported**:
  - `Badge` (`visible`, `children: string | number`, `size?: number`, `style`)
  - `Button` (`mode: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal'`, `icon`, `loading`, `disabled`, `compact`, `buttonColor`, `textColor`, `contentStyle`)
  - `IconButton` (`icon`, `mode?: 'outlined' | 'contained' | 'contained-tonal'`, `iconColor`, `containerColor`, `selected`, `loading`, `size`)
  - `FAB` (`icon`, `label` [makes it extended], `size?: 'small' | 'medium' | 'large'`, `variant?: 'primary' | 'secondary' | 'tertiary' | 'surface'`, `mode?: 'flat' | 'elevated'`) + `AnimatedFAB`
  - `SegmentedButtons` (supports `multiSelect?: boolean`, `value: T | T[]`, `onValueChange`, `density`, `buttons[]` — **horizontal-only**, no vertical layout prop) + `ToggleButton` (`ToggleButton.Row`, `ToggleButton.Group`)
  - `Checkbox` (`status: 'checked' | 'unchecked' | 'indeterminate'`, `Checkbox.Item`)
  - `Chip` (`mode: 'flat' | 'outlined'`, `icon`, `avatar`, `closeIcon`, `selected`, `showSelectedCheck`, `onPress`, `onClose`, `elevated`)
  - `ProgressBar` (`progress`, `indeterminate`, `color`, `visible`) & `ActivityIndicator` (`animating`, `color`, `size: 'small' | 'large' | number`)
  - `RadioButton` (`RadioButton.Group`, `RadioButton.Item`, `status: 'checked' | 'unchecked'`)
  - `Switch` (`value?: boolean`, `onValueChange`, `disabled`, `color`)
  - `TextInput` (`mode: 'flat' | 'outlined'`, `left`/`right`, `TextInput.Icon`, `TextInput.Affix`, `error`, `dense`, `editable`, `secureTextEntry`)
  - `Tooltip` (`title: string`, `children: ReactElement`, `enterTouchDelay`, `leaveTouchDelay` — **no `position` or `disabled` prop**; uses `measure()` and `onHoverIn`/`onHoverOut`/`onLongPress`)
  - `Card` (`mode: 'elevated' | 'outlined' | 'contained'`, `Card.Title`, `Card.Content`, `Card.Cover`, `Card.Actions`)
  - `HelperText` (`type: 'error' | 'info'`, `visible`, `padding: 'none' | 'normal'`)
  - `Menu` (`visible`, `anchor`, `anchorPosition: 'top' | 'bottom'`, `onDismiss`, `Menu.Item` — uses `measureInWindow` + `BackHandler` + `Portal`)
  - `Portal` (`Portal.Host`, already included inside `PaperProvider`)
  - `List` (`List.Section`, `List.Subheader`, `List.Item`, `List.Icon`, `List.Accordion`), `Divider` (`bold`, `leftInset`, `horizontalInset`), `Avatar` (`Avatar.Image`, `Avatar.Icon`, `Avatar.Text`), `Icon`, `Surface`, `TouchableRipple`, `Text`
  - Themes: `MD3LightTheme`, `MD3DarkTheme`, `useTheme`, `PaperProvider`, `MD3Colors`
- **`react-native-web` v0.21.4 exports**: `View`, `Text`, `Pressable`, `TextInput`, `Switch`, `ScrollView`, `FlatList`, `Modal`, `Platform`, `StyleSheet`, `Animated`, `Dimensions`, `PanResponder`, `TouchableOpacity`, `AccessibilityInfo`, `I18nManager`.
- **Missing native primitive confirmed**: Neither `react-native-paper` nor `react-native-web` ships a `Slider` or `Select` component (matching the approved plan to build lightweight pure-RN `MagicSlider` and `Paper.Menu`-backed `MagicSelect`).

#### `ng-mat` Baseline 7 Material 3 Palettes (from `libs/ui/ng-mat/src/theme/_palettes.scss` & `.storybook/preview.ts`)
Exact palette IDs and light/dark modes to mirror in both `react-mui` and `rn-paper`:
1. `azure-blue` (Light — default; Azure primary, Blue tertiary)
2. `light-theme` (Light; Violet primary, Orange tertiary)
3. `dark-theme` (Dark; Green primary, Orange tertiary)
4. `rose-red` (Light; Rose primary, Red tertiary)
5. `cyan-orange` (Dark; Cyan primary, Orange tertiary)
6. `orange-red` (Light; Orange primary, Red tertiary)
7. `magenta-violet` (Dark; Magenta primary, Violet tertiary)

---

## 2. Logic Chain (Pitfalls & Root Causes -> Actionable Fixes)

1. **CI Pipeline (`ci.yml`) vs. Dual-Project Vitest 4 Config (`test.projects`)**
   - *Observations*: `.github/workflows/ci.yml:24` runs `pnpm nx affected -t lint test build` with no Playwright installation step. By default, `@nx/vitest` infers `test` as `vitest` with no `--project` flag.
   - *Inference*: Once `vite.config.mts` defines `test.projects: [unitProject, storybookBrowserProject]`, running `pnpm exec nx run <lib>:test` (and CI's `nx affected -t test`) will execute **both** projects, attempting to launch Playwright Chromium in CI and failing.
   - *Fix*: Add a `project.json` in both `libs/ui/react-mui/project.json` and `libs/ui/rn-paper/project.json` that explicitly overrides `test` to `vitest run --project=react-mui` (or `rn-paper`) and defines `test-storybook` as `vitest run --project=react-mui-storybook` (or `rn-paper-storybook`). Keep `test` fast and jsdom-only for CI while `test-storybook` runs Playwright + a11y + `storybook-addon-vis`.

2. **Vitest 4 `coverage` Placement with `test.projects`**
   - *Observations*: In Vitest 4.1.12 (`reporters.d.DtoKVV2s.d.ts:3597`), `ProjectConfig` omits `NonProjectOptions` (which includes `coverage`). Both `react-mui/tsconfig.spec.json` and `rn-paper/tsconfig.spec.json` include `vite.config.mts`.
   - *Inference*: Putting `coverage` (and `thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 }`) inside `test.projects[0].test` will either fail TypeScript typecheck or be silently ignored by Vitest 4.
   - *Fix*: Place `coverage` at the **top-level `test.coverage`** inside `vite.config.mts`, with `include: ['src/lib/**/*.{ts,tsx}']` and `exclude: ['**/*.stories.*', '**/*.spec.*', '**/*.test.*', '**/index.ts', 'src/test-setup.ts']`.

3. **Playwright System Chromium Fallback on VM**
   - *Observations*: `playwright.chromium.executablePath()` (`~/.cache/ms-playwright/chromium-1255/...`) does not exist on this VM, whereas `/usr/bin/chromium` (v156.0.8078.79) launches cleanly headless.
   - *Inference*: Calling `playwright()` with no options in `vite.config.mts` will fail locally on this VM with `Executable doesn't exist`.
   - *Fix*: Resolve `executablePath` dynamically in `vite.config.mts`: if `existsSync(chromium.executablePath())` is false and `existsSync('/usr/bin/chromium')` is true, pass `playwright({ launchOptions: { executablePath: '/usr/bin/chromium' } })` (honoring `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` first). This works seamlessly on both this VM and GitHub Actions (where Playwright's bundled browser or system Chromium may be used).

4. **Missing `build` Target on `react-mui` and `rn-paper`**
   - *Observations*: Neither `react-mui` nor `rn-paper` has an Nx `build` target (verified via `nx show project --json`), because `package.json` exports `./src/index.ts` directly (matching `ng-mat/package.json`, which also has no `build` target).
   - *Inference*: Running `pnpm exec nx run react-mui:build` (listed in `implementation_plan.md` lines 277/287) will fail with "Cannot find configuration for task `react-mui:build`".
   - *Fix*: Do NOT invent an unnecessary Vite library build unless desired — verification should use `lint`, `typecheck`, `test -- --coverage`, `build-storybook`, and `test-storybook`. (`nx affected -t lint test build` in `ci.yml` automatically skips projects without a `build` target.)

5. **`tools/ci/storybook-pages.mjs` Output Directory Alignment**
   - *Observations*: `tools/ci/storybook-pages.mjs:101-104` reads `projectJson?.targets?.['build-storybook']?.options?.outputDir` and defaults to `<root>/storybook-static` if absent. It does **not** read `package.json`'s `nx.targets`.
   - *Inference*: If `build-storybook` outputs to `dist/storybook/<lib>`, it MUST be declared in `project.json` under `targets["build-storybook"].options.outputDir` (AND the command must pass `-o ../../../dist/storybook/<lib>` or use `@nx/storybook:build`), otherwise `storybook-pages.mjs` will fail to find `index.html`. Alternatively, keeping the inferred `storybook-static` default works out-of-the-box with `storybook-pages.mjs`.
   - *Fix*: If creating `project.json` for `test` and `test-storybook`, either omit `build-storybook` (keeping inferred `storybook build` -> `libs/ui/<lib>/storybook-static`, which `eslint.config.mjs` already ignores and `storybook-pages.mjs` already expects), OR explicitly set both `options.outputDir: "dist/storybook/<lib>"` AND `command: "storybook build -o ../../../dist/storybook/<lib>"`. Omitting `build-storybook` override (keeping `storybook-static`) is simplest and zero-risk.

6. **`react-docgen-typescript` & Solution-Style `tsconfig.json` + RN Paper Compatibility**
   - *Observations*:
     - `@storybook/react-vite` bundles `@joshwooding/vite-plugin-react-docgen-typescript` (`0.7.0`) and `react-docgen` (`8.0.4`).
     - Both `libs/ui/react-mui/tsconfig.json` and `libs/ui/rn-paper/tsconfig.json` have `"files": [], "include": []`.
     - `libs/ui/rn-paper/.storybook/main.ts:8-10` previously set `reactDocgen: false`.
   - *Inference*: If `reactDocgen: 'react-docgen-typescript'` is enabled without `reactDocgenTypescriptOptions.tsconfigPath`, the plugin defaults to `tsconfig.json` (which includes zero files!) or crawls `node_modules` (`@mui/material` / `react-native` Flow types), either yielding empty prop tables or crashing/timing out during `build-storybook`.
   - *Fix*:
     - In `react-mui/.storybook/main.ts`, configure:
       ```ts
       typescript: {
         reactDocgen: 'react-docgen-typescript',
         reactDocgenTypescriptOptions: {
           tsconfigPath: './tsconfig.lib.json',
           shouldExtractLiteralValuesFromEnum: true,
           shouldRemoveUndefinedFromOptional: true,
           propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
         },
       }
       ```
       (Optionally allow specific MUI escape-hatch props or document them in `Magic*Props` JSDoc so prop tables stay crisp and fast.)
     - In `rn-paper/.storybook/main.ts`, test `react-docgen-typescript` with `tsconfigPath: './tsconfig.lib.json'` and `include: ['src/lib/**/*.tsx']` + `exclude: ['**/node_modules/**']` + `propFilter` excluding `node_modules` (so it never parses `react-native` Flow sources); if `typescript@6.0.3` + `react-native` types cause any parser edge case, fall back cleanly to `reactDocgen: 'react-docgen'` (Babel-based, works on pure TS files under `src/lib/`).

7. **MDX & Storybook Typecheck Pitfalls (`tsconfig.storybook.json`)**
   - *Observations*: `ng-mat/.storybook/preview.ts` imports `DocumentationTemplate from './DocumentationTemplate.mdx'` and relies on `ng-mat/.storybook/typings.d.ts` (`declare module '*.mdx'`). Neither `react-mui` nor `rn-paper` has `.storybook/typings.d.ts`, and `react-mui/tsconfig.storybook.json` has `"jsx": "preserve"` and lacks `"types": ["node"]`.
   - *Inference*: Adding `DocumentationTemplate.mdx` and `.storybook/vitest.setup.ts` will break `nx run <lib>:typecheck` unless `.storybook/typings.d.ts` is added and `tsconfig.storybook.json` has `"jsx": "react-jsx"` and `"types": ["node"]`. Also `.storybook/vitest.setup.ts` for React must call `setProjectAnnotations([a11yAddonAnnotations, projectAnnotations])` from `@storybook/react-vite` (or `@storybook/react`), unlike Angular's setup.
   - *Fix*: Add `.storybook/typings.d.ts` in both libs, update `tsconfig.storybook.json` (`jsx: "react-jsx"`, `types: ["node"]`, include `.storybook/*.d.ts`), and add `storybook-addon-vis` `optimizeDeps` exclusions/inclusions (`exclude: ['storybook-addon-vis', 'vitest-plugin-vis']`, `include: ['storybook-addon-vis > vitest-plugin-vis > ssim.js', 'storybook-addon-vis > vitest-plugin-vis > pngjs']`) in the Storybook Vite project matching `ng-mat/vite.config.mts:48-54`.

8. **RN Paper Specific Runtime Pitfalls (jsdom + Web Browser + Icons)**
   - *Observations*:
     - `Paper.Menu` calls `measureInWindow` and subscribes to `BackHandler`. Under jsdom, `measureInWindow` returns `0, 0, 0, 0` (or may not invoke callback unless layout is mocked or anchor `{ x, y }` coordinates are used), which can keep `Menu` content unmounted (`opacity: 0` / hidden) in jsdom unit tests!
     - `Paper.Tooltip` has **no** `position` or `disabled` prop and relies on `measure()` + `onHoverIn`/`onHoverOut`/`onLongPress`.
     - `Paper.SegmentedButtons` only renders horizontally (`flexDirection: 'row'`).
     - `rnPaperWebPlugin` stubs `@expo/vector-icons` to `null`; `paper-theme.tsx`'s current `defaultSettings.icon` renders raw icon names as plain `<Text>{name}</Text>`.
     - `rn-paper/vite.config.mts` uses `optimizeDeps.rolldownOptions` (Vite 8) and `resolve.alias` for `react-native` -> `react-native-web/dist/index.js`. When splitting into `test.projects`, **both** projects (`rn-paper` and `rn-paper-storybook`) must inherit `plugins: [rnPaperWebPlugin(), react()]`, `resolve.alias`, `resolve.extensions`, `define: { __DEV__: false }`, and `optimizeDeps.rolldownOptions` (keep shared Vite config at top-level or set `extends: true` on each project in Vitest 4!).
     - `rn-paper/src/lib/atoms/button/button.tsx` currently imports the static `magicPaperTheme` directly instead of calling `useTheme()`, so theme switching won't update button colors!
   - *Fix*:
     - In `rn-paper/vite.config.mts`, use `extends: true` on both `test.projects` entries so top-level `plugins`, `resolve.alias`, `define`, and `optimizeDeps.rolldownOptions` are automatically inherited by both jsdom and Playwright browser projects!
     - Upgrade `MagicPaperProvider`'s `settings.icon` (and `MagicIcon`) so on `Platform.OS === 'web'` it renders `<Text style={{ fontFamily: '"Material Icons"', ... }}>{name}</Text>` (ligature-based Material Icons Google Font, matching `ng-mat` and `react-mui`!) while still accepting custom `ReactNode` icons cleanly.
     - Always read theme colors dynamically via `useTheme()` + custom `MagicPaperSemanticContext` (never static `magicPaperTheme`).
     - For `MagicToolTip`: wrap `Paper.Tooltip` (or handle `disabled` by returning `children` directly, and provide accessible web/RN tooltip positioning when `position` is customized).
     - For `MagicMenu` & `MagicSelect`: support `Paper.Menu` with `PaperProvider`'s `Portal`, and ensure jsdom tests either mock `measureInWindow` in `src/test-setup.ts` or pass/test coordinate anchor fallback so menu items reliably open and assert cleanly in jsdom AND Playwright.
     - For `MagicButtonToggle`: use `Paper.SegmentedButtons` for horizontal layout (supporting both `single` and `multiple` via `multiSelect`) and render an accessible vertical `Pressable` button group when `vertical={true}`.

9. **ESLint (`nx.configs["flat/react"]`) & React 19 Compliance**
   - *Observations*: Both libs inherit `nx.configs["flat/react"]` (which enables `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`, `jsx-a11y/*`, `react/*`, `@typescript-eslint/no-unused-vars`, `@nx/enforce-module-boundaries`).
   - *Inference*: Violations of `jsx-a11y` (e.g., interactive `div` without role/keyboard handler, missing labels) or `react-hooks/exhaustive-deps` will fail `nx run <lib>:lint`. Also in `react-mui`/`rn-paper`, avoid `React.forwardRef` (React 19 passes `ref` directly as a prop), use `<Context value={...}>` directly, and avoid `@testing-library/user-event` imports in `*.spec.tsx` since it's not a direct root dependency (`fireEvent` is already used across all existing specs; `userEvent` from `storybook/test` is available in `*.stories.tsx`).

---

## 3. Caveats

- **Read-only scope**: No files were modified; `build-storybook` and `test-storybook` were not executed with modified configs. The `react-docgen-typescript` behavior with `react-native-web` + TypeScript 6.0.3 should be smoke-tested as soon as `rn-paper/.storybook/main.ts` is updated (fallback to `reactDocgen: 'react-docgen'` is documented above if needed).
- **Nx Cloud transient warning**: During baseline `nx run-many`, Nx Cloud logged `Failed to download cached artifacts (400)` (likely sandbox egress or token scope), which did not affect local execution (exit code 0).
- **Root `package.json` untouched**: Per the approved plan, no new dependencies need to be added to root `package.json`. Note that `@testing-library/user-event` and `@mui/icons-material` are NOT installed at root — specs should use `@testing-library/react` (`fireEvent`), stories should use `storybook/test` (`userEvent`, `fn`, `expect`, `within`), and icons should use Material Icons font (`@mui/material/Icon` / web font ligatures) + custom `ReactNode`.

---

## 4. Conclusion

Both `libs/ui/react-mui` and `libs/ui/rn-paper` are clean, minimal, passing baselines ready for full 16-component parity implementation with zero root-file changes required. Implementers should:
1. Create `project.json` in each library defining `test` (`vitest run --project=<lib>`) and `test-storybook` (`vitest run --project=<lib>-storybook`) while keeping inferred `build-storybook` (`storybook-static`) for seamless `tools/ci/storybook-pages.mjs` compatibility and CI safety (`ci.yml` lacks Playwright).
2. Configure `vite.config.mts` with top-level `test.coverage` (`>=80%` thresholds), `test.projects` (`extends: true` for `rn-paper`), `storybook-addon-vis` `optimizeDeps`, and Playwright `executablePath` fallback to `/usr/bin/chromium`.
3. Add `.storybook/typings.d.ts` (`*.mdx`), `.storybook/DocumentationTemplate.mdx`, `.storybook/vitest.setup.ts` (`setProjectAnnotations` + `vis.setup`), 7-palette theme switcher, and `react-docgen-typescript` pointed at `./tsconfig.lib.json` (with `propFilter` excluding `node_modules`).
4. Use MUI v9.5.0 modern APIs (`slotProps`, built-in `Button`/`IconButton` `loading`, palette augmentation for `tertiary`/`neutral`) in `react-mui`, and dynamic `useTheme()` + `Material Icons` web font + `extends: true` `rnPaperWebPlugin` + `measureInWindow` jsdom safety in `rn-paper`.
5. Run verification via `lint`, `typecheck`, `test -- --coverage`, `build-storybook`, and `test-storybook` (omitting non-existent `:build` targets).

---

## 5. Verification Method

Independently reproduce every observation in this report from `/home/antigravity/sukrutsathaye/mono-magic`:

```bash
# 1. Verify Nx inferred targets for both libraries (confirms no 'build' or 'test-storybook' target)
pnpm exec nx show project react-mui --json | jq '.targets | keys'
pnpm exec nx show project rn-paper --json | jq '.targets | keys'

# 2. Verify baseline lint, typecheck, and unit tests pass
pnpm exec nx run-many -t lint typecheck test -p react-mui rn-paper --output-style=static

# 3. Verify Playwright binary availability & system Chromium headless launch
node -e 'import("playwright").then(async ({chromium}) => { const b = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true }); console.log(b.version()); await b.close(); })'

# 4. Verify storybook-pages.mjs discovery contract
node tools/ci/storybook-pages.mjs discover
```

**Invalidation conditions**: Any changes to root `package.json` dependencies, `nx.json` plugins, `tools/ci/storybook-pages.mjs`, `.github/workflows/ci.yml`, or Playwright browser installation in `~/.cache/ms-playwright` would require re-checking the affected sections.
