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

async function computedPseudo(page: Page, selector: string, pseudo: string, prop: string): Promise<string> {
  return page.locator(selector).first().evaluate(
    (el, { pseudo, prop }) => getComputedStyle(el as Element, pseudo).getPropertyValue(prop),
    { pseudo, prop },
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
  test('skins form controls, fields, file, slider, and range sub-elements with QDS tokens', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Catalog' }).click()
    await applyTheme(page, 'light', 'fluent')

    const primary = await resolvedColor(page, '--qds-color-primary')
    const negative = await resolvedColor(page, '--qds-color-negative')

    await expect(page.locator('[data-test="qds-catalog-input-readonly"] .q-field')).toHaveClass(/q-field--readonly/)
    await expect(page.locator('[data-test="qds-catalog-input-error"] .q-field')).toHaveClass(/q-field--error/)
    await expect(page.locator('[data-test="qds-catalog-input-disabled"] .q-field')).toHaveClass(/q-field--disabled/)
    await expect(page.locator('[data-test="qds-catalog-input-error"] .q-field__messages')).toContainText('Visible validation message')
    expect.soft(
      await computedPseudo(page, '[data-test="qds-catalog-input-readonly"] .q-field__control', '::before', 'border-top-style'),
      'QInput readonly outline is visibly distinct',
    ).toBe('dashed')
    expect.soft(
      await computedPseudo(page, '[data-test="qds-catalog-input-error"] .q-field__control', '::after', 'border-top-color'),
      'QInput error outline uses negative token',
    ).toBe(negative)
    expect.soft(
      await computed(page, '[data-test="qds-catalog-input-disabled"] .q-field__control', 'background-color'),
      'QInput disabled control keeps a visible disabled surface',
    ).not.toBe('rgba(0, 0, 0, 0)')

    await expect(page.locator('[data-test="qds-catalog-select-readonly"] .q-field')).toHaveClass(/q-field--readonly/)
    await expect(page.locator('[data-test="qds-catalog-select-error"] .q-field')).toHaveClass(/q-field--error/)
    await expect(page.locator('[data-test="qds-catalog-select-disabled"] .q-field')).toHaveClass(/q-field--disabled/)
    await expect(page.locator('[data-test="qds-catalog-select-error"] .q-field__messages')).toContainText('Visible selection message')
    expect.soft(
      await computedPseudo(page, '[data-test="qds-catalog-select-readonly"] .q-field__control', '::before', 'border-top-style'),
      'QSelect readonly outline is visibly distinct',
    ).toBe('dashed')
    expect.soft(
      await computedPseudo(page, '[data-test="qds-catalog-select-error"] .q-field__control', '::after', 'border-top-color'),
      'QSelect error outline uses negative token',
    ).toBe(negative)

    await expect(page.locator('[data-test="qds-catalog-checkbox"] .q-checkbox__bg')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-radio"] .q-radio__bg')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-toggle"] .q-toggle__track')).toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-catalog-checkbox"] .q-checkbox__bg', 'border-top-color'), 'QCheckbox truthy frame uses primary').toBe(primary)
    expect.soft(await computed(page, '[data-test="qds-catalog-radio"] .q-radio__bg', 'border-top-color'), 'QRadio truthy frame uses primary').toBe(primary)
    expect.soft(await computed(page, '[data-test="qds-catalog-radio"] .q-radio__check', 'fill'), 'QRadio check uses primary').toBe(primary)
    expect.soft(await computed(page, '[data-test="qds-catalog-toggle"] .q-toggle__track', 'border-radius'), 'QToggle track is rounded').not.toBe('0px')
    expect.soft(await computedPseudo(page, '[data-test="qds-catalog-toggle"] .q-toggle__thumb', '::after', 'background-color'), 'QToggle thumb uses primary when on').toBe(primary)
    const toggleInset = await page.locator('[data-test="qds-catalog-toggle"]').evaluate((el) => {
      const track = el.querySelector('.q-toggle__track')!.getBoundingClientRect()
      const thumb = el.querySelector('.q-toggle__thumb')!.getBoundingClientRect()
      return Math.round((track.right - thumb.right) * 100) / 100
    })
    expect.soft(toggleInset, 'QToggle truthy thumb keeps breathing room inside track').toBeGreaterThanOrEqual(3)

    await expect(page.locator('[data-test="qds-catalog-option-radio"]')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-option-checkbox"]')).toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-catalog-option-radio"]', 'display'), 'QOptionGroup is layout-controlled').toBe('flex')
    expect.soft(await computed(page, '[data-test="qds-catalog-option-checkbox"] .q-checkbox', 'border-radius'), 'QOptionGroup options are softened').not.toBe('0px')

    await expect(page.locator('[data-test="qds-catalog-file"]')).toContainText('token-proof.pdf')
    expect.soft(await computed(page, '[data-test="qds-catalog-file"] .q-field__control', 'border-radius'), 'QFile control is softened').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-file"] .q-field__native', 'color'), 'QFile native text is tokenized').not.toBe('rgba(0, 0, 0, 0.87)')

    await expect(page.locator('[data-test="qds-catalog-slider"] .q-slider__selection')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-range"] .q-slider__selection').first()).toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-catalog-slider"] .q-slider__track', 'border-radius'), 'QSlider track is rounded').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-slider"] .q-slider__selection', 'background-color'), 'QSlider selection uses primary').toBe(primary)
    expect.soft(await computed(page, '[data-test="qds-catalog-slider"] .q-slider__thumb', 'box-shadow'), 'QSlider thumb is elevated').not.toBe('none')
    expect.soft(await computed(page, '[data-test="qds-catalog-range"] .q-slider__track', 'border-radius'), 'QRange track is rounded').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-range"] .q-slider__selection', 'background-color'), 'QRange selection uses primary').toBe(primary)
    expect.soft(await computed(page, '[data-test="qds-catalog-range"] .q-slider__thumb', 'box-shadow'), 'QRange thumbs are elevated').not.toBe('none')
  })

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
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-tab.q-tab--active', 'transition-property'), 'QColor tabs animate state changes').toContain('box-shadow')
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-color-picker__cube', 'border-radius'), 'QColor swatches are softened').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-color-picker__cube', 'aspect-ratio'), 'QColor swatches stay square').toBe('1 / 1')
    const swatchDelta = await page.locator('[data-test="qds-catalog-color"] .q-color-picker__cube').first().evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return Math.abs(rect.width - rect.height)
    })
    expect.soft(swatchDelta, 'QColor swatch rendered box stays near-square').toBeLessThanOrEqual(1)
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-color-picker__footer', 'background-color'), 'QColor footer is surfaced').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(await computed(page, '[data-test="qds-catalog-date"]', 'border-top-color'), 'QDate bordered frame is softened').not.toBe('rgb(200, 200, 200)')
    expect.soft(await computed(page, '[data-test="qds-catalog-time"]', 'border-top-color'), 'QTime bordered frame is softened').not.toBe('rgb(200, 200, 200)')

    const selectedDate = page.locator('[data-test="qds-catalog-date"]').getByRole('button', { name: '17', exact: true })
    await expect(selectedDate).toBeVisible()
    expect.soft(await selectedDate.evaluate((el) => getComputedStyle(el as Element).backgroundColor), 'QDate selected day uses primary').toBe(primary)
    expect.soft(await selectedDate.evaluate((el) => getComputedStyle(el as Element).color), 'QDate selected day uses on-solid text').toBe(onSolid)
    expect.soft(await computed(page, '[data-test="qds-catalog-date"] .q-date__header', 'background-color'), 'QDate header is not transparent').not.toBe('rgba(0, 0, 0, 0)')

    await expect(page.locator('[data-test="qds-catalog-date-range"] .q-date__range').first(), 'QDate range middle rendered').toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-date-range"] .q-date__range-from').first(), 'QDate range start rendered').toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-date-range"] .q-date__range-to').first(), 'QDate range end rendered').toBeVisible()
    expect.soft(await computedPseudo(page, '[data-test="qds-catalog-date-range"] .q-date__range', '::before', 'background-color'), 'QDate range fill is tokenized').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(await computed(page, '[data-test="qds-catalog-date-range"] .q-date__range-from', 'border-top-left-radius'), 'QDate range start is rounded').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-date-range"] .q-date__range-to', 'border-top-right-radius'), 'QDate range end is rounded').not.toBe('0px')

    const activeTime = page.locator('[data-test="qds-catalog-time"] .q-time__clock-position--active').first()
    await expect(activeTime).toBeVisible()
    expect.soft(await activeTime.evaluate((el) => getComputedStyle(el as Element).backgroundColor), 'QTime active tick uses primary').toBe(primary)
    expect.soft(await activeTime.evaluate((el) => getComputedStyle(el as Element).color), 'QTime active tick uses on-solid text').toBe(onSolid)
    expect.soft(await computed(page, '[data-test="qds-catalog-time"] .q-time__container-child', 'background-color'), 'QTime clock face is token surfaced').not.toBe('rgba(0, 0, 0, 0.12)')
  })
})
