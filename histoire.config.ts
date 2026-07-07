import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  setupFile: '/histoire.setup.ts',
  outDir: '.histoire/dist',
  routerMode: 'hash',
  plugins: [HstVue()],
  vite: {
    base: './',
    plugins: [vue()],
    ssr: {
      noExternal: ['@quasar/quasar-ui-qwindow'],
    },
  },
})
