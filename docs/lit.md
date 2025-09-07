# Lit Package Guide

## Build & Types

- Bundler: Vite library mode (ES + CJS)
- Types: `tsc -p tsconfig.build.json --emitDeclarationOnly`
- Peer deps: `lit`

## Usage

```ts
import '@rte/lit-ui';
// Now you can use the element anywhere
// <my-button variant="primary">Hello</my-button>
```

## Creating a new Lit package

```bash
pnpm scaffold -- --template lit --name awesome-lit --scope @your-scope
```

## Notes

- The library defines the custom element, so consumers only need to import once
- If publishing multiple elements, export registration from `src/index.ts`
