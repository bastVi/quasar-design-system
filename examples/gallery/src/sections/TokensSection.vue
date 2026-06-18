<script setup lang="ts">
import { QDS_TOKENS } from '@bastvi/quasar-design-system'
import TokenSwatch from '../components/TokenSwatch.vue'

// Group the public --qds-* contract by visual category for the gallery.
const colorTokens = QDS_TOKENS.filter(
  (t) => t.startsWith('--qds-color-') && !t.endsWith('-rgb'),
)
const surfaceTokens = QDS_TOKENS.filter(
  (t) => t.startsWith('--qds-surface-') || t.startsWith('--qds-text') || t.startsWith('--qds-border'),
)
const spaceTokens = QDS_TOKENS.filter((t) => t.startsWith('--qds-space-'))
const radiusTokens = QDS_TOKENS.filter((t) => t.startsWith('--qds-radius-'))
const shadowTokens = QDS_TOKENS.filter(
  (t) => t.startsWith('--qds-shadow-') || t.startsWith('--qds-elevation-'),
)
const motionTokens = QDS_TOKENS.filter((t) => t.startsWith('--qds-motion-'))
</script>

<template>
  <div class="column" style="gap: 1.5rem">
    <div>
      <div class="text-h6 qds-display q-mb-sm">Color</div>
      <div class="grid">
        <TokenSwatch v-for="t in colorTokens" :key="t" :token="t" kind="color" />
      </div>
    </div>

    <div>
      <div class="text-h6 qds-display q-mb-sm">Surface &amp; Text</div>
      <div class="grid">
        <TokenSwatch v-for="t in surfaceTokens" :key="t" :token="t" kind="color" />
      </div>
    </div>

    <div>
      <div class="text-h6 qds-display q-mb-sm">Spacing</div>
      <div class="row q-col-gutter-md items-end">
        <div v-for="t in spaceTokens" :key="t" class="col-auto column items-center" style="gap: 0.5rem">
          <div class="space-bar" :style="{ width: `var(${t})`, height: `var(${t})` }" />
          <code class="caption">{{ t }}</code>
        </div>
      </div>
    </div>

    <div>
      <div class="text-h6 qds-display q-mb-sm">Radius</div>
      <div class="grid">
        <TokenSwatch v-for="t in radiusTokens" :key="t" :token="t" kind="box" />
      </div>
    </div>

    <div>
      <div class="text-h6 qds-display q-mb-sm">Shadow &amp; Elevation</div>
      <div class="grid">
        <TokenSwatch v-for="t in shadowTokens" :key="t" :token="t" kind="box" />
      </div>
    </div>

    <div>
      <div class="text-h6 qds-display q-mb-sm">Motion</div>
      <div class="row q-col-gutter-md">
        <div v-for="t in motionTokens" :key="t" class="col-auto column items-center" style="gap: 0.5rem">
          <div class="motion-dot" :style="{ transition: `transform var(${t})` }" />
          <code class="caption">{{ t }}</code>
        </div>
      </div>
      <p class="qds-text-muted q-mt-sm">Hover a dot to feel the easing/duration.</p>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}
.caption {
  font-size: 0.7rem;
  color: var(--qds-text-muted);
}
.space-bar {
  background: var(--qds-color-primary);
  border-radius: var(--qds-radius-xs);
}
.motion-dot {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--qds-radius-full);
  background: var(--qds-color-accent);
}
.motion-dot:hover {
  transform: translateX(2rem) scale(1.15);
}
</style>
