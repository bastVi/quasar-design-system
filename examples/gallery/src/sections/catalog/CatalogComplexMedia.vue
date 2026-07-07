<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

type UploaderProbe = {
  addFiles: (files: File[]) => void
  files: File[]
  updateFileStatus: (file: File, status: 'idle' | 'uploading' | 'failed' | 'uploaded', uploadedSize?: number) => void
}

const step = ref(2)
const carouselSlide = ref('air')
const splitter = ref(42)
const knob = ref(64)
const editor = ref('<p><strong>Token notes</strong> stay local to the gallery.</p>')
const uploader = ref<UploaderProbe | null>(null)

const virtualItems = Array.from({ length: 18 }, (_, index) => `Virtual row ${index + 1}`)
const infiniteItems = ['Loaded block 1', 'Loaded block 2', 'Loaded block 3']
const uploadFactory = () => Promise.resolve({ url: '' })

function makeProbeFile(name: string, size: number, type = 'text/plain'): File {
  return new File([new Uint8Array(size).fill(65)], name, { type, lastModified: 86 })
}

onMounted(async () => {
  await nextTick()

  uploader.value?.addFiles([
    makeProbeFile('media-queued.txt', 128),
    makeProbeFile('media-progress.bin', 512, 'application/octet-stream'),
    makeProbeFile('media-error.txt', 96),
    makeProbeFile('media-uploaded.txt', 192),
  ])

  await nextTick()

  const files = uploader.value?.files ?? []
  if (files[1]) uploader.value?.updateFileStatus(files[1], 'uploading', Math.round(files[1].size * 0.58))
  if (files[2]) uploader.value?.updateFileStatus(files[2], 'failed')
  if (files[3]) uploader.value?.updateFileStatus(files[3], 'uploaded')
})

function svgData(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function mediaSvg(title: string, subtitle: string, from: string, via: string, to: string): string {
  return svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${from}"/>
          <stop offset=".54" stop-color="${via}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
        <radialGradient id="orb" cx="50%" cy="50%" r="50%">
          <stop stop-color="white" stop-opacity=".42"/>
          <stop offset="1" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="960" height="540" rx="52" fill="url(#g)"/>
      <path d="M0 414 C180 318 290 494 470 386 S735 260 960 350 V540 H0 Z" fill="white" fill-opacity=".16"/>
      <circle cx="744" cy="132" r="156" fill="url(#orb)"/>
      <circle cx="202" cy="392" r="194" fill="url(#orb)"/>
      <rect x="64" y="66" width="420" height="162" rx="32" fill="black" fill-opacity=".18"/>
      <text x="96" y="132" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="750" fill="white">${title}</text>
      <text x="98" y="184" font-family="Inter, Arial, sans-serif" font-size="28" fill="white" fill-opacity=".86">${subtitle}</text>
    </svg>
  `)
}

function avatarSvg(initials: string, from: string, to: string): string {
  return svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${initials} avatar">
      <defs>
        <linearGradient id="a" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#a)"/>
      <circle cx="72" cy="24" r="24" fill="white" fill-opacity=".22"/>
      <text x="48" y="58" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="750" fill="white">${initials}</text>
    </svg>
  `)
}

const visualImage = mediaSvg('QDS Gallery', 'Static media surface', '#6366f1', '#06b6d4', '#f59e0b')
const carouselSlides = [
  {
    name: 'air',
    title: 'Acrylic depth',
    caption: 'Layered blur, soft controls, no remote images.',
    src: mediaSvg('Acrylic', 'Soft media chrome', '#007aff', '#7c3aed', '#06b6d4'),
  },
  {
    name: 'mobile',
    title: 'Mobile radius',
    caption: 'Large rounded frames with deterministic artwork.',
    src: mediaSvg('Mobile', 'One UI inspired spacing', '#005a9e', '#14b8a6', '#ffb020'),
  },
  {
    name: 'fluent',
    title: 'Fluent contrast',
    caption: 'Readable captions over owned gradient surfaces.',
    src: mediaSvg('Fluent', 'Primary QDS tone', '#005a9e', '#2563eb', '#8b5cf6'),
  },
]
const chatAvatars = {
  designer: avatarSvg('DS', '#005a9e', '#06b6d4'),
  reviewer: avatarSvg('RV', '#6a8f66', '#005a9e'),
}
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
        <q-timeline color="primary" layout="dense" data-test="qds-timeline">
          <q-timeline-entry title="Baseline" subtitle="Tokens">Theme variables are loaded.</q-timeline-entry>
          <q-timeline-entry title="Catalog" subtitle="Components">Remaining Quasar widgets are visible.</q-timeline-entry>
        </q-timeline>
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QChatMessage</div>
        <q-chat-message
          data-test="qds-chat-sent"
          name="Designer"
          :avatar="chatAvatars.designer"
          stamp="10:24"
          :text="['Does the surface keep QDS radius, tail color, and readable contrast?']"
          sent
        />
        <q-chat-message
          data-test="qds-chat-received"
          name="Reviewer"
          :avatar="chatAvatars.reviewer"
          stamp="10:25"
          :text="['Yes — both bubbles use tokenized surfaces and deterministic avatars.']"
        />
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
        <q-carousel
          v-model="carouselSlide"
          animated
          arrows
          navigation
          height="280px"
          class="catalog-media"
          data-test="qds-carousel"
        >
          <q-carousel-slide
            v-for="slide in carouselSlides"
            :key="slide.name"
            :name="slide.name"
            class="catalog-carousel-slide q-pa-none"
          >
            <q-img :src="slide.src" class="catalog-carousel-image" fit="cover" no-spinner>
              <div class="absolute-bottom catalog-media-caption">
                <div class="text-subtitle2 text-weight-bold">{{ slide.title }}</div>
                <div class="text-caption">{{ slide.caption }}</div>
              </div>
            </q-img>
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
        <q-video :src="videoSrc" :ratio="16 / 9" class="catalog-video" data-test="qds-video" />
      </div>
    </div>
  </q-card>

  <q-card class="catalog-card q-pa-lg">
    <div class="text-h6 qds-display q-mb-md">Scrolling, split layouts &amp; gestures</div>
    <div class="catalog-grid catalog-grid--two">
      <div class="catalog-demo">
        <div class="catalog-label">QScrollArea</div>
        <q-scroll-area style="height: 180px" class="catalog-scroll-box" data-test="qds-scroll-area">
          <div v-for="item in virtualItems" :key="`scroll-${item}`" class="q-pa-sm">{{ item }}</div>
        </q-scroll-area>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QSplitter</div>
        <q-splitter v-model="splitter" style="height: 180px" class="catalog-splitter" data-test="qds-splitter">
          <template #before><div class="q-pa-md">Navigation</div></template>
          <template #after><div class="q-pa-md qds-text-muted">Preview content</div></template>
        </q-splitter>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QSlideItem</div>
        <q-slide-item left-color="positive" right-color="negative" data-test="qds-slide-item">
          <template #left>Archive</template>
          <template #right>Delete</template>
          <q-item>
            <q-item-section>Slide me to reveal actions</q-item-section>
          </q-item>
        </q-slide-item>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QPullToRefresh</div>
        <q-pull-to-refresh data-test="qds-pull-to-refresh" @refresh="refresh">
          <div class="catalog-pull-box">Pull area with a safe local refresh callback.</div>
        </q-pull-to-refresh>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QKnob</div>
        <q-knob
          v-model="knob"
          show-value
          size="96px"
          :thickness="0.18"
          color="primary"
          track-color="grey-3"
          data-test="qds-knob"
        />
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QInfiniteScroll</div>
        <q-infinite-scroll disable :offset="120" data-test="qds-infinite-scroll">
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
        <q-editor
          v-model="editor"
          min-height="8rem"
          :toolbar="[['bold', 'italic'], ['quote', 'unordered', 'ordered']]"
          data-test="qds-editor"
        />
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QUploader</div>
        <q-uploader
          ref="uploader"
          label="Uploader state proof"
          class="full-width"
          data-test="qds-uploader"
          :factory="uploadFactory"
          :auto-upload="false"
          multiple
          no-thumbnails
          hide-upload-btn
        />
      </div>
    </div>
  </q-card>
</template>
