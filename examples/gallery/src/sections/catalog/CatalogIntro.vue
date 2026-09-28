<script setup lang="ts">
import { ppCaretRight, ppFolder, ppHouse, ppInfo, ppWarning, ppWifiSlash } from 'quasar-extras-svg-icons/phosphor-icons-v2'

const breadcrumbItems = ['Gallery', 'Catalog', 'Quasar coverage']
const overflowItems = ['Workspace', 'Design library', 'Component catalog', 'Navigation patterns', 'Breadcrumb overflow']
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

    <div class="catalog-grid catalog-grid--two q-mt-md">
      <div class="catalog-demo">
        <div class="catalog-label">QBreadcrumbs states</div>
        <q-breadcrumbs data-test="qds-breadcrumbs">
          <template #separator><q-icon :name="ppCaretRight" size="0.875rem" /></template>
          <q-breadcrumbs-el :icon="ppHouse" label="Home" href="#catalog" />
          <q-breadcrumbs-el :icon="ppFolder" label="Archived" disable />
          <q-breadcrumbs-el label="Breadcrumbs" />
        </q-breadcrumbs>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QBreadcrumbs overflow</div>
        <div class="catalog-breadcrumbs-narrow">
          <q-breadcrumbs separator="›" data-test="qds-breadcrumbs-overflow">
            <q-breadcrumbs-el v-for="item in overflowItems" :key="item" :label="item" />
          </q-breadcrumbs>
        </div>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QBanner with icon</div>
        <q-banner rounded class="catalog-banner" data-test="qds-banner">
          <template #avatar><q-icon :name="ppInfo" color="primary" size="1.5rem" /></template>
          Token updates publish on the next build. Nothing is sent from the gallery.
        </q-banner>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QBanner dense inline actions</div>
        <q-banner dense inline-actions rounded class="catalog-banner" data-test="qds-banner-dense">
          <template #avatar><q-icon :name="ppWifiSlash" size="1.25rem" /></template>
          You are offline.
          <template #action>
            <q-btn flat dense no-caps label="Retry" />
          </template>
        </q-banner>
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QBanner with avatar and actions</div>
        <q-banner rounded class="catalog-banner" data-test="qds-banner-actions">
          <template #avatar><q-icon :name="ppWarning" color="warning" size="1.5rem" /></template>
          Two components still use the legacy radius. Review them before publishing the next release.
          <template #action>
            <q-btn flat no-caps label="Dismiss" />
            <q-btn flat no-caps color="primary" label="Review components" />
          </template>
        </q-banner>
      </div>
    </div>
  </q-card>
</template>

<style scoped>
.catalog-breadcrumbs-narrow {
  max-width: 14rem;
}
</style>
