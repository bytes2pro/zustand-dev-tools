# Nuxt Package Guide

## Build & Types

- Bundler: Vite library mode (ES + CJS)
- Types: `vue-tsc -p tsconfig.build.json --declaration --emitDeclarationOnly`
- Peer deps: `vue`, optional peer: `nuxt`

## Usage

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { NuxtButton } from '@rte/nuxt-ui';
</script>

<template>
  <!-- Wrap in <ClientOnly> if using browser-only APIs inside -->
  <NuxtButton>Nuxt</NuxtButton>
  <!-- <ClientOnly><NuxtButton>Nuxt</NuxtButton></ClientOnly> -->
</template>
```

## Creating a new Nuxt package

```bash
pnpm scaffold -- --template vue --name awesome-nuxt --scope @your-scope
```

## Notes

- For client-only code in Nuxt, consumers should wrap usage with `<ClientOnly>`
- Keep peer dependency on `vue` to avoid bundling runtime
