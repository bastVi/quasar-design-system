# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

## [0.5.0] — 2026-06-26

### Added

- Added `terminal` built-in variant (`qds-variant-terminal`): dark amber developer
  UI with near-black surfaces, #fcc40d amber primary, crisp hairline cards,
  restrained glow, and tight 6px control radius.
- Added terminal scene wallpaper SVG and Playwright variant/scenes expectations.

## [0.4.0] — 2026-06-25

### Added

- Added a gallery **Scenes** tab with deterministic owned SVG wallpapers for
  comparing `fluent`, `air`, `mobile`, and `feather` materials in image-rich
  contexts.
- Added visual scene tests covering scene mount, Air material tokens, and
  Feather paper/e-ink behavior.
- Added public inline icon-gap tokens for comfortable default spacing and
  compact dense spacing across buttons, chips, badges, and select chips.

### Changed

- Retuned default `fluent` card acrylic to use a neutral explicit tint token
  instead of primary-blue resting glow.
- Retuned `air` toward a modern matte-glass material with stronger blur,
  image-friendly translucency, and tokenized acrylic tint/depth.
- Refined `feather` as a warm paper/e-ink variant with minimal glass behavior,
  muted sage/earth actions, paper borders, and low-fatigue dark mode.
- Improved default Quasar coverage with explicit `QHeader` styling and focused
  `QBtnDropdown` / `QBtnGroup` / `QBtnToggle` assertions.

### Fixed

- Consolidated duplicate LoadingBar styling so the catalog/loading-data rule is
  the single source for the public QDS loading-bar treatment.

## [0.3.0] — 2026-06-24

### Changed

- **Built TypeScript entrypoints.** Runtime TS exports (`.`, `./runtime`, `./tokens`,
  `./themes`, `./icons/quasar-icon-set`) now resolve to pre-compiled ESM JS and
  `.d.ts` files in `dist/`. Consumers no longer need to compile this package's
  TypeScript — bundlers pick up the built output directly.
- `main` and `types` fields now point at `dist/index.js` and `dist/index.d.ts`.
- Export map uses `types` + `import` conditions for all TS entrypoints.
- Added `pnpm build` (`tsc -p tsconfig.build.json`) and wired it into
  `verify:publish` / `prepublishOnly`.
- SCSS, CSS, and font exports remain source-first (`src/`) — no change for
  Sass consumers.
- Packed tarball verified: all public subpaths (JS, `.d.ts`, SCSS, fonts) resolve
  from the extracted package.

### Notes

- Visual output, token contract, and component coverage are unchanged.
- Gallery, Histoire, and Playwright gates are unaffected.

## [0.2.0] — prior

- Initial public-surface release with source-only TS entrypoints.
- Fluent 2-inspired design tokens, Quasar component overrides, runtime theme
  controller, Phosphor icon set, and optional font CSS.
