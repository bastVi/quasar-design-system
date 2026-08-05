<script setup lang="ts">
import { ref } from 'vue'
import { ppPlus, ppPencil, ppShare, ppStar, ppStarFill, ppStarHalf } from 'quasar-extras-svg-icons/phosphor-icons-v2'

const dropdownItems = ['Duplicate', 'Move', 'Archive']
const toggleChoice = ref('weekly')
const fabOpen = ref(false)
const ratingInactive = ref(0)
const ratingActive = ref(3)
const ratingHalf = ref(2.5)
const ratingReadonly = ref(4)
const ratingDisabled = ref(2)
const ratingPositive = ref(4)
const ratingNegative = ref(2)
const ratingPrimary = ref(3)
const ratingNoDimming = ref(2)

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
        <q-btn-dropdown data-test="qds-btn-dropdown" unelevated color="primary" label="Actions" no-caps>
          <q-list dense style="min-width: 180px">
            <q-item v-for="item in dropdownItems" :key="item" v-close-popup clickable>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QBtnGroup</div>
        <q-btn-group data-test="qds-btn-group" unelevated spread>
          <q-btn color="primary" label="One" no-caps />
          <q-btn color="primary" label="Two" no-caps />
          <q-btn color="primary" label="Three" no-caps />
        </q-btn-group>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QBtnToggle</div>
        <q-btn-toggle
          v-model="toggleChoice"
          data-test="qds-btn-toggle"
          unelevated
          no-caps
          toggle-color="primary"
          :options="toggleOptions"
        />
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QRating states</div>
        <div class="column q-gutter-sm">
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">Inactive:</span>
            <q-rating v-model="ratingInactive" data-test="qds-rating-inactive" aria-label="Product rating" icon-aria-label="Product rating" :icon="ppStar" size="sm" :max="5" />
          </div>
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">Selected (3):</span>
            <q-rating v-model="ratingActive" data-test="qds-rating-active" aria-label="Product rating" icon-aria-label="Product rating" :icon="ppStar" :icon-selected="ppStarFill" size="sm" :max="5" />
          </div>
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">Half (2.5):</span>
            <q-rating v-model="ratingHalf" data-test="qds-rating-half" aria-label="Product rating" icon-aria-label="Product rating" :icon="ppStar" :icon-half="ppStarHalf" :icon-selected="ppStarFill" size="sm" :max="5" />
          </div>
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">Readonly:</span>
            <q-rating v-model="ratingReadonly" data-test="qds-rating-readonly" aria-label="Read only product rating" icon-aria-label="Read only product rating" :icon="ppStar" :icon-selected="ppStarFill" size="sm" :max="5" readonly />
          </div>
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">Disabled:</span>
            <q-rating v-model="ratingDisabled" data-test="qds-rating-disabled" aria-label="Unavailable product rating" icon-aria-label="Unavailable product rating" :icon="ppStar" :icon-selected="ppStarFill" size="sm" :max="5" disable />
          </div>
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">No dimming:</span>
            <q-rating v-model="ratingNoDimming" data-test="qds-rating-no-dimming" aria-label="No dimming product rating" icon-aria-label="No dimming product rating" :icon="ppStar" :icon-selected="ppStarFill" no-dimming size="sm" :max="5" />
          </div>
        </div>
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QRating sizes</div>
        <div class="row items-center q-gutter-lg">
          <q-rating data-test="qds-rating-sm" :model-value="3" :icon="ppStar" :icon-selected="ppStarFill" size="sm" :max="5" />
          <q-rating data-test="qds-rating-md" :model-value="3" :icon="ppStar" :icon-selected="ppStarFill" size="md" :max="5" />
          <q-rating data-test="qds-rating-lg" :model-value="3" :icon="ppStar" :icon-selected="ppStarFill" size="lg" :max="5" />
        </div>
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QRating semantic colors</div>
        <div class="column q-gutter-sm">
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">Positive:</span>
            <q-rating v-model="ratingPositive" data-test="qds-rating-positive" :icon="ppStar" :icon-selected="ppStarFill" size="sm" :max="5" color="positive" />
          </div>
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">Negative:</span>
            <q-rating v-model="ratingNegative" data-test="qds-rating-negative" :icon="ppStar" :icon-selected="ppStarFill" size="sm" :max="5" color="negative" />
          </div>
          <div class="row items-center q-gutter-md">
            <span class="qds-text-muted text-caption">Primary:</span>
            <q-rating v-model="ratingPrimary" data-test="qds-rating-primary" :icon="ppStar" :icon-selected="ppStarFill" size="sm" :max="5" color="primary" />
          </div>
        </div>
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QBar + QSeparator</div>
        <q-toolbar data-test="qds-toolbar-surface" class="qds-card q-mb-sm">
          <q-toolbar-title>Toolbar surface</q-toolbar-title>
          <q-btn dense flat label="Action" aria-label="Toolbar action" no-caps />
        </q-toolbar>
        <q-toolbar data-test="qds-toolbar-dense" class="qds-card q-toolbar--dense q-mb-sm">
          <q-toolbar-title>Dense toolbar</q-toolbar-title>
          <q-btn dense flat label="Save" aria-label="Save dense toolbar" no-caps />
        </q-toolbar>
        <q-toolbar data-test="qds-toolbar-wrap" class="qds-card qds-toolbar--wrap q-mb-sm">
          <q-toolbar-title>Responsive toolbar actions</q-toolbar-title>
          <q-btn dense flat label="Share" aria-label="Share responsive toolbar" no-caps />
          <q-btn dense flat label="More" aria-label="More responsive toolbar actions" no-caps />
        </q-toolbar>
        <q-toolbar data-test="qds-toolbar-truncate" class="qds-card q-mb-sm">
          <q-toolbar-title data-test="qds-toolbar-long-title" class="qds-toolbar-title--truncate">
            A deliberately long toolbar title remains contained when action controls reserve the available space
          </q-toolbar-title>
          <q-btn dense flat label="Edit" aria-label="Edit long-title toolbar" no-caps />
        </q-toolbar>
        <q-bar data-test="qds-bar-standard" class="catalog-bar">
          <div>Toolbar preview</div>
          <q-space />
          <q-btn dense flat round aria-label="Minimize" />
          <q-btn dense flat round aria-label="Close" />
        </q-bar>
        <q-separator data-test="qds-separator-horizontal" spaced />
        <div data-test="qds-separator-inset-host">
          <q-separator data-test="qds-separator-inset-dark" dark inset spaced />
        </div>
        <div class="qds-text-muted">Separator rhythm below a tokenized bar.</div>
        <div data-test="qds-bar-separator-row" class="row items-center no-wrap q-mt-md">
          <q-bar data-test="qds-bar-dense" dense>
            <div>Dense bar</div>
            <q-space />
            <q-btn dense flat round aria-label="Minimize" />
          </q-bar>
          <q-separator data-test="qds-separator-vertical" vertical spaced style="height: 2rem" />
          <q-bar data-test="qds-bar-dense-secondary" dense>
            <div>Sibling bar</div>
          </q-bar>
        </div>
        <q-bar data-test="qds-bar-dark" dark class="q-mt-md">
          <div>Explicit dark bar</div>
          <q-space />
          <q-btn dense flat round aria-label="Close dark bar" />
        </q-bar>
      </div>

      <div class="catalog-demo">
        <div class="catalog-label">QAvatar</div>
        <div class="row items-center q-gutter-sm">
          <q-avatar data-test="qds-avatar" color="primary" text-color="white">QD</q-avatar>
          <q-avatar rounded color="accent" text-color="white">Ink</q-avatar>
          <q-avatar square color="secondary" text-color="white">UI</q-avatar>
        </div>
      </div>

      <div class="catalog-demo catalog-demo--wide">
        <div class="catalog-label">QFab</div>
        <div class="catalog-fab-stage">
          <q-fab v-model="fabOpen" color="accent" direction="right" label="Create" no-caps>
            <template #icon>
              <q-icon :name="ppPlus" />
            </template>
            <q-fab-action color="primary" label="Draft">
              <template #icon>
                <q-icon :name="ppPencil" />
              </template>
            </q-fab-action>
            <q-fab-action color="secondary" label="Share">
              <template #icon>
                <q-icon :name="ppShare" />
              </template>
            </q-fab-action>
          </q-fab>
        </div>
      </div>
    </div>
  </q-card>
</template>
