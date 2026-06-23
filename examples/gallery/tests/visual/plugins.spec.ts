import { test, expect, type Page } from '@playwright/test'

type Mode = 'light' | 'dark'
type Variant = 'fluent' | 'air' | 'mobile'

const SURFACE: Record<Mode, string> = {
  light: 'rgb(255, 253, 248)',
  dark: 'rgb(32, 34, 37)',
}
const PRIMARY_RGB_PATTERN = /rgba?\(0,\s*90,\s*158/

async function applyTheme(page: Page, mode: Mode, variant: Variant) {
  await page.evaluate(
    ({ mode, variant }) => {
      const ds = (window as unknown as { __qdsGallery: any }).__qdsGallery
      ds.setMode(mode)
      ds.setVariant(variant)
    },
    { mode, variant },
  )
  await expect(page.locator('body')).toHaveClass(new RegExp(`qds-variant-${variant}`))
  await expect(page.locator('body')).toHaveClass(new RegExp(mode === 'dark' ? 'qds-theme-dark' : 'qds-theme-light'))
}

async function computed(page: Page, selector: string, prop: string): Promise<string> {
  return page.locator(selector).first().evaluate(
    (el, prop) => getComputedStyle(el as Element).getPropertyValue(prop as string),
    prop,
  )
}

async function expectNoResidualGlobalSurfaces(page: Page) {
  await expect(page.locator('.q-dialog')).toHaveCount(0)
  await expect(page.locator('.q-bottom-sheet')).toHaveCount(0)
  await expect(page.locator('.q-loading')).toHaveCount(0)
  await expect(page.locator('.q-notification')).toHaveCount(0)

  // Quasar's LoadingBar plugin keeps one inert .q-loading-bar node mounted after install.
  // The no-residual invariant for this plugin is therefore "no active progressbar".
  await expect(page.locator('.q-loading-bar[role="progressbar"]')).toHaveCount(0)
}

test.describe('QDS plugin/global UI surfaces', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#plugins')
    await applyTheme(page, 'light', 'fluent')
    await expect(page.getByRole('tab', { name: 'Plugins' })).toHaveAttribute('aria-selected', 'true')
    await expectNoResidualGlobalSurfaces(page)
  })

  test.afterEach(async ({ page }) => {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(50)
    await expectNoResidualGlobalSurfaces(page)
  })

  test('BottomSheet plugin list and grid surfaces are tokenized and clean up', async ({ page }) => {
    await page.getByRole('button', { name: 'Open list BottomSheet' }).click()
    await expect(page.locator('.q-bottom-sheet.q-bottom-sheet--list')).toBeVisible()
    expect.soft(await computed(page, '.q-bottom-sheet', 'background-color'), 'BottomSheet list surface').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(await computed(page, '.q-bottom-sheet', 'box-shadow'), 'BottomSheet list shadow').not.toBe('none')
    expect.soft(await computed(page, '.q-bottom-sheet', 'border-top-width'), 'BottomSheet list border').toBe('1px')
    await page.getByText('Pin surface').click()
    await expect(page.getByTestId('plugin-status')).toContainText('BottomSheet list action: Pin surface')
    await expectNoResidualGlobalSurfaces(page)

    await page.getByRole('button', { name: 'Open grid BottomSheet' }).click()
    await expect(page.locator('.q-bottom-sheet.q-bottom-sheet--grid')).toBeVisible()
    expect.soft(await computed(page, '.q-bottom-sheet--grid .q-bottom-sheet__item', 'border-radius'), 'BottomSheet grid item radius').toBe('8px')
    expect.soft(await computed(page, '.q-bottom-sheet--grid .q-bottom-sheet__item', 'color'), 'BottomSheet grid item text').not.toBe('rgba(0, 0, 0, 0)')
    await page.locator('.q-bottom-sheet').getByText('Air').click()
    await expect(page.getByTestId('plugin-status')).toContainText('BottomSheet grid action: Air')
    await expectNoResidualGlobalSurfaces(page)
  })

  test('Dialog and Notify plugin surfaces inherit existing QDS overlay styling and clean up', async ({ page }) => {
    await page.getByRole('button', { name: 'Open plugin dialog' }).click()
    await expect(page.locator('.q-dialog').first()).toBeVisible()
    expect.soft(await computed(page, '.q-dialog__backdrop', 'background-color'), 'Dialog plugin scrim').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(await computed(page, '.q-dialog .q-card', 'box-shadow'), 'Dialog plugin card shadow').not.toBe('none')
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByTestId('plugin-status')).toContainText('Dialog plugin confirmed')
    await expectNoResidualGlobalSurfaces(page)

    await page.getByRole('button', { name: 'Show plugin notify' }).click()
    await expect(page.locator('.q-notification').first()).toBeVisible()
    expect.soft(await computed(page, '.q-notification', 'background-color'), 'Notify plugin surface').toBe(SURFACE.light)
    expect.soft(await computed(page, '.q-notification', 'box-shadow'), 'Notify plugin shadow').not.toBe('none')
    await page.getByRole('button', { name: 'Dismiss' }).click()
    await expectNoResidualGlobalSurfaces(page)
  })

  test('Loading and LoadingBar plugin surfaces are visible only during their assertions', async ({ page }) => {
    await page.getByRole('button', { name: 'Show loading overlay' }).click()
    await expect(page.locator('.q-loading').first()).toBeVisible()
    expect.soft(await computed(page, '.q-loading__box', 'background-color'), 'Loading box surface').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(await computed(page, '.q-loading__box', 'box-shadow'), 'Loading box shadow').not.toBe('none')
    await expect(page.locator('.q-loading')).toHaveCount(0)
    await expectNoResidualGlobalSurfaces(page)

    await page.getByRole('button', { name: 'Start loading bar' }).click()
    await expect(page.locator('.q-loading-bar[role="progressbar"]').first()).toBeVisible()
    expect.soft(await computed(page, '.q-loading-bar[role="progressbar"]', 'background-image'), 'LoadingBar token color').toMatch(PRIMARY_RGB_PATTERN)
    await page.getByRole('button', { name: 'Stop loading bar' }).click()
    await expect(page.locator('.q-loading-bar[role="progressbar"]')).toHaveCount(0, { timeout: 1500 })
    await expectNoResidualGlobalSurfaces(page)
  })
})
