<script setup lang="ts">
// Headings use --qds-font-family-display, body uses --qds-font-family.
const scale = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
const weights = [
  { label: 'Regular', token: '--qds-font-weight-regular' },
  { label: 'Medium', token: '--qds-font-weight-medium' },
  { label: 'Semibold', token: '--qds-font-weight-semibold' },
  { label: 'Bold', token: '--qds-font-weight-bold' },
] as const
</script>

<template>
  <div class="column" style="gap: 1.5rem">
    <div class="qds-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Display family</div>
      <div v-for="level in scale" :key="level" :class="`text-${level}`">
        {{ level.toUpperCase() }} — Calm enterprise surfaces
      </div>
    </div>

    <div class="qds-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Body family &amp; weights</div>
      <p
        v-for="w in weights"
        :key="w.token"
        class="q-mb-sm"
        :style="{ fontWeight: `var(${w.token})` }"
      >
        {{ w.label }} — The quick brown fox jumps over the lazy dog. Le vif œuf brun.
      </p>
    </div>

    <div class="qds-card q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Accent family</div>
      <p class="accent-text">
        Accent family (<code>--qds-font-family-accent</code>) falls back to the body stack when unset.
      </p>
    </div>
  </div>
</template>

<style scoped>
.accent-text {
  font-family: var(--qds-font-family-accent);
  font-size: 1.25rem;
}
</style>
