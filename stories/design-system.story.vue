<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  PhBellRinging,
  PhCheckCircle,
  PhDevices,
  PhMoonStars,
  PhPalette,
  PhSparkle,
  PhSun,
} from '@phosphor-icons/vue'
import {
  DESIGN_SYSTEM_VARIANTS,
  useDesignSystem,
  type DesignSystemMode,
  type DesignSystemVariantName,
} from '../src'

const $q = useQuasar()
const designSystem = useDesignSystem()
const variantRegistry = DESIGN_SYSTEM_VARIANTS as Record<string, (typeof DESIGN_SYSTEM_VARIANTS)[keyof typeof DESIGN_SYSTEM_VARIANTS]>

const modeOptions: DesignSystemMode[] = ['light', 'dark', 'system']
const variantOptions = Object.keys(DESIGN_SYSTEM_VARIANTS) as DesignSystemVariantName[]
const mode = ref<DesignSystemMode>(designSystem.mode.value)
const variant = ref<DesignSystemVariantName>(designSystem.variant.value)
const density = ref('Comfortable')
const search = ref('Design tokens')
const enabled = ref(true)

function applyTheme() {
  designSystem.setMode(mode.value)
  designSystem.setVariant(variant.value)
}

const rootState = computed(() => {
  const state = designSystem.state

  return [
    'qds-ui',
    state.isDark ? 'qds-theme-dark' : 'qds-theme-light',
    variantRegistry[state.variant]?.cssClass ?? DESIGN_SYSTEM_VARIANTS.fluent.cssClass,
  ].filter(Boolean).join(' · ')
})

function notify() {
  $q.notify({
    type: 'info',
    message: 'QDS notification surface',
    caption: 'Phosphor control icons via qdsIconSet',
    timeout: 1400,
  })
}
</script>

<template>
  <Story title="Design System / Overview" :layout="{ type: 'single', iframe: true }">
    <Variant title="QDS catalog">
      <div class="qds-story-shell q-pa-xl">
        <q-toolbar class="qds-story-toolbar q-mb-lg rounded-borders">
          <q-toolbar-title>
            <div class="text-h5 qds-story-title">Quasar Design System</div>
            <div class="text-caption qds-text-muted">Tonal-first components over Quasar 2 primitives.</div>
          </q-toolbar-title>

          <q-btn flat round aria-label="Theme menu">
            <PhPalette :size="22" weight="regular" />
            <q-menu>
              <q-list style="min-width: 220px">
                <q-item v-close-popup clickable @click="mode = 'light'; applyTheme()">
                  <q-item-section avatar><PhSun :size="20" weight="regular" /></q-item-section>
                  <q-item-section>Light mode</q-item-section>
                </q-item>
                <q-item v-close-popup clickable @click="mode = 'dark'; applyTheme()">
                  <q-item-section avatar><PhMoonStars :size="20" weight="regular" /></q-item-section>
                  <q-item-section>Dark mode</q-item-section>
                </q-item>
                <q-item v-close-popup clickable @click="mode = 'system'; applyTheme()">
                  <q-item-section avatar><PhDevices :size="20" weight="regular" /></q-item-section>
                  <q-item-section>Follow system</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn color="info" unelevated @click="notify">
            <template #default>
              <PhBellRinging :size="18" weight="regular" />
              Notify
            </template>
          </q-btn>
        </q-toolbar>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-lg-4">
            <q-card class="q-pa-lg qds-story-panel">
              <div class="text-overline qds-text-muted">Runtime controls</div>
              <div class="text-h6 q-mb-md">Mode and variant</div>
              <q-select v-model="mode" :options="modeOptions" label="Mode" outlined dense class="q-mb-md" @update:model-value="applyTheme" />
              <q-select v-model="variant" :options="variantOptions" label="Variant" outlined dense class="q-mb-md" @update:model-value="applyTheme" />
              <q-input v-model="search" label="Search field" outlined dense class="q-mb-md">
                <template #prepend>
                  <PhSparkle :size="18" weight="regular" />
                </template>
              </q-input>
              <q-select v-model="density" :options="['Compact', 'Comfortable', 'Spacious']" label="Density sample" outlined dense class="q-mb-md" />
              <q-toggle v-model="enabled" color="primary" label="Interactive state" />
              <q-separator class="q-my-md" />
              <div class="text-caption qds-text-muted">{{ rootState }}</div>
            </q-card>
          </div>

          <div class="col-12 col-lg-8">
            <q-card class="q-pa-lg qds-story-panel q-mb-lg">
              <div class="row items-start q-col-gutter-lg">
                <div class="col-12 col-md-7">
                  <div class="text-overline qds-text-muted">Buttons</div>
                  <h2 class="qds-story-heading q-mt-none q-mb-sm">Semantic color is tonal by default here</h2>
                  <p class="qds-text-muted q-mb-lg">
                    Colored actions are tonal by default; reserve solid primary for a clear CTA.
                  </p>
                  <div class="q-gutter-sm q-mb-md">
                    <q-btn unelevated color="primary" label="Primary tonal" />
                    <q-btn unelevated color="positive" label="Positive tonal" />
                    <q-btn unelevated color="warning" label="Warning tonal" />
                    <q-btn unelevated color="negative" label="Negative tonal" />
                  </div>
                  <div class="q-gutter-sm">
                    <q-btn class="qds-solid" unelevated color="primary" label="Solid CTA" />
                    <q-btn outline color="primary" label="Outline" />
                    <q-btn unelevated label="Neutral" />
                    <q-btn flat color="primary" label="Flat" />
                  </div>
                </div>

                <div class="col-12 col-md-5">
                  <div class="qds-story-feature q-pa-lg rounded-borders">
                    <PhSparkle :size="44" weight="duotone" />
                    <div class="text-h6 q-mt-md">Phosphor content icon</div>
                    <p class="qds-text-muted q-mb-none">
                      Content uses duotone icons; Quasar controls use the QDS Phosphor line icon set.
                    </p>
                  </div>
                </div>
              </div>
            </q-card>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-card class="q-pa-lg qds-story-panel full-height">
                  <div class="text-overline qds-text-muted">Cards and surfaces</div>
                  <div class="text-h6 q-mb-sm">Layered surface rhythm</div>
                  <p class="qds-text-muted">Cards keep a neutral border, subtle depth, and tokenized radius across variants.</p>
                  <div class="qds-story-surface q-pa-md rounded-borders q-mb-md">
                    Muted surface utility with body text and soft boundary.
                  </div>
                  <div class="qds-glass q-pa-md rounded-borders">Glass utility for translucent emphasis.</div>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card class="q-pa-lg qds-story-panel full-height">
                  <div class="text-overline qds-text-muted">Feedback</div>
                  <div class="text-h6 q-mb-md">Badges, chips, notification</div>
                  <div class="q-gutter-sm q-mb-md">
                    <q-badge color="primary" label="Primary" />
                    <q-badge color="positive" label="Ready" />
                    <q-chip color="warning" label="Review" />
                    <q-chip color="info" removable label="Info chip" />
                  </div>
                  <q-banner rounded class="qds-story-banner">
                    <template #avatar>
                      <PhCheckCircle :size="24" weight="duotone" />
                    </template>
                    Toolbar, menu, fields, and Notify all inherit QDS tokens.
                  </q-banner>
                </q-card>
              </div>
            </div>

            <q-card class="q-pa-lg qds-story-panel q-mt-lg">
              <div class="text-overline qds-text-muted">Typography</div>
              <div class="qds-story-display">Display face: Fluent-inspired, calm, readable.</div>
              <p class="qds-story-body q-mb-none">
                Body face: Inter variable with local font assets and semantic token fallbacks for public package consumers.
              </p>
            </q-card>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>

<style scoped>
.qds-story-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(var(--qds-color-primary-rgb), 0.14), transparent 32rem),
    var(--qds-surface-1);
  color: var(--qds-text);
}

.qds-story-toolbar,
.qds-story-panel {
  background: var(--qds-card-bg);
  border: var(--qds-border-width-control) solid var(--qds-card-border);
}

.qds-story-title,
.qds-story-heading,
.qds-story-display {
  font-family: var(--qds-font-family-display);
}

.qds-story-heading {
  font-size: clamp(1.5rem, 2.6vw, 2.35rem);
  line-height: 1.08;
}

.qds-story-feature {
  background: rgba(var(--qds-color-primary-rgb), var(--qds-tonal-bg-opacity));
  border: var(--qds-border-width-control) solid rgba(var(--qds-color-primary-rgb), var(--qds-tonal-border-opacity));
}

.qds-story-surface,
.qds-story-banner {
  background: var(--qds-surface-1);
  border: var(--qds-border-width-control) solid var(--qds-border-subtle);
}

.qds-story-display {
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: var(--qds-font-weight-bold);
  line-height: 1.05;
}

.qds-story-body {
  max-width: 64ch;
  color: var(--qds-text-muted);
}
</style>
