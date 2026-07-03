import { expect, test, type Page } from '@playwright/test'

type Mode = 'light' | 'dark'
type Variant = 'fluent' | 'air' | 'mobile'

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
  await expect(page.locator('body')).toHaveClass(
    new RegExp(mode === 'dark' ? 'qds-theme-dark' : 'qds-theme-light'),
  )
}

async function computed(page: Page, selector: string, prop: string): Promise<string> {
  return page.locator(selector).first().evaluate(
    (el, prop) => getComputedStyle(el as Element).getPropertyValue(prop),
    prop,
  )
}

async function resolvedColor(page: Page, name: string): Promise<string> {
  return page.locator('body').evaluate(
    (el, name) => {
      const root = el as Element
      const probe = document.createElement('span')
      probe.style.color = `var(${name})`
      root.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    },
    name,
  )
}

test.describe('QDS catalog form picker gate', () => {
  test('skins QColor, QDate, and QTime picker internals with QDS tokens', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Catalog' }).click()
    await applyTheme(page, 'light', 'fluent')

    const primary = await resolvedColor(page, '--qds-color-primary')
    const onSolid = await resolvedColor(page, '--qds-text-on-solid')

    await expect(page.locator('[data-test="qds-catalog-color"] .q-color-picker__header-tabs')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-color"] .q-color-picker__footer')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-color"] .q-color-picker__cube').first()).toBeVisible()

    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-color-picker__header-bg', 'background-image'), 'QColor checker uses tokenized gradients').not.toContain('data:image')
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-tab.q-tab--active', 'border-radius'), 'QColor tabs are softened').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-color-picker__cube', 'border-radius'), 'QColor swatches are softened').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-color-picker__footer', 'background-color'), 'QColor footer is surfaced').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(await computed(page, '[data-test="qds-catalog-date"]', 'border-top-color'), 'QDate bordered frame is softened').not.toBe('rgb(200, 200, 200)')
    expect.soft(await computed(page, '[data-test="qds-catalog-time"]', 'border-top-color'), 'QTime bordered frame is softened').not.toBe('rgb(200, 200, 200)')

    const selectedDate = page.locator('[data-test="qds-catalog-date"]').getByRole('button', { name: '17', exact: true })
    await expect(selectedDate).toBeVisible()
    expect.soft(await selectedDate.evaluate((el) => getComputedStyle(el as Element).backgroundColor), 'QDate selected day uses primary').toBe(primary)
    expect.soft(await selectedDate.evaluate((el) => getComputedStyle(el as Element).color), 'QDate selected day uses on-solid text').toBe(onSolid)
    expect.soft(await computed(page, '[data-test="qds-catalog-date"] .q-date__header', 'background-color'), 'QDate header is not transparent').not.toBe('rgba(0, 0, 0, 0)')

    const activeTime = page.locator('[data-test="qds-catalog-time"] .q-time__clock-position--active').first()
    await expect(activeTime).toBeVisible()
    expect.soft(await activeTime.evaluate((el) => getComputedStyle(el as Element).backgroundColor), 'QTime active tick uses primary').toBe(primary)
    expect.soft(await activeTime.evaluate((el) => getComputedStyle(el as Element).color), 'QTime active tick uses on-solid text').toBe(onSolid)
    expect.soft(await computed(page, '[data-test="qds-catalog-time"] .q-time__container-child', 'background-color'), 'QTime clock face is token surfaced').not.toBe('rgba(0, 0, 0, 0.12)')
  })
})
