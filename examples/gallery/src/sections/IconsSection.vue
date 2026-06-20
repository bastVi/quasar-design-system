<script setup lang="ts">
// Content icons: @phosphor-icons/vue, duotone weight (the documented app-level path).
import {
  PhBell,
  PhCaretDown,
  PhHeart,
  PhGear,
  PhRocketLaunch,
  PhChartLineUp,
  PhFolderOpen,
} from '@phosphor-icons/vue'

const duotone = [
  { comp: PhBell, name: 'PhBell' },
  { comp: PhHeart, name: 'PhHeart' },
  { comp: PhGear, name: 'PhGear' },
  { comp: PhRocketLaunch, name: 'PhRocketLaunch' },
  { comp: PhChartLineUp, name: 'PhChartLineUp' },
  { comp: PhFolderOpen, name: 'PhFolderOpen' },
]
</script>

<template>
  <div class="column" style="gap: 1.5rem">
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-xs">Quasar control icons (qdsIconSet — Phosphor line)</div>
      <p class="qds-text-muted q-mb-md">
        These glyphs come from the Quasar icon-set wired via <code>app.use(Quasar, { iconSet: qdsIconSet })</code>.
      </p>
      <div class="row q-col-gutter-md items-center">
        <div class="col-auto"><q-btn round flat aria-label="Dropdown"><PhCaretDown :size="20" weight="regular" /></q-btn></div>
        <div class="col-auto"><q-chip removable color="primary" text-color="white" label="chip.remove" /></div>
        <div class="col-auto" style="min-width: 220px">
          <q-select class="icons-dense-select" model-value="" :options="['One', 'Two']" outlined dense label="Select arrow" />
        </div>
        <div class="col-auto"><q-rating :model-value="3" /></div>
      </div>
      <q-expansion-item label="Expansion item (chevron)" class="q-mt-md qds-card" style="border-radius: var(--qds-radius-md)">
        <q-card-section class="qds-text-muted">Uses the icon-set caret.</q-card-section>
      </q-expansion-item>
    </q-card>

    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-xs">Content icons (@phosphor-icons/vue — duotone)</div>
      <p class="qds-text-muted q-mb-md">App-level feature icons, <code>weight="duotone"</code>, sized via <code>1.75em</code>.</p>
      <div class="row q-col-gutter-lg">
        <div
          v-for="icon in duotone"
          :key="icon.name"
          class="col-auto column items-center"
          style="gap: 0.5rem"
        >
          <component :is="icon.comp" weight="duotone" :size="28" color="var(--qds-color-primary)" />
          <code class="caption">{{ icon.name }}</code>
        </div>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
.caption {
  font-size: 0.7rem;
  color: var(--qds-text-muted);
}
</style>
