# Next.js Package Guide

## Build & Types

- Bundler: tsup (ESM + CJS + .d.ts)
- Client components require `'use client'` where necessary
- Peer deps: `react`, `react-dom`, `next`

## Usage

```tsx
'use client';
import { ClientButton } from '@bytes2pro/next-ui';
```

## Creating a new Next package

```bash
pnpm scaffold -- --template next --name awesome-next --scope @your-scope
```

## Gotchas

- Only put `'use client'` at top-level of files that must be client components
- Avoid Node APIs in the bundle; keep it browser-safe
