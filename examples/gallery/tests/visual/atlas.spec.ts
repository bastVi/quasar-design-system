import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { applyTheme, type Mode } from './helpers'

type Section = 'components' | 'catalog' | 'plugins'

type Overlay = {
  name: string
  open: (page: Page) => Promise<void>
  target: string
  close: (page: Page) => Promise<void>
  mobile?: boolean
}

const MODES: Mode[] = ['light', 'dark']

// Overlays are captured on the solid material fallback so baselines never depend on blurred page content.
async function forceSolidMaterials(page: Page) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] })
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-transparency: reduce)').matches), 'reduced transparency is emulated').toBe(true)
}

function alpha(color: string): number {
  const slash = color.match(/\/\s*([\d.]+)(%?)\s*\)$/)
  if (slash) return Number.parseFloat(slash[1]) / (slash[2] ? 100 : 1)
  const rgba = color.match(/^rgba\((?:[^,]+,){3}\s*([\d.]+)\)$/)
  return rgba ? Number.parseFloat(rgba[1]) : 1
}

// Rounded overlay corners otherwise reveal whatever page content sits beneath them.
const HIDE_PAGE_BEHIND_OVERLAYS = fileURLToPath(new URL('./atlas-overlay.css', import.meta.url))
// The sticky gallery header would otherwise cover the top of targets taller than the viewport.
const HIDE_GALLERY_HEADER = fileURLToPath(new URL('./atlas-element.css', import.meta.url))

// Floor the overlay rect inward so sub-pixel positions never bleed the trigger beneath into the crop.
async function tightClip(page: Page, selector: string) {
  // Enter transitions scale the overlay, so settle every finite animation before measuring.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)))
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  )
  const box = await page.locator(selector).boundingBox()
  expect(box, `${selector} has a layout box`).not.toBeNull()
  const x = Math.ceil(box!.x)
  const y = Math.ceil(box!.y)
  return { x, y, width: Math.floor(box!.x + box!.width) - x, height: Math.floor(box!.y + box!.height) - y }
}

const byHook = (hook: string) => `[data-test="${hook}"]`

const escape = async (page: Page) => {
  await page.keyboard.press('Escape')
}

// Quasar only binds Escape on desktop platforms, so mobile-captured overlays close through an action.
const clickButton = (target: string, name: string) => async (page: Page) => {
  await page.locator(target).getByRole('button', { name }).click()
}

const clickItem = (target: string, text: string) => async (page: Page) => {
  await page.locator(target).locator('.q-item', { hasText: text }).click()
}

const FAMILIES: Record<Section, Record<string, readonly string[]>> = {
  components: {
    actions: ['qds-control-standard-button', 'qds-control-outline-button', 'qds-card-header-action'],
    identity: ['qds-badge-floating', 'qds-badge-multiline', 'qds-chip-square', 'qds-chip-avatar'],
    forms: [
      'qds-control-input',
      'qds-control-input-filled',
      'qds-control-input-error',
      'qds-control-select',
      'qds-control-select-multiple',
      'qds-field-float-value',
      'qds-field-start-form',
    ],
    data: ['qds-table-official-modes', 'qds-table-no-chrome', 'qds-pagination', 'qds-pagination-input', 'qds-flush-card-table'],
    tabs: ['qds-tabs-horizontal', 'qds-tabs-vertical', 'qds-tabs-scroll'],
  },
  catalog: {
    actions: [
      'qds-btn-dropdown',
      'qds-btn-group',
      'qds-btn-toggle',
      'qds-rating-active',
      'qds-rating-half',
      'qds-toolbar-surface',
      'qds-toolbar-dense',
      'qds-bar-standard',
      'qds-bar-dark',
      'qds-separator-inset-host',
    ],
    identity: [
      'qds-avatar',
      'qds-breadcrumbs',
      'qds-breadcrumbs-overflow',
      'qds-banner',
      'qds-banner-actions',
      'qds-banner-dense',
    ],
    tabs: ['qds-tab-panels'],
    forms: [
      'qds-catalog-input-error',
      'qds-catalog-select-multiple',
      'qds-catalog-option-group',
      'qds-catalog-checkbox',
      'qds-catalog-radio',
      'qds-catalog-toggle',
      'qds-catalog-file-multiple',
      'qds-catalog-file-progress',
      'qds-catalog-slider',
      'qds-catalog-range',
      'qds-catalog-color',
      'qds-catalog-date',
      'qds-catalog-date-range',
      'qds-catalog-time',
    ],
    data: [
      'qds-linear-progress',
      'qds-circular-progress',
      'qds-spinner',
      'qds-expansion-expanded',
      'qds-expansion-collapsed',
      'qds-expansion-dense',
      'qds-tree-primary',
      'qds-tree-dense',
    ],
    media: [
      'qds-stepper',
      'qds-stepper-vertical',
      'qds-stepper-horizontal',
      'qds-stepper-compact',
      'qds-timeline',
      'qds-timeline-dense',
      'qds-chat-sent',
      'qds-chat-received',
      'qds-carousel',
      'qds-scroll-area',
      'qds-splitter',
      'qds-slide-item',
      'qds-knob',
      'qds-editor',
      'qds-uploader',
    ],
  },
  plugins: {
    plugins: [
      'qds-plugin-bottomsheet-card',
      'qds-plugin-dialog-notify-card',
      'qds-plugin-loading-card',
      'qds-plugin-inner-loading-box',
      'qds-plugin-status-card',
    ],
  },
}

const MOBILE_HOOKS: Record<Section, readonly string[]> = {
  components: ['qds-control-standard-button', 'qds-chip-avatar', 'qds-control-input', 'qds-pagination', 'qds-tabs-horizontal', 'qds-tabs-scroll'],
  catalog: [
    'qds-btn-toggle',
    'qds-banner-actions',
    'qds-breadcrumbs-overflow',
    'qds-catalog-date',
    'qds-tree-primary',
    'qds-stepper-vertical',
    'qds-stepper-horizontal',
    'qds-uploader',
  ],
  plugins: ['qds-plugin-dialog-notify-card'],
}

const clickHook = (hook: string) => async (page: Page) => {
  await page.locator(byHook(hook)).click()
}

const OVERLAYS: Record<Section, readonly Overlay[]> = {
  components: [
    { name: 'qds-menu-dense', open: clickHook('qds-menu-dense-trigger'), target: byHook('qds-menu-dense'), close: escape },
    { name: 'qds-menu-sections', open: clickHook('qds-menu-sections-trigger'), target: byHook('qds-menu-sections'), close: clickItem(byHook('qds-menu-sections'), 'Copy link'), mobile: true },
    {
      name: 'qds-menu-context',
      open: async (page) => page.locator(byHook('qds-menu-context-target')).click({ button: 'right' }),
      target: byHook('qds-menu-context'),
      close: escape,
    },
    {
      name: 'qds-select-popup',
      open: async (page) => page.locator(`${byHook('qds-control-select')} .q-field__control`).click(),
      target: '.q-menu[role="listbox"]',
      close: escape,
    },
    {
      name: 'qds-tooltip-top',
      open: async (page) => page.locator(byHook('qds-tooltip-top-trigger')).hover(),
      target: byHook('qds-tooltip-top'),
      close: async (page) => page.mouse.move(0, 0),
    },
    {
      name: 'qds-dialog-persistent',
      open: clickHook('qds-dialog-persistent-trigger'),
      target: byHook('qds-dialog-persistent'),
      close: clickButton(byHook('qds-dialog-persistent'), 'Keep editing'),
    },
    { name: 'qds-dialog-maximized', open: clickHook('qds-dialog-maximized-trigger'), target: byHook('qds-dialog-maximized'), close: escape },
    { name: 'qds-dialog-bottom', open: clickHook('qds-dialog-bottom-trigger'), target: byHook('qds-dialog-bottom'), close: escape },
    { name: 'qds-dialog-prompt', open: clickHook('qds-dialog-prompt-trigger'), target: byHook('qds-dialog-prompt'), close: clickButton(byHook('qds-dialog-prompt'), 'Cancel'), mobile: true },
  ],
  catalog: [],
  plugins: [
    {
      name: 'qds-bottom-sheet-list',
      open: async (page) => page.getByRole('button', { name: 'Open list BottomSheet' }).click(),
      target: '.q-bottom-sheet',
      close: clickItem('.q-bottom-sheet', 'Cancel'),
      mobile: true,
    },
  ],
}

test.describe('@screens atlas', () => {
  for (const section of Object.keys(FAMILIES) as Section[]) {
    for (const mode of MODES) {
      test(`${section} fluent ${mode}`, async ({ page }, testInfo) => {
        test.setTimeout(240_000)
        const mobile = testInfo.project.name === 'mobile'

        await page.goto(`./#${section}`)
        await applyTheme(page, mode, 'fluent')
        await page.evaluate(async () => {
          await document.fonts.ready
        })

        const hooks = Object.values(FAMILIES[section]).flat()
        for (const hook of mobile ? MOBILE_HOOKS[section] : hooks) {
          const target = page.locator(byHook(hook))
          await expect(target, `${hook} is rendered exactly once`).toHaveCount(1)
          // Centre the target so the sticky gallery header never overlaps the crop.
          await target.evaluate((element) => element.scrollIntoView({ block: 'center' }))
          await expect(target, `${hook} is visible on ${testInfo.project.name}`).toBeVisible()
          await expect.soft(target).toHaveScreenshot(`atlas-${hook}-${mode}.png`, { stylePath: HIDE_GALLERY_HEADER })
        }

        const overlays = OVERLAYS[section].filter((overlay) => !mobile || overlay.mobile)
        if (overlays.length) await forceSolidMaterials(page)
        for (const overlay of overlays) {
          await overlay.open(page)
          const target = page.locator(overlay.target)
          await expect(target, `${overlay.name} overlay opens once`).toHaveCount(1)
          await expect(target, `${overlay.name} overlay is visible`).toBeVisible()
          const background = await target.evaluate((element) => getComputedStyle(element).backgroundColor)
          expect.soft(alpha(background), `${overlay.name} renders on the solid material fallback (${background})`).toBe(1)
          await expect.soft(page).toHaveScreenshot(`atlas-${overlay.name}-${mode}.png`, {
            clip: await tightClip(page, overlay.target),
            stylePath: HIDE_PAGE_BEHIND_OVERLAYS,
          })
          await overlay.close(page)
          await expect(target, `${overlay.name} overlay closes`).toHaveCount(0)
        }
      })
    }
  }

  for (const mode of MODES) {
    test(`scenes materials fluent ${mode}`, async ({ page }) => {
      await page.goto('./#scenes')
      await applyTheme(page, mode, 'fluent')
      await page.evaluate(async () => {
        await document.fonts.ready
      })
      const target = page.locator(byHook('qds-scene-materials'))
      await expect(target, 'qds-scene-materials is rendered exactly once').toHaveCount(1)
      await target.evaluate((element) => element.scrollIntoView({ block: 'center' }))
      await expect(target).toBeVisible()
      await expect.soft(target).toHaveScreenshot(`atlas-qds-scene-materials-${mode}.png`)
    })
  }
})
