<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  QBadge,
  QCard,
  QCheckbox,
  QDate,
  QOptionGroup,
  QRadio,
  QSelect,
  QSeparator,
  QToggle,
} from 'quasar'
import { PhCalendarDots, PhChecks, PhSlidersHorizontal } from '@phosphor-icons/vue'
import {
  DESIGN_SYSTEM_VARIANTS,
  useDesignSystem,
  type DesignSystemMode,
  type DesignSystemVariantName,
} from '../src'

const designSystem = useDesignSystem()
const variantRegistry = DESIGN_SYSTEM_VARIANTS as Record<string, (typeof DESIGN_SYSTEM_VARIANTS)[keyof typeof DESIGN_SYSTEM_VARIANTS]>

const modeOptions: DesignSystemMode[] = ['light', 'dark', 'system']
const variantOptions = Object.keys(DESIGN_SYSTEM_VARIANTS) as DesignSystemVariantName[]
const mode = ref<DesignSystemMode>(designSystem.mode.value)
const variant = ref<DesignSystemVariantName>(designSystem.variant.value)
const checkbox = ref(true)
const denseCheckbox = ref(false)
const radio = ref('air')
const toggle = ref(true)
const denseToggle = ref(false)
const groupSingle = ref('comfortable')
const groupMultiple = ref(['motion', 'contrast'])
const date = ref('2026/07/02')

const densityOptions = [
  { label: 'Compact', value: 'compact' },
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Touch', value: 'touch' },
]

const capabilityOptions = [
  { label: 'Motion', value: 'motion' },
  { label: 'Contrast', value: 'contrast' },
  { label: 'Keyboard', value: 'keyboard' },
]

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
</script>

<template>
  <Story title="Design System / Forms & Pickers" :layout="{ type: 'single', iframe: true }">
    <Variant title="Selection controls and QDate">
      <div class="qds-story-shell q-pa-xl">
        <div class="qds-story-kicker">{{ rootState }}</div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-lg-4">
            <QCard class="qds-story-panel q-pa-lg full-height">
              <div class="text-overline qds-text-muted">Theme controls</div>
              <h2 class="qds-story-heading q-my-sm">Form states</h2>
              <p class="qds-text-muted">
                Selection controls cover checked, unchecked, radio-selected, toggle, dense, disabled, and grouped states.
              </p>
              <QSelect v-model="mode" :options="modeOptions" label="Mode" outlined dense class="q-mb-md" @update:model-value="applyTheme" />
              <QSelect v-model="variant" :options="variantOptions" label="Variant" outlined dense @update:model-value="applyTheme" />
            </QCard>
          </div>

          <div class="col-12 col-lg-8">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="row items-center q-mb-md">
                    <div>
                      <div class="text-overline qds-text-muted">Checkbox, radio, toggle</div>
                      <div class="text-h6 qds-story-title">Individual controls</div>
                    </div>
                    <PhChecks class="q-ml-auto" :size="28" weight="duotone" />
                  </div>
                  <div class="qds-story-stack">
                    <QCheckbox v-model="checkbox" color="primary" label="Checked checkbox" />
                    <QCheckbox v-model="denseCheckbox" dense color="secondary" label="Dense unchecked checkbox" />
                    <QRadio v-model="radio" val="fluent" color="primary" label="Fluent radio" />
                    <QRadio v-model="radio" val="air" color="primary" label="Air radio selected" />
                    <QToggle v-model="toggle" color="primary" label="Enabled toggle" />
                    <QToggle v-model="denseToggle" dense color="accent" label="Dense disabled toggle" disable />
                  </div>
                </QCard>
              </div>

              <div class="col-12 col-md-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="row items-center q-mb-md">
                    <div>
                      <div class="text-overline qds-text-muted">QOptionGroup</div>
                      <div class="text-h6 qds-story-title">Grouped choices</div>
                    </div>
                    <PhSlidersHorizontal class="q-ml-auto" :size="28" weight="duotone" />
                  </div>
                  <QOptionGroup v-model="groupSingle" color="primary" :options="densityOptions" />
                  <QSeparator spaced />
                  <QOptionGroup v-model="groupMultiple" type="checkbox" color="accent" :options="capabilityOptions" />
                  <div class="q-mt-md q-gutter-sm">
                    <QBadge outline color="primary" :label="groupSingle" />
                    <QBadge color="accent" :label="`${groupMultiple.length} enabled`" />
                  </div>
                </QCard>
              </div>

              <div class="col-12">
                <QCard class="qds-story-panel q-pa-lg">
                  <div class="row q-col-gutter-lg items-start">
                    <div class="col-12 col-md-5">
                      <div class="text-overline qds-text-muted">QDate</div>
                      <h3 class="qds-story-title q-my-sm">Calendar picker</h3>
                      <p class="qds-text-muted">
                        Static date picker coverage keeps day cells, header, navigation controls, and selected state visible.
                      </p>
                      <div class="row items-center q-gutter-sm">
                        <PhCalendarDots :size="28" weight="duotone" />
                        <QBadge color="primary" :label="date" />
                      </div>
                    </div>
                    <div class="col-12 col-md-7">
                      <QDate v-model="date" flat bordered class="qds-story-picker" />
                    </div>
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

.qds-story-stack {
  display: grid;
  gap: var(--qds-space-sm);
}

.qds-story-picker {
  width: 100%;
  max-width: 24rem;
}
</style>
