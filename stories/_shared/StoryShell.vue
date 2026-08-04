<script setup lang="ts">
import { computed, watch } from 'vue'
import { QBadge } from 'quasar'
import {
  DESIGN_SYSTEM_VARIANTS,
  useDesignSystem,
  type DesignSystemMode,
  type DesignSystemVariantName,
} from '../../src'

const props = defineProps<{
  title: string
  description?: string
  mode: DesignSystemMode
  variant: DesignSystemVariantName
}>()

const designSystem = useDesignSystem()

watch(() => props.mode, (mode) => {
  designSystem.setMode(mode)
}, { immediate: true })

watch(() => props.variant, (variant) => {
  designSystem.setVariant(variant)
}, { immediate: true })

const rootState = computed(() => {
  const variant = DESIGN_SYSTEM_VARIANTS[props.variant as keyof typeof DESIGN_SYSTEM_VARIANTS]

  return [
    'qds-ui',
    `qds-theme-${designSystem.resolvedMode.value}`,
    variant?.cssClass ?? DESIGN_SYSTEM_VARIANTS.fluent.cssClass,
  ].join(' · ')
})
</script>

<template>
  <main class="qds-story-shell">
    <header class="qds-story-header">
      <div>
        <p class="qds-story-kicker">Quasar Design System</p>
        <h1 class="qds-story-heading">{{ title }}</h1>
        <p v-if="description" class="qds-story-description">{{ description }}</p>
      </div>
      <QBadge class="qds-story-root-state" color="primary" text-color="white" role="status" aria-live="polite">
        {{ rootState }}
      </QBadge>
    </header>

    <slot />
  </main>
</template>
