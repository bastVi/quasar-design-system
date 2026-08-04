import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  setupFile: '/histoire.setup.ts',
  outDir: '.histoire/dist',
  routerMode: 'hash',
  defaultStoryProps: {
    responsiveDisabled: true,
    autoPropsDisabled: true,
  },
  theme: {
    title: 'Quasar Design System',
    logo: {
      square: './public/qds-logo-square.svg',
      light: './public/qds-logo-light.svg',
      dark: './public/qds-logo-dark.svg',
    },
    favicon: 'qds-favicon.svg',
    colors: {
      primary: {
        500: '#005a9e',
      },
    },
  },
  plugins: [HstVue()],
  vite: {
    base: './',
    plugins: [vue()],
    ssr: {
      noExternal: ['@quasar/quasar-ui-qwindow'],
    },
  },
})
