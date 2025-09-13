# NPM Client Package Template (TypeScript, Multi-Framework)

Production-ready template to build and publish npm packages for client-side frameworks: React, Next.js, Vue 3, and SolidJS. Strict TypeScript, robust type definitions, CI/CD via GitHub Actions + Changesets, and examples per framework.

Quick links:

- Docs: see `docs/` or start with `docs/overview.md`
- CI/CD: `.github/workflows/`
- Packages: `packages/`

## Features

- TypeScript-first with strict settings and declaration output
- Framework targets: React, Next.js, Vue 3 (Vite library), SolidJS (Vite library)
- Bundling: tsup (React/Next) and Vite (Vue/Solid) ⇒ ESM + CJS + types
- Linting/Formatting: ESLint (+ React/Vue/Solid), Prettier, EditorConfig
- Testing: Vitest + jsdom + Testing Library variants
- Versioning/Publishing: Changesets + GitHub Actions release workflow
- Monorepo: pnpm workspaces + Turborepo caching
- Scaffold script to generate new packages (WIP command in docs)

## Monorepo Structure

- `packages/react-ui` — React component library (tsup)
- `packages/next-ui` — Next.js-ready React components (tsup + `use client`)
- `packages/vue-ui` — Vue 3 library (Vite library mode + `vue-tsc` for d.ts)
- `packages/solid-ui` — SolidJS library (Vite library mode + d.ts)
- `packages/preact-ui` - Preact library (Vite library mode + d.ts)
- `packages/nuxt-ui` - Nuxt.js-ready Vue components (Vite library mode)
- `packages/lit-ui` - LitJS Library (Vite library mode + d.ts)

## Getting Started

1. Install

```bash
pnpm install
```

2. Develop

```bash
pnpm dev
```

3. Set your npm scope (optional)

```bash
pnpm set-scope -- --scope @your-scope
```

New packages you scaffold will default to this scope. You can also override per scaffold with `--scope`.

4. Build all packages

```bash
pnpm build
```

4. Test

```bash
pnpm test
```

5. Lint & Format

```bash
pnpm lint
pnpm format
```

## Publish & Release

1. Record changes

```bash
pnpm changeset
```

2. Version packages (creates a PR via CI or locally bumps versions)

```bash
pnpm version-packages
```

3. Publish (CI uses `NPM_TOKEN`; local publish uses your `~/.npmrc`)

```bash
pnpm release
```

CI will open a Version PR or publish on pushes to `main` when `NPM_TOKEN` is set. See `docs/publishing.md` for details.

## Quality gates

- CI runs lint, typecheck, build, tests, and size checks before releasing
- Pre-commit hook auto-formats and lints staged files (`husky` + `lint-staged`)
- Bundles are minimized: peers are externalized, ESM/CJS outputs, tree-shaking, and `size-limit` enforces thresholds

## Framework Quick Starts (single package, subpath exports from root)

- React usage:

```tsx
import { Button } from '@bytes2pro/zustand-dev-tools/react';

export function App() {
  return <Button variant="primary">Click</Button>;
}
```

- Next.js (client component):

```tsx
'use client';
import { ZustandDevtools } from '@bytes2pro/zustand-dev-tools/next';

export default function Page() {
  return <ClientButton>Next</ClientButton>;
}
```

- Vue 3:

```ts
import { createApp } from 'vue';
import { VButton } from '@bytes2pro/zustand-dev-tools/vue';
createApp({}).component('VButton', VButton).mount('#app');
```

- SolidJS:

```tsx
import { SButton } from '@bytes2pro/zustand-dev-tools/solid';

export default function App() {
  return <SButton>Solid</SButton>;
}
```

## Creating a New Package

Use the scaffold script to copy from a template package and rename.

```bash
pnpm scaffold -- --template react --name awesome-ui            # uses detected scope
pnpm scaffold -- --template react --name awesome-ui --scope @another-scope
```

See `docs/overview.md#scaffolding` for options and manual steps.

## Multi-framework umbrella package (subpath exports)

This template includes an umbrella package that re-exports each framework build so consumers can import:

- `import { ZDev } from '@your-scope/your-package/react'`
- `import { ZDev } from '@your-scope/your-package/next'`
- `import { ZDev } from '@your-scope/your-package/nuxt'`

How-to:

- Build framework packages first: `pnpm build`
- Build umbrella: `pnpm --filter @bytes2pro/your-package build` (copies framework dists into `packages/umbrella/dist`)
- Rename `@bytes2pro/your-package` in `packages/umbrella/package.json` to your final name (e.g., `@your-scope/your-package-name`)
- Publish: `pnpm release`

## Docs

See the `docs/` folder for:

- `overview.md` — concepts, repo workflow, scaffolding
- `react.md`, `next.md`, `vue.md`, `solid.md` — framework guides
- `publishing.md` — npm publishing/changesets/CI
- `ci.md` — CI/CD overview and required secrets
- `troubleshooting.md` — common issues

## Notes

- Set your npm scope once with `pnpm set-scope -- --scope @your-scope` (updates packages and docs)
- All packages are strict TypeScript and emit `.d.ts`
- Favor functional, typed APIs; throw typed errors sparingly and document them
