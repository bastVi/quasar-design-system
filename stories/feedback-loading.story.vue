<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  QBanner,
  QBtn,
  QCard,
  QCircularProgress,
  QInnerLoading,
  QKnob,
  QLinearProgress,
  QSelect,
  QSeparator,
  QSkeleton,
  QSpinner,
  useQuasar,
} from 'quasar'
import { PhBellRinging, PhCheckCircle, PhCloudArrowUp, PhWarningCircle } from '@phosphor-icons/vue'
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
const knobValue = ref(64)

function applyTheme() {
  designSystem.setMode(mode.value)
  designSystem.setVariant(variant.value)
}

function notify() {
  $q.notify({
    type: 'positive',
    message: 'Design-system notification',
    caption: 'Notify plugin preview from Histoire',
    timeout: 1400,
  })
}

const rootState = computed(() => {
  const state = designSystem.state

  return [
    'qds-ui',
    state.isDark ? 'qds-theme-dark' : 'qds-theme-light',
    variantRegistry[state.variant]?.cssClass ?? DESIGN_SYSTEM_VARIANTS.fluent.cssClass,
  ].filter(Boolean).join(' · ')
})
</script>

<template>
  <Story title="Design System / Feedback & Loading" :layout="{ type: 'single', iframe: true }">
    <Variant title="Notify, banner, skeleton and progress">
      <div class="qds-story-shell q-pa-xl">
        <div class="qds-story-kicker">{{ rootState }}</div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-lg-4">
            <QCard class="qds-story-panel q-pa-lg full-height">
              <div class="text-overline qds-text-muted">Theme controls</div>
              <h2 class="qds-story-heading q-my-sm">Feedback surfaces</h2>
              <p class="qds-text-muted">
                Static loading states plus a Notify trigger for plugin-level visual review.
              </p>
              <QSelect v-model="mode" :options="modeOptions" label="Mode" outlined dense class="q-mb-md" @update:model-value="applyTheme" />
              <QSelect v-model="variant" :options="variantOptions" label="Variant" outlined dense class="q-mb-md" @update:model-value="applyTheme" />
              <QBtn color="primary" unelevated no-caps @click="notify">
                <PhBellRinging :size="18" weight="regular" />
                Show Notify
              </QBtn>
            </QCard>
          </div>

          <div class="col-12 col-lg-8">
            <div class="row q-col-gutter-lg">
              <div class="col-12">
                <QCard class="qds-story-panel q-pa-lg">
                  <div class="text-overline qds-text-muted">QBanner</div>
                  <QBanner rounded class="qds-story-banner q-mt-sm">
                    <template #avatar>
                      <PhCheckCircle :size="28" weight="duotone" />
                    </template>
                    <div class="text-weight-medium">Visual gate ready</div>
                    <div class="qds-text-muted">Banners use surface, border, icon, and muted-text tokens across modes.</div>
                  </QBanner>
                  <QBanner rounded class="qds-story-banner qds-story-banner--warning q-mt-md">
                    <template #avatar>
                      <PhWarningCircle :size="28" weight="duotone" />
                    </template>
                    <div class="text-weight-medium">Review required</div>
                    <div class="qds-text-muted">Secondary banner state with warning color context.</div>
                  </QBanner>
                </QCard>
              </div>

              <div class="col-12 col-md-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="text-overline qds-text-muted">QLinearProgress</div>
                  <div class="text-h6 qds-story-title q-mb-md">Progress states</div>
                  <QLinearProgress :value="0.68" rounded color="primary" size="12px" />
                  <QLinearProgress :value="0.38" rounded color="secondary" size="8px" class="q-mt-md" />
                  <QSeparator class="q-my-md" />
                  <div class="row items-center q-gutter-md">
                    <QCircularProgress show-value :value="72" size="3.5rem" color="accent" track-color="grey-3" />
                    <QSpinner color="primary" size="2rem" />
                    <div>
                      <div class="text-weight-medium">Circular progress + spinner</div>
                      <div class="qds-text-muted">Static proof for determinate and live wait treatments.</div>
                    </div>
                  </div>
                  <QSeparator class="q-my-md" />
                  <div class="row items-center q-gutter-md">
                    <QKnob v-model="knobValue" show-value size="4.5rem" :thickness="0.18" color="primary" track-color="grey-3" />
                    <div class="qds-text-muted">Knob inherits QDS progress color and track tokens.</div>
                  </div>
                </QCard>
              </div>

              <div class="col-12 col-md-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="text-overline qds-text-muted">QSkeleton</div>
                  <div class="text-h6 qds-story-title q-mb-md">Placeholder block</div>
                  <QSkeleton type="text" animation="none" width="42%" />
                  <QSkeleton type="rect" animation="none" height="72px" class="q-mt-sm" />
                  <QSkeleton type="text" animation="none" width="72%" class="q-mt-sm" />
                  <QSkeleton type="text" animation="none" width="56%" class="q-mt-sm" />
                </QCard>
              </div>

              <div class="col-12">
                <QCard class="qds-story-panel q-pa-lg">
                  <div class="text-overline qds-text-muted">QInnerLoading overlay</div>
                  <div class="qds-story-loading-box q-mt-sm">
                    <div class="row items-center q-col-gutter-md">
                      <div class="col-auto"><PhCloudArrowUp :size="34" weight="duotone" /></div>
                      <div class="col">
                        <div class="text-h6 qds-story-title">Syncing design assets</div>
                        <p class="qds-text-muted q-mb-none">A deterministic overlay state for loading-surface review.</p>
                      </div>
                    </div>
                    <QInnerLoading showing label="Syncing" color="primary" class="qds-plugin-inner-loading" data-test="qds-story-inner-loading" />
                  </div>
                </QCard>
              </div>
            </div>
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

.qds-story-panel {
  background: var(--qds-card-bg);
  border: var(--qds-border-width-control) solid var(--qds-card-border);
}

.qds-story-heading,
.qds-story-title {
  font-family: var(--qds-font-family-display);
}

.qds-story-heading {
  font-size: clamp(1.5rem, 2.4vw, 2.25rem);
  line-height: 1.08;
}

.qds-story-kicker {
  margin-bottom: var(--qds-space-md);
  color: var(--qds-text-muted);
  font-size: 0.8125rem;
  font-weight: 650;
}

.qds-story-banner,
.qds-story-loading-box {
  background: var(--qds-surface-1);
  border: var(--qds-border-width-control) solid var(--qds-border-subtle);
}

.qds-story-banner--warning {
  border-color: rgba(var(--qds-color-warning-rgb), var(--qds-tonal-border-opacity));
}

.qds-story-loading-box {
  position: relative;
  min-height: 9rem;
  padding: var(--qds-space-lg);
  border-radius: var(--qds-radius-lg);
}
</style>
