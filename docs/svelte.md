# Svelte Package Guide

## Build & Types

- Bundler: Vite library mode (ES + CJS)
- Types: manual `index.d.ts` export + `svelte-check` for type safety
- Peer deps: `svelte`

## Usage

```svelte
<script>
  import { SButton } from '@bytes2pro/svelte-ui';
</script>

<SButton variant="primary">Svelte</SButton>
```

## Creating a new Svelte package

```bash
pnpm scaffold -- --template svelte --name awesome-svelte --scope @your-scope
```

## Notes

- Externalize `svelte` to keep bundles small
- For advanced typing, consider generating d.ts via svelte2tsx in CI if needed
