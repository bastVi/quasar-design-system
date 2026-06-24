<script setup lang="ts">
import { ref } from 'vue'

const step = ref(2)
const carouselSlide = ref('air')
const splitter = ref(42)
const knob = ref(64)
const editor = ref('<p><strong>Token notes</strong> stay local to the gallery.</p>')

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
</script>

<template>
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
</template>
