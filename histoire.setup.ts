import { Quasar } from 'quasar'
import type { App } from 'vue'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './src/css/index.scss'

export function setupVue3({ app }: { app: App }) {
  app.use(Quasar, {})
}
