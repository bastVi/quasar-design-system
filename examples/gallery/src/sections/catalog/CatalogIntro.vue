<script setup lang="ts">
const breadcrumbItems = ['Gallery', 'Catalog', 'Quasar coverage']
</script>

<template>
  <q-card class="catalog-card q-pa-lg">
    <div class="catalog-heading q-mb-md">
      <div>
        <div class="text-overline qds-text-muted">Catalog extension</div>
        <div class="text-h5 qds-display">Remaining Quasar components</div>
      </div>
      <q-badge color="primary" label="static gallery" />
    </div>

    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el v-for="item in breadcrumbItems" :key="item" :label="item" />
    </q-breadcrumbs>

    <q-banner rounded class="catalog-banner">
      This section keeps examples lightweight: local state only, no uploads, no business-specific data.
    </q-banner>
  </q-card>
</template>
