---
name: interactive-stories
description: >-
  Designs and implements comprehensive, state-complete interactive Storybook stories
  (react-mui, ng-mat, rn-paper, vue-vuetify, svelte-tw) and Flutter Widgetbook use-cases
  (fl-mat) covering the Canonical 7-Category Component State Matrix, categorized Controls/knobs,
  stateful demo wrappers, automated play interaction tests, and visual regression baselines.
---

# Interactive & Comprehensive Component Stories Playbook

Use this skill whenever creating, updating, or auditing Storybook stories (`*.stories.tsx` / `*.stories.ts`) across `react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, and `svelte-tw`, or Flutter Widgetbook use-cases (`*_use_cases.dart`) in `fl-mat`.

---

## 1. Canonical 7-Category Component State Matrix (Mandatory)

Every UI component MUST have stories (and Widgetbook use-cases in `fl-mat`) covering **every applicable state** in this matrix—never ship a component with only a single static story:

1. **`Default` / `InteractivePlayground`**:
   - Wired to full `args` and categorized `argTypes` (Storybook Controls) or `context.knobs` (Flutter Widgetbook) so every public prop can be tweaked live.
   - Wrapped in a reactive state holder (`useState`, Angular `signal`, Vue `ref`, Svelte `$state`, or Flutter `StatefulWidget`) so clicking, typing, toggling, selecting, or dismissing updates the live UI immediately.
2. **`Variants` / `Appearances`**:
   - Renders all visual variants side-by-side or individually (e.g., `filled`, `tonal`, `outlined`, `elevated`, `text`, `raised`, `standard`).
3. **`SizesAndColors` (or separate `Sizes` & `ColorIntents`)**:
   - Exercises all supported `MagicSize` values (`xs`, `sm`, `md`, `lg`, `xl`) and all 7 semantic `MagicColor` intents (`primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, `neutral`).
4. **`DisabledAndLoading` (`Disabled` / `ReadOnly` / `Loading` / `DisabledInteractive`)**:
   - Explicitly showcases disabled state, `disabledInteractive` (focusable for tooltips/a11y while non-activatable), `readOnly`, and async `loading` / indeterminate states.
5. **`ErrorAndEdgeCases` (`Error` / `Validation` / `Empty` / `Overflow`)**:
   - Showcases validation error state (`error`, `errorMessage`, `aria-invalid="true"`), empty data state (0 items/options), and long text truncation/scrollable overflow.
6. **`CustomSlotsAndComposition` (`WithIcons` / `CustomSlots` / `Nested`)**:
   - Exercises leading/trailing icons, avatars, badges, prefix/suffix slots, header/media/footer slots, or nested items/submenus.
7. **`DarkTheme`**:
   - Renders the component inside the library's dark theme palette (`dark-theme` / `cyan-orange` / dark `ThemeData.dark(useMaterial3: true)`) to verify contrast and visual tokens in dark mode.

---

## 2. Storybook CSF3 & `play` Interaction Requirements

### A. Categorized `argTypes` & `autodocs`
- Include `tags: ['autodocs', 'snapshot']` in `meta`.
- Add a JSDoc comment above `meta` describing the component's purpose, composed atoms, and Material 3 design references.
- Categorize every `argTypes` entry under `table: { category: 'Content' | 'Appearance' | 'State' | 'Behavior' | 'Layout' | 'Accessibility' | 'Events' | 'Slots' }`.
- Attach `fn()` spies from `storybook/test` to all callback args (`onClick`, `onChange`, `onClose`, `onSelect`, etc.).

### B. Automated `play` Functions (`storybook/test`)
Every interactive story (`Default`, `Interactive*`, form/selection stories, modal triggers, keyboard flows) MUST define a `play: async ({ args, canvasElement }) => { ... }` function that:
1. Queries elements via accessible roles/labels (`within(canvasElement).getByRole(...)`, `getByLabelText(...)`).
2. Performs real user interactions (`await userEvent.click(...)`, `await userEvent.type(...)`, `await userEvent.keyboard('{Escape}')`).
3. Asserts both **callback invocation** (`await expect(args.onChange).toHaveBeenCalledWith(...)`) and **live DOM/ARIA state transition** (`toHaveAttribute('aria-expanded', 'true')`, `toBeChecked()`, `not.toBeInTheDocument()`).
4. For disabled/readOnly stories, asserts that interaction is blocked or callback is not fired.

### C. Framework-Specific Story Patterns
- **React (`react-mui`) & React Native Paper (`rn-paper`)**:
  - Use a `Stateful<Component>Demo` functional wrapper syncing `useState` with `useEffect(() => setState(args.prop), [args.prop])` so both Controls panel changes and user clicks work seamlessly.
  - For overlay/modal components (`Dialog`, `Menu`, `Select`, `DatePicker`, `Toast`, `ToolTip`), keep `Default` inline/contained (`disablePortal: true` / `inline: true`) for deterministic `storybook-addon-vis` bounding-box snapshots, and provide an `InteractivePortal` / `InteractiveTrigger` story testing portal trigger & dismissal.
- **Angular (`ng-mat`)**:
  - Use `argsToTemplate(args)` or an inline standalone wrapper with Angular `signal(...)` state and `fn()` action spies.
- **Vue (`vue-vuetify`)**:
  - Use `setup(args)` with `ref(args.modelValue)` and `watch(() => args.modelValue, ...)` so Vuetify controls and user clicks stay synchronized.
- **Svelte (`svelte-tw`)**:
  - Use Svelte 5 reactive state or component wrapper props with `storybook/test` interaction assertions.

---

## 3. Flutter Widgetbook (`fl-mat`) Parity Requirements

In `libs/ui/fl-mat/lib/widgetbook/<tier>/<snake_name>_use_cases.dart`:
1. Export `buildMagic<Component>Component()` returning a `WidgetbookComponent` with use-cases matching the Canonical State Matrix:
   - `Interactive Playground` (wired to `context.knobs.*` for every prop and backed by a `StatefulWidget` preview).
   - `Variants & Appearances`
   - `Sizes & Color Intents`
   - `Disabled & Loading States`
   - `Error & Edge Cases`
   - `Custom Slots & Icons`
   - `Dark Theme Preview` (wrapping the preview in `Theme(data: MagicFlutterTheme.dark(), child: ...)`).
2. Register the builder in `libs/ui/fl-mat/lib/widgetbook.dart` and verify with:
   ```bash
   pnpm nx run-many -t lint test build-widgetbook -p fl-mat
   ```

---

## 4. Visual Regression Baselines (`storybook-addon-vis`)

Whenever adding or updating any story across `react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, or `svelte-tw`:
1. Regenerate visual baselines for the affected story file:
   ```bash
   pnpm nx test-storybook <project> -- -u src/lib/<tier>/<component>/<component>.stories.tsx
   ```
2. Run the verification suite without `-u` to ensure 100% deterministic visual and `play` pass:
   ```bash
   pnpm nx test-storybook <project>
   ```
