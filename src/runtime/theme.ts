import {
  computed,
  getCurrentInstance,
  inject,
  reactive,
  readonly,
  type App,
  type ComputedRef,
} from 'vue'

import {
  DESIGN_SYSTEM_VARIANTS,
  isDesignSystemVariantName,
  type DesignSystemVariant,
  type DesignSystemVariantName,
  type QuasarDesignTheme,
} from '../themes'

export type DesignSystemMode = 'light' | 'dark' | 'system'
export type DesignSystemResolvedMode = 'light' | 'dark'

export interface DesignSystemOptions {
  enabled?: boolean
  mode?: DesignSystemMode
  variant?: DesignSystemVariantName
  syncWithSystem?: boolean
  persist?: boolean
  storageKey?: string
  /**
   * Additional class toggled on the target alongside the package scope class
   * `.qds-ui`. This does NOT replace the scope class the CSS is compiled
   * against; set it only when you need an extra hook class.
   */
  rootClass?: string
  target?: HTMLElement | null
  /**
   * Vars-only themes registered by an external project. Their variants are
   * merged into the runtime variant registry so their cssClass is toggled and
   * cleaned up like a built-in.
   */
  themes?: Record<string, QuasarDesignTheme>
  /** Vars-only variants registered by an external project. */
  variants?: Record<string, DesignSystemVariant>
  /**
   * Quasar icon-set object to apply on initialization.
   * The recommended way to set the icon-set is via Quasar's own plugin:
   *   app.use(Quasar, { iconSet: qdsIconSet })
   * Supply this option only when you need `configureDesignSystem` to apply it
   * after Quasar is already mounted (e.g. runtime switching). Requires Quasar
   * to be present on the app instance; silently ignored otherwise.
   */
  iconSet?: object
}

export interface DesignSystemState {
  enabled: boolean
  initialized: boolean
  mode: DesignSystemMode
  resolvedMode: DesignSystemResolvedMode
  isDark: boolean
  prefersDark: boolean
  variant: DesignSystemVariantName
  syncWithSystem: boolean
  persist: boolean
  storageKey: string
  rootClass: string
}

export interface DesignSystemController {
  state: Readonly<DesignSystemState>
  mode: ComputedRef<DesignSystemMode>
  resolvedMode: ComputedRef<DesignSystemResolvedMode>
  isDark: ComputedRef<boolean>
  variant: ComputedRef<DesignSystemVariantName>
  initialize: () => void
  destroy: () => void
  setMode: (mode: DesignSystemMode) => DesignSystemMode
  setLight: () => DesignSystemMode
  setDark: () => DesignSystemMode
  setSystem: () => DesignSystemMode
  toggleMode: () => DesignSystemMode
  setVariant: (variant: DesignSystemVariantName) => DesignSystemVariantName
}

interface QuasarDarkLike {
  set?: (value: boolean) => void
}

interface QuasarIconSetLike {
  [key: string]: unknown
}

interface QuasarLike {
  dark?: QuasarDarkLike
  iconSet?: QuasarIconSetLike
}

export const DESIGN_SYSTEM_THEME_KEY = Symbol('bastvi-quasar-design-system')

export const DEFAULT_DESIGN_SYSTEM_OPTIONS: Required<
  Omit<DesignSystemOptions, 'target' | 'iconSet' | 'themes' | 'variants'>
> = {
  enabled: true,
  mode: 'system',
  variant: 'fluent',
  syncWithSystem: true,
  persist: true,
  storageKey: 'bastvi.quasar-design-system.theme',
  rootClass: 'qds-ui',
}

const THEME_MODES: DesignSystemMode[] = ['light', 'dark', 'system']
let fallbackController: DesignSystemController | null = null

export function configureDesignSystem(app: App, options: DesignSystemOptions = {}): DesignSystemController {
  const q = app.config.globalProperties?.$q as unknown as QuasarLike | undefined
  const controller = createDesignSystemController(options, q)

  app.provide(DESIGN_SYSTEM_THEME_KEY, controller)
  app.config.globalProperties.$designSystem = controller
  controller.initialize()
  fallbackController = controller

  if (options.iconSet && q?.iconSet) {
    Object.assign(q.iconSet, options.iconSet)
  }

  return controller
}

export function useDesignSystem(): DesignSystemController {
  const injected = inject<DesignSystemController | null>(DESIGN_SYSTEM_THEME_KEY, null)
  if (injected) {
    return injected
  }

  if (fallbackController) {
    return fallbackController
  }

  const instance = getCurrentInstance()
  const q = instance?.proxy?.$q as QuasarLike | undefined
  const controller = createDesignSystemController({ enabled: false }, q)
  controller.initialize()
  fallbackController = controller
  return controller
}

export function getDesignSystemController(): DesignSystemController | null {
  return fallbackController
}

export function createDesignSystemController(
  options: DesignSystemOptions = {},
  q?: QuasarLike,
): DesignSystemController {
  const target = options.target ?? getDefaultTarget()

  const variantRegistry: Record<string, DesignSystemVariant> = { ...DESIGN_SYSTEM_VARIANTS }
  if (options.themes) {
    Object.values(options.themes).forEach((theme) => Object.assign(variantRegistry, theme.variants))
  }
  if (options.variants) {
    Object.assign(variantRegistry, options.variants)
  }

  const state = reactive<DesignSystemState>({
    enabled: options.enabled ?? DEFAULT_DESIGN_SYSTEM_OPTIONS.enabled,
    initialized: false,
    mode: normalizeMode(options.mode),
    resolvedMode: 'light',
    isDark: false,
    prefersDark: false,
    variant: normalizeVariant(options.variant),
    syncWithSystem: options.syncWithSystem ?? DEFAULT_DESIGN_SYSTEM_OPTIONS.syncWithSystem,
    persist: options.persist ?? DEFAULT_DESIGN_SYSTEM_OPTIONS.persist,
    storageKey: options.storageKey ?? DEFAULT_DESIGN_SYSTEM_OPTIONS.storageKey,
    rootClass: options.rootClass ?? DEFAULT_DESIGN_SYSTEM_OPTIONS.rootClass,
  })

  let mediaQuery: MediaQueryList | null = null
  let onMediaChange: ((event: MediaQueryListEvent) => void) | null = null

  const resolveMode = (): DesignSystemResolvedMode => {
    return state.mode === 'system' ? (state.prefersDark ? 'dark' : 'light') : state.mode
  }

  const applyState = () => {
    state.resolvedMode = resolveMode()
    state.isDark = state.resolvedMode === 'dark'
    q?.dark?.set?.(state.isDark)

    if (!target) {
      return
    }

    target.dataset.qdsMode = state.mode
    target.dataset.qdsResolved = state.resolvedMode
    target.dataset.qdsVariant = state.variant
    target.classList.toggle('qds-theme-light', !state.isDark)
    target.classList.toggle('qds-theme-dark', state.isDark)
    target.classList.toggle(state.rootClass, state.enabled)

    Object.values(variantRegistry).forEach((variant) => {
      target.classList.toggle(variant.cssClass, variant.name === state.variant)
    })
  }

  const loadStoredState = () => {
    if (!state.persist || typeof window === 'undefined') {
      return
    }

    try {
      const stored = JSON.parse(window.localStorage.getItem(state.storageKey) || '{}') as Partial<DesignSystemState>
      state.mode = normalizeMode(stored.mode ?? state.mode)
      state.variant = normalizeVariant(stored.variant ?? state.variant)
    } catch {
      window.localStorage.removeItem(state.storageKey)
    }
  }

  const saveState = () => {
    if (!state.persist || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(state.storageKey, JSON.stringify({ mode: state.mode, variant: state.variant }))
  }

  const attachSystemListener = () => {
    if (!state.syncWithSystem || typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    onMediaChange = (event) => {
      state.prefersDark = event.matches
      applyState()
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onMediaChange)
      return
    }

    mediaQuery.addListener(onMediaChange)
  }

  const detachSystemListener = () => {
    if (!mediaQuery || !onMediaChange) {
      return
    }

    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', onMediaChange)
    } else {
      mediaQuery.removeListener(onMediaChange)
    }

    mediaQuery = null
    onMediaChange = null
  }

  const setMode = (mode: DesignSystemMode): DesignSystemMode => {
    state.mode = normalizeMode(mode)
    saveState()
    applyState()
    return state.mode
  }

  const setVariant = (variant: DesignSystemVariantName): DesignSystemVariantName => {
    state.variant = normalizeVariant(variant)
    saveState()
    applyState()
    return state.variant
  }

  const initialize = () => {
    if (state.initialized) {
      return
    }

    state.prefersDark = getSystemPrefersDark()
    loadStoredState()
    attachSystemListener()
    applyState()
    state.initialized = true
  }

  const destroy = () => {
    detachSystemListener()
    if (target) {
      target.classList.remove(state.rootClass, 'qds-theme-light', 'qds-theme-dark')
      Object.values(variantRegistry).forEach((variant) => target.classList.remove(variant.cssClass))
      delete target.dataset.qdsMode
      delete target.dataset.qdsResolved
      delete target.dataset.qdsVariant
    }
    state.initialized = false
  }

  return {
    state: readonly(state) as Readonly<DesignSystemState>,
    mode: computed(() => state.mode),
    resolvedMode: computed(() => state.resolvedMode),
    isDark: computed(() => state.isDark),
    variant: computed(() => state.variant),
    initialize,
    destroy,
    setMode,
    setLight: () => setMode('light'),
    setDark: () => setMode('dark'),
    setSystem: () => setMode('system'),
    toggleMode: () => setMode(THEME_MODES[(THEME_MODES.indexOf(state.mode) + 1) % THEME_MODES.length]),
    setVariant,
  }
}

function normalizeMode(value: unknown): DesignSystemMode {
  return value === 'light' || value === 'dark' || value === 'system' ? value : DEFAULT_DESIGN_SYSTEM_OPTIONS.mode
}

function normalizeVariant(value: unknown): DesignSystemVariantName {
  if (value === 'studio') {
    return 'fluent'
  }

  if (value === 'glass') {
    return 'air'
  }

  return isDesignSystemVariantName(value) ? value : DEFAULT_DESIGN_SYSTEM_OPTIONS.variant
}

function getSystemPrefersDark(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)
}

function getDefaultTarget(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.body
}
