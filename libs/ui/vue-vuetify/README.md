# @mono-magic/vue-vuetify

Vue 3 + Vuetify 3 design-system component library adhering to **Atomic Design** and contract-first interfaces from `@mono-magic/atomic-design-interfaces`.

## Development & Verification Commands

Run all commands from the workspace root via Nx:

```bash
# Lint the library (TypeScript & Vue SFCs)
pnpm nx lint vue-vuetify

# Typecheck library with vue-tsc
pnpm nx typecheck vue-vuetify

# Run unit tests with V8 coverage (>= 80% threshold enforced)
pnpm nx test vue-vuetify -- --coverage

# Launch interactive Storybook dev server
pnpm nx storybook vue-vuetify

# Build static Storybook showcase
pnpm nx build-storybook vue-vuetify

# Run Storybook interaction and visual tests in headless Chromium
pnpm nx test-storybook vue-vuetify
```
