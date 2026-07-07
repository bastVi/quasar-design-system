<script setup lang="ts">
import { ref } from 'vue'
import { QdsWindow } from '../src/qwindow'
import '@quasar/quasar-ui-qwindow/index.css'
import '../src/css/extensions/qwindow.scss'

const visible = ref(true)
const maximized = ref(false)
</script>

<template>
  <Story title="Optional / QWindow" :layout="{ type: 'single', iframe: true }">
    <Variant title="Embedded QDS window">
      <div class="qds-window-story q-pa-xl">
        <div class="qds-window-story__stage">
          <QdsWindow
            v-model="visible"
            v-model:maximized="maximized"
            title="QDS optional window"
            embedded
            dense
            no-resize
            :actions="['close']"
            aria-label="QDS optional QWindow story"
          >
            <div class="qds-window-story__content">
              <p class="text-overline qds-text-muted q-mb-xs">Optional module</p>
              <h2 class="qds-story-heading q-mt-none q-mb-sm">Window chrome follows QDS tokens</h2>
              <p class="qds-text-muted q-mb-none">
                Consumers install <code>@quasar/quasar-ui-qwindow</code>, import its native CSS, then opt into the QDS extension stylesheet.
              </p>
            </div>
          </QdsWindow>
        </div>
      </div>
    </Variant>
  </Story>
</template>

<style scoped>
.qds-window-story {
  min-height: 100vh;
  color: var(--qds-text);
  background:
    radial-gradient(circle at top right, rgba(var(--qds-color-primary-rgb), 0.14), transparent 30rem),
    var(--qds-surface-1);
}

.qds-window-story__stage {
  min-height: 22rem;
  padding: var(--qds-space-md);
  border: var(--qds-border-width-control) solid var(--qds-border-subtle);
  border-radius: var(--qds-radius-xl);
  background: var(--qds-surface-0);
}

.qds-window-story__content {
  max-width: 44rem;
}

.qds-story-heading {
  font-family: var(--qds-font-family-display);
  font-size: clamp(1.5rem, 2.4vw, 2.2rem);
  line-height: 1.1;
}
</style>
