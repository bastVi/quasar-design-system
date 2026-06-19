<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'warning', 'info'] as const
const text = ref('')
const select = ref(null)
const selectOptions = ['Studio', 'Glass', 'Mobile']

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

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Unelevated (semantic)</div>
      <div class="row q-col-gutter-sm q-mb-md">
        <div v-for="c in colors" :key="`u-${c}`" class="col-auto">
          <q-btn unelevated :color="c" :label="c" no-caps />
        </div>
      </div>

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Outline</div>
      <div class="row q-col-gutter-sm q-mb-md">
        <div v-for="c in colors" :key="`o-${c}`" class="col-auto">
          <q-btn outline :color="c" :label="c" no-caps />
        </div>
      </div>

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Flat &amp; Tonal</div>
      <div class="row q-col-gutter-sm q-mb-md items-center">
        <div class="col-auto"><q-btn flat color="primary" label="Flat" no-caps /></div>
        <div class="col-auto"><q-btn flat color="negative" label="Flat" no-caps /></div>
        <div class="col-auto"><q-btn class="qds-tonal" color="primary" label="Tonal" text-color="primary" no-caps /></div>
        <div class="col-auto"><q-btn class="qds-tonal" color="accent" label="Tonal" text-color="accent" no-caps /></div>
      </div>

      <div class="text-subtitle2 qds-text-muted q-mb-xs">Round, Dense &amp; Disabled</div>
      <div class="row q-col-gutter-sm items-center">
        <div class="col-auto"><q-btn round color="primary" icon="add" /></div>
        <div class="col-auto"><q-btn round outline color="accent" icon="check" /></div>
        <div class="col-auto"><q-btn dense unelevated color="primary" label="Dense" no-caps /></div>
        <div class="col-auto"><q-btn unelevated color="primary" label="Disabled" disable no-caps /></div>
      </div>
    </q-card>

    <!-- QBadge + QChip -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QBadge &amp; QChip</div>
      <div class="row q-col-gutter-sm q-mb-md">
        <div v-for="c in colors" :key="`b-${c}`" class="col-auto">
          <q-badge :color="c" :label="c" />
        </div>
      </div>
      <div class="row q-col-gutter-sm items-center">
        <div class="col-auto"><q-chip color="primary" text-color="white" label="Primary" /></div>
        <div class="col-auto"><q-chip color="positive" text-color="white" icon="check" label="Done" /></div>
        <div class="col-auto"><q-chip color="warning" text-color="white" label="Removable" removable /></div>
        <div class="col-auto"><q-chip outline color="accent" label="Outline" /></div>
        <div class="col-auto"><q-chip clickable color="info" text-color="white" label="Clickable" /></div>
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
        <q-btn flat round icon="menu" />
        <q-toolbar-title>Toolbar surface</q-toolbar-title>
        <q-btn flat round icon="more_vert">
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
            <q-item v-close-popup clickable><q-item-section>Studio</q-item-section></q-item>
            <q-item v-close-popup clickable><q-item-section>Glass</q-item-section></q-item>
            <q-item v-close-popup clickable><q-item-section>Mobile</q-item-section></q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card>

    <!-- QNotification -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Notifications</div>
      <div class="row q-col-gutter-sm">
        <div class="col-auto"><q-btn unelevated color="positive" label="Positive" no-caps @click="notify('positive')" /></div>
        <div class="col-auto"><q-btn unelevated color="negative" label="Negative" no-caps @click="notify('negative')" /></div>
        <div class="col-auto"><q-btn unelevated color="warning" label="Warning" no-caps @click="notify('warning')" /></div>
        <div class="col-auto"><q-btn unelevated color="info" label="Info" no-caps @click="notify('info')" /></div>
      </div>
    </q-card>
  </div>
</template>
