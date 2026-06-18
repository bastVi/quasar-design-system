<script setup lang="ts">
import { computed } from 'vue'
import type { QdsToken } from '@bastvi/quasar-design-system'

const props = defineProps<{
  token: QdsToken | string
  /** Render style: a color chip, a box (radius/shadow), or a plain value. */
  kind?: 'color' | 'box' | 'value'
}>()

const cssVar = computed(() => `var(${props.token})`)
const kind = computed(() => props.kind ?? 'color')
</script>

<template>
  <div class="qds-card q-pa-sm column" style="gap: 0.5rem">
    <div
      v-if="kind === 'color'"
      class="swatch swatch--color"
      :style="{ background: cssVar }"
    />
    <div
      v-else-if="kind === 'box'"
      class="swatch swatch--box"
      :style="{
        borderRadius: token.includes('radius') ? cssVar : undefined,
        boxShadow: token.includes('shadow') || token.includes('elevation') ? cssVar : undefined,
      }"
    />
    <code class="token-name">{{ token }}</code>
  </div>
</template>

<style scoped>
.swatch {
  width: 100%;
  height: 3rem;
  border: 1px solid var(--qds-border);
}
.swatch--color {
  border-radius: var(--qds-radius-sm);
}
.swatch--box {
  background: var(--qds-surface-0);
}
.token-name {
  font-size: 0.7rem;
  color: var(--qds-text-muted);
  word-break: break-all;
}
</style>
