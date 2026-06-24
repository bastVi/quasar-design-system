<script setup lang="ts">
import { ref } from 'vue'

const tab = ref('overview')
</script>

<template>
  <q-card class="catalog-card q-pa-lg">
    <div class="text-h6 qds-display q-mb-md">Identity, notices &amp; panels</div>
    <div class="catalog-grid catalog-grid--three">
      <div class="catalog-demo">
        <div class="catalog-label">QAvatar</div>
        <div class="row items-center q-gutter-sm">
          <q-avatar color="primary" text-color="white">QD</q-avatar>
          <q-avatar rounded color="accent" text-color="white">Air</q-avatar>
          <q-avatar square color="secondary" text-color="white">UI</q-avatar>
        </div>
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QTabPanels</div>
        <q-tabs v-model="tab" dense no-caps align="left" class="text-primary">
          <q-tab name="overview" label="Overview" />
          <q-tab name="states" label="States" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated class="catalog-panel">
          <q-tab-panel name="overview">Panel surfaces inherit the gallery background.</q-tab-panel>
          <q-tab-panel name="states">Animated panels keep the Quasar interaction model.</q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-card>
</template>
