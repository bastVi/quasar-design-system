<script setup lang="ts">
import { ref } from 'vue'
import {
  useDesignSystem,
  DESIGN_SYSTEM_VARIANTS,
  type DesignSystemMode,
  type DesignSystemVariantName,
} from '@bastvi/quasar-design-system'

import TokensSection from './sections/TokensSection.vue'
import TypographySection from './sections/TypographySection.vue'
import ComponentsSection from './sections/ComponentsSection.vue'
import IconsSection from './sections/IconsSection.vue'
import FontsSection from './sections/FontsSection.vue'

const ds = useDesignSystem()

const tab = ref<'tokens' | 'typography' | 'components' | 'icons' | 'fonts'>('tokens')

const modes: DesignSystemMode[] = ['light', 'dark', 'system']
const variants = Object.values(DESIGN_SYSTEM_VARIANTS)

function onMode(mode: DesignSystemMode) {
  ds.setMode(mode)
}

function onVariant(variant: DesignSystemVariantName) {
  ds.setVariant(variant)
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="qds-display">Quasar Design System</q-toolbar-title>

        <q-btn-toggle
          :model-value="ds.mode.value"
          :options="modes.map((m) => ({ label: m, value: m }))"
          unelevated
          dense
          no-caps
          toggle-color="primary"
          color="white"
          text-color="primary"
          class="q-mr-md"
          @update:model-value="onMode"
        />

        <q-btn-toggle
          :model-value="ds.variant.value"
          :options="variants.map((v) => ({ label: v.label, value: v.name }))"
          unelevated
          dense
          no-caps
          toggle-color="accent"
          color="white"
          text-color="accent"
          @update:model-value="onVariant"
        />
      </q-toolbar>

      <q-tabs v-model="tab" align="left" no-caps inline-label class="bg-primary text-white">
        <q-tab name="tokens" label="Tokens" />
        <q-tab name="typography" label="Typography" />
        <q-tab name="components" label="Components" />
        <q-tab name="icons" label="Icons" />
        <q-tab name="fonts" label="Fonts" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <q-page class="gallery-page qds-surface-muted">
        <q-tab-panels v-model="tab" animated class="gallery-panels bg-transparent">
          <q-tab-panel name="tokens"><TokensSection /></q-tab-panel>
          <q-tab-panel name="typography"><TypographySection /></q-tab-panel>
          <q-tab-panel name="components"><ComponentsSection /></q-tab-panel>
          <q-tab-panel name="icons"><IconsSection /></q-tab-panel>
          <q-tab-panel name="fonts"><FontsSection /></q-tab-panel>
        </q-tab-panels>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.gallery-page {
  min-height: 0;
  padding: var(--qds-space-md);
}

.gallery-panels :deep(.q-tab-panel) {
  padding: 0;
}
</style>
