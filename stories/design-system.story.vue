<script setup lang="ts">
import { ref } from 'vue'
import { createDesignSystemController } from '../src/runtime/theme'
import { DESIGN_SYSTEM_VARIANTS, type DesignSystemVariantName } from '../src/themes'

const mode = ref<'light' | 'dark' | 'system'>('system')
const variant = ref<DesignSystemVariantName>('studio')
const controller = createDesignSystemController({ persist: false })

controller.initialize()

function applyTheme() {
  controller.setMode(mode.value)
  controller.setVariant(variant.value)
}
</script>

<template>
  <Story title="Design System / Overview" :layout="{ type: 'grid', width: 900 }">
    <Variant title="Tokens and Quasar Controls">
      <div class="q-pa-lg qds-surface-muted" style="min-height: 100vh">
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-6">
            <q-select v-model="mode" :options="['light', 'dark', 'system']" label="Mode" outlined dense @update:model-value="applyTheme" />
          </div>
          <div class="col-12 col-md-6">
            <q-select v-model="variant" :options="Object.keys(DESIGN_SYSTEM_VARIANTS)" label="Variant" outlined dense @update:model-value="applyTheme" />
          </div>
        </div>

        <q-card class="q-pa-lg q-mb-lg">
          <div class="text-h5 q-mb-sm">Quasar Design System</div>
          <p class="qds-text-muted q-mb-lg">Opinionated Quasar 2 visual layer — tokens, overrides, and runtime theming.</p>

          <div class="row q-col-gutter-sm q-mb-lg">
            <div class="col-auto"><q-btn color="primary" label="Primary" /></div>
            <div class="col-auto"><q-btn color="secondary" label="Secondary" /></div>
            <div class="col-auto"><q-btn outline color="primary" label="Outline" /></div>
            <div class="col-auto"><q-btn flat color="negative" label="Flat" /></div>
          </div>

          <div class="row q-col-gutter-sm q-mb-lg">
            <div class="col-auto"><q-badge color="primary" label="Primary" /></div>
            <div class="col-auto"><q-badge color="positive" label="Positive" /></div>
            <div class="col-auto"><q-chip color="warning" label="Warning chip" /></div>
            <div class="col-auto"><q-chip color="info" label="Info chip" /></div>
          </div>

          <q-input model-value="" label="Outlined field" outlined class="q-mb-md" />
          <q-card class="q-pa-md qds-glass">Glass surface utility</q-card>
        </q-card>
      </div>
    </Variant>
  </Story>
</template>
