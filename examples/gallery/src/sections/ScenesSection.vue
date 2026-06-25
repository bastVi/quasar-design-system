<script setup lang="ts">
type SceneVariant = 'fluent' | 'air' | 'mobile' | 'feather'

type Scene = {
  variant: SceneVariant
  label: string
  tagline: string
  wallpaper: string
  detail: string
}

const scenes: Scene[] = [
  {
    variant: 'fluent',
    label: 'Fluent',
    tagline: 'Tonal workboard',
    wallpaper: '/scenes/qds-wallpaper-fluent.svg',
    detail: 'Calm depth, solid reading surfaces, and restrained acrylic over cool geometry.',
  },
  {
    variant: 'air',
    label: 'Air',
    tagline: 'Matte glass over imagery',
    wallpaper: '/scenes/qds-wallpaper-air.svg',
    detail: 'Higher blur, softer translucency, and image-aware depth without shiny legacy glass.',
  },
  {
    variant: 'mobile',
    label: 'Mobile',
    tagline: 'Rounded touch surface',
    wallpaper: '/scenes/qds-wallpaper-mobile.svg',
    detail: 'Larger curves and friendly spacing for stacked phone-sized panels.',
  },
  {
    variant: 'feather',
    label: 'Feather',
    tagline: 'Paper and ink',
    wallpaper: '/scenes/qds-wallpaper-feather.svg',
    detail: 'Warm paper color, minimal acrylic, and quiet shadows for eink-like reading.',
  },
]
</script>

<template>
  <section class="scenes-section" data-test="qds-scenes-section" aria-labelledby="qds-scenes-title">
    <div class="scenes-hero qds-card">
      <p class="scenes-kicker">Scene surfaces</p>
      <h1 id="qds-scenes-title" class="qds-display">Variant matrix over owned scenic wallpapers</h1>
      <p class="qds-text-muted">
        These frames compare the same tokenized Quasar card anatomy over deterministic SVG wallpapers.
        The backgrounds are gallery-owned assets, so Air can be judged as matte glass against image-rich context.
      </p>
    </div>

    <div class="scenes-grid" aria-label="Variant scene matrix">
      <article
        v-for="scene in scenes"
        :key="scene.variant"
        class="scene-frame"
        :class="[`qds-variant-${scene.variant}`, `scene-frame--${scene.variant}`]"
        :style="{ '--scene-wallpaper': `url(${scene.wallpaper})` }"
        :data-test="`qds-scene-${scene.variant}`"
      >
        <div class="scene-wallpaper" aria-hidden="true" />

        <q-card class="scene-panel" :data-test="`qds-scene-card-${scene.variant}`">
          <q-card-section>
            <div class="scene-panel__eyebrow">{{ scene.tagline }}</div>
            <h2 class="scene-panel__title qds-display">{{ scene.label }}</h2>
            <p class="scene-panel__copy">{{ scene.detail }}</p>
          </q-card-section>

          <q-separator />

          <q-card-section class="scene-metrics">
            <span>blur <strong>var(--qds-card-backdrop-blur)</strong></span>
            <span>alpha <strong>var(--qds-surface-glass)</strong></span>
          </q-card-section>

          <q-card-actions align="between">
            <q-btn dense flat color="primary" label="Inspect" no-caps />
            <q-btn dense unelevated color="primary" label="Apply" no-caps />
          </q-card-actions>
        </q-card>

        <div class="scene-dock qds-card" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.scenes-section {
  display: grid;
  gap: var(--qds-space-lg);
}

.scenes-hero {
  padding: clamp(1.25rem, 3vw, 2rem);
}

.scenes-kicker {
  margin: 0 0 var(--qds-space-xs);
  color: var(--qds-color-primary);
  font-size: 0.78rem;
  font-weight: var(--qds-font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.scenes-hero h1 {
  margin: 0 0 var(--qds-space-sm);
  color: var(--qds-text-strong);
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 1.05;
}

.scenes-hero p {
  max-width: 62rem;
  margin: 0;
  font-size: 1rem;
}

.scenes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--qds-space-lg);
}

.scene-frame {
  position: relative;
  min-height: 28rem;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(1rem, 3vw, 1.5rem);
  border: var(--qds-border-width-control) solid color-mix(in srgb, var(--qds-border) 54%, transparent);
  border-radius: calc(var(--qds-card-radius) + 0.75rem);
  background-image: var(--scene-wallpaper);
  background-position: center;
  background-size: cover;
  box-shadow: var(--qds-shadow-md);
}

.scene-wallpaper {
  position: absolute;
  inset: 0;
  z-index: -2;
  background-image: var(--scene-wallpaper);
  background-position: center;
  background-size: cover;
  transform: scale(1.02);
}

.scene-frame::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  background:
    radial-gradient(circle at 22% 20%, rgba(var(--qds-color-primary-rgb), 0.18), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.02));
}

.scene-panel {
  max-width: 26rem;
  margin-top: clamp(2rem, 7vw, 5rem);
}

.scene-panel__eyebrow {
  color: var(--qds-color-primary);
  font-size: 0.75rem;
  font-weight: var(--qds-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.scene-panel__title {
  margin: 0.2rem 0 0;
  color: var(--qds-text-strong);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1;
}

.scene-panel__copy {
  margin: var(--qds-space-sm) 0 0;
  color: var(--qds-text-muted);
}

.scene-metrics {
  display: grid;
  gap: var(--qds-space-xs);
  color: var(--qds-text-muted);
  font-size: 0.8rem;
}

.scene-metrics strong {
  color: var(--qds-text-strong);
  font-weight: var(--qds-font-weight-medium);
}

.scene-dock {
  position: absolute;
  right: clamp(1rem, 3vw, 1.5rem);
  bottom: clamp(1rem, 3vw, 1.5rem);
  display: flex;
  gap: 0.4rem;
  padding: 0.55rem;
  border-radius: var(--qds-radius-full);
}

.scene-dock span {
  width: 0.62rem;
  height: 0.62rem;
  border-radius: var(--qds-radius-full);
  background: rgba(var(--qds-color-primary-rgb), 0.7);
}

.scene-frame--air .scene-panel,
.scene-frame--air .scene-dock {
  transform: translateY(-0.25rem);
}

.scene-frame--feather::before {
  background:
    repeating-linear-gradient(0deg, rgba(95, 111, 82, 0.045) 0 1px, transparent 1px 9px),
    linear-gradient(135deg, rgba(255, 248, 232, 0.72), rgba(255, 248, 232, 0.08));
}

@media (max-width: 900px) {
  .scenes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
