# @mono-magic/svelte-tw

Svelte 5 + Tailwind CSS v4 + Bits UI design-system component library adhering to **Atomic Design** and contract-first interfaces from `@mono-magic/atomic-design-interfaces`.

## Development & Verification Commands

Run all commands from the workspace root via Nx:

```bash
# Lint the library (TypeScript & Svelte 5 components)
pnpm nx lint svelte-tw

# Typecheck library with svelte-check
pnpm nx typecheck svelte-tw

# Run unit tests with V8 coverage (>= 80% threshold enforced)
pnpm nx test svelte-tw -- --coverage

# Launch interactive Storybook dev server
pnpm nx storybook svelte-tw

# Build static Storybook showcase
pnpm nx build-storybook svelte-tw

# Run Storybook interaction and visual tests in headless Chromium
pnpm nx test-storybook svelte-tw
```
