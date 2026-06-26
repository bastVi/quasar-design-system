# Quasar Design System

Opinionated Quasar 2 design system inspired by Microsoft Fluent 2, Apple's Human Interface Guidelines, and Samsung One UI.

Published under the personal scope `@bastvi/quasar-design-system` while the visual language is still evolving. It contains only generic visual language — no business logic, models, or app-specific assumptions.

## Goals

- Provide a full Quasar 2 visual layer: tokens, surfaces, shape, motion, typography, and component overrides.
- Keep functional libraries (components, features, models, entities, helpers, composables) separate from the visual language.
- Let apps opt into the design system explicitly instead of forcing every consumer into one visual language.
- Support multiple close variants of the same design language without pretending to be strict Fluent UI compliance.

## Design Direction

The default language is Microsoft Fluent 2-inspired: navy primary, gold accent, orange warning, warm neutral surfaces, restrained acrylic cards, and compact enterprise controls.

- clean, calm, tonal surfaces with restrained acrylic depth
- tonal-first semantic controls with explicit solid, outlined, and neutral states
- crisp radii and hairline borders; subtle state layers
- a clear 2px outline focus ring
- adaptive light/dark/system mode
- deliberate variant overlays (see Variants), not separate brands

## Install

```bash
pnpm add @bastvi/quasar-design-system
```

> **Built TS + source SCSS.** TypeScript runtime entrypoints ship pre-compiled as ESM
> JS with `.d.ts` declarations in `dist/`. SCSS and font exports remain in raw `src/`
> so your build pipeline can consume and customize them. Import the design-system CSS
> **after** Quasar's own CSS.

## Basic Usage

Import Quasar's own CSS first, then the design-system CSS:

```ts
import 'quasar/src/css/index.sass'
import '@bastvi/quasar-design-system/css'
```

The default `./css` bundle is **unlayered** and must be imported **after** Quasar's CSS — Quasar ships unlayered CSS, so the overrides win on cascade order plus specificity, not on `@layer`. If your app deliberately places Quasar's CSS in a lower `@layer`, use the advanced `@bastvi/quasar-design-system/css/layered` bundle instead. Mixing the layered bundle with unlayered Quasar CSS is unsupported (a layer cannot beat unlayered rules).

For a deeper Quasar integration, use the package Sass variable bridge from your app-level `quasar.variables.scss`:

```scss
@use '@bastvi/quasar-design-system/quasar-variables' as *;
```

This is the first styling layer: it overrides Quasar Sass defaults where Quasar exposes variables. The runtime CSS then defines design tokens, and direct component selectors are only used for behavior or polish that Quasar variables cannot express.

Configure the runtime theme controller during app startup:

```ts
import { configureDesignSystem } from '@bastvi/quasar-design-system'

configureDesignSystem(app, {
  mode: 'system',
  variant: 'fluent',
  persist: true,
})
```

Add `qds-ui` to the body automatically through `configureDesignSystem()`. The class scopes the stronger Quasar overrides.

## Buttons

Four usage states over Quasar's native `QBtn`:

```vue
<q-btn unelevated color="primary" label="Preview" />         <!-- tonal: semantic default -->
<q-btn class="qds-solid" unelevated color="primary" label="Save" />  <!-- solid: primary CTA -->
<q-btn outline color="primary" label="Edit" />               <!-- outlined: secondary action -->
<q-btn label="Cancel" />                                     <!-- neutral: uncolored default -->
```

Colored non-solid buttons are tonal by default. Add `qds-solid` only for the strongest filled CTA.

## Icons

Icons use Phosphor through a Quasar icon-set (no Material Icons):

```ts
import { Quasar } from 'quasar'
import { qdsIconSet } from '@bastvi/quasar-design-system'

app.use(Quasar, { iconSet: qdsIconSet })
```

For content icons, use `@phosphor-icons/vue` (duotone for feature icons, line weight for controls).

## Fonts

Inter (body) and Selawik (optional display) ship as optional CSS — import what you need:

```ts
import '@bastvi/quasar-design-system/fonts/inter.css'
import '@bastvi/quasar-design-system/fonts/selawik.css'
```

The core CSS only declares the font stack, so skipping these still yields a sane system fallback. An accent font token is reserved for future use.

## Variants

The package is structured around `src/themes/`. For now there is one real theme, `default`, plus small runtime variants layered over it:

- `fluent`: default Fluent 2-inspired direction, balanced desktop/admin density.
- `air`: airier acrylic surfaces for colorful, image-rich, transparency-forward apps. Legacy `glass` input is normalized for compatibility.
- `mobile`: Samsung One UI-inspired rounding, spacing, and touch-friendly controls.
- `feather`: warm paper/e-ink mood with minimal glass behavior, muted sage/earth actions, and low-fatigue surfaces.

They are not separate brands — deliberate overlays over the same token system.

## Component Coverage

QDS skins visible Quasar chrome — buttons, cards, inputs, toolbars, drawers, lists, expansion items, and similar surfaces that carry tokenized visual treatment.

It intentionally does **not** add CSS for behavior-only, SSR, observer, or composable surfaces. These inherit Quasar's own defaults or have no visual representation at all:

- **SSR/layout helpers:** `QNoSSR`, `QResponsive`, `QSpace`, `QSlideTransition`
- **Observer helpers:** `QIntersection`, `QResizeObserver`, `QScrollObserver`
- **Icon component:** `QIcon` itself is not separately skinned — QDS provides the Phosphor `qdsIconSet` and font guidance instead
- **Nonvisual plugins:** AddressbarColor, AppFullscreen, AppVisibility, Cookies, Dark, Meta, Local/Session Storage
- **Behavior directives:** `v-close-popup`, `v-intersection`, `v-mutation`, `v-morph`, `v-scroll`, `v-scroll-fire`, `v-touch-*`; Material Ripple is intentionally suppressed in QDS surfaces
- **Composables and utilities:** no CSS added unless visual behavior is directly affected

Layout helpers that carry visible chrome (header, footer, toolbar, sticky child controls) are covered through the gallery examples and visual tests; scroll/position observers remain behavior-only unless an app adds visible child controls.

## Gallery

Live: **https://qds.bastienviglianti.fr** · run locally with `pnpm gallery:dev` (build with `pnpm gallery:build`).
