import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import path from 'node:path'

export default defineConfig({
	plugins: [svelte({ extensions: ['.svelte'], preprocess: sveltePreprocess() })],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'SvelteUi',
			fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
			formats: ['es', 'cjs']
		},
		rollupOptions: {
			external: ['svelte'],
			output: {
				globals: { svelte: 'svelte' }
			}
		}
	}
})


