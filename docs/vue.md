# Vue 3 Package Guide

## Build & Types

- Bundler: Vite library mode (ES + UMD/CJS)
- Types: `vue-tsc`/`tsc` emit to `dist`
- Peer deps: `vue`

## Usage

```ts
import { VButton } from '@rte/vue-ui';
app.component('VButton', VButton);
```

## Creating a new Vue package

```bash
pnpm scaffold -- --template vue --name awesome-vue --scope @your-scope
```

## Publishing notes

- Mark `external: ['vue']` in rollup options and set globals for UMD
- Keep `.vue` SFCs typed with `<script setup lang="ts">`
