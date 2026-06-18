import { createApp } from 'vue'
import { Quasar, Notify } from 'quasar'

// 1. Quasar's own CSS FIRST.
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

// 2. Design-system CSS AFTER Quasar (import-after-Quasar — overrides are unlayered).
import '@bastvi/quasar-design-system/css'

// 3. Optional design-system fonts (drive --qds-font-family* faces).
import '@bastvi/quasar-design-system/fonts/inter.css'
import '@bastvi/quasar-design-system/fonts/open-sans.css'
import '@bastvi/quasar-design-system/fonts/selawik.css'

import {
  configureDesignSystem,
  qdsIconSet,
} from '@bastvi/quasar-design-system'

import App from './App.vue'

const app = createApp(App)

app.use(Quasar, {
  plugins: { Notify },
  iconSet: qdsIconSet,
})

// Initialize the runtime theme controller exactly as an external app would.
// `persist: false` keeps the visual gate deterministic (no localStorage carry-over
// of mode/variant between matrix cells).
const ds = configureDesignSystem(app, {
  mode: 'light',
  variant: 'studio',
  persist: false,
})

// Expose the controller so the Playwright visual gate can drive mode/variant
// directly (same API an external app uses), instead of clicking switchers.
;(window as unknown as { __qdsGallery?: typeof ds }).__qdsGallery = ds

app.mount('#app')
