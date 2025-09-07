# Overview

This template helps you create and publish client-side npm packages with TypeScript and strong typing for multiple frameworks: React, Next.js, Vue 3, and SolidJS.

## What you get

- pnpm workspace monorepo and Turborepo build orchestration
- Framework-specific package examples you can copy or scaffold from
- Bundling with tsup (React/Next) and Vite (Vue/Solid)
- Strict TypeScript with declaration output
- ESLint + Prettier
- Vitest + Testing Library
- Changesets for versioning and publishing
- GitHub Actions for CI and release

## Scaffolding

Generate a new package from an existing template:

```bash
pnpm scaffold -- --template react --name awesome-ui        # uses detected scope
pnpm scaffold -- --template react --name awesome-ui --scope @your-scope
```

Options:

- `--template` one of `react`, `next`, `vue`, `solid`, `preact`, `lit`, `nuxt`, `svelte`, `umbrella`
- `--name` the folder and package name (e.g. `awesome-ui`)
- `--scope` npm scope (defaults to the scope detected from existing packages)

### Set or change npm scope for the repo

Run once after cloning to update all package names and docs:

```bash
pnpm set-scope -- --scope @your-scope
```

After this, new scaffolds default to `@your-scope` automatically.

### Umbrella package (subpath exports)

This repo includes an umbrella package at `packages/umbrella` that re-exports each framework build so consumers can import from subpaths like `@scope/pkg/react` or `@scope/pkg/nuxt`.

Steps (template usage):

- Build frameworks: `pnpm build`
- Assemble umbrella: `pnpm --filter @rte/your-package build`
- Rename umbrella only: `pnpm set-umbrella -- --scope @your-scope --name z-devtools`
- Publish via Changesets

Note: `pnpm set-scope` intentionally does not rename the umbrella package so the template keeps its `@rte/*` default. Use `set-umbrella` to rename just the umbrella package for publishing.

## Development Loop

- Build all: `pnpm build`
- Dev (watch): `pnpm dev`
- Test: `pnpm test`
- Lint/Format: `pnpm lint` / `pnpm format`

## Versioning & Publishing

- Record changes: `pnpm changeset`
- Version: `pnpm version-packages`
- Publish: `pnpm release`

CI will open a version PR or publish on push to `main` when `NPM_TOKEN` is present. See `publishing.md`.

## Error Handling and Types

- Use precise TypeScript types and narrow union types to improve DX
- Prefer returning typed results to throwing in library code; when throwing, use custom `Error` subclasses with clear messages
- Document error cases in README/API docs
- Keep public APIs minimal and stable; use `exports` map in `package.json`

## Add another framework

Follow one of the existing packages as a blueprint. For frameworks with Vite plugins (e.g., Svelte), use Vite library mode and `tsc`/`dts` emission. Ensure:

- ESM and CJS outputs
- Proper `peerDependencies`
- Strong typings output in `dist`
- Tests and basic example component
