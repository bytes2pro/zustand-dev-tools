# Preact Package Guide

## Build & Types

- Bundler: Vite library mode (ES + CJS)
- Types: `tsc -p tsconfig.build.json --emitDeclarationOnly`
- Peer deps: `preact`

## Usage

```tsx
import { PButton } from '@rte/preact-ui';

export function App() {
  return <PButton>Preact</PButton>;
}
```

## Creating a new Preact package

```bash
pnpm scaffold -- --template preact --name awesome-preact --scope @your-scope
```

## Notes

- Set `jsxImportSource: 'preact'` in `tsconfig.json`
