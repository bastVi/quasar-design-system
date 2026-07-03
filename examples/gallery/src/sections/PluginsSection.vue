<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const status = ref('No plugin surface opened yet.')

let dismissNotify: (() => void) | undefined
let loadingTimer: number | undefined

const listActions = [
  { id: 'pin', label: 'Pin surface' },
  { id: 'duplicate', label: 'Duplicate card' },
  { id: 'archive', label: 'Archive draft' },
  {},
  { id: 'cancel', label: 'Cancel' },
]

const gridActions = [
  { id: 'fluent', label: 'Fluent' },
  { id: 'air', label: 'Air' },
  { id: 'mobile', label: 'One' },
  { id: 'feather', label: 'Feather' },
  {},
  { id: 'tokens', label: 'Tokens' },
  { id: 'motion', label: 'Motion' },
]

function setStatus(message: string) {
  status.value = message
}

function openListBottomSheet() {
  $q.bottomSheet({
    title: 'Surface actions',
    message: 'List mode keeps the action rail compact and tokenized.',
    actions: listActions,
  }).onOk((action: { label?: string }) => {
    setStatus(`BottomSheet list action: ${action.label ?? 'separator'}`)
  }).onCancel(() => {
    setStatus('BottomSheet list dismissed')
  })
}

function openGridBottomSheet() {
  $q.bottomSheet({
    title: 'Variant shortcuts',
    message: 'Grid mode proves the larger BottomSheet layout is skinned too.',
    grid: true,
    actions: gridActions,
  }).onOk((action: { label?: string }) => {
    setStatus(`BottomSheet grid action: ${action.label ?? 'separator'}`)
  }).onCancel(() => {
    setStatus('BottomSheet grid dismissed')
  })
}

function openDialog() {
  $q.dialog({
    title: 'Plugin dialog',
    message: 'The Dialog plugin uses the same QDS card, scrim, and action styling as component dialogs.',
    cancel: { label: 'Cancel', noCaps: true, flat: true, color: 'primary' },
    ok: { label: 'Confirm', noCaps: true, unelevated: true, color: 'primary' },
  }).onOk(() => {
    setStatus('Dialog plugin confirmed')
  }).onCancel(() => {
    setStatus('Dialog plugin cancelled')
  })
}

function showNotify() {
  dismissNotify?.()
  dismissNotify = $q.notify({
    type: 'info',
    message: 'Plugin notification',
    caption: 'Dismissed explicitly by the demo or visual gate.',
    position: 'top-right',
    timeout: 0,
    group: false,
    actions: [{ label: 'Dismiss', color: 'info', noCaps: true }],
    onDismiss: () => {
      dismissNotify = undefined
      setStatus('Notify plugin dismissed')
    },
  })
  setStatus('Notify plugin opened')
}

function hideLoading() {
  if (loadingTimer !== undefined) {
    window.clearTimeout(loadingTimer)
    loadingTimer = undefined
  }
  $q.loading.hide()
}

function showLoading() {
  hideLoading()
  $q.loading.show({
    delay: 0,
    message: 'Checking tokenized loading overlay…',
    spinnerSize: 56,
    customClass: 'qds-plugin-loading',
  })
  setStatus('Loading plugin opened')
  loadingTimer = window.setTimeout(() => {
    hideLoading()
    setStatus('Loading plugin hidden')
  }, 320)
}

function startLoadingBar() {
  $q.loadingBar.start()
  $q.loadingBar.increment(34)
  setStatus('LoadingBar plugin started')
}

function stopLoadingBar() {
  $q.loadingBar.stop()
  setStatus('LoadingBar plugin stopped')
}

onBeforeUnmount(() => {
  dismissNotify?.()
  hideLoading()
  $q.loadingBar.stop()
})
</script>

<template>
  <div class="column" style="gap: var(--qds-space-lg)">
    <q-card class="q-pa-lg">
      <div class="text-h6 qds-display q-mb-sm">Quasar plugin surfaces</div>
      <p class="qds-text-muted q-mb-lg" style="max-width: 64rem">
        Deterministic coverage for plugin/global UI that renders outside the local component tree.
        BottomSheet gets dedicated QDS styling; Dialog, Notify, Loading, and LoadingBar prove their
        teleported surfaces continue to inherit the body-level <code>.qds-ui</code> scope.
      </p>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6 col-lg-4">
          <q-card flat bordered class="q-pa-md full-height">
            <div class="text-subtitle1 qds-text-strong q-mb-xs">BottomSheet</div>
            <div class="qds-text-muted q-mb-md">List and grid action sheets share one tokenized surface.</div>
            <div class="qds-button-row">
              <q-btn unelevated color="primary" no-caps label="Open list BottomSheet" @click="openListBottomSheet" />
              <q-btn outline color="accent" no-caps label="Open grid BottomSheet" @click="openGridBottomSheet" />
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <q-card flat bordered class="q-pa-md full-height">
            <div class="text-subtitle1 qds-text-strong q-mb-xs">Dialog &amp; Notify</div>
            <div class="qds-text-muted q-mb-md">Global overlays reuse the existing dialog and notification skin.</div>
            <div class="qds-button-row">
              <q-btn unelevated color="primary" no-caps label="Open plugin dialog" @click="openDialog" />
              <q-btn outline color="info" no-caps label="Show plugin notify" @click="showNotify" />
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <q-card flat bordered class="q-pa-md full-height">
            <div class="text-subtitle1 qds-text-strong q-mb-xs">Loading surfaces</div>
            <div class="qds-text-muted q-mb-md">Short-lived loading controls avoid timers that outlive a test.</div>
            <div class="qds-button-row">
              <q-btn unelevated color="primary" no-caps label="Show loading overlay" @click="showLoading" />
              <q-btn outline color="accent" no-caps label="Start loading bar" @click="startLoadingBar" />
              <q-btn flat color="accent" no-caps label="Stop loading bar" @click="stopLoadingBar" />
            </div>
            <div class="qds-plugin-inner-loading-box q-mt-md" data-test="qds-plugin-inner-loading-box">
              <div class="qds-text-strong">Inline busy proof</div>
              <div class="qds-text-muted">QInnerLoading keeps plugin-overlay material without a timer.</div>
              <q-inner-loading showing label="Syncing" color="primary" class="qds-plugin-inner-loading" data-test="qds-plugin-inner-loading" />
            </div>
          </q-card>
        </div>
      </div>
    </q-card>

    <q-card class="q-pa-md" data-test="qds-plugin-status-card" data-testid="plugin-status-card">
      <div class="text-subtitle2 qds-text-muted q-mb-xs">Last plugin event</div>
      <div class="qds-text-strong" data-test="qds-plugin-status" data-testid="plugin-status">{{ status }}</div>
    </q-card>
  </div>
</template>

<style scoped>
.qds-plugin-inner-loading-box {
  position: relative;
  min-height: 6.5rem;
  padding: var(--qds-space-md);
  overflow: hidden;
  background: var(--qds-surface-1);
  border: var(--qds-border-width-control) solid var(--qds-border-subtle);
  border-radius: var(--qds-radius-lg);
}
</style>
