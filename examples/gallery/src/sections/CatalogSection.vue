<script setup lang="ts">
import { ref } from 'vue'

const breadcrumbItems = ['Gallery', 'Catalog', 'Quasar coverage']
const dropdownItems = ['Duplicate', 'Move', 'Archive']
const toggleChoice = ref('weekly')
const fabOpen = ref(false)
const tab = ref('overview')
const optionSingle = ref('compact')
const optionMultiple = ref(['motion', 'contrast'])
const file = ref<File | null>(null)
const color = ref('#6366f1')
const date = ref('2026/06/22')
const time = ref('10:30')
const popupLabel = ref('Editable label')
const step = ref(2)
const carouselSlide = ref('air')
const splitter = ref(42)
const knob = ref(64)
const editor = ref('<p><strong>Token notes</strong> stay local to the gallery.</p>')
const treeTicked = ref(['tokens'])
const ajaxBar = ref<{ start: () => void; stop: () => void } | null>(null)

const toggleOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

const optionChoices = [
  { label: 'Compact cards', value: 'compact' },
  { label: 'Comfortable cards', value: 'comfortable' },
  { label: 'Large touch targets', value: 'touch' },
]

const checkboxChoices = [
  { label: 'Motion', value: 'motion' },
  { label: 'Contrast', value: 'contrast' },
  { label: 'Density', value: 'density' },
]

const treeNodes = [
  {
    label: 'Design system',
    value: 'design-system',
    children: [
      { label: 'Tokens', value: 'tokens' },
      { label: 'Components', value: 'components' },
      { label: 'Runtime theme', value: 'runtime-theme' },
    ],
  },
]

const virtualItems = Array.from({ length: 18 }, (_, index) => `Virtual row ${index + 1}`)
const infiniteItems = ['Loaded block 1', 'Loaded block 2', 'Loaded block 3']
const uploadFactory = () => Promise.resolve({ url: '' })
const visualImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop stop-color="%236366f1"/%3E%3Cstop offset=".55" stop-color="%2306b6d4"/%3E%3Cstop offset="1" stop-color="%23f59e0b"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="960" height="540" rx="48" fill="url(%23g)"/%3E%3Ccircle cx="760" cy="120" r="130" fill="white" fill-opacity=".22"/%3E%3Ccircle cx="210" cy="405" r="170" fill="white" fill-opacity=".18"/%3E%3Ctext x="72" y="106" font-family="Inter,Arial" font-size="56" font-weight="700" fill="white"%3EQDS Gallery%3C/text%3E%3Ctext x="76" y="172" font-family="Inter,Arial" font-size="30" fill="white" fill-opacity=".86"%3EStatic media surface%3C/text%3E%3C/svg%3E'
const videoSrc = `data:text/html;charset=utf-8,${encodeURIComponent(`
  <!doctype html>
  <html lang="en">
    <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#111827,#312e81,#0891b2);font-family:Inter,Arial,sans-serif;color:white;">
      <div style="text-align:center;padding:24px;">
        <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;opacity:.72;">QVideo</div>
        <div style="margin-top:10px;font-size:28px;font-weight:700;">Static embed preview</div>
        <div style="margin-top:8px;font-size:15px;opacity:.76;">Local iframe content keeps the gallery deterministic.</div>
      </div>
    </body>
  </html>
`)}`

function refresh(done: () => void): void {
  window.setTimeout(done, 250)
}

function pulseAjaxBar(): void {
  ajaxBar.value?.start()
  window.setTimeout(() => ajaxBar.value?.stop(), 900)
}
</script>

<template>
  <div class="catalog-section column">
    <q-card class="catalog-card q-pa-lg">
      <div class="catalog-heading q-mb-md">
        <div>
          <div class="text-overline qds-text-muted">Catalog extension</div>
          <div class="text-h5 qds-display">Remaining Quasar components</div>
        </div>
        <q-badge color="primary" label="static gallery" />
      </div>

      <q-breadcrumbs class="q-mb-md">
        <q-breadcrumbs-el v-for="item in breadcrumbItems" :key="item" :label="item" />
      </q-breadcrumbs>

      <q-banner rounded class="catalog-banner">
        This section keeps examples lightweight: local state only, no uploads, no business-specific data.
      </q-banner>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Navigation, buttons &amp; app chrome</div>
      <div class="catalog-grid catalog-grid--three">
        <div class="catalog-demo">
          <div class="catalog-label">QBtnDropdown</div>
          <q-btn-dropdown unelevated color="primary" label="Actions" no-caps>
            <q-list dense style="min-width: 180px">
              <q-item v-for="item in dropdownItems" :key="item" v-close-popup clickable>
                <q-item-section>{{ item }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QBtnGroup</div>
          <q-btn-group unelevated spread>
            <q-btn color="primary" label="One" no-caps />
            <q-btn color="primary" label="Two" no-caps />
            <q-btn color="primary" label="Three" no-caps />
          </q-btn-group>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QBtnToggle</div>
          <q-btn-toggle v-model="toggleChoice" unelevated no-caps toggle-color="primary" :options="toggleOptions" />
        </div>

        <div class="catalog-demo catalog-demo--wide">
          <div class="catalog-label">QBar + QSeparator</div>
          <q-bar class="catalog-bar">
            <div>Toolbar preview</div>
            <q-space />
            <q-btn dense flat round aria-label="Minimize" />
            <q-btn dense flat round aria-label="Close" />
          </q-bar>
          <q-separator spaced />
          <div class="qds-text-muted">Separator rhythm below a tokenized bar.</div>
        </div>

        <div class="catalog-demo catalog-demo--wide">
          <div class="catalog-label">QFab</div>
          <div class="catalog-fab-stage">
            <q-fab v-model="fabOpen" color="accent" direction="right" icon="add" label="Create" no-caps>
              <q-fab-action color="primary" icon="edit" label="Draft" />
              <q-fab-action color="secondary" icon="share" label="Share" />
            </q-fab>
          </div>
        </div>
      </div>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Identity, notices &amp; panels</div>
      <div class="catalog-grid catalog-grid--three">
        <div class="catalog-demo">
          <div class="catalog-label">QAvatar</div>
          <div class="row items-center q-gutter-sm">
            <q-avatar color="primary" text-color="white">QD</q-avatar>
            <q-avatar rounded color="accent" text-color="white">Air</q-avatar>
            <q-avatar square color="secondary" text-color="white">UI</q-avatar>
          </div>
        </div>

        <div class="catalog-demo catalog-demo--wide">
          <div class="catalog-label">QTabPanels</div>
          <q-tabs v-model="tab" dense no-caps align="left" class="text-primary">
            <q-tab name="overview" label="Overview" />
            <q-tab name="states" label="States" />
          </q-tabs>
          <q-tab-panels v-model="tab" animated class="catalog-panel">
            <q-tab-panel name="overview">Panel surfaces inherit the gallery background.</q-tab-panel>
            <q-tab-panel name="states">Animated panels keep the Quasar interaction model.</q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Forms, pickers &amp; editing</div>
      <q-form class="catalog-form">
        <div class="catalog-grid catalog-grid--three">
          <div class="catalog-demo">
            <div class="catalog-label">QOptionGroup</div>
            <q-option-group v-model="optionSingle" :options="optionChoices" color="primary" />
            <q-separator spaced />
            <q-option-group v-model="optionMultiple" :options="checkboxChoices" color="accent" type="checkbox" />
          </div>

          <div class="catalog-demo">
            <div class="catalog-label">QFile</div>
            <q-file v-model="file" label="Choose local file" outlined clearable counter />
          </div>

          <div class="catalog-demo">
            <div class="catalog-label">QColor</div>
            <q-color v-model="color" no-header-tabs default-view="palette" class="catalog-picker" />
          </div>

          <div class="catalog-demo">
            <div class="catalog-label">QDate</div>
            <q-date v-model="date" flat bordered class="catalog-picker" />
          </div>

          <div class="catalog-demo">
            <div class="catalog-label">QTime</div>
            <q-time v-model="time" flat bordered format24h class="catalog-picker" />
          </div>

          <div class="catalog-demo">
            <div class="catalog-label">QPopupEdit</div>
            <div class="catalog-edit-target">
              {{ popupLabel }}
              <q-popup-edit v-model="popupLabel" buttons v-slot="scope">
                <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
              </q-popup-edit>
            </div>
          </div>
        </div>
      </q-form>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Progress, loading &amp; placeholders</div>
      <q-ajax-bar ref="ajaxBar" color="primary" position="top" size="3px" skip-hijack />
      <div class="catalog-grid catalog-grid--three">
        <div class="catalog-demo">
          <div class="catalog-label">QAjaxBar</div>
          <q-btn unelevated color="primary" label="Pulse ajax bar" no-caps @click="pulseAjaxBar" />
          <div class="qds-text-muted q-mt-sm">Manual preview only; no network hijacking.</div>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QLinearProgress</div>
          <q-linear-progress :value="0.68" rounded color="primary" size="12px" />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QCircularProgress + QSpinner</div>
          <div class="row items-center q-gutter-md">
            <q-circular-progress show-value :value="72" size="64px" color="accent" track-color="grey-3" />
            <q-spinner color="primary" size="2rem" />
          </div>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QInnerLoading</div>
          <div class="catalog-loading-box">
            <div class="qds-text-muted">Loading overlay preview</div>
            <q-inner-loading showing label="Syncing" color="primary" />
          </div>
        </div>

        <div class="catalog-demo catalog-demo--wide">
          <div class="catalog-label">QSkeleton</div>
          <q-skeleton type="text" width="45%" />
          <q-skeleton type="rect" height="64px" class="q-mt-sm" />
          <q-skeleton type="text" width="72%" class="q-mt-sm" />
        </div>
      </div>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Data display &amp; navigation structures</div>
      <div class="catalog-grid catalog-grid--two">
        <div class="catalog-demo">
          <div class="catalog-label">QTree</div>
          <q-tree :nodes="treeNodes" node-key="value" tick-strategy="leaf" v-model:ticked="treeTicked" default-expand-all />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QVirtualScroll</div>
          <q-virtual-scroll :items="virtualItems" style="height: 220px" separator v-slot="{ item, index }">
            <q-item :key="index" dense>
              <q-item-section>{{ item }}</q-item-section>
              <q-item-section side>#{{ index + 1 }}</q-item-section>
            </q-item>
          </q-virtual-scroll>
        </div>

        <div class="catalog-demo catalog-demo--wide">
          <div class="catalog-label">QMarkupTable</div>
          <q-markup-table flat bordered dense>
            <thead>
              <tr>
                <th class="text-left">Component</th>
                <th class="text-left">State</th>
                <th class="text-right">Coverage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Controls</td>
                <td>Visual only</td>
                <td class="text-right">100%</td>
              </tr>
              <tr>
                <td>Media</td>
                <td>Static embeds</td>
                <td class="text-right">100%</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Flows, timelines &amp; rich content</div>
      <div class="catalog-grid catalog-grid--two">
        <div class="catalog-demo">
          <div class="catalog-label">QStepper</div>
          <q-stepper v-model="step" flat bordered animated color="primary">
            <q-step :name="1" title="Tokens" icon="palette" :done="step > 1">Define values.</q-step>
            <q-step :name="2" title="Components" icon="widgets">Exercise Quasar surfaces.</q-step>
          </q-stepper>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QTimeline</div>
          <q-timeline color="primary" layout="dense">
            <q-timeline-entry title="Baseline" subtitle="Tokens">Theme variables are loaded.</q-timeline-entry>
            <q-timeline-entry title="Catalog" subtitle="Components">Remaining Quasar widgets are visible.</q-timeline-entry>
          </q-timeline>
        </div>

        <div class="catalog-demo catalog-demo--wide">
          <div class="catalog-label">QChatMessage</div>
          <q-chat-message name="Designer" avatar="" :text="['Does the surface keep QDS radius and spacing?']" sent />
          <q-chat-message name="Reviewer" :text="['Yes, with neutral static content.']" bg-color="primary" text-color="white" />
        </div>
      </div>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Media</div>
      <div class="catalog-grid catalog-grid--two">
        <div class="catalog-demo">
          <div class="catalog-label">QCarousel + QImg</div>
          <q-img :src="visualImage" ratio="16/9" class="catalog-image q-mb-md">
            <div class="absolute-bottom catalog-media-caption">Standalone image surface</div>
          </q-img>
          <q-carousel v-model="carouselSlide" animated arrows navigation height="260px" class="catalog-media">
            <q-carousel-slide name="air" :img-src="visualImage">
              <div class="absolute-bottom catalog-media-caption">Acrylic image slide</div>
            </q-carousel-slide>
            <q-carousel-slide name="mobile" class="column flex-center">
              <q-img :src="visualImage" ratio="16/9" class="catalog-image" />
            </q-carousel-slide>
          </q-carousel>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QParallax</div>
          <q-parallax :src="visualImage" :height="220">
            <div class="text-white text-h5 qds-display">Parallax surface</div>
          </q-parallax>
        </div>

        <div class="catalog-demo catalog-demo--wide">
          <div class="catalog-label">QVideo</div>
          <q-video :src="videoSrc" :ratio="16 / 9" />
        </div>
      </div>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Scrolling, split layouts &amp; gestures</div>
      <div class="catalog-grid catalog-grid--two">
        <div class="catalog-demo">
          <div class="catalog-label">QScrollArea</div>
          <q-scroll-area style="height: 180px" class="catalog-scroll-box">
            <div v-for="item in virtualItems" :key="`scroll-${item}`" class="q-pa-sm">{{ item }}</div>
          </q-scroll-area>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QSplitter</div>
          <q-splitter v-model="splitter" style="height: 180px" class="catalog-splitter">
            <template #before><div class="q-pa-md">Navigation</div></template>
            <template #after><div class="q-pa-md qds-text-muted">Preview content</div></template>
          </q-splitter>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QSlideItem</div>
          <q-slide-item left-color="positive" right-color="negative">
            <template #left>Archive</template>
            <template #right>Delete</template>
            <q-item>
              <q-item-section>Slide me to reveal actions</q-item-section>
            </q-item>
          </q-slide-item>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QPullToRefresh</div>
          <q-pull-to-refresh @refresh="refresh">
            <div class="catalog-pull-box">Pull area with a safe local refresh callback.</div>
          </q-pull-to-refresh>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QKnob</div>
          <q-knob v-model="knob" show-value size="96px" :thickness="0.18" color="primary" track-color="grey-3" />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QInfiniteScroll</div>
          <q-infinite-scroll disable :offset="120">
            <q-item v-for="item in infiniteItems" :key="item" dense>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
            <template #loading>
              <div class="row justify-center q-my-md"><q-spinner color="primary" /></div>
            </template>
          </q-infinite-scroll>
        </div>
      </div>
    </q-card>

    <q-card class="catalog-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Rich text &amp; safe upload shell</div>
      <div class="catalog-grid catalog-grid--two">
        <div class="catalog-demo">
          <div class="catalog-label">QEditor</div>
          <q-editor v-model="editor" min-height="8rem" :toolbar="[['bold', 'italic'], ['quote', 'unordered', 'ordered']]" />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QUploader</div>
          <q-uploader
            label="Uploader shell (disabled)"
            class="full-width"
            :factory="uploadFactory"
            :auto-upload="false"
            hide-upload-btn
            disable
          />
        </div>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
.catalog-section {
  gap: var(--qds-space-lg);
}

.catalog-card {
  border: 1px solid var(--qds-border-subtle);
}

.catalog-heading,
.catalog-grid,
.catalog-form {
  display: grid;
  gap: var(--qds-space-md);
}

.catalog-heading {
  grid-template-columns: 1fr auto;
  align-items: start;
}

.catalog-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.catalog-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.catalog-demo {
  min-width: 0;
  padding: var(--qds-space-md);
  border: 1px solid var(--qds-border-subtle);
  border-radius: var(--qds-radius-lg);
  background: color-mix(in srgb, var(--qds-surface-1) 92%, transparent);
}

.catalog-demo--wide {
  grid-column: span 2;
}

.catalog-label {
  margin-bottom: var(--qds-space-sm);
  color: var(--qds-text-muted);
  font-size: 0.875rem;
  font-weight: 650;
}

.catalog-banner,
.catalog-panel,
.catalog-bar,
.catalog-scroll-box,
.catalog-splitter,
.catalog-pull-box,
.catalog-edit-target,
.catalog-loading-box {
  border: 1px solid var(--qds-border-subtle);
  border-radius: var(--qds-radius-md);
  background: var(--qds-surface-1);
}

.catalog-bar {
  color: var(--qds-text);
}

.catalog-fab-stage {
  display: flex;
  min-height: 5rem;
  align-items: center;
}

.catalog-picker {
  width: 100%;
  max-width: 21rem;
}

.catalog-edit-target,
.catalog-loading-box,
.catalog-pull-box {
  min-height: 5rem;
  padding: var(--qds-space-md);
}

.catalog-loading-box {
  position: relative;
}

.catalog-media {
  overflow: hidden;
  border-radius: var(--qds-radius-lg);
}

.catalog-media-caption {
  padding: var(--qds-space-sm) var(--qds-space-md);
  color: white;
  background: linear-gradient(transparent, rgb(0 0 0 / 0.62));
}

.catalog-image {
  width: min(100%, 32rem);
  border-radius: var(--qds-radius-lg);
}

@media (max-width: 960px) {
  .catalog-grid--two,
  .catalog-grid--three {
    grid-template-columns: 1fr;
  }

  .catalog-demo--wide {
    grid-column: auto;
  }
}

@media (max-width: 640px) {
  .catalog-heading {
    grid-template-columns: 1fr;
  }
}
</style>
