<script setup lang="ts">
// Faces shipped via @bastvi/quasar-design-system/fonts/*.css (imported in main.ts).
const families = [
  { label: 'Inter Variable', stack: "'Inter Variable', sans-serif", note: 'Body / --qds-font-family' },
  { label: 'Selawik', stack: "'Selawik', sans-serif", note: 'Display / --qds-font-family-display' },
  { label: 'Open Sans Variable', stack: "'Open Sans Variable', sans-serif", note: 'Alternate body face' },
]
const sample = 'The quick brown fox jumps. Le vif œuf brun. 0123456789'
</script>

<template>
  <div class="column" style="gap: 1.5rem">
    <q-card v-for="f in families" :key="f.label" class="q-pa-lg">
      <div class="row items-baseline justify-between q-mb-sm">
        <div class="text-h6" :style="{ fontFamily: f.stack }">{{ f.label }}</div>
        <code class="caption">{{ f.note }}</code>
      </div>
      <div :style="{ fontFamily: f.stack }" style="font-size: 1.5rem">{{ sample }}</div>
      <div :style="{ fontFamily: f.stack }" class="q-mt-sm qds-text-muted">{{ sample }}</div>
    </q-card>
  </div>
</template>

<style scoped>
.caption {
  font-size: 0.7rem;
  color: var(--qds-text-muted);
}
</style>
