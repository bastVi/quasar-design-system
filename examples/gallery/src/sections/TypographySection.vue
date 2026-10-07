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

    <div class="qds-card q-pa-lg" data-test="qds-type-utilities">
      <div class="text-h6 qds-display q-mb-md">Utilities &amp; prose</div>
      <div class="text-subtitle1" data-test="qds-type-subtitle">Subtitle at its scale weight</div>
      <div class="text-subtitle1 text-weight-bold" data-test="qds-type-subtitle-bold">Subtitle with text-weight-bold</div>
      <div class="text-overline text-capitalize" data-test="qds-type-overline-capitalize">overline with text-capitalize</div>
      <p class="q-mt-sm">
        Plain prose links take the brand ink, for example the
        <a href="#typography" data-test="qds-type-link">release notes</a>, and keep an underline.
      </p>
      <div class="row items-center" style="gap: var(--qds-space-sm)" data-test="qds-type-anchors">
        <div role="button" tabindex="0" class="qds-demo-role-button" data-test="qds-type-role-button">Custom role="button"</div>
        <q-btn href="#typography" outline no-caps label="QBtn link" />
        <q-list dense><q-item href="#typography" clickable class="qds-card">QItem link</q-item></q-list>
      </div>
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
.qds-demo-role-button {
  display: inline-block;
  padding: var(--qds-space-xs) var(--qds-space-sm);
  border: var(--qds-border-width-control) solid var(--qds-stroke-default);
  border-radius: var(--qds-radius-control);
  cursor: pointer;
}

.accent-text {
  font-family: var(--qds-font-family-accent);
  font-size: 1.25rem;
}
</style>
