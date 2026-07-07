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
> **after** Quasar's own CSS. Git/source installs run the package `prepare` script to
> generate `dist/`; npm releases already include the built files.

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

## Optional Modules

Optional modules stay out of the default runtime and CSS bundle. Install their native peer explicitly, import the native CSS first, then import the QDS extension stylesheet.

### QWindow

`QdsWindow` wraps `@quasar/quasar-ui-qwindow` with QDS BEM chrome (`.qds-window`, `.qds-window__*`, `.qds-window--*`) while passing QWindow props, slots, methods, and events through to the native component.

```bash
pnpm add @quasar/quasar-ui-qwindow @bastvi/quasar-design-system
```

```ts
import '@quasar/quasar-ui-qwindow/index.css'
import '@bastvi/quasar-design-system/css/extensions/qwindow'
import { QdsWindow } from '@bastvi/quasar-design-system/qwindow'
```

For layered Quasar setups, use `@bastvi/quasar-design-system/css/extensions/qwindow/layered` instead. Do not import either QWindow stylesheet unless the native QWindow peer is installed and used.

> **Native QWindow minimize caveat:** `@quasar/quasar-ui-qwindow@3.0.0` exposes a `minimize` action/method, but that native action currently throws in its internal state guard. `QdsWindow` therefore treats `minimized` as a consumer-controlled visual state and filters `minimize` out of the native action list. Use your app/state layer (for example quasar-core's taskbar/window store) to hide/restore minimized windows until the peer fixes this action.

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

Inter (body), Open Sans (compatibility/body alternative), and Selawik (optional display) ship as optional CSS — import what you need:

```ts
import '@bastvi/quasar-design-system/fonts/inter.css'
import '@bastvi/quasar-design-system/fonts/open-sans.css'
import '@bastvi/quasar-design-system/fonts/selawik.css'
```

The core CSS only declares the font stack, so skipping these still yields a sane system fallback. An accent font token is reserved for future use.

## Variants

The package is structured around `src/themes/`. For now there is one real theme, `default`, plus small runtime variants layered over it:

- `fluent`: default Fluent 2-inspired direction, balanced desktop/admin density.
- `air`: airier acrylic surfaces for colorful, image-rich, transparency-forward apps. Legacy `glass` input is normalized for compatibility.
- `mobile` (labelled **One**): Samsung One UI-inspired rounding, spacing, and touch-friendly controls.
- `feather`: warm paper/e-ink mood with minimal glass behavior, muted sage/earth actions, and low-fatigue surfaces.
- `terminal`: dark amber developer UI with near-black surfaces, crisp hairline cards, restrained glow, and a monospace-forward feel.

They are not separate brands — deliberate overlays over the same token system.

Choose the variant once at app startup and let the runtime keep the matching body class in sync:

```ts
configureDesignSystem(app, {
  mode: 'system',
  variant: 'feather', // fluent | air | mobile (One) | feather | terminal
})
```

The legacy `glass` value still resolves to `air` for existing consumers, but new apps should use the canonical names above.

## Component Coverage

QDS skins visible Quasar chrome — buttons, cards, inputs, toolbars, drawers, lists, expansion items, and similar surfaces that carry tokenized visual treatment. The release gallery and Histoire catalog exercise the high-value sub-elements across forms/pickers, data/navigation/layout, media/complex/loading, and overlays/plugins.

Public QDS-owned component classes use strict namespaced BEM for new optional modules: block `.qds-window`, elements such as `.qds-window__titlebar`, and modifiers such as `.qds-window--embedded`. Utility hooks such as `.qds-ui`, `.qds-solid`, and variant classes remain intentionally semantic rather than component blocks.

It intentionally does **not** add CSS for behavior-only, SSR, observer, or composable surfaces. These inherit Quasar's own defaults or have no visual representation at all:

- **SSR/layout helpers:** `QNoSSR`, `QResponsive`, `QSpace`, `QSlideTransition`
- **Observer helpers:** `QIntersection`, `QResizeObserver`, `QScrollObserver`
- **Icon component:** `QIcon` itself is not separately skinned — QDS provides the Phosphor `qdsIconSet` and font guidance instead
- **Nonvisual plugins:** AddressbarColor, AppFullscreen, AppVisibility, Cookies, Dark, Meta, Local/Session Storage
- **Behavior directives:** `v-close-popup`, `v-intersection`, `v-mutation`, `v-morph`, `v-scroll`, `v-scroll-fire`, `v-touch-*`; Material Ripple is intentionally suppressed in QDS surfaces
- **Composables and utilities:** no CSS added unless visual behavior is directly affected

Layout helpers that carry visible chrome (header, footer, toolbar, sticky child controls) are covered through the gallery examples and visual tests; scroll/position observers remain behavior-only unless an app adds visible child controls.

Some interaction-heavy Quasar states are intentionally documented/manual rather than automated in the visual gate because they depend on teleported overlays, gestures, or scroll thresholds: QPopupEdit popup interaction, QPageScroller activation, QSlideItem and QPullToRefresh gestures, and QInfiniteScroll scroll-triggered loading. Static skins and common visible states remain covered.

## Gallery

Live: **https://qds.bastienviglianti.fr** · run locally with `pnpm gallery:dev` (build with `pnpm gallery:build`).
