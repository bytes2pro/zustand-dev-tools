import type { Config } from 'tailwindcss';
import preset from './tailwind/preset';

export default {
  content: ['./packages/**/*.{ts,tsx,vue,svelte}', './docs/**/*.{md,mdx}'],
  presets: [preset as unknown as Config],
} satisfies Config;
