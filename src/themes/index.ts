export type BuiltInDesignSystemVariantName = 'fluent' | 'glass' | 'mobile'
export type LegacyDesignSystemVariantName = 'studio'

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

export const DESIGN_SYSTEM_VARIANTS: Record<BuiltInDesignSystemVariantName, DesignSystemVariant> = {
  fluent: {
    name: 'fluent',
    label: 'Fluent',
    description: 'Default Fluent 2-inspired baseline with restrained acrylic and Windows-like tonal color.',
    cssClass: 'qds-variant-fluent',
  },
  glass: {
    name: 'glass',
    label: 'Glass',
    description: 'Softer Apple-inspired surfaces with more translucency and relaxed depth.',
    cssClass: 'qds-variant-glass',
  },
  mobile: {
    name: 'mobile',
    label: 'Mobile',
    description: 'Rounder One UI-inspired spacing and touch-friendly controls.',
    cssClass: 'qds-variant-mobile',
  },
}

export const DEFAULT_THEME: QuasarDesignTheme = {
  name: DEFAULT_THEME_NAME,
  label: 'Default',
  description: 'Fluent 2 focused Quasar 2 design language with Apple and One UI influence.',
  variants: DESIGN_SYSTEM_VARIANTS,
}

export const DESIGN_SYSTEM_THEMES = {
  [DEFAULT_THEME.name]: DEFAULT_THEME,
} as const

export function isBuiltInDesignSystemVariantName(value: unknown): value is BuiltInDesignSystemVariantName {
  return value === 'fluent' || value === 'glass' || value === 'mobile'
}

// Accepts any non-empty string so external projects can register variants;
// the runtime falls back to the default only for empty/invalid input.
export function isDesignSystemVariantName(value: unknown): value is DesignSystemVariantName {
  return typeof value === 'string' && value.length > 0
}
