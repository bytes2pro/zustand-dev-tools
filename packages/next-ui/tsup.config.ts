import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: false,
  treeshake: true,
  splitting: false,
  minify: true,
  // Auto-inject imported CSS at runtime so consumers don't need a separate import
  injectStyle: true,
  external: ['react', 'react-dom', 'next'],
});
