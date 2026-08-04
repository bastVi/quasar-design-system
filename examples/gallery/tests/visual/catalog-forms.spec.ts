import { expect, test, type Page } from '@playwright/test'
import { MATRIX_VARIANTS } from './helpers'

type Mode = 'light' | 'dark'
type Variant = 'fluent' | 'ink' | 'mobile' | 'terminal'

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
    await expect(page.locator('[data-test="qds-catalog-select-multiple"] .q-chip').first(), 'QSelect multiple chip rendered').toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-catalog-select-multiple"] .q-chip', 'border-radius'), 'QSelect chips use chip radius').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-select-multiple"] .q-chip', 'background-color'), 'QSelect chips are token surfaced').not.toBe('rgba(0, 0, 0, 0)')
    await page.locator('[data-test="qds-catalog-select-multiple"] .q-field').click()
    await expect(page.locator('.q-menu').last(), 'QSelect menu opens deterministically').toBeVisible()
    await expect(page.locator('.q-menu .q-item[aria-selected="true"]').first(), 'QSelect selected option is exposed in menu').toBeVisible()
    expect.soft(await computed(page, '.q-menu .q-item[aria-selected="true"]', 'background-color'), 'QSelect selected menu item has a visible state layer').not.toBe('rgba(0, 0, 0, 0)')
    await page.keyboard.press('Escape')

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
    expect.soft(await computed(page, '[data-test="qds-catalog-slider"] .q-slider__thumb', 'box-shadow'), 'QSlider thumb follows Fluent solid/no-small-shadow treatment').toBe('none')
    expect.soft(await computed(page, '[data-test="qds-catalog-range"] .q-slider__track', 'border-radius'), 'QRange track is rounded').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-range"] .q-slider__selection', 'background-color'), 'QRange selection uses primary').toBe(primary)
    expect.soft(await computed(page, '[data-test="qds-catalog-range"] .q-slider__thumb', 'box-shadow'), 'QRange thumbs follow Fluent solid/no-small-shadow treatment').toBe('none')
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
    await expect(page.locator('[data-test="qds-catalog-color-spectrum"] .q-color-picker__spectrum')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-color-spectrum"] .q-color-picker__alpha')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-color-tune"] .q-color-picker__tune-tab input').first()).toBeVisible()

    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-color-picker__header-bg', 'background-image'), 'QColor checker uses tokenized gradients').not.toContain('data:image')
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-tab.q-tab--active', 'border-radius'), 'QColor tabs are softened').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-color"] .q-tab.q-tab--active', 'transition-property'), 'QColor tabs animate state changes').toContain('box-shadow')
    expect.soft(await computed(page, '[data-test="qds-catalog-color-spectrum"] .q-color-picker__spectrum', 'border-radius'), 'QColor spectrum is framed').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-color-spectrum"] .q-color-picker__alpha .q-slider__track-container', 'background-image'), 'QColor alpha slider exposes checker pattern').not.toBe('none')
    expect.soft(await computed(page, '[data-test="qds-catalog-color-tune"] .q-color-picker__tune-tab > .row', 'background-color'), 'QColor tune rows are surfaced').not.toBe('rgba(0, 0, 0, 0)')
    await page.locator('[data-test="qds-catalog-color-tune"] .q-color-picker__tune-tab input').first().focus()
    expect.soft(await computed(page, '[data-test="qds-catalog-color-tune"] .q-color-picker__tune-tab input', 'outline-style'), 'QColor tune input focus ring is visible').toBe('solid')
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
    await expect(page.locator('[data-test="qds-catalog-date"] .q-date__calendar-item--out').first(), 'QDate disabled/out day rendered').toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-catalog-date"] .q-date__calendar-item--out > div', 'background-color'), 'QDate out days retain a subtle disabled surface').not.toBe('rgba(0, 0, 0, 0)')
    await expect(page.locator('[data-test="qds-catalog-date-months"] .q-date__months')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-date-years"] .q-date__years')).toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-catalog-date-months"] .q-date__months', 'gap'), 'QDate month grid has native picker rhythm').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-date-years"] .q-date__years-content', 'gap'), 'QDate year grid has native picker rhythm').not.toBe('0px')

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
    await expect(page.locator('[data-test="qds-catalog-time"] .q-time__header-ampm')).toBeVisible()
    // Viewport-aware landscape: landscape on >=640px, portrait on narrow
    const viewportWidth = page.viewportSize()?.width ?? 1280
    if (viewportWidth > 640) {
      await expect(page.locator('[data-test="qds-catalog-time"].q-time--landscape')).toBeVisible()
    } else {
      await expect(page.locator('[data-test="qds-catalog-time"]')).not.toHaveClass(/q-time--landscape/)
    }
    await expect(page.locator('[data-test="qds-catalog-time"] .q-time__clock-position--disable').first(), 'QTime disabled clock positions rendered').toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-catalog-time"] .q-time__header-ampm', 'border-radius'), 'QTime AM/PM group is a segmented control').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-time"] .q-time__clock-position--disable', 'cursor'), 'QTime disabled positions communicate unavailable state').toBe('not-allowed')

    await page.locator('[data-test="qds-catalog-popup-edit-target"]').click()
    await expect(page.locator('.q-popup-edit').last(), 'QPopupEdit popup opens deterministically').toBeVisible()
    expect.soft(await computed(page, '.q-popup-edit', 'border-radius'), 'QPopupEdit popup uses menu radius').not.toBe('0px')
    expect.soft(await computed(page, '.q-popup-edit', 'background-color'), 'QPopupEdit popup uses surfaced background').not.toBe('rgba(0, 0, 0, 0)')
  })

  test('forms and pickers render Fluent, Ink, and One in both resolved modes', async ({ page }) => {
    await page.goto('/#catalog')
    for (const mode of ['light', 'dark'] as const) {
      for (const variant of MATRIX_VARIANTS) {
        await applyTheme(page, mode, variant)
        const primary = await resolvedColor(page, '--qds-color-primary')
        await expect(page.locator('[data-test="qds-catalog-input-error"] .q-field')).toBeVisible()
        await expect(page.locator('[data-test="qds-catalog-date"] .q-date__header')).toBeVisible()
        await expect(page.locator('[data-test="qds-catalog-time"] .q-time__container-child')).toBeVisible()
        expect.soft(await computed(page, '[data-test="qds-catalog-input-error"] .q-field__control', 'border-radius'), `${mode}/${variant} field radius`).not.toBe('0px')
        expect.soft(await computedPseudo(page, '[data-test="qds-catalog-input-error"] .q-field__control', '::after', 'border-top-color'), `${mode}/${variant} error outline is semantic`).not.toBe('rgba(0, 0, 0, 0)')
        expect.soft(await page.locator('[data-test="qds-catalog-date"]').getByRole('button', { name: '17', exact: true }).evaluate((el) => getComputedStyle(el).backgroundColor), `${mode}/${variant} selected date uses the active primary`).toBe(primary)
        expect.soft(await computed(page, '[data-test="qds-catalog-time"] .q-time__clock-position--active', 'background-color'), `${mode}/${variant} active time uses the active primary`).toBe(primary)
        if (variant === 'ink') {
          expect.soft(await page.locator('body').evaluate((el) => getComputedStyle(el).getPropertyValue('--qds-surface-positive-soft').trim()), `${mode}/ink has a pastel semantic role surface`).toBe(mode === 'light' ? '#d9f1e4' : '#30493e')
        }
        if (variant === 'mobile') {
          expect.soft(await computed(page, '[data-test="qds-catalog-input-error"] .q-field__control', 'min-height'), `${mode}/One fields retain 44px touch controls`).toBe('44px')
        }
      }
    }
  })

  test('QTime renders portrait on narrow viewports to prevent clipping', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/#catalog')
    await applyTheme(page, 'light', 'fluent')

    const activeTabBox = await page.getByRole('tab', { name: 'Catalog' }).boundingBox()
    const tabsBox = await page.locator('.gallery-tabs').boundingBox()
    const leftArrow = page.locator('.gallery-tabs .q-tabs__arrow--left')
    const rightArrow = page.locator('.gallery-tabs .q-tabs__arrow--right')
    const leftArrowBox = await leftArrow.isVisible() ? await leftArrow.boundingBox() : null
    const rightArrowBox = await rightArrow.isVisible() ? await rightArrow.boundingBox() : null
    if (activeTabBox && tabsBox) {
      const visibleLeft = leftArrowBox ? leftArrowBox.x + leftArrowBox.width : tabsBox.x
      const visibleRight = rightArrowBox ? rightArrowBox.x : tabsBox.x + tabsBox.width
      expect.soft(activeTabBox.x, 'deep-linked active tab clears the left scroll arrow').toBeGreaterThanOrEqual(visibleLeft - 1)
      expect.soft(activeTabBox.x + activeTabBox.width, 'deep-linked active tab clears the right scroll arrow').toBeLessThanOrEqual(visibleRight + 1)
    }

    const timePicker = page.locator('[data-test="qds-catalog-time"]')
    await expect(timePicker).toBeVisible()
    await expect(timePicker).not.toHaveClass(/q-time--landscape/)
    const timeBox = await timePicker.boundingBox()
    const demoCard = await timePicker.locator('xpath=ancestor::*[contains(@class, "catalog-demo")][1]').boundingBox()
    if (timeBox && demoCard) {
      expect.soft(timeBox.width, 'QTime narrow width fits within card').toBeLessThanOrEqual(demoCard.width + 1)
      expect.soft(timeBox.x, 'QTime does not overflow card left edge').toBeGreaterThanOrEqual(demoCard.x - 1)
      expect.soft(timeBox.x + timeBox.width, 'QTime does not overflow card right edge').toBeLessThanOrEqual(demoCard.x + demoCard.width + 1)
    }
    await expect(timePicker.locator('.q-time__header-ampm')).toBeVisible()
    await expect(timePicker.locator('.q-time__clock-position--disable').first()).toBeVisible()
  })
})
