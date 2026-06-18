# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@bastvi/quasar-design-system` — an opinionated **visual layer** for Quasar 2 (Fluent 2 focused, with
Apple and One UI influence). It provides design tokens, surfaces, shape, motion, typography, Quasar
component overrides, and a runtime light/dark/system + variant controller.

It is a pure visual product: **no business logic, no entity/model layer, no API/transport code, no
permissions, no app routes, no private endpoints.** Prefer semantic token names over app-specific
selectors. Anything that is not generic, reusable visual language does not belong here.

## Commands

- `pnpm typecheck` — `vue-tsc --noEmit` against `tsconfig.json`. The only correctness gate; run it
  after changing any `.ts`/`.vue`.
- `pnpm stories` — Histoire dev server (component gallery / visual playground).
- `pnpm stories:build` — build the static gallery.

There is **no build/compile/test/lint step**: the package publishes raw `src/` (`main` and `types` in
`package.json` both point at `src/index.ts`; `exports` expose the `.scss` paths directly). Consumers'
build pipelines compile the TS and SCSS. Validate work via `typecheck` + visual review in the gallery.

## Architecture

### Three styling layers (apply in this order of preference)

1. **Quasar Sass variable overrides** — `src/quasar.variables.scss`. Consumed from the app's own
   `quasar.variables.scss` via `@use '@bastvi/quasar-design-system/quasar-variables' as *`. Always
   override a Quasar variable here *before* reaching for a direct component selector.
2. **Design tokens as CSS custom properties** — `--qds-*` vars defined in `src/themes/default.scss`,
   sourced from Sass maps in `src/tokens/_default.scss` (`$palette`, `$palette-rgb`, surfaces, text,
   borders, `$space`, `$radius`, `$font`, motion, state opacities, focus ring). This is the single
   source of truth for design values — never hardcode a second copy of a brand value.
3. **Direct component selectors** — `src/css/components/_*.scss`, only for behavior/polish Quasar
   variables can't express. These must be scoped under `.qds-ui` and consume `var(--qds-*)` tokens.

### CSS cascade layers

`src/css/_layers.scss` declares the global order:
`qds.reset, qds.tokens, qds.base, qds.utilities, qds.quasar, qds.overrides`.
Tokens live in `@layer qds.tokens`; Quasar component overrides live in `@layer qds.quasar` (see
`src/css/components/_button.scss`).

### CSS entry point

`src/css/index.scss` is the `./css` export. It `@use`s, in order: `layers`, the active theme
(`themes/default`, `themes/compat`), `base`, `utilities`, then each `components/*`. Adding a new
component override = create `src/css/components/_name.scss` (wrapped in `@layer qds.quasar`, scoped to
`.qds-ui`) and add it to `index.scss`.

### Runtime theme controller — `src/runtime/theme.ts`

`configureDesignSystem(app, options)` is the app entry point. It provides a reactive
`DesignSystemController` (also via `useDesignSystem()` / `getDesignSystemController()`), and:

- Resolves `mode` (`light | dark | system`) against `prefers-color-scheme`, mirrors it onto Quasar's
  `$q.dark`, and writes `data-qds-mode` / `data-qds-resolved` / `data-qds-variant` plus the
  `qds-theme-light|dark` and `.qds-ui` classes onto the target (default `document.body`).
- `.qds-ui` is the scoping class the stronger overrides depend on — it is added here, not by hand.
- Applies the `variant` as a body class (`qds-variant-studio|glass|mobile`).
- Persists `{ mode, variant }` to `localStorage` and listens to system theme changes. Defaults live
  in `DEFAULT_DESIGN_SYSTEM_OPTIONS`.

### Themes vs variants — `src/themes/index.ts`

There is **one theme** (`default`). "Variants" (`studio`, `glass`, `mobile`) are small mood shifts
expressed purely as CSS classes (`DESIGN_SYSTEM_VARIANTS[*].cssClass`) over the same token system —
not separate brands. New themes start as variables-only files: `src/themes/{name}.scss` for CSS
vars/classes + registration metadata in `src/themes/index.ts`. Keep `src/themes/` free of component
selectors — themes define values, the implementation reads them through `var(--qds-*)`.

### Public API surface

`src/index.ts` re-exports the runtime controller and theme metadata/types. `package.json#exports`
defines the subpath entry points: `.` (runtime + themes), `./css`, `./quasar-variables`, `./runtime`,
`./themes`, `./themes/default`. Update both when changing the public surface.

## Conventions

- All tokens and classes are namespaced `qds-` / `--qds-*`. Keep new ones semantic, not app-specific.
- Themes are variables-only. Component styling lives in `src/css/`, never in `src/themes/`.
- UnoCSS is allowed only as an *optional* preset; the plain SCSS/CSS path must always work so any
  Quasar 2 app can adopt the package without changing its build.
