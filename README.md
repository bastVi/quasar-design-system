# Quasar Design System

Opinionated Quasar 2 design system inspired by Fluent 2, Apple, and One UI.

This package is published under the personal scope `@bastvi/quasar-design-system` while the visual language is still designer-led and exploratory. It intentionally contains no application business logic, no models, no entity workflows, and no private project assumptions.

## Goals

- Provide a full Quasar 2 visual layer: tokens, surfaces, shape, motion, typography, and component overrides.
- Keep functional libraries (components, features, models, entities, helpers, composables) separate from the visual language.
- Let apps opt into the design system explicitly instead of forcing every consumer into one visual language.
- Support multiple close variants of the same design language without pretending to be strict Fluent UI compliance.

## Design Direction

The default language is Fluent 2 focused, with selective inspiration from Apple interface polish and Samsung One UI softness:

- clean and calm enterprise surfaces
- tonal semantic controls instead of heavy filled defaults
- large, readable radii without cartoonish shapes
- subtle depth and state layers
- adaptive light/dark/system mode
- optional variant presets for slightly different product moods

## Install

```bash
pnpm add @bastvi/quasar-design-system
```

> **Source-only package.** It ships raw `src/` (`.ts` + `.scss`); `main`/`types`/`exports` point at
> sources. Intended for **Vite + Quasar 2** projects with Sass available — your build pipeline
> compiles the TS and SCSS. There is no prebuilt `dist/` (yet), so it is not aimed at plain Node/CJS
> consumers. Import the design-system CSS **after** Quasar's own CSS.

## Basic Usage

Import Quasar's own CSS first, then the design-system CSS:

```ts
import 'quasar/src/css/index.sass'
import '@bastvi/quasar-design-system/css'
```

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
  variant: 'studio',
  persist: true,
})
```

Add `qds-ui` to the body automatically through `configureDesignSystem()`. The class scopes the stronger Quasar overrides.

## Variants

The package is structured around `src/themes/`. For now there is one real theme, `default`, plus small runtime variants layered over it:

- `studio`: default, Fluent 2 focused, balanced desktop/admin feel.
- `glass`: softer Apple-inspired surfaces and translucent cards.
- `mobile`: rounder, warmer, One UI-inspired spacing and touch feel.

They are not separate brands. They are small mood shifts over the same token system.

Future themes should start as flat files containing variables only:

- `src/themes/{theme-name}.scss` for CSS variables and theme classes
- `src/themes/index.ts` for runtime metadata and theme registration

The design-system implementation itself stays outside `src/themes/`. It reads variables from the active theme through `var(--qds-*)`.

## Component Gallery

> **Work in progress.** A visual gallery (tokens, variants, light/dark, component showcase) is planned
> for an upcoming release. A Histoire scaffold exists in the repo, but its static build is not yet
> stable on this Vite/Quasar stack — the gallery tooling is still being finalized.

## UnoCSS

UnoCSS is allowed, but should stay optional until the SCSS baseline is stable. Good future uses:

- shortcuts for design-system token utilities
- safelisted color/state classes
- a preset for app teams that already use UnoCSS
- generated docs pages or playground helpers

The package must keep a plain SCSS/CSS path so every Quasar 2 app can adopt it without changing its build pipeline.
