<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue'
import {
  PhDeviceMobile,
  PhFeather,
  PhMoonStars,
  PhMonitor,
  PhPalette,
  PhSparkle,
  PhSun,
  PhTerminal,
} from '@phosphor-icons/vue'
import {
  useDesignSystem,
  DESIGN_SYSTEM_VARIANTS,
  type DesignSystemMode,
  type DesignSystemVariantName,
} from '@bastvi/quasar-design-system'

import TokensSection from './sections/TokensSection.vue'
import TypographySection from './sections/TypographySection.vue'
import ComponentsSection from './sections/ComponentsSection.vue'
import CatalogSection from './sections/CatalogSection.vue'
import IconsSection from './sections/IconsSection.vue'
import FontsSection from './sections/FontsSection.vue'
import PluginsSection from './sections/PluginsSection.vue'
import ScenesSection from './sections/ScenesSection.vue'
import VariantsSection from './sections/VariantsSection.vue'
import WindowSection from './sections/WindowSection.vue'

const ds = useDesignSystem()

type GalleryTab = 'tokens' | 'typography' | 'components' | 'catalog' | 'variants' | 'scenes' | 'plugins' | 'window' | 'icons' | 'fonts'

const tabs: GalleryTab[] = ['tokens', 'typography', 'components', 'catalog', 'variants', 'scenes', 'plugins', 'window', 'icons', 'fonts']
const tab = ref<GalleryTab>(tabFromHash())

const modes: DesignSystemMode[] = ['light', 'dark', 'system']
const variants = Object.values(DESIGN_SYSTEM_VARIANTS)
const modeIcons = {
  light: PhSun,
  dark: PhMoonStars,
  system: PhMonitor,
} as const
const variantIcons: Record<string, Component> = {
  fluent: PhPalette,
  air: PhSparkle,
  mobile: PhDeviceMobile,
  feather: PhFeather,
  terminal: PhTerminal,
}

function onMode(mode: DesignSystemMode) {
  ds.setMode(mode)
}

function onVariant(variant: DesignSystemVariantName) {
  ds.setVariant(variant)
}

function tabFromHash(): GalleryTab {
  if (typeof window === 'undefined') {
    return 'tokens'
  }

  const value = window.location.hash.replace(/^#\/?/, '')
  return tabs.includes(value as GalleryTab) ? value as GalleryTab : 'tokens'
}

function onHashChange() {
  tab.value = tabFromHash()
}

onMounted(() => {
  window.addEventListener('hashchange', onHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
})

watch(tab, (value) => {
  if (typeof window === 'undefined') {
    return
  }

  const nextHash = value === 'tokens' ? '' : `#${value}`
  const next = `${window.location.pathname}${window.location.search}${nextHash}`
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
    window.history.replaceState(null, '', next)
  }
})
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="gallery-header">
      <q-toolbar>
        <q-toolbar-title class="gallery-title qds-display">Quasar Design System</q-toolbar-title>

        <div class="gallery-controls">
          <div class="gallery-switcher" aria-label="Mode">
            <q-btn
              v-for="mode in modes"
              :key="mode"
              dense
              unelevated
              no-caps
              color="primary"
              class="gallery-switcher__button"
              :aria-pressed="ds.mode.value === mode"
              :class="{ 'qds-active': ds.mode.value === mode }"
              @click="onMode(mode)"
            >
              <component :is="modeIcons[mode]" :size="16" weight="duotone" />
              <span>{{ mode }}</span>
            </q-btn>
          </div>

          <div class="gallery-switcher" aria-label="Variant">
            <q-btn
              v-for="variant in variants"
              :key="variant.name"
              dense
              unelevated
              no-caps
              color="accent"
              class="gallery-switcher__button"
              :aria-pressed="ds.variant.value === variant.name"
              :class="{ 'qds-active': ds.variant.value === variant.name }"
              @click="onVariant(variant.name)"
            >
              <component :is="variantIcons[variant.name] ?? PhPalette" :size="16" weight="duotone" />
              <span>{{ variant.label }}</span>
            </q-btn>
          </div>
        </div>
      </q-toolbar>

      <q-tabs v-model="tab" align="left" no-caps inline-label class="gallery-tabs">
        <q-tab name="tokens" label="Tokens" />
        <q-tab name="typography" label="Typography" />
        <q-tab name="components" label="Components" />
        <q-tab name="catalog" label="Catalog" />
        <q-tab name="variants" label="Variants" />
        <q-tab name="scenes" label="Scenes" />
        <q-tab name="plugins" label="Plugins" />
        <q-tab name="window" label="Window" />
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
          <q-tab-panel name="catalog"><CatalogSection /></q-tab-panel>
          <q-tab-panel name="variants"><VariantsSection /></q-tab-panel>
          <q-tab-panel name="scenes"><ScenesSection /></q-tab-panel>
          <q-tab-panel name="plugins"><PluginsSection /></q-tab-panel>
          <q-tab-panel name="window"><WindowSection /></q-tab-panel>
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

.gallery-header {
  box-shadow: none;
}

.gallery-header :deep(.q-toolbar) {
  flex-wrap: wrap;
  gap: var(--qds-space-sm);
  padding-block: var(--qds-space-xs);
}

.gallery-title {
  flex: 1 1 16rem;
  min-width: 14rem;
  overflow: visible;
}

.gallery-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--qds-space-sm);
}

.gallery-switcher {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.1875rem;
  padding: 0.1875rem;
  border: 1px solid var(--qds-border-subtle);
  border-radius: var(--qds-radius-full);
  background: color-mix(in srgb, var(--qds-surface-glass) 88%, transparent);
  backdrop-filter: blur(var(--qds-glass-blur)) saturate(var(--qds-glass-saturate));
}

.gallery-switcher__button {
  min-height: 1.875rem;
  border-radius: var(--qds-radius-full);
}

@media (max-width: 720px) {
  .gallery-title {
    flex-basis: 100%;
  }

  .gallery-controls {
    flex: 1 1 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.125rem;
  }

  .gallery-switcher {
    flex: 0 0 auto;
  }
}

.gallery-tabs {
  background: color-mix(in srgb, var(--qds-toolbar-bg) 88%, transparent);
  color: var(--qds-text);
}

.gallery-panels :deep(.q-tab-panel) {
  padding: 0;
}
</style>
