# Tailwind & shadcn Setup

This template ships Tailwind and a preset compatible with shadcn-style tokens (via CSS variables) so you can build Tailwind-based components across frameworks.

## What's included

- Root Tailwind preset: `tailwind/preset.ts`
- Root Tailwind config: `tailwind.config.ts` (for local usage/testing)
- PostCSS: `postcss.config.cjs`
- Utility `cn` helper: `utils/cn.ts` (clsx + tailwind-merge)

## Library guidance

- Component libraries should emit classnames; consumers compile Tailwind in their apps.
- Keep framework runtimes as peerDependencies (already configured).
- Do not inline compiled Tailwind CSS in your library bundles.

## Using Tailwind classes in packages

- Use classes directly in components, e.g. `className={cn('px-3 py-2 rounded-md')}`.
- For Vue/Svelte, use `class` binding.

## Consumer app setup

- Install Tailwind in the app and add your app files + any library paths to the `content` globs.
- Optionally use this repo's preset to get shadcn-style tokens:

```ts
// tailwind.config.ts in the consuming app
import type { Config } from 'tailwindcss';
import preset from '@your-scope/your-package/preset'; // or copy from this repo

export default {
  presets: [preset as unknown as Config],
  content: [
    './src/**/*.{ts,tsx,vue,svelte,js,jsx,html}',
    './node_modules/@your-scope/your-package/**/*.{js,mjs,ts,tsx,vue,svelte}',
  ],
} satisfies Config;
```

## shadcn

- React/Next: use shadcn/ui in the consumer app; your library components can rely on the same tokens/classes. This template's React/Next buttons use class-variance-authority (CVA) + tailwind-merge for shadcn-like variants.
- Vue/Solid/Svelte: use community ports (e.g., shadcn-vue, shadcn-svelte) or replicate styles with tokens in this preset.

## Tips

- Share tokens via CSS variables; keep palettes in the preset.
- Use `cn` for merging classes safely.
- Document required classes for consumers.
