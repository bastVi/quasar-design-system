<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  QBadge,
  QCard,
  QCheckbox,
  QColor,
  QDate,
  QFile,
  QInput,
  QOptionGroup,
  QPopupEdit,
  QRange,
  QRadio,
  QSelect,
  QSeparator,
  QSlider,
  QToggle,
  QTime,
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
const inputReadonly = ref('Readonly field')
const inputError = ref('Needs attention')
const inputDisabled = ref('Disabled field')
const selectReadonly = ref('Comfortable')
const selectError = ref('Compact')
const selectDisabled = ref('Touch')
const selectMultiple = ref(['Compact', 'Touch'])
const file = ref<File | null>(null)
const date = ref('2026/07/02')
const dateMonthView = ref('2026/07/02')
const dateYearView = ref('2026/07/02')
const dateRange = ref({ from: '2026/07/06', to: '2026/07/12' })
const time = ref('10:30')
const color = ref('#6366f1')
const colorAlpha = ref('rgba(99, 102, 241, 0.72)')
const colorTune = ref('rgba(245, 158, 11, 0.84)')
const popupLabel = ref('Inline editable label')
const slider = ref(64)
const range = ref({ min: 22, max: 78 })
const timeHourOptions = [9, 10, 11]

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

const selectOptions = ['Compact', 'Comfortable', 'Touch']

function dateSelectable(day: string) {
  return !day.endsWith('/03') && !day.endsWith('/15')
}

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
                        Static date picker coverage keeps day cells, disabled days, month/year views, selected state, and range state visible.
                      </p>
                      <div class="row items-center q-gutter-sm">
                        <PhCalendarDots :size="28" weight="duotone" />
                        <QBadge color="primary" :label="date" />
                      </div>
                    </div>
                    <div class="col-12 col-md-7">
                      <div class="qds-story-stack qds-story-stack--relaxed">
                        <QDate v-model="date" :options="dateSelectable" flat bordered class="qds-story-picker" />
                        <QDate v-model="dateRange" range flat bordered class="qds-story-picker" />
                        <QDate v-model="dateMonthView" default-view="Months" flat bordered class="qds-story-picker" />
                        <QDate v-model="dateYearView" default-view="Years" flat bordered class="qds-story-picker" />
                      </div>
                    </div>
                  </div>
                </QCard>
              </div>

              <div class="col-12 col-lg-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="text-overline qds-text-muted">QInput, QSelect, QFile</div>
                  <h3 class="qds-story-title q-my-sm">Visible field states</h3>
                  <p class="qds-text-muted">
                    Readonly, error, disabled, and file affordances keep the field sub-elements visible without interaction.
                  </p>
                  <div class="qds-story-stack">
                    <QInput v-model="inputReadonly" label="Readonly input" outlined readonly />
                    <QInput v-model="inputError" label="Error input" outlined error error-message="Validation remains visible" />
                    <QInput v-model="inputDisabled" label="Disabled input" outlined disable />
                    <QSelect v-model="selectReadonly" :options="selectOptions" label="Readonly select" outlined readonly />
                    <QSelect v-model="selectError" :options="selectOptions" label="Error select" outlined error error-message="Selection needs review" />
                    <QSelect v-model="selectDisabled" :options="selectOptions" label="Disabled select" outlined disable />
                    <QSelect v-model="selectMultiple" :options="selectOptions" label="Multiple select chips" outlined multiple use-chips behavior="menu" />
                    <QFile v-model="file" label="File input" outlined clearable counter display-value="design-tokens.pdf" />
                  </div>
                </QCard>
              </div>

              <div class="col-12 col-lg-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="text-overline qds-text-muted">QTime, QColor, QPopupEdit, QSlider, QRange</div>
                  <h3 class="qds-story-title q-my-sm">Picker and edit surfaces</h3>
                  <p class="qds-text-muted">
                    Static picker surfaces expose AM/PM, landscape, spectrum/tune/alpha, popup editing chrome, and range controls.
                  </p>
                  <div class="qds-story-stack qds-story-stack--relaxed">
                    <QTime v-model="time" flat bordered landscape :format24h="false" :hour-options="timeHourOptions" class="qds-story-picker" />
                    <QColor v-model="color" default-view="palette" class="qds-story-picker" />
                    <QColor v-model="colorAlpha" default-view="spectrum" format-model="rgba" class="qds-story-picker" />
                    <QColor v-model="colorTune" default-view="tune" format-model="rgba" class="qds-story-picker" />
                    <div class="qds-story-edit-target">
                      {{ popupLabel }}
                      <QPopupEdit v-model="popupLabel" buttons v-slot="scope">
                        <QInput v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
                      </QPopupEdit>
                    </div>
                    <QSlider v-model="slider" :min="0" :max="100" label label-always markers />
                    <QRange v-model="range" :min="0" :max="100" label label-always markers />
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

.qds-story-stack--relaxed {
  gap: var(--qds-space-lg);
}

.qds-story-edit-target {
  display: inline-flex;
  width: fit-content;
  padding: var(--qds-space-sm) var(--qds-space-md);
  color: var(--qds-text-strong);
  background: var(--qds-surface-2);
  border: var(--qds-border-width-control) solid var(--qds-border);
  border-radius: var(--qds-radius-control);
}

.qds-story-picker {
  width: 100%;
  max-width: 24rem;
}
</style>
