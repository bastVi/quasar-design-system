# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

## [0.5.6] — 2026-07-07

### Changed

- Deepened native-pattern styling and proof coverage for complex controls: `QStepper`, `QCarousel`, `QEditor`, and `QUploader` now expose richer active/done/error/navigation, thumbnail/control, toolbar/dropdown/focus, and upload-state treatments.
- Expanded picker coverage for `QSelect` multiple chips/menu states, `QColor` spectrum/tune/alpha views, `QDate` disabled/month/year views, `QTime` AM/PM landscape mode, and `QPopupEdit` popup chrome.
- Updated public project guidance to reflect built `dist/` TypeScript entrypoints and the current five built-in variants.

### Fixed

- Kept the catalog a11y gate green after adding QColor tune inputs by extending the existing known Quasar picker exclusion to QColor's internal unlabeled channel inputs.

## [0.5.5] — 2026-07-07

### Changed

- Rebalanced the Air variant so it is more translucent than Fluent while preserving contrast with stronger tonal tint, border, and chrome guardrails.
- Improved `QColor` picker chrome with cleaner tabs, animated state transitions, and square palette swatches.
- Refined `QTree` row spacing, indentation, hover treatment, and RTL-safe child padding.

### Fixed

- Kept `QToggle` knobs inset inside their tracks in normal and dense branches.
- Strengthened tab/tree hover transitions without changing active tabs back into filled pills.

## [0.5.4] — 2026-07-07

### Fixed

- Fixed the deployed gallery Media section `QVideo` proof overflowing into the following Scrolling section on wide viewports by constraining the demo iframe frame.

## [0.5.3] — 2026-07-07

### Changed

- Made the deployed gallery default to `system` mode so it follows the OS light/dark preference on first load.
- Added initial `sm` / `md` / `lg` control and icon-size CSS tokens for calmer default field, button, chip, and expansion control proportions.
- Rebalanced Fluent/default card material with clearer surface and border separation while keeping Air/acrylic card chrome softer.
- Updated the gallery icon proof row to exercise Quasar icon-set-driven controls and `sm` / `md` / `lg` button sizing.

### Fixed

- Fixed `QSlider` / `QRange` always-visible labels rendering as unstyled square chips, including dark mode.
- Reduced oversized/aggressive internal control icons for fields, selects, chips, buttons, and expansion chevrons.
- Updated visual expectations so deterministic tests explicitly force light mode where they assert light-token values.

## [0.5.2] — 2026-07-06

### Changed

- Softened the default Fluent card material by reducing resting card border mix and dark elevation weight.
- Retuned Air dark surfaces toward a cooler, airier material so Air separates more clearly from dark Fluent.
- Reworked `QBtnGroup`, `QBtnToggle`, and `QPagination` into cohesive segmented controls with shared shells and internal dividers instead of per-button boxes.
- Deepened `QDate` day/month/year, selected, today, focus, and range-state styling with tokenized rounded cells and range fills.

### Fixed

- Added gallery and Histoire `QDate` range examples plus Playwright assertions so range styling is covered by the release gate.
- Updated gallery visual assertions for the new Fluent/Air token contract and stabilized variant restoration after the legacy `glass` alias check.

## [0.5.1] — 2026-07-02

### Added

- Expanded Quasar sub-element proof coverage across the release gallery and Histoire catalog:
  - Forms and pickers now expose and test QSlider, QRange, QCheckbox, QRadio, QToggle, QOptionGroup, QFile, and QInput/QSelect state surfaces.
  - Data, navigation, and layout coverage now proves QAvatar, QPagination, QDrawer, and consolidated QTabPanels treatment.
  - Media, complex, progress, and loading coverage now proves QCarousel, QEditor, deterministic QUploader queue/progress/error/uploaded states, QScrollArea, QSplitter, QTimeline, QKnob, QCircularProgress, and QSpinner.
  - Overlay/plugin coverage now proves Air QMenu material, Air/Feather/Terminal Notify treatment, and plugin-scoped QInnerLoading.

### Changed

- Deepened built-in variant structure beyond token swaps:
  - **One** (`mobile` key) now has stronger touch-first row/menu/control rhythm, grouped tabs, and bottom-nav depth.
  - **Air** now has cleaner sheet/media/nested chrome treatment with low resting noise and contextual overlay depth.
  - **Feather** now has more matte paper/document styling for cards, tables, forms, popups, loading surfaces, and media.
- Expanded the gallery Variant lab with nested chrome and table examples.

### Fixed

- Added regression coverage for One rhythm, Air nested-chrome shadowlessness, Feather matte/table behavior, and existing Terminal typography/pagination behavior.
- Added final gallery and Histoire release gates for the expanded component proof wave.
- Ensured `configureDesignSystem({ rootClass })` always keeps the required `.qds-ui` scope class and treats `rootClass` as an additional hook, matching the documented CSS-scoping contract.

### Notes

- The following interaction-heavy states remain documented manual-only exceptions rather than brittle automated gates: QPopupEdit's teleported popup, QPageScroller scroll threshold, QSlideItem and QPullToRefresh gestures, QInfiniteScroll scroll-triggered loading, and any future LoadingBar ownership relocation.

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
