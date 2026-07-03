<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  QBtn,
  QBtnDropdown,
  QBtnGroup,
  QBtnToggle,
  QCard,
  QFab,
  QFabAction,
  QItem,
  QItemSection,
  QList,
  QSelect,
} from 'quasar'
import { PhArrowBendUpRight, PhCopy, PhPalette, PhPlus, PhSparkle } from '@phosphor-icons/vue'
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
const cadence = ref('weekly')
const density = ref('comfortable')
const fabOpen = ref(true)

const cadenceOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

const densityOptions = [
  { label: 'Compact', value: 'compact' },
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Touch', value: 'touch' },
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
  <Story title="Design System / Actions" :layout="{ type: 'single', iframe: true }">
    <Variant title="Buttons, groups and FAB">
      <div class="qds-story-shell q-pa-xl">
        <div class="qds-story-kicker">{{ rootState }}</div>
        <div class="row q-col-gutter-lg items-stretch">
          <div class="col-12 col-lg-4">
            <QCard class="qds-story-panel q-pa-lg full-height">
              <div class="text-overline qds-text-muted">Theme controls</div>
              <h2 class="qds-story-heading q-my-sm">Action primitives</h2>
              <p class="qds-text-muted">
                Focused Histoire coverage for grouped actions, dropdown affordances, toggles, and floating entry points.
              </p>
              <QSelect v-model="mode" :options="modeOptions" label="Mode" outlined dense class="q-mb-md" @update:model-value="applyTheme" />
              <QSelect v-model="variant" :options="variantOptions" label="Variant" outlined dense @update:model-value="applyTheme" />
            </QCard>
          </div>

          <div class="col-12 col-lg-8">
            <QCard class="qds-story-panel q-pa-lg full-height">
              <div class="qds-story-grid">
                <div class="qds-story-demo">
                  <div class="qds-story-label">QBtnDropdown</div>
                  <QBtnDropdown unelevated color="primary" label="Actions" no-caps>
                    <QList dense style="min-width: 180px">
                      <QItem v-close-popup clickable>
                        <QItemSection>Duplicate</QItemSection>
                      </QItem>
                      <QItem v-close-popup clickable>
                        <QItemSection>Move</QItemSection>
                      </QItem>
                      <QItem v-close-popup clickable>
                        <QItemSection>Archive</QItemSection>
                      </QItem>
                    </QList>
                  </QBtnDropdown>
                </div>

                <div class="qds-story-demo">
                  <div class="qds-story-label">QBtnGroup</div>
                  <QBtnGroup unelevated spread>
                    <QBtn color="primary" label="One" no-caps />
                    <QBtn color="primary" label="Two" no-caps />
                    <QBtn color="primary" label="Three" no-caps />
                  </QBtnGroup>
                </div>

                <div class="qds-story-demo">
                  <div class="qds-story-label">QBtnToggle</div>
                  <QBtnToggle v-model="cadence" unelevated no-caps toggle-color="primary" :options="cadenceOptions" />
                </div>

                <div class="qds-story-demo">
                  <div class="qds-story-label">Segmented density</div>
                  <QBtnToggle v-model="density" dense unelevated no-caps toggle-color="secondary" :options="densityOptions" />
                </div>

                <div class="qds-story-demo qds-story-demo--wide">
                  <div class="qds-story-label">QFab open state</div>
                  <div class="qds-story-fab-stage">
                    <QFab v-model="fabOpen" color="accent" direction="right" icon="add" label="Create" no-caps>
                      <QFabAction color="primary" icon="edit" label="Draft" />
                      <QFabAction color="secondary" icon="share" label="Share" />
                    </QFab>
                  </div>
                </div>

                <div class="qds-story-demo qds-story-demo--wide">
                  <div class="qds-story-label">Icon + tonal actions</div>
                  <div class="q-gutter-sm">
                    <QBtn unelevated color="primary" no-caps>
                      <PhSparkle :size="18" weight="regular" />
                      Compose
                    </QBtn>
                    <QBtn outline color="primary" no-caps>
                      <PhCopy :size="18" weight="regular" />
                      Copy
                    </QBtn>
                    <QBtn flat color="primary" no-caps>
                      <PhArrowBendUpRight :size="18" weight="regular" />
                      Share
                    </QBtn>
                    <QBtn round color="accent" aria-label="Quick add">
                      <PhPlus :size="20" weight="bold" />
                    </QBtn>
                    <QBtn round flat aria-label="Palette">
                      <PhPalette :size="20" weight="regular" />
                    </QBtn>
                  </div>
                </div>
              </div>
            </QCard>
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

.qds-story-panel,
.qds-story-demo {
  background: var(--qds-card-bg);
  border: var(--qds-border-width-control) solid var(--qds-card-border);
}

.qds-story-heading {
  font-family: var(--qds-font-family-display);
  font-size: clamp(1.5rem, 2.4vw, 2.25rem);
  line-height: 1.08;
}

.qds-story-kicker,
.qds-story-label {
  color: var(--qds-text-muted);
  font-size: 0.8125rem;
  font-weight: 650;
}

.qds-story-kicker {
  margin-bottom: var(--qds-space-md);
}

.qds-story-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--qds-space-md);
}

.qds-story-demo {
  min-width: 0;
  padding: var(--qds-space-md);
  border-color: var(--qds-border-subtle);
  border-radius: var(--qds-radius-lg);
}

.qds-story-label {
  margin-bottom: var(--qds-space-sm);
}

.qds-story-demo--wide {
  grid-column: 1 / -1;
}

.qds-story-fab-stage {
  display: flex;
  min-height: 5.5rem;
  align-items: center;
}

@media (max-width: 720px) {
  .qds-story-grid {
    grid-template-columns: 1fr;
  }
}
</style>
