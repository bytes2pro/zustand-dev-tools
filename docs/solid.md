# SolidJS Package Guide

## Build & Types

- Bundler: Vite library mode + `vite-plugin-solid`
- Types: `tsc -p tsconfig.build.json --emitDeclarationOnly`
- Peer deps: `solid-js`

## Usage

```tsx
import { SButton } from '@bytes2pro/solid-ui';
```

## Creating a new Solid package

```bash
pnpm scaffold -- --template solid --name awesome-solid --scope @your-scope
```

## Notes

- Set `jsx: 'preserve'` and `jsxImportSource: 'solid-js'` in `tsconfig.json`
