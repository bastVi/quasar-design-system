<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  QBtn,
  QCard,
  QCardSection,
  QDialog,
  QItem,
  QItemSection,
  QList,
  QMenu,
  QSelect,
  QSeparator,
  QTab,
  QTabPanel,
  QTabPanels,
  QTabs,
} from 'quasar'
import { PhBell, PhFolderOpen, PhPalette, PhSidebar, PhSparkle } from '@phosphor-icons/vue'
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
const tab = ref('overview')
const dialogOpen = ref(true)
const menuOpen = ref(true)

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
  <Story title="Design System / Navigation & Overlays" :layout="{ type: 'single', iframe: true }">
    <Variant title="Tabs, panels, dialog and menu">
      <div class="qds-story-shell q-pa-xl">
        <div class="qds-story-kicker">{{ rootState }}</div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-lg-4">
            <QCard class="qds-story-panel q-pa-lg full-height">
              <div class="text-overline qds-text-muted">Theme controls</div>
              <h2 class="qds-story-heading q-my-sm">Navigation states</h2>
              <p class="qds-text-muted">
                Tabs, tab panels, menus, and modal overlays use tokenized chrome and keep the same scope as the overview story.
              </p>
              <QSelect v-model="mode" :options="modeOptions" label="Mode" outlined dense class="q-mb-md" @update:model-value="applyTheme" />
              <QSelect v-model="variant" :options="variantOptions" label="Variant" outlined dense @update:model-value="applyTheme" />
            </QCard>
          </div>

          <div class="col-12 col-lg-8">
            <QCard class="qds-story-panel q-pa-lg q-mb-lg">
              <div class="text-overline qds-text-muted">QTabs + QTabPanels</div>
              <QTabs v-model="tab" align="left" inline-label class="qds-story-tabs q-mt-sm">
                <QTab name="overview" label="Overview" icon="dashboard" />
                <QTab name="assets" label="Assets" icon="folder" />
                <QTab name="alerts" label="Alerts" icon="notifications" />
              </QTabs>
              <QSeparator />
              <QTabPanels v-model="tab" animated class="qds-story-tab-panels">
                <QTabPanel name="overview">
                  <div class="row items-center q-col-gutter-md">
                    <div class="col-auto"><PhSparkle :size="34" weight="duotone" /></div>
                    <div class="col">
                      <div class="text-h6 qds-story-title">Overview panel</div>
                      <p class="qds-text-muted q-mb-none">Active panel with soft card surface and deterministic content.</p>
                    </div>
                  </div>
                </QTabPanel>
                <QTabPanel name="assets">
                  <div class="row items-center q-col-gutter-md">
                    <div class="col-auto"><PhFolderOpen :size="34" weight="duotone" /></div>
                    <div class="col">Asset navigation keeps tab spacing consistent with list and menu rows.</div>
                  </div>
                </QTabPanel>
                <QTabPanel name="alerts">
                  <div class="row items-center q-col-gutter-md">
                    <div class="col-auto"><PhBell :size="34" weight="duotone" /></div>
                    <div class="col">Alert panel demonstrates icon and body text alignment.</div>
                  </div>
                </QTabPanel>
              </QTabPanels>
            </QCard>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="text-overline qds-text-muted">QMenu</div>
                  <div class="text-h6 qds-story-title q-mb-md">Anchored overlay menu</div>
                  <QBtn color="primary" unelevated label="Open menu" no-caps>
                    <QMenu v-model="menuOpen" persistent anchor="bottom left" self="top left" :offset="[0, 8]">
                      <QList dense style="min-width: 220px">
                        <QItem clickable>
                          <QItemSection avatar><PhPalette :size="18" weight="regular" /></QItemSection>
                          <QItemSection>Switch variant</QItemSection>
                        </QItem>
                        <QItem clickable>
                          <QItemSection avatar><PhSidebar :size="18" weight="regular" /></QItemSection>
                          <QItemSection>Pin navigation</QItemSection>
                        </QItem>
                        <QSeparator />
                        <QItem clickable>
                          <QItemSection>Open documentation</QItemSection>
                        </QItem>
                      </QList>
                    </QMenu>
                  </QBtn>
                  <p class="qds-text-muted q-mt-md q-mb-none">Menu is held open to expose the styled overlay in the story frame.</p>
                </QCard>
              </div>

              <div class="col-12 col-md-6">
                <QCard class="qds-story-panel q-pa-lg full-height">
                  <div class="text-overline qds-text-muted">QDialog</div>
                  <div class="text-h6 qds-story-title q-mb-md">Modal surface</div>
                  <QBtn outline color="primary" label="Toggle dialog" no-caps @click="dialogOpen = !dialogOpen" />
                  <QDialog v-model="dialogOpen" persistent>
                    <QCard class="qds-story-dialog" style="min-width: 320px">
                      <QCardSection>
                        <div class="text-h6 qds-story-title">Design-system dialog</div>
                        <p class="qds-text-muted q-mb-none">Open by default for visual review of scrim, card radius, and action spacing.</p>
                      </QCardSection>
                      <QCardSection class="row justify-end q-gutter-sm">
                        <QBtn flat label="Cancel" no-caps @click="dialogOpen = false" />
                        <QBtn color="primary" unelevated label="Confirm" no-caps @click="dialogOpen = false" />
                      </QCardSection>
                    </QCard>
                  </QDialog>
                  <p class="qds-text-muted q-mt-md q-mb-none">The dialog can be closed and reopened without changing any story data.</p>
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

.qds-story-panel,
.qds-story-dialog {
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

.qds-story-tabs,
.qds-story-tab-panels {
  background: transparent;
}
</style>
