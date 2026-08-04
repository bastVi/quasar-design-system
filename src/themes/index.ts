export type CanonicalDesignSystemVariantName = 'fluent' | 'ink' | 'mobile' | 'terminal'
export type LegacyDesignSystemVariantName = 'studio' | 'air' | 'glass' | 'feather'
export type BuiltInDesignSystemVariantName = CanonicalDesignSystemVariantName | LegacyDesignSystemVariantName

// Built-ins are typed narrowly while still accepting variants registered by
// external projects. `(string & {})` keeps literal autocompletion.
export type DesignSystemVariantName = BuiltInDesignSystemVariantName | (string & {})

export interface DesignSystemVariant {
  name: DesignSystemVariantName
  label: string
  description?: string
  cssClass: string
}

export interface QuasarDesignTheme {
  name: string
  label: string
  description?: string
  cssClass?: string
  variants: Record<string, DesignSystemVariant>
}

export const DEFAULT_THEME_NAME = 'default'

export const DESIGN_SYSTEM_VARIANTS = {
  fluent: {
    name: 'fluent',
    label: 'Fluent',
    description: 'Default Fluent 2-inspired baseline with solid mica surfaces and restrained tonal color.',
    cssClass: 'qds-variant-fluent',
  },
  ink: {
    name: 'ink',
    label: 'Ink',
    description: 'Paper-neutral editorial surfaces with charcoal type and coordinated pastel role washes.',
    cssClass: 'qds-variant-ink',
  },
  mobile: {
    name: 'mobile',
    label: 'One',
    description: 'One UI-inspired color, depth, shape, spacing, and touch-friendly control rhythm.',
    cssClass: 'qds-variant-mobile',
  },
  terminal: {
    name: 'terminal',
    label: 'Terminal',
    description: 'Dark amber developer UI with near-black surfaces, crisp hairline cards, and restrained glow.',
    cssClass: 'qds-variant-terminal',
  },
} as Record<CanonicalDesignSystemVariantName, DesignSystemVariant> & {
  studio: DesignSystemVariant
  air: DesignSystemVariant
  glass: DesignSystemVariant
  feather: DesignSystemVariant
}

const LEGACY_VARIANT_ALIASES = {
  studio: {
    name: 'studio',
    label: 'Fluent',
    description: 'Legacy alias for the fluent variant.',
    cssClass: 'qds-variant-fluent',
  },
  air: {
    name: 'air',
    label: 'Fluent',
    description: 'Legacy alias for the fluent variant.',
    cssClass: 'qds-variant-fluent',
  },
  glass: {
    name: 'glass',
    label: 'Fluent',
    description: 'Legacy alias for the fluent variant.',
    cssClass: 'qds-variant-fluent',
  },
  feather: {
    name: 'feather',
    label: 'Ink',
    description: 'Legacy alias for the ink variant.',
    cssClass: 'qds-variant-ink',
  },
} satisfies Record<LegacyDesignSystemVariantName, DesignSystemVariant>

for (const [name, variant] of Object.entries(LEGACY_VARIANT_ALIASES)) {
  Object.defineProperty(DESIGN_SYSTEM_VARIANTS, name, {
    enumerable: false,
    configurable: false,
    value: variant,
  })
}

export const DEFAULT_THEME: QuasarDesignTheme = {
  name: DEFAULT_THEME_NAME,
  label: 'Default',
  description: 'Fluent 2 focused Quasar 2 design language with Ink, One, and Terminal variants.',
  variants: DESIGN_SYSTEM_VARIANTS,
}

export const DESIGN_SYSTEM_THEMES = {
  [DEFAULT_THEME.name]: DEFAULT_THEME,
} as const

export function isBuiltInDesignSystemVariantName(value: unknown): value is BuiltInDesignSystemVariantName {
  return value === 'fluent' || value === 'ink' || value === 'mobile' || value === 'terminal'
    || value === 'studio' || value === 'air' || value === 'glass' || value === 'feather'
}

// Accepts any non-empty string so external projects can register variants;
// the runtime falls back to the default only for empty/invalid input.
export function isDesignSystemVariantName(value: unknown): value is DesignSystemVariantName {
  return typeof value === 'string' && value.length > 0
}
