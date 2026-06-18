import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// Relative base so the built gallery can be served from any deploy subpath.
export default defineConfig({
  base: './',
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // The design-system is a source-only package (.ts/.scss). Keep it out of
  // esbuild's dep prebundle so Vite/Quasar/Sass compile its sources directly.
  optimizeDeps: {
    exclude: ['@bastvi/quasar-design-system'],
  },
})
