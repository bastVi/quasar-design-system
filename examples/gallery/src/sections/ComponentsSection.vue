<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { PhCheck, PhDotsThreeVertical, PhList, PhPlus } from '@phosphor-icons/vue'

const $q = useQuasar()

const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'warning', 'info'] as const
const text = ref('')
const select = ref(null)
const selectOptions = ['Fluent', 'Glass', 'Mobile']

function notify(type: 'positive' | 'negative' | 'warning' | 'info') {
  $q.notify({
    type,
    message: `This is a ${type} notification`,
    position: 'top-right',
  })
}
</script>

<template>
  <div class="column" style="gap: 1.5rem">
    <!-- QBtn -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QBtn</div>

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Unelevated (semantic tonal default)</div>
      <div class="qds-button-row q-mb-md">
        <q-btn v-for="c in colors" :key="`u-${c}`" unelevated :color="c" :label="c" no-caps />
      </div>

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Explicit solid CTA</div>
      <div class="qds-button-row q-mb-md">
        <q-btn class="qds-solid" unelevated color="primary" label="Save" no-caps />
        <q-btn color="primary" label="Elevated" no-caps />
      </div>

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Outline</div>
      <div class="qds-button-row q-mb-md">
        <q-btn v-for="c in colors" :key="`o-${c}`" outline :color="c" :label="c" no-caps />
      </div>

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Flat &amp; Tonal</div>
      <div class="qds-button-row q-mb-md">
        <q-btn flat color="primary" label="Flat" no-caps />
        <q-btn flat color="negative" label="Flat" no-caps />
        <q-btn color="primary" label="Tonal" text-color="primary" no-caps />
        <q-btn color="accent" label="Tonal" text-color="accent" no-caps />
      </div>

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Round, Dense &amp; Disabled</div>
      <div class="qds-button-row">
        <q-btn round color="primary" aria-label="Add"><PhPlus :size="18" weight="regular" /></q-btn>
        <q-btn round outline color="accent" aria-label="Confirm"><PhCheck :size="18" weight="regular" /></q-btn>
        <q-btn dense unelevated color="primary" label="Dense" no-caps />
        <q-btn unelevated color="primary" label="Disabled" disable no-caps />
      </div>
    </q-card>

    <!-- QBadge + QChip -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QBadge &amp; QChip</div>
      <div class="qds-button-row q-mb-md">
        <q-badge v-for="c in colors" :key="`b-${c}`" :color="c" :label="c" />
      </div>
      <div class="qds-button-row">
        <q-chip color="primary" text-color="white" label="Primary" />
        <q-chip color="positive" text-color="white"><PhCheck :size="16" weight="regular" /> Done</q-chip>
        <q-chip color="warning" text-color="white" label="Removable" removable />
        <q-chip outline color="accent" label="Outline" />
        <q-chip clickable color="info" text-color="white" label="Clickable" />
      </div>
    </q-card>

    <!-- QCard -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QCard</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-4">
          <q-card>
            <q-card-section>
              <div class="text-subtitle1 qds-text-strong">Default card</div>
              <div class="qds-text-muted">Surface, border, radius, shadow from tokens.</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" label="Action" no-caps />
            </q-card-actions>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <div class="qds-glass q-pa-md" style="border-radius: var(--qds-card-radius)">
            <div class="text-subtitle1 qds-text-strong">Glass surface</div>
            <div class="qds-text-muted">.qds-glass utility (blur + saturate + border-mix).</div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- QInput / field -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QInput / QSelect (field)</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <q-input v-model="text" label="Outlined" outlined clearable class="q-mb-md" />
          <q-input model-value="" label="Filled" filled class="q-mb-md" />
          <q-input model-value="" label="With error" outlined error error-message="Required field" />
        </div>
        <div class="col-12 col-sm-6">
          <q-select v-model="select" :options="selectOptions" label="Outlined select" outlined class="q-mb-md" />
          <q-input model-value="" label="Disabled" outlined disable />
        </div>
      </div>
    </q-card>

    <!-- QMenu + QToolbar -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QMenu &amp; QToolbar</div>
      <q-toolbar class="qds-card q-mb-md" style="border-radius: var(--qds-radius-md)">
        <q-btn flat round aria-label="Menu"><PhList :size="20" weight="regular" /></q-btn>
        <q-toolbar-title>Toolbar surface</q-toolbar-title>
        <q-btn flat round aria-label="More actions">
          <PhDotsThreeVertical :size="20" weight="regular" />
          <q-menu>
            <q-list style="min-width: 180px">
              <q-item v-close-popup clickable>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item v-close-popup clickable>
                <q-item-section>Duplicate</q-item-section>
              </q-item>
              <q-separator />
              <q-item v-close-popup clickable>
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
      <q-btn unelevated color="primary" label="Open menu" no-caps>
        <q-menu>
          <q-list style="min-width: 160px">
            <q-item v-close-popup clickable><q-item-section>Fluent</q-item-section></q-item>
            <q-item v-close-popup clickable><q-item-section>Glass</q-item-section></q-item>
            <q-item v-close-popup clickable><q-item-section>Mobile</q-item-section></q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card>

    <!-- QNotification -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Notifications</div>
      <div class="qds-button-row">
        <q-btn unelevated color="positive" label="Positive" no-caps @click="notify('positive')" />
        <q-btn unelevated color="negative" label="Negative" no-caps @click="notify('negative')" />
        <q-btn unelevated color="warning" label="Warning" no-caps @click="notify('warning')" />
        <q-btn unelevated color="info" label="Info" no-caps @click="notify('info')" />
      </div>
    </q-card>
  </div>
</template>
