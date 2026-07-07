import { computed, defineComponent, h, ref, useAttrs, type PropType, type StyleValue } from 'vue'
import { QBtn } from 'quasar'
import { QWindow as NativeQWindow, useQWindowResponsiveProps } from '@quasar/quasar-ui-qwindow'
import type {
  QWindow as NativeQWindowInstance,
  QWindowActionMenuItem,
  QWindowPosition,
  QWindowProps,
  QWindowResponsiveProps,
  QWindowResponsivePropsOptions,
} from '@quasar/quasar-ui-qwindow'

type NativeActionItem = QWindowActionMenuItem | 'separator'

export type QdsWindowProps = QWindowProps
export type QdsWindowActionMenuItem = QWindowActionMenuItem
export type QdsWindowPosition = QWindowPosition
export type QdsWindowResponsiveProps = QWindowResponsiveProps
export type QdsWindowResponsivePropsOptions = QWindowResponsivePropsOptions
export type QdsWindowInstance = NativeQWindowInstance

export interface QdsWindowTitlebarSlotScope {
  menuData: QWindowActionMenuItem[]
}

export interface QdsWindowDefaultSlotScope {
  zIndex: number
}

const actionGlyphs: Record<string, string> = {
  close: '×',
  embedded: '⇲',
  fullscreen: '⛶',
  maximize: '□',
  minimize: '–',
  pinned: '⌖',
}

// @quasar/quasar-ui-qwindow@3.0.0 exposes a `minimized` prop/action/method,
// but its internal action-state guard currently throws for the `minimize` action.
// QDS keeps minimized as a visual/consumer-controlled state and does not forward
// it into the native component until the peer bug is fixed upstream.
const unsupportedNativeActions = new Set(['minimize'])

function callListener(listener: unknown, ...args: unknown[]) {
  if (Array.isArray(listener)) {
    listener.forEach((entry) => callListener(entry, ...args))
    return
  }

  if (typeof listener === 'function') {
    listener(...args)
  }
}

function actionLabel(item: QWindowActionMenuItem) {
  return item.state === true ? item.off.label : item.on.label
}

function runAction(item: QWindowActionMenuItem) {
  return item.state === true ? item.off.func() : item.on.func()
}

function stopPointer(evt: Event) {
  evt.stopPropagation()
}

const qdsWindowProps = {
  actions: Array as PropType<string[]>,
  ariaLabel: String,
  ariaRole: String as PropType<QWindowProps['ariaRole']>,
  autoPin: Boolean,
  backgroundColor: String,
  borderStyle: String,
  borderWidth: String,
  color: String,
  contentClass: [String, Object, Array] as PropType<unknown>,
  contentStyle: [String, Object, Array] as PropType<StyleValue>,
  dense: Boolean,
  disabled: Boolean,
  embedded: Boolean,
  fullscreen: Boolean,
  gripperBackgroundColor: String,
  gripperBorderColor: String,
  headless: Boolean,
  height: [Number, String] as PropType<number | string>,
  hideGrippers: Boolean,
  hideToolbarDivider: Boolean,
  iconSet: Object as PropType<Record<string, unknown>>,
  maximized: Boolean,
  menuFunc: Function as PropType<(menuData: QWindowActionMenuItem[]) => void>,
  menuIcon: String,
  minimized: Boolean,
  modelValue: Boolean,
  noMenu: Boolean,
  noMove: Boolean,
  noResize: Boolean,
  pinned: Boolean,
  resizable: Array as PropType<string[]>,
  roundGrippers: Boolean,
  scrollWithWindow: Boolean,
  startX: [Number, String] as PropType<number | string>,
  startY: [Number, String] as PropType<number | string>,
  title: String,
  titlebarClass: [String, Object, Array] as PropType<unknown>,
  titlebarStyle: [String, Object, Array] as PropType<StyleValue>,
  width: [Number, String] as PropType<number | string>,
}

export const QdsWindow = defineComponent({
  name: 'QdsWindow',
  inheritAttrs: false,
  props: qdsWindowProps,
  setup(props, { slots, expose }) {
    const attrs = useAttrs()
    const windowRef = ref<NativeQWindowInstance | null>(null)
    const selected = ref(false)

    const qdsClasses = computed(() => ({
      'qds-window--active': selected.value,
      'qds-window--dense': props.dense,
      'qds-window--disabled': props.disabled,
      'qds-window--embedded': props.embedded,
      'qds-window--floating': props.embedded !== true,
      'qds-window--fullscreen': props.fullscreen,
      'qds-window--headless': props.headless,
      'qds-window--maximized': props.maximized,
      'qds-window--minimized': props.minimized,
      'qds-window--pinned': props.pinned,
    }))

    function exposeBooleanMethod(method: keyof NativeQWindowInstance) {
      const candidate = windowRef.value?.[method]
      return typeof candidate === 'function' ? Boolean(candidate.call(windowRef.value)) : false
    }

    expose({
      show: () => exposeBooleanMethod('show'),
      hide: () => exposeBooleanMethod('hide'),
      embed: () => exposeBooleanMethod('embed'),
      float: () => exposeBooleanMethod('float'),
      toggleEmbedded: () => exposeBooleanMethod('toggleEmbedded'),
      pin: () => exposeBooleanMethod('pin'),
      unpin: () => exposeBooleanMethod('unpin'),
      togglePinned: () => exposeBooleanMethod('togglePinned'),
      maximize: () => exposeBooleanMethod('maximize'),
      restore: () => exposeBooleanMethod('restore'),
      toggleMaximized: () => exposeBooleanMethod('toggleMaximized'),
      enterFullscreen: () => exposeBooleanMethod('enterFullscreen'),
      leaveFullscreen: () => exposeBooleanMethod('leaveFullscreen'),
      toggleFullscreen: () => exposeBooleanMethod('toggleFullscreen'),
      getPosition: () => windowRef.value?.getPosition(),
    })

    function renderAction(item: NativeActionItem) {
      if (item === 'separator') {
        return null
      }

      const label = actionLabel(item)
      const glyph = actionGlyphs[item.key] ?? label.slice(0, 1)

      return h(QBtn, {
        key: item.key,
        'aria-label': label,
        class: ['qds-window__action', `qds-window__action--${item.key}`],
        dense: true,
        flat: true,
        round: true,
        size: props.dense ? 'sm' : 'md',
        title: label,
        onClick: (evt: Event) => {
          evt.stopPropagation()
          runAction(item)
        },
        onMousedown: stopPointer,
        onTouchstart: stopPointer,
      }, () => glyph)
    }

    function renderFallbackAction(key: string, label: string, handler: () => boolean | undefined) {
      const glyph = actionGlyphs[key] ?? label.slice(0, 1)

      return h(QBtn, {
        key: `fallback-${key}`,
        'aria-label': label,
        class: ['qds-window__action', `qds-window__action--${key}`],
        dense: true,
        flat: true,
        round: true,
        size: props.dense ? 'sm' : 'md',
        title: label,
        onClick: (evt: Event) => {
          evt.stopPropagation()
          handler()
        },
        onMousedown: stopPointer,
        onTouchstart: stopPointer,
      }, () => glyph)
    }

    function renderTitlebar(scope: QdsWindowTitlebarSlotScope) {
      if (slots.titlebar) {
        return slots.titlebar(scope)
      }

      const actions = scope.menuData.map(renderAction).filter(Boolean)
      const hasCloseAction = scope.menuData.some((item) => item.key === 'close')
      if (hasCloseAction !== true && props.actions?.includes('close') === true) {
        actions.push(renderFallbackAction('close', 'Close', () => windowRef.value?.hide()))
      }

      return h('div', { class: 'qds-window__chrome' }, [
        h('div', { class: 'qds-window__title' }, slots.title ? slots.title() : props.title),
        h('div', { class: 'qds-window__actions' }, actions),
      ])
    }

    function renderDefault(scope: QdsWindowDefaultSlotScope) {
      return h('div', { class: 'qds-window__body' }, slots.default?.(scope))
    }

    return () => {
      const {
        class: inheritedClass,
        style: inheritedStyle,
        onSelected,
        ...forwardAttrs
      } = attrs

      const {
        actions,
        minimized: _minimized,
        ...nativeProps
      } = props

      const nativeActions = actions?.filter((action) => unsupportedNativeActions.has(action) !== true)

      return h(NativeQWindow, {
        ...forwardAttrs,
        ...nativeProps,
        ref: windowRef,
        actions: nativeActions,
        backgroundColor: props.backgroundColor ?? 'var(--qds-card-bg)',
        borderStyle: props.borderStyle ?? 'solid',
        borderWidth: props.borderWidth ?? 'var(--qds-border-width-control)',
        color: props.color ?? 'var(--qds-text)',
        contentClass: ['qds-window', qdsClasses.value, props.contentClass, inheritedClass],
        contentStyle: [props.contentStyle, inheritedStyle],
        gripperBackgroundColor: props.gripperBackgroundColor ?? 'var(--qds-surface-0)',
        gripperBorderColor: props.gripperBorderColor ?? 'var(--qds-border)',
        titlebarClass: ['qds-window__titlebar', props.titlebarClass],
        onSelected: (value: boolean) => {
          selected.value = value
          callListener(onSelected, value)
        },
      }, {
        default: renderDefault,
        titlebar: renderTitlebar,
      })
    }
  },
})

export { useQWindowResponsiveProps }

export default QdsWindow
