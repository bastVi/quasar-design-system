<script setup lang="ts">
import { reactive } from 'vue'

type VariantName = 'fluent' | 'air' | 'mobile' | 'feather' | 'terminal'

type VariantSample = {
  name: VariantName
  label: string
  intent: string
  sample: string
}

const variants: VariantSample[] = [
  {
    name: 'fluent',
    label: 'Fluent',
    intent: 'Windows-style baseline: subtle acrylic, tonal cards, soft separators.',
    sample: 'Settings surface 01',
  },
  {
    name: 'air',
    label: 'Air',
    intent: 'Apple-like material: clean system palette, broad shape, quiet resting chrome.',
    sample: 'Material sheet A',
  },
  {
    name: 'mobile',
    label: 'One',
    intent: 'One UI-inspired rhythm: larger controls, rounder groups, touch-first spacing.',
    sample: 'Touch panel 04',
  },
  {
    name: 'feather',
    label: 'Feather',
    intent: 'Paper mood: warm surfaces, low acrylic, comfortable reading contrast.',
    sample: 'Reading card 12',
  },
  {
    name: 'terminal',
    label: 'Terminal',
    intent: 'Developer shell: monospace type, crisp hairlines, compact amber controls.',
    sample: 'qdsctl --inspect',
  },
]

const pages = reactive<Record<VariantName, number>>({
  fluent: 3,
  air: 3,
  mobile: 3,
  feather: 3,
  terminal: 3,
})
</script>

<template>
  <section class="variants-section" data-test="qds-variants-section" aria-labelledby="qds-variants-title">
    <div class="variants-hero qds-card">
      <p class="variants-kicker">Variant lab</p>
      <h1 id="qds-variants-title" class="qds-display">Same anatomy, different visual systems</h1>
      <p class="qds-text-muted">
        This view keeps component anatomy identical so variant-specific typography, density, borders,
        material, and state rules are visible side by side.
      </p>
    </div>

    <div class="variants-grid" aria-label="Variant comparison grid">
      <q-card
        v-for="variant in variants"
        :key="variant.name"
        class="variant-card"
        :class="`qds-variant-${variant.name}`"
        :data-test="`qds-variant-card-${variant.name}`"
      >
        <q-card-section>
          <div class="variant-card__eyebrow">{{ variant.sample }}</div>
          <h2 class="variant-card__title qds-display">{{ variant.label }}</h2>
          <p class="variant-card__copy">{{ variant.intent }}</p>
        </q-card-section>

        <q-separator />

        <q-card-section class="variant-card__controls">
          <q-input model-value="Variant token" label="Outlined field" outlined dense readonly />
          <div class="qds-button-row qds-button-row--tight">
            <q-btn unelevated color="primary" label="Apply" no-caps />
            <q-btn outline color="primary" label="Inspect" no-caps />
          </div>
          <q-list bordered separator>
            <q-item clickable active>
              <q-item-section>
                <q-item-label>Active row</q-item-label>
                <q-item-label caption>Spacing, type, and active state</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section>
                <q-item-label>Secondary row</q-item-label>
                <q-item-label caption>Shared anatomy, variant behavior</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-card flat bordered class="variant-card__nested" :data-test="`qds-variant-nested-${variant.name}`">
            <q-card-section>
              <div class="variant-card__eyebrow">Nested chrome</div>
              <p class="variant-card__copy">Secondary card material, separators, and variant-specific shadow rules.</p>
            </q-card-section>
          </q-card>
          <q-markup-table dense flat bordered :data-test="`qds-variant-table-${variant.name}`">
            <thead>
              <tr>
                <th class="text-left">Token</th>
                <th class="text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>radius</td>
                <td class="text-right">{{ variant.label }}</td>
              </tr>
            </tbody>
          </q-markup-table>
          <q-pagination
            v-model="pages[variant.name]"
            :max="128"
            :max-pages="6"
            boundary-numbers
            boundary-links
            direction-links
            color="primary"
          />
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

<style scoped>
.variants-section {
  display: grid;
  gap: var(--qds-space-lg);
}

.variants-hero {
  padding: clamp(1.25rem, 3vw, 2rem);
}

.variants-kicker {
  margin: 0 0 var(--qds-space-xs);
  color: var(--qds-color-primary);
  font-size: 0.78rem;
  font-weight: var(--qds-font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.variants-hero h1 {
  margin: 0 0 var(--qds-space-sm);
  color: var(--qds-text-strong);
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 1.05;
}

.variants-hero p {
  max-width: 62rem;
  margin: 0;
  font-size: 1rem;
}

.variants-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--qds-space-lg);
}

.variant-card {
  overflow: hidden;
}

.variant-card__eyebrow {
  color: var(--qds-color-primary);
  font-family: var(--qds-font-family);
  font-size: 0.75rem;
  font-weight: var(--qds-font-weight-semibold);
  letter-spacing: var(--qds-control-letter-spacing);
  text-transform: var(--qds-control-text-transform);
}

.variant-card__title {
  margin: 0.2rem 0 0;
  color: var(--qds-text-strong);
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  line-height: 1;
}

.variant-card__copy {
  margin: var(--qds-space-sm) 0 0;
  color: var(--qds-text-muted);
}

.variant-card__nested {
  padding: var(--qds-space-xs);
}

.variant-card__controls {
  display: grid;
  gap: var(--qds-space-md);
}

.variant-card :deep(.q-pagination) {
  justify-content: flex-start;
}

@media (max-width: 900px) {
  .variants-grid {
    grid-template-columns: 1fr;
  }
}
</style>
