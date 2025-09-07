# Contributing Guide

Thanks for contributing! This repo is a template for multi-framework client packages.

## Workflow

1. Install deps

```bash
pnpm install
```

2. Develop

```bash
pnpm dev # if your package has a watch task
```

3. Validate before pushing

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm size
```

4. Versioning / Release (if publishing)

```bash
pnpm changeset            # record changes
pnpm version-packages     # bump versions (CI can do this)
# merge the version PR, CI will publish with NPM_TOKEN
```

## Pre-commit

Husky + lint-staged auto-run on commit:

- Prettier formatting
- ESLint fixes

## Adding a new package

Use the scaffold script:

```bash
pnpm scaffold -- --template <react|next|vue|solid|preact|lit|nuxt> --name my-lib --scope @your-scope
```

Then update `package.json` name/description and implement your code in `src/`.

## CI/CD

- CI runs lint, typecheck, build, tests, and size checks on PRs
- Release workflow runs the same checks before publishing via Changesets

## Coding standards

- TypeScript strict everywhere; robust public types
- Externalize framework runtime as peerDependencies
- Keep bundle minimal; prefer functional, typed APIs
- Update docs in `docs/` and package READMEs for user-facing changes

## Troubleshooting

See `docs/troubleshooting.md`.
