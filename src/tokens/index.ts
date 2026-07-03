/**
 * Canonical inventory of the public CSS custom-property contract.
 * Every `--qds-*` token the package emits is listed here so consumers can
 * discover, type, and override the full surface. The stable public contract
 * is the `--qds-*` prefix; Sass map names remain internal.
 *
 * Source of truth: the union of `--qds-*` properties emitted at `:root` in
 * `src/themes/fallbacks.scss` (base layer) and `src/themes/default.scss`
 * (default theme + derived tokens). Tokens are grouped by category in a
 * stable order.
 */
export const QDS_TOKENS = [
  // ── Colors ──────────────────────────────────────────────────────────
  '--qds-color-primary',
  '--qds-color-primary-light',
  '--qds-color-primary-dark',
  '--qds-color-secondary',
  '--qds-color-accent',
  '--qds-color-positive',
  '--qds-color-negative',
  '--qds-color-warning',
  '--qds-color-info',

  // ── Colors (RGB) ────────────────────────────────────────────────────
  '--qds-color-primary-rgb',
  '--qds-color-primary-light-rgb',
  '--qds-color-primary-dark-rgb',
  '--qds-color-secondary-rgb',
  '--qds-color-accent-rgb',
  '--qds-color-positive-rgb',
  '--qds-color-negative-rgb',
  '--qds-color-warning-rgb',
  '--qds-color-info-rgb',

  // ── Surfaces ────────────────────────────────────────────────────────
  '--qds-surface-0',
  '--qds-surface-1',
  '--qds-surface-2',
  '--qds-surface-3',
  '--qds-surface-glass',

  // ── Text ────────────────────────────────────────────────────────────
  '--qds-text',
  '--qds-text-strong',
  '--qds-text-muted',
  '--qds-text-on-solid',

  // ── Media ───────────────────────────────────────────────────────────
  '--qds-media-scrim',
  '--qds-media-scrim-strong',

  // ── Borders ─────────────────────────────────────────────────────────
  '--qds-border',
  '--qds-border-subtle',

  // ── Spacing ─────────────────────────────────────────────────────────
  '--qds-space-xs',
  '--qds-space-sm',
  '--qds-space-md',
  '--qds-space-lg',
  '--qds-space-xl',

  // ── Radius ──────────────────────────────────────────────────────────
  '--qds-radius-xs',
  '--qds-radius-sm',
  '--qds-radius-md',
  '--qds-radius-lg',
  '--qds-radius-xl',
  '--qds-radius-full',
  '--qds-radius-control',

  // ── Shadows ─────────────────────────────────────────────────────────
  '--qds-shadow-sm',
  '--qds-shadow-md',
  '--qds-shadow-lg',

  // ── Typography ──────────────────────────────────────────────────────
  '--qds-font-family',
  '--qds-font-family-display',
  '--qds-font-family-accent',
  '--qds-font-weight-regular',
  '--qds-font-weight-medium',
  '--qds-font-weight-semibold',
  '--qds-font-weight-bold',

  // ── Motion ──────────────────────────────────────────────────────────
  '--qds-motion-fast',
  '--qds-motion-base',
  '--qds-motion-duration-fast',
  '--qds-motion-duration-base',
  '--qds-motion-ease-out',
  '--qds-motion-ease-in-out',

  // ── Focus ring ──────────────────────────────────────────────────────
  '--qds-focus-ring-width',
  '--qds-focus-ring-offset',
  '--qds-focus-ring-opacity',

  // ── State opacities ─────────────────────────────────────────────────
  '--qds-state-hover-opacity',
  '--qds-state-focus-opacity',
  '--qds-state-press-opacity',

  // ── Tonal opacities ─────────────────────────────────────────────────
  '--qds-tonal-bg-opacity',
  '--qds-tonal-hover-opacity',
  '--qds-tonal-border-opacity',
  '--qds-tonal-text-mix',

  // ── Border widths ───────────────────────────────────────────────────
  '--qds-border-width-control',

  // ── Control ─────────────────────────────────────────────────────────
  '--qds-control-letter-spacing',
  '--qds-control-text-transform',
  '--qds-control-content-line-height',

  // ── Inline icons ────────────────────────────────────────────────────
  '--qds-inline-icon-gap',
  '--qds-inline-icon-dense-gap',

  // ── Button ──────────────────────────────────────────────────────────
  '--qds-button-min-height',
  '--qds-button-padding-inline',
  '--qds-button-dense-min-height',
  '--qds-button-dense-padding-inline',
  '--qds-button-dense-radius',
  '--qds-button-dense-font-size',
  '--qds-button-round-size',
  '--qds-button-elevated-shadow',
  '--qds-button-elevated-shadow-hover',

  // ── Card ────────────────────────────────────────────────────────────
  '--qds-card-acrylic-tint-rgb',
  '--qds-card-tonal-opacity',
  '--qds-card-fallback-tonal-opacity',
  '--qds-card-border-mix',
  '--qds-card-backdrop-blur',
  '--qds-card-backdrop-saturate',

  // ── Chrome ──────────────────────────────────────────────────────────
  '--qds-chrome-border-mix',
  '--qds-chrome-border-soft-mix',
  '--qds-chrome-surface-mix',
  '--qds-chrome-surface-strong-mix',
  '--qds-separator-mix',
  '--qds-handle-border-mix',
  '--qds-handle-primary-mix',

  // ── Badge ───────────────────────────────────────────────────────────
  '--qds-badge-min-height',
  '--qds-badge-padding',

  // ── Field ───────────────────────────────────────────────────────────
  '--qds-field-min-height',
  '--qds-field-dense-min-height',
  '--qds-field-padding-inline',
  '--qds-field-label-size',
  '--qds-field-focus-border-width',

  // ── Glass effects ───────────────────────────────────────────────────
  '--qds-glass-blur',
  '--qds-glass-saturate',
  '--qds-glass-border-mix',

  // ── Elevation (derived from shadows) ────────────────────────────────
  '--qds-elevation-1',
  '--qds-elevation-2',
  '--qds-elevation-3',

  // ── Interactive (derived from surfaces/text/border) ─────────────────
  '--qds-interactive-bg',
  '--qds-interactive-bg-hover',
  '--qds-interactive-bg-active',
  '--qds-interactive-border',
  '--qds-interactive-border-strong',
  '--qds-interactive-text',
  '--qds-interactive-text-muted',

  // ── Button (derived) ────────────────────────────────────────────────
  '--qds-button-icon-gap',
  '--qds-button-dense-icon-gap',
  '--qds-button-radius',

  // ── Chip (derived) ──────────────────────────────────────────────────
  '--qds-chip-icon-gap',
  '--qds-chip-dense-icon-gap',
  '--qds-chip-radius',

  // ── Badge (derived) ─────────────────────────────────────────────────
  '--qds-badge-icon-gap',
  '--qds-badge-dense-icon-gap',
  '--qds-badge-radius',

  // ── Banner (component) ──────────────────────────────────────────────
  '--qds-banner-accent',
  '--qds-banner-accent-rgb',
  '--qds-banner-text',

  // ── Card (derived) ──────────────────────────────────────────────────
  '--qds-card-bg',
  '--qds-card-bg-fallback',
  '--qds-card-border',
  '--qds-card-radius',
  '--qds-card-shadow',
  '--qds-card-shadow-value',

  // ── Chrome (derived) ────────────────────────────────────────────────
  '--qds-chrome-border',
  '--qds-chrome-border-soft',
  '--qds-chrome-surface',
  '--qds-chrome-surface-strong',
  '--qds-chrome-shadow',
  '--qds-chrome-shadow-value',
  '--qds-media-frame-shadow',
  '--qds-media-frame-shadow-value',
  '--qds-separator-color',
  '--qds-handle-color',

  // ── Menu (derived) ──────────────────────────────────────────────────
  '--qds-menu-bg',
  '--qds-menu-border',
  '--qds-menu-item-min-height',
  '--qds-menu-item-min-height-value',
  '--qds-menu-radius',
  '--qds-menu-shadow',

  // ── Notification (derived) ──────────────────────────────────────────
  '--qds-notification-radius',
  '--qds-notification-shadow',

  // ── Notification (component) ────────────────────────────────────────
  '--qds-notify-accent',
  '--qds-notify-accent-rgb',
  '--qds-notify-bg',
  '--qds-notify-text',

  // ── Pagination (component) ──────────────────────────────────────────
  '--qds-pagination-active-bg',
  '--qds-pagination-active-border',
  '--qds-pagination-active-text',

  // ── Scrollbar (component) ───────────────────────────────────────────
  '--qds-scrollbar-size',
  '--qds-scrollbar-thumb',
  '--qds-scrollbar-thumb-hover',

  // ── Selection controls (component) ──────────────────────────────────
  '--qds-selection-inner-size',
  '--qds-selection-mark-offset',
  '--qds-selection-mark-size',

  // ── Stepper (component) ─────────────────────────────────────────────
  '--qds-stepper-rail',
  '--qds-stepper-rail-active',
  '--qds-stepper-state-bg',

  // ── List (derived) ──────────────────────────────────────────────────
  '--qds-list-item-min-height',
  '--qds-list-item-min-height-value',

  // ── Expansion (derived) ─────────────────────────────────────────────
  '--qds-expansion-item-min-height',
  '--qds-expansion-item-min-height-value',

  // ── Table (derived) ─────────────────────────────────────────────────
  '--qds-table-header-height',
  '--qds-table-header-height-value',
  '--qds-table-row-height',
  '--qds-table-row-height-value',

  // ── Table (component) ───────────────────────────────────────────────
  '--qds-table-header-bg',
  '--qds-table-header-text',
  '--qds-table-row-hover-bg',
  '--qds-table-selected-bg',
  '--qds-table-sort-icon',

  // ── Timeline (component) ────────────────────────────────────────────
  '--qds-timeline-marker-bg',
  '--qds-timeline-rail',

  // ── Chat (component) ────────────────────────────────────────────────
  '--qds-chat-bubble-bg',
  '--qds-chat-bubble-fg',

  // ── Toolbar (derived) ───────────────────────────────────────────────
  '--qds-toolbar-bg',

  // ── Field (derived) ─────────────────────────────────────────────────
  '--qds-field-label-bg',

  // ── Tab (derived) ───────────────────────────────────────────────────
  '--qds-tab-radius',
  '--qds-tab-hover-bg',
  '--qds-tab-active-bg',
  '--qds-tab-active-text',
  '--qds-tab-active-rail',
] as const

/** A public CSS custom-property name in the `--qds-*` contract. */
export type QdsToken = (typeof QDS_TOKENS)[number]

/** A partial override map keyed by public token name. */
export type QdsTokenMap = Partial<Record<QdsToken, string>>
