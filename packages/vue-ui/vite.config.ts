import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'VueUi',
			fileName: (format) => `vue-ui.${format}.js`
		},
		rollupOptions: {
			external: ['vue'],
			output: {
				globals: { vue: 'Vue' }
			}
		}
	}
})
