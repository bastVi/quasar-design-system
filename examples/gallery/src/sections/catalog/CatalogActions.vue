<script setup lang="ts">
import { ref } from 'vue'

const dropdownItems = ['Duplicate', 'Move', 'Archive']
const toggleChoice = ref('weekly')
const fabOpen = ref(false)

const toggleOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]
</script>

<template>
  <q-card class="catalog-card q-pa-lg">
    <div class="text-h6 qds-display q-mb-md">Navigation, buttons &amp; app chrome</div>
    <div class="catalog-grid catalog-grid--three">
      <div class="catalog-demo">
        <div class="catalog-label">QBtnDropdown</div>
        <q-btn-dropdown unelevated color="primary" label="Actions" no-caps>
          <q-list dense style="min-width: 180px">
            <q-item v-for="item in dropdownItems" :key="item" v-close-popup clickable>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QBtnGroup</div>
        <q-btn-group unelevated spread>
          <q-btn color="primary" label="One" no-caps />
          <q-btn color="primary" label="Two" no-caps />
          <q-btn color="primary" label="Three" no-caps />
        </q-btn-group>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QBtnToggle</div>
        <q-btn-toggle v-model="toggleChoice" unelevated no-caps toggle-color="primary" :options="toggleOptions" />
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QBar + QSeparator</div>
        <q-bar class="catalog-bar">
          <div>Toolbar preview</div>
          <q-space />
          <q-btn dense flat round aria-label="Minimize" />
          <q-btn dense flat round aria-label="Close" />
        </q-bar>
        <q-separator spaced />
        <div class="qds-text-muted">Separator rhythm below a tokenized bar.</div>
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QFab</div>
        <div class="catalog-fab-stage">
          <q-fab v-model="fabOpen" color="accent" direction="right" icon="add" label="Create" no-caps>
            <q-fab-action color="primary" icon="edit" label="Draft" />
            <q-fab-action color="secondary" icon="share" label="Share" />
          </q-fab>
        </div>
      </div>
    </div>
  </q-card>
</template>
