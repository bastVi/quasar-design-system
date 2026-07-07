import { createApp } from 'vue'
import { BottomSheet, Dialog, Loading, LoadingBar, Notify, Quasar } from 'quasar'

// 1. Quasar's own CSS FIRST.
import 'quasar/src/css/index.sass'
import '@quasar/quasar-ui-qwindow/index.css'

// 2. Design-system CSS AFTER Quasar (import-after-Quasar — overrides are unlayered).
import '@bastvi/quasar-design-system/css'
import '@bastvi/quasar-design-system/css/extensions/qwindow'

// 3. Gallery-only demo helpers (NOT part of the published design-system package).
import './gallery.css'

// 4. Optional design-system fonts (drive --qds-font-family* faces).
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
  plugins: { BottomSheet, Dialog, Loading, LoadingBar, Notify },
  config: {
    loadingBar: {
      color: 'primary',
      size: '4px',
      skipHijack: true,
    },
  },
  iconSet: qdsIconSet,
})

// Initialize the runtime theme controller exactly as an external app would.
// `persist: false` keeps the visual gate deterministic (no localStorage carry-over
// of mode/variant between matrix cells).
const ds = configureDesignSystem(app, {
  mode: 'system',
  variant: 'fluent',
  persist: false,
})

// Expose the controller so the Playwright visual gate can drive mode/variant
// directly (same API an external app uses), instead of clicking switchers.
;(window as unknown as { __qdsGallery?: typeof ds }).__qdsGallery = ds

app.mount('#app')
