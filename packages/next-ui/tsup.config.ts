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
  // Do not auto-inject CSS; consumers import CSS explicitly from package export
  injectStyle: false,
  external: ['react', 'react-dom', 'next'],
});
