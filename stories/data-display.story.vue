<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  QBadge,
  QCard,
  QExpansionItem,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QPagination,
  QSelect,
  QSeparator,
  QTable,
  type QTableColumn,
} from 'quasar'
import { PhDatabase, PhListChecks, PhStack } from '@phosphor-icons/vue'
import {
  DESIGN_SYSTEM_VARIANTS,
  useDesignSystem,
  type DesignSystemMode,
  type DesignSystemVariantName,
} from '../src'

type CoverageRow = {
  component: string
  group: string
  state: string
  coverage: number
}

const designSystem = useDesignSystem()
const variantRegistry = DESIGN_SYSTEM_VARIANTS as Record<string, (typeof DESIGN_SYSTEM_VARIANTS)[keyof typeof DESIGN_SYSTEM_VARIANTS]>

const modeOptions: DesignSystemMode[] = ['light', 'dark', 'system']
const variantOptions = Object.keys(DESIGN_SYSTEM_VARIANTS) as DesignSystemVariantName[]
const mode = ref<DesignSystemMode>(designSystem.mode.value)
const variant = ref<DesignSystemVariantName>(designSystem.variant.value)
const page = ref(2)
const expansionOpen = ref(true)
const secondExpansionOpen = ref(false)
const tablePagination = ref({ page: 1, rowsPerPage: 4 })

const tableColumns: QTableColumn<CoverageRow>[] = [
  { name: 'component', label: 'Component', field: 'component', align: 'left', sortable: true },
  { name: 'group', label: 'Group', field: 'group', align: 'left' },
  { name: 'state', label: 'State', field: 'state', align: 'left' },
  { name: 'coverage', label: 'Coverage', field: 'coverage', align: 'right', format: value => `${value}%` },
]

const tableRows: CoverageRow[] = [
  { component: 'QTable', group: 'Data', state: 'Flat bordered', coverage: 92 },
  { component: 'QPagination', group: 'Data', state: 'Compact navigation', coverage: 88 },
  { component: 'QList', group: 'Lists', state: 'Dense item rhythm', coverage: 94 },
  { component: 'QExpansionItem', group: 'Lists', state: 'Expanded header', coverage: 90 },
  { component: 'QItem', group: 'Lists', state: 'Side metadata', coverage: 96 },
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
  <Story title="Design System / Data Display" :layout="{ type: 'single', iframe: true }">
    <Variant title="Tables, pagination, lists and expansion">
      <div class="qds-story-shell q-pa-xl">
        <div class="qds-story-kicker">{{ rootState }}</div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-lg-4">
            <QCard class="qds-story-panel q-pa-lg full-height">
              <div class="text-overline qds-text-muted">Theme controls</div>
              <h2 class="qds-story-heading q-my-sm">Structured content</h2>
              <p class="qds-text-muted">
                Deterministic table, pagination, list, and expansion states for visual parity checks.
              </p>
              <QSelect v-model="mode" :options="modeOptions" label="Mode" outlined dense class="q-mb-md" @update:model-value="applyTheme" />
              <QSelect v-model="variant" :options="variantOptions" label="Variant" outlined dense @update:model-value="applyTheme" />
            </QCard>
          </div>

          <div class="col-12 col-lg-8">
            <QCard class="qds-story-panel q-pa-lg q-mb-lg">
              <div class="row items-center q-mb-md">
                <div>
                  <div class="text-overline qds-text-muted">QTable + QPagination</div>
                  <div class="text-h6 qds-story-title">Coverage matrix sample</div>
                </div>
                <div class="q-ml-auto"><PhDatabase :size="28" weight="duotone" /></div>
              </div>

              <QTable
                v-model:pagination="tablePagination"
                :columns="tableColumns"
                :rows="tableRows"
                row-key="component"
                flat
                bordered
                dense
                hide-bottom
              />
              <div class="row justify-end q-mt-md">
                <QPagination v-model="page" data-test="qds-story-pagination" color="primary" :max="5" :max-pages="5" boundary-numbers direction-links />
              </div>
              <p class="qds-text-muted q-mt-sm q-mb-none">Switch to Air or Feather to verify the same pagination proof against variant tokens.</p>
            </QCard>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="row items-center q-mb-md">
                    <div class="text-overline qds-text-muted">QList</div>
                    <PhListChecks class="q-ml-auto" :size="26" weight="duotone" />
                  </div>
                  <QList separator>
                    <QItem clickable>
                      <QItemSection avatar><QBadge color="primary" rounded /></QItemSection>
                      <QItemSection>
                        <QItemLabel>Token audit</QItemLabel>
                        <QItemLabel caption>Neutral row with avatar marker</QItemLabel>
                      </QItemSection>
                      <QItemSection side>Today</QItemSection>
                    </QItem>
                    <QItem clickable active>
                      <QItemSection avatar><QBadge color="positive" rounded /></QItemSection>
                      <QItemSection>
                        <QItemLabel>Component pass</QItemLabel>
                        <QItemLabel caption>Active item state</QItemLabel>
                      </QItemSection>
                      <QItemSection side><QBadge outline color="primary" label="Live" /></QItemSection>
                    </QItem>
                    <QItem disable>
                      <QItemSection avatar><QBadge color="grey" rounded /></QItemSection>
                      <QItemSection>
                        <QItemLabel>Deprecated alias</QItemLabel>
                        <QItemLabel caption>Disabled row treatment</QItemLabel>
                      </QItemSection>
                    </QItem>
                  </QList>
                </QCard>
              </div>

              <div class="col-12 col-md-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="row items-center q-mb-md">
                    <div class="text-overline qds-text-muted">QExpansionItem</div>
                    <PhStack class="q-ml-auto" :size="26" weight="duotone" />
                  </div>
                  <QList class="qds-story-expansion" separator>
                    <QExpansionItem v-model="expansionOpen" expand-separator>
                      <template #header="{ expanded }">
                        <QItemSection>
                          <QItemLabel>Expanded custom header</QItemLabel>
                          <QItemLabel caption>{{ expanded ? 'Content region is visible' : 'Content region is hidden' }}</QItemLabel>
                        </QItemSection>
                        <QItemSection side><QBadge outline color="primary" label="open" /></QItemSection>
                      </template>
                      <div class="qds-story-expansion-body">Expanded content uses the same card surface and muted border rhythm.</div>
                    </QExpansionItem>

                    <QExpansionItem
                      v-model="secondExpansionOpen"
                      dense
                      label="Dense collapsed row"
                      caption="Compact header state"
                      expand-icon-toggle
                    >
                      <div class="qds-story-expansion-body">Hidden until toggled.</div>
                    </QExpansionItem>
                  </QList>
                  <QSeparator class="q-my-md" />
                  <p class="qds-text-muted q-mb-none">Includes expanded, collapsed, dense, active, and disabled visual states.</p>
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

.qds-story-expansion {
  overflow: hidden;
  border: var(--qds-border-width-control) solid var(--qds-border-subtle);
  border-radius: var(--qds-radius-lg);
}

.qds-story-expansion-body {
  padding: var(--qds-space-md);
  color: var(--qds-text-muted);
  background: var(--qds-surface-1);
}
</style>
