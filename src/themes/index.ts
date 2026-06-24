export type CanonicalDesignSystemVariantName = 'fluent' | 'air' | 'mobile' | 'feather'
export type BuiltInDesignSystemVariantName = CanonicalDesignSystemVariantName | 'glass'
export type LegacyDesignSystemVariantName = 'studio' | 'glass'

// Built-ins are typed narrowly while still accepting variants registered by
// external projects. `(string & {})` keeps literal autocompletion.
export type DesignSystemVariantName = BuiltInDesignSystemVariantName | LegacyDesignSystemVariantName | (string & {})

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
    description: 'Default Fluent 2-inspired baseline with restrained acrylic and tonal color.',
    cssClass: 'qds-variant-fluent',
  },
  air: {
    name: 'air',
    label: 'Air',
    description: 'Airier acrylic surfaces for image-rich, colorful, transparency-forward apps.',
    cssClass: 'qds-variant-air',
  },
  mobile: {
    name: 'mobile',
    label: 'Mobile',
    description: 'Rounder One UI-inspired spacing and touch-friendly controls.',
    cssClass: 'qds-variant-mobile',
  },
  feather: {
    name: 'feather',
    label: 'Feather',
    description: 'Soft, low-acrylic paper mood with rounder shape and gentle tonal contrast.',
    cssClass: 'qds-variant-feather',
  },
} as Record<CanonicalDesignSystemVariantName, DesignSystemVariant> & { glass: DesignSystemVariant }

Object.defineProperty(DESIGN_SYSTEM_VARIANTS, 'glass', {
  enumerable: false,
  configurable: false,
  value: {
    name: 'glass',
    label: 'Air',
    description: 'Legacy alias for the air variant. Prefer variant="air".',
    cssClass: 'qds-variant-air',
  } satisfies DesignSystemVariant,
})

export const DEFAULT_THEME: QuasarDesignTheme = {
  name: DEFAULT_THEME_NAME,
  label: 'Default',
  description: 'Fluent 2 focused Quasar 2 design language with close tonal/acrylic variants.',
  variants: DESIGN_SYSTEM_VARIANTS,
}

export const DESIGN_SYSTEM_THEMES = {
  [DEFAULT_THEME.name]: DEFAULT_THEME,
} as const

export function isBuiltInDesignSystemVariantName(value: unknown): value is BuiltInDesignSystemVariantName {
  return value === 'fluent' || value === 'air' || value === 'mobile' || value === 'feather' || value === 'glass'
}

// Accepts any non-empty string so external projects can register variants;
// the runtime falls back to the default only for empty/invalid input.
export function isDesignSystemVariantName(value: unknown): value is DesignSystemVariantName {
  return typeof value === 'string' && value.length > 0
}
