# React Package Guide

## Build & Types

- Bundler: tsup (ESM + CJS + .d.ts)
- Entry: `src/index.tsx`
- Peer deps: `react`, `react-dom`

## Usage

```tsx
import { Button } from '@rte/react-ui';
```

## Creating a new React package

1. Scaffold:

```bash
pnpm scaffold -- --template react --name awesome-react --scope @your-scope
```

2. Implement components in `src/`
3. Build: `pnpm --filter @your-scope/awesome-react build`
4. Test: `pnpm test`

## Publishing notes

- Ensure the `exports` map includes both ESM and CJS and `types`
- Mark `sideEffects: false` where safe to enable tree-shaking
