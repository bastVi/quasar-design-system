<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  PhCalendarBlank,
  PhCheck,
  PhDotsThreeVertical,
  PhInfo,
  PhList,
  PhMagnifyingGlass,
  PhPlus,
  PhSidebar,
  PhSparkle,
} from '@phosphor-icons/vue'

const $q = useQuasar()

const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'warning', 'info'] as const
const text = ref('')
const select = ref<string | null>(null)
const selectMultiple = ref(['Fluent', 'Air'])
const selectOptions = ['Fluent', 'Air', 'Mobile']
const dialogOpen = ref(false)
const tooltipOpen = ref(false)
const drawerOpen = ref(true)
const page = ref(3)
const checkbox = ref(true)
const radio = ref('comfortable')
const toggle = ref(true)
const denseCheckbox = ref(true)
const denseRadio = ref('dense-comfortable')
const denseToggle = ref(true)
const slider = ref(42)
const range = ref({ min: 24, max: 76 })
const verticalTab = ref('network')

const tableColumns = [
  { name: 'surface', label: 'Surface', field: 'surface', align: 'left' as const, sortable: true },
  { name: 'density', label: 'Density', field: 'density', align: 'left' as const },
  { name: 'state', label: 'State', field: 'state', align: 'left' as const },
]

const tableRows = [
  { surface: 'Command card', density: 'Comfortable', state: 'Ready' },
  { surface: 'Data table', density: 'Dense', state: 'Audited' },
  { surface: 'Overlay menu', density: 'Compact', state: 'Tokenized' },
]

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
        <q-badge class="qds-demo-icon-badge" color="primary"><PhSparkle :size="14" weight="duotone" /> Status</q-badge>
      </div>
      <div class="qds-button-row">
        <q-chip color="primary" text-color="white" label="Primary" />
        <q-chip color="positive" text-color="white"><PhCheck :size="16" weight="regular" /> Done</q-chip>
        <q-chip color="warning" text-color="white" label="Removable" removable />
        <q-chip outline color="accent" label="Outline" />
        <q-chip clickable color="info" text-color="white" label="Clickable" />
        <q-chip dense color="info" text-color="white"><PhInfo :size="14" weight="regular" /> Dense</q-chip>
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
            <div class="text-subtitle1 qds-text-strong">Acrylic surface</div>
            <div class="qds-text-muted">.qds-glass utility for shared blur + saturate + border-mix treatment.</div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- QInput / field -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QInput / QSelect</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <q-input v-model="text" label="Outlined" outlined clearable class="q-mb-md" />
          <q-input model-value="Search" label="With icon" outlined class="q-mb-md">
            <template #prepend><PhMagnifyingGlass :size="18" weight="regular" /></template>
          </q-input>
          <q-input model-value="" label="Filled" filled class="q-mb-md" />
          <q-input model-value="" label="With error" outlined error error-message="Required field" />
        </div>
        <div class="col-12 col-sm-6">
          <q-select v-model="select" :options="selectOptions" label="Outlined select" outlined class="q-mb-md" />
          <q-select
            v-model="selectMultiple"
            :options="selectOptions"
            label="Multiple select"
            filled
            multiple
            use-chips
            class="q-mb-md"
          />
          <q-select v-model="select" :options="selectOptions" label="Dense select" outlined dense class="q-mb-md" />
          <q-input model-value="" label="Disabled" outlined disable />
        </div>
      </div>
    </q-card>

    <!-- QDialog / overlays -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Dialogs, tooltips &amp; popups</div>
      <div class="qds-button-row">
        <q-btn unelevated color="primary" label="Open dialog" no-caps @click="dialogOpen = true" />
        <q-btn outline color="info" no-caps @click="tooltipOpen = !tooltipOpen">
          Tooltip target
          <PhInfo :size="18" weight="regular" />
          <q-tooltip v-model="tooltipOpen" anchor="top middle" self="bottom middle" no-parent-event>
            Tokenized tooltip surface with QDS depth.
          </q-tooltip>
        </q-btn>
        <q-btn outline color="accent" no-caps>
          Popup proxy
          <PhCalendarBlank :size="18" weight="regular" />
          <q-popup-proxy>
            <div class="q-pa-md" style="min-width: 220px">
              <div class="text-subtitle2 qds-text-strong q-mb-xs">Popup surface</div>
              <div class="qds-text-muted">Uses menu tokens for radius, border, and depth.</div>
            </div>
          </q-popup-proxy>
        </q-btn>
      </div>

      <q-dialog v-model="dialogOpen">
        <q-card>
          <q-card-section>
            <div class="text-h6 qds-display">Delete draft?</div>
            <div class="qds-text-muted q-mt-sm">
              Dialogs use an acrylic scrim, large-radius card surface, and tokenized action rail.
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat color="primary" label="Cancel" no-caps v-close-popup />
            <q-btn class="qds-solid" unelevated color="negative" label="Delete" no-caps v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>

    <!-- QTable / pagination -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QTable &amp; QPagination</div>
      <q-table
        title="Surface audit"
        :rows="tableRows"
        :columns="tableColumns"
        row-key="surface"
        dense
        flat
        class="q-mb-md"
      />
      <q-pagination v-model="page" data-test="qds-pagination" :max="7" direction-links boundary-links color="primary" />
    </q-card>

    <!-- QTabs -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">QTabs</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-5">
          <q-tabs v-model="verticalTab" vertical align="left" no-caps class="qds-card qds-vertical-tabs-demo q-pa-xs">
            <q-tab name="home" label="Home" />
            <q-tab name="network" label="Network & internet" />
            <q-tab name="personalization" label="Personalization" />
          </q-tabs>
        </div>
        <div class="col-12 col-md-7">
          <div class="qds-card q-pa-md" style="border-radius: var(--qds-radius-md)">
            <div class="text-subtitle1 qds-text-strong">Short rounded rail</div>
            <div class="qds-text-muted">
              Active tabs use a tokenized 3px accent rail that respects padding and avoids boxed fills.
            </div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- QDrawer / layout shell -->
    <q-card class="q-pa-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 qds-display">QDrawer / layout shell</div>
        <q-btn dense outline color="primary" no-caps @click="drawerOpen = !drawerOpen">
          <PhSidebar :size="18" weight="regular" /> Toggle drawer
        </q-btn>
      </div>
      <q-layout view="hHh lpR fFf" container style="height: 320px; border-radius: var(--qds-card-radius); overflow: hidden">
        <q-drawer v-model="drawerOpen" data-test="qds-drawer" show-if-above bordered :width="220">
          <q-list>
            <q-item clickable active>
              <q-item-section avatar><PhSparkle :size="18" weight="duotone" /></q-item-section>
              <q-item-section>Overview</q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section avatar><PhList :size="18" weight="regular" /></q-item-section>
              <q-item-section>Components</q-item-section>
            </q-item>
          </q-list>
        </q-drawer>
        <q-page-container>
          <q-page class="q-pa-md">
            <div class="qds-card q-pa-md" style="border-radius: var(--qds-radius-md)">
              <div class="text-subtitle1 qds-text-strong">Content shell</div>
              <div class="qds-text-muted">Drawer surfaces share the same acrylic, border, and active-list language.</div>
            </div>
            <!-- QPageSticky: generic layout helper — transparent surface, anchored to page edge -->
            <q-page-sticky position="bottom-right" :offset="[12, 12]">
              <q-btn round color="primary" size="sm" aria-label="Sticky action">
                <PhPlus :size="16" weight="regular" />
              </q-btn>
            </q-page-sticky>
            <!-- QPageScroller: deterministic scroll-to-top in a tall page.
                 Docs-only in the gallery because the demo container is too short
                 to trigger the scroll threshold reliably. The override in
                 _footer.scss resets its background to transparent. -->
          </q-page>
        </q-page-container>
        <q-footer bordered class="qds-layout-footer-demo">
          <q-toolbar class="q-px-md" style="min-height: 2.25rem">
            <div class="qds-text-muted" style="font-size: 0.8125rem">Footer surface — tokenized border-top, shared marginal background.</div>
          </q-toolbar>
        </q-footer>
      </q-layout>
    </q-card>

    <!-- Form controls -->
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-md">Selection controls</div>
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-5 column" style="gap: .75rem">
          <q-checkbox v-model="checkbox" label="Checkbox selected" />
          <q-radio v-model="radio" val="comfortable" label="Comfortable density" />
          <q-radio v-model="radio" val="compact" label="Compact density" />
          <q-toggle v-model="toggle" label="Enable tonal surfaces" />
          <div class="qds-text-muted q-mt-sm">Dense controls keep Quasar's compact branch.</div>
          <q-checkbox v-model="denseCheckbox" dense label="Dense checkbox" />
          <q-radio v-model="denseRadio" dense val="dense-comfortable" label="Dense radio selected" />
          <q-radio v-model="denseRadio" dense val="dense-compact" label="Dense radio unselected" />
          <q-toggle v-model="denseToggle" dense label="Dense toggle" />
        </div>
        <div class="col-12 col-md-7">
          <div class="text-subtitle2 qds-text-muted q-mb-sm">Slider</div>
          <q-slider v-model="slider" :min="0" :max="100" label color="primary" />
          <div class="qds-text-muted">Current value: {{ slider }}</div>
          <div class="text-subtitle2 qds-text-muted q-mt-md q-mb-sm">Range</div>
          <q-range v-model="range" :min="0" :max="100" label color="primary" />
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
            <q-item v-close-popup clickable><q-item-section>Air</q-item-section></q-item>
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
