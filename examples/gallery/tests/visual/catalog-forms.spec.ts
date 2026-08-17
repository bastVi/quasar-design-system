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

    const emptyFile = page.locator('[data-test="qds-catalog-file-empty"] .q-file')
    const selectedFile = page.locator('[data-test="qds-catalog-file-selected"] .q-file')
    const multipleFiles = page.locator('[data-test="qds-catalog-file-multiple"] .q-file')
    await expect(emptyFile, 'QFile empty state rendered').toBeVisible()
    await expect(emptyFile.locator('.q-chip'), 'QFile empty state has no selected chips').toHaveCount(0)
    await expect(selectedFile).toContainText('brand-guidelines.pdf')
    await expect(multipleFiles.locator('.q-chip'), 'QFile multiple state renders deterministic chips').toHaveCount(2)
    await expect(multipleFiles.locator('.q-chip__icon--remove').first(), 'QFile chips expose the public remove control').toBeVisible()
    await expect(multipleFiles.locator('.q-chip__icon--remove').first(), 'QFile chip remove has an accessible name').toHaveAttribute('aria-label', /remove/i)
    await expect(selectedFile.locator('.q-field__focusable-action'), 'QFile selected state exposes its clear control').toBeVisible()
    await expect(selectedFile.locator('.q-field__focusable-action'), 'QFile clear has an accessible name').toHaveAttribute('aria-label', /clear/i)
    await expect(multipleFiles.locator('.q-field__bottom'), 'QFile multiple state renders its counter').toContainText('2')
    const progressFiles = page.locator('[data-test="qds-catalog-file-progress"] .q-file')
    await expect(progressFiles.locator('.q-chip'), 'QFile file slot renders progress chips').toHaveCount(2)
    await expect(progressFiles.locator('.q-linear-progress'), 'QFile file slot renders deterministic progress').toHaveCount(2)
    await expect(progressFiles.locator('.q-chip__icon--remove').first(), 'QFile file-slot remove has a descriptive name').toHaveAttribute('aria-label', /remove token-audit\.json/i)
    await expect(progressFiles.locator('.q-field__bottom'), 'QFile file slot renders its counter').toContainText('2')
    const progressBox = await progressFiles.locator('.q-linear-progress').first().boundingBox()
    if (progressBox) {
      expect.soft(progressBox.width, 'QFile file-slot progress has a visible width').toBeGreaterThan(0)
      expect.soft(progressBox.height, 'QFile file-slot progress has a visible height').toBeGreaterThan(0)
    }
    expect.soft(await computed(page, '[data-test="qds-catalog-file-selected"] .q-field__control', 'border-radius'), 'QFile control inherits field radius').not.toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-catalog-file-selected"] .q-field__native', 'color'), 'QFile native text is tokenized').not.toBe('rgba(0, 0, 0, 0.87)')
    await selectedFile.locator('.q-field__native').focus()
    await expect(selectedFile, 'QFile focus inherits QField focus state').toHaveClass(/q-field--focused/)
    await expect.poll(
      () => computedPseudo(page, '[data-test="qds-catalog-file-selected"] .q-field__control', '::after', 'border-top-color'),
      { message: 'QFile focused outline uses primary after its transition settles' },
    ).toBe(primary)
    await multipleFiles.locator('.q-chip__icon--remove').first().click()
    await expect(multipleFiles.locator('.q-chip'), 'QFile chip remove updates the local fixture').toHaveCount(1)
    await progressFiles.locator('.q-chip__icon--remove').first().click()
    await expect(progressFiles.locator('.q-chip'), 'QFile file-slot remove updates the local fixture').toHaveCount(1)
    await selectedFile.locator('.q-field__focusable-action').click()
    await expect(selectedFile.locator('.q-field__focusable-action'), 'QFile clear removes its clear affordance').toHaveCount(0)
    await expect(page.locator('[data-test="qds-catalog-file-readonly"] .q-file')).toHaveClass(/q-field--readonly/)
    await expect(page.locator('[data-test="qds-catalog-file-disabled"] .q-file')).toHaveClass(/q-field--disabled/)
    expect.soft(await computedPseudo(page, '[data-test="qds-catalog-file-readonly"] .q-field__control', '::before', 'border-top-style'), 'QFile readonly state inherits the distinct outline').toBe('dashed')
    expect.soft(await computed(page, '[data-test="qds-catalog-file-disabled"] .q-field__control', 'background-color'), 'QFile disabled state inherits a visible disabled surface').not.toBe('rgba(0, 0, 0, 0)')
    const readonlyFile = page.locator('[data-test="qds-catalog-file-readonly"] .q-file')
    const disabledFile = page.locator('[data-test="qds-catalog-file-disabled"] .q-file')
    await expect(readonlyFile.locator('input[type="file"]'), 'QFile readonly native input is disabled').toBeDisabled()
    await expect(disabledFile.locator('input[type="file"]'), 'QFile disabled native input is disabled').toBeDisabled()
    let nativeFileChooserCount = 0
    const countNativeFileChooser = () => { nativeFileChooserCount += 1 }
    page.on('filechooser', countNativeFileChooser)
    for (const protectedFile of [readonlyFile, disabledFile]) {
      await protectedFile.scrollIntoViewIfNeeded()
      await protectedFile.click({ force: true })
      await protectedFile.locator('.q-field__native').focus()
      await protectedFile.locator('.q-field__native').press('Enter')
      await protectedFile.locator('.q-field__native').press('Space')
    }
    await page.waitForTimeout(100)
    page.off('filechooser', countNativeFileChooser)
    expect.soft(nativeFileChooserCount, 'Readonly and disabled QFile fields do not activate the native chooser by pointer or keyboard').toBe(0)
    await expect(page.locator('[data-test="qds-catalog-file-affordances"] .q-field__prepend svg')).toBeVisible()
    await expect(page.locator('[data-test="qds-catalog-file-affordances"] .q-field__append svg')).toBeVisible()
    await emptyFile.locator('.q-field__native').dispatchEvent('dragover')
    await expect(emptyFile, 'QFile drag-over state has the native dnd class').toHaveClass(/q-file--dnd/)
    await expect(emptyFile.locator('.q-file__dnd'), 'QFile drag-over surface is visible without a file chooser').toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-catalog-file-empty"] .q-file__dnd', 'outline-style'), 'QFile drag-over surface uses a dashed visual affordance').toBe('dashed')
    expect.soft(await computed(page, '[data-test="qds-catalog-file-empty"] .q-file__dnd', 'background-color'), 'QFile drag-over surface is token surfaced').not.toBe('rgba(0, 0, 0, 0)')
    await emptyFile.locator('.q-field__native').dispatchEvent('dragleave')
    await expect(emptyFile.locator('.q-file__dnd'), 'QFile drag-over surface clears without dropping files').toHaveCount(0)

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

  test('QSelect supports dialog, cover-menu, empty, and max-value modes without visual regressions', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/#catalog')
    await applyTheme(page, 'light', 'fluent')

    const dialogSelect = page.locator('[data-test="qds-catalog-select-dialog"] .q-select')
    await dialogSelect.locator('.q-field__native').click()
    const selectDialog = page.locator('.q-dialog .q-select__dialog')
    await expect(selectDialog, 'QSelect dialog behavior opens at the mobile viewport').toBeVisible()
    await expect(selectDialog.getByRole('listbox').getByText('Comfortable', { exact: true })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('qselect-dialog-mobile.png'), fullPage: true })
    await page.keyboard.press('Escape')
    await expect(selectDialog).toBeHidden()

    await page.setViewportSize({ width: 1280, height: 800 })
    const coverSelect = page.locator('[data-test="qds-catalog-select-cover"] .q-select')
    const coverControl = coverSelect.locator('.q-field__control')
    const coverControlBox = await coverControl.boundingBox()
    await coverSelect.locator('.q-field__native').click()
    const coverMenu = page.locator('.q-menu').last()
    await expect(coverMenu, 'QSelect cover menu opens deterministically').toBeVisible()
    const coverMenuBox = await coverMenu.boundingBox()
    if (coverControlBox && coverMenuBox) {
      expect.soft(Math.abs(coverMenuBox.x - coverControlBox.x), 'QSelect cover menu aligns with its control').toBeLessThanOrEqual(1)
      expect.soft(Math.abs(coverMenuBox.width - coverControlBox.width), 'QSelect cover menu matches its control width').toBeLessThanOrEqual(1)
    }
    await page.keyboard.press('Escape')

    const noOptionsSelect = page.locator('[data-test="qds-catalog-select-no-options"] .q-select')
    await noOptionsSelect.locator('.q-field__native').click()
    await expect(page.locator('.q-menu').last().getByText('No options available', { exact: true }), 'QSelect public no-option slot renders an intentional empty state').toBeVisible()
    await page.keyboard.press('Escape')

    const limitedSelect = page.locator('[data-test="qds-catalog-select-limited"] .q-select')
    await expect(limitedSelect.locator('.q-chip'), 'QSelect max-values fixture begins with one chip').toHaveCount(1)
    await expect(limitedSelect.locator('.q-field__bottom'), 'QSelect counter exposes the maximum').toContainText('1 / 2')
    await limitedSelect.locator('.q-field__native').click()
    const limitedMenu = page.locator('.q-menu').last()
    await limitedMenu.getByText('Comfortable', { exact: true }).click()
    await expect(limitedSelect.locator('.q-chip'), 'QSelect adds values up to max-values').toHaveCount(2)
    await expect(limitedSelect.locator('.q-field__bottom')).toContainText('2 / 2')
    await limitedMenu.getByText('Touch', { exact: true }).click()
    await expect(limitedSelect.locator('.q-chip'), 'QSelect blocks values beyond max-values').toHaveCount(2)
  })

  test('forms and pickers render Fluent, Ink, and One in both resolved modes', async ({ page }) => {
    await page.goto('/#catalog')
    for (const mode of ['light', 'dark'] as const) {
      for (const variant of MATRIX_VARIANTS) {
        await applyTheme(page, mode, variant)
        const primary = await resolvedColor(page, '--qds-color-primary')
        await expect(page.locator('[data-test="qds-catalog-input-error"] .q-field')).toBeVisible()
        await expect(page.locator('[data-test="qds-catalog-file-readonly"] .q-file')).toHaveClass(/q-field--readonly/)
        await expect(page.locator('[data-test="qds-catalog-file-disabled"] .q-file')).toHaveClass(/q-field--disabled/)
        await expect(page.locator('[data-test="qds-catalog-date"] .q-date__header')).toBeVisible()
        await expect(page.locator('[data-test="qds-catalog-time"] .q-time__container-child')).toBeVisible()
        expect.soft(await computed(page, '[data-test="qds-catalog-input-error"] .q-field__control', 'border-radius'), `${mode}/${variant} field radius`).not.toBe('0px')
        expect.soft(await computedPseudo(page, '[data-test="qds-catalog-input-error"] .q-field__control', '::after', 'border-top-color'), `${mode}/${variant} error outline is semantic`).not.toBe('rgba(0, 0, 0, 0)')
        expect.soft(await computedPseudo(page, '[data-test="qds-catalog-file-readonly"] .q-field__control', '::before', 'border-top-style'), `${mode}/${variant} QFile readonly outline is distinct`).toBe('dashed')
        expect.soft(await computed(page, '[data-test="qds-catalog-file-disabled"] .q-field__control', 'background-color'), `${mode}/${variant} QFile disabled surface remains visible`).not.toBe('rgba(0, 0, 0, 0)')
        expect.soft(await page.locator('[data-test="qds-catalog-date"]').getByRole('button', { name: '17', exact: true }).evaluate((el) => getComputedStyle(el).backgroundColor), `${mode}/${variant} selected date uses the active primary`).toBe(primary)
        expect.soft(await computed(page, '[data-test="qds-catalog-time"] .q-time__clock-position--active', 'background-color'), `${mode}/${variant} active time uses the active primary`).toBe(primary)
        if (variant === 'ink') {
          expect.soft(await page.locator('body').evaluate((el) => getComputedStyle(el).getPropertyValue('--qds-surface-positive-soft').trim()), `${mode}/ink has a pastel semantic role surface`).toBe(mode === 'light' ? '#d9f1e4' : '#30493e')
        }
        if (variant === 'mobile') {
          expect.soft(await computed(page, '[data-test="qds-catalog-input-error"] .q-field__control', 'min-height'), `${mode}/One fields retain the label-safe 48px field height`).toBe('48px')
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
    const tabContentBox = await page.locator('.gallery-tabs .q-tabs__content').boundingBox()
    const leftArrow = page.locator('.gallery-tabs .q-tabs__arrow--left')
    const rightArrow = page.locator('.gallery-tabs .q-tabs__arrow--right')
    const leftArrowBox = await leftArrow.isVisible() ? await leftArrow.boundingBox() : null
    const rightArrowBox = await rightArrow.isVisible() ? await rightArrow.boundingBox() : null
    if (activeTabBox && tabsBox) {
      const visibleLeft = leftArrowBox ? leftArrowBox.x + leftArrowBox.width : tabsBox.x
      const visibleRight = rightArrowBox ? rightArrowBox.x : tabsBox.x + tabsBox.width
      if (tabContentBox) {
        expect.soft(tabContentBox.x, 'mobile tab content reserves the left scroll-arrow lane').toBeGreaterThanOrEqual(visibleLeft - 1)
        expect.soft(tabContentBox.x + tabContentBox.width, 'mobile tab content reserves the right scroll-arrow lane').toBeLessThanOrEqual(visibleRight + 1)
      }
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

  test('forms retain logical RTL affordances and reduce motion when requested', async ({ page }) => {
    await page.goto('/#catalog')
    await applyTheme(page, 'light', 'fluent')
    await page.evaluate(() => { document.documentElement.dir = 'rtl' })

    const affordances = page.locator('[data-test="qds-catalog-file-affordances"] .q-file')
    const prependBox = await affordances.locator('.q-field__prepend').boundingBox()
    const appendBox = await affordances.locator('.q-field__append').boundingBox()
    const affordanceControlBox = await affordances.locator('.q-field__control').boundingBox()
    if (prependBox && appendBox && affordanceControlBox) {
      expect.soft(prependBox.x, 'RTL QFile prepend stays within the logical field frame').toBeGreaterThanOrEqual(affordanceControlBox.x)
      expect.soft(appendBox.x + appendBox.width, 'RTL QFile append stays within the logical field frame').toBeLessThanOrEqual(affordanceControlBox.x + affordanceControlBox.width)
    }

    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect.soft(
      Number.parseFloat(await computed(page, '[data-test="qds-catalog-file-multiple"] .q-chip__icon--remove', 'transition-duration')),
      'QFile chip controls respect reduced motion',
    ).toBeLessThanOrEqual(0.01)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.evaluate(() => { document.documentElement.removeAttribute('dir') })
  })

  test('Terminal and Ink dark selected date/time use semantic on-primary text, not white', async ({ page }) => {
    await page.goto('/#catalog')

    // Terminal light: primary is yellow (#fcc40d), on-primary should be dark (#0d0d0c)
    await applyTheme(page, 'light', 'terminal')
    const terminalLightOnPrimary = await resolvedColor(page, '--qds-text-on-primary')
    const terminalLightSelectedDate = page.locator('[data-test="qds-catalog-date"]').getByRole('button', { name: '17', exact: true })
    await expect(terminalLightSelectedDate).toBeVisible()
    expect.soft(
      await terminalLightSelectedDate.evaluate((el) => getComputedStyle(el as Element).color),
      'Terminal light selected date uses dark on-primary text, not white',
    ).toBe(terminalLightOnPrimary)
    expect.soft(
      await terminalLightSelectedDate.evaluate((el) => getComputedStyle(el as Element).color),
      'Terminal light selected date text is not white',
    ).not.toBe('rgb(255, 255, 255)')

    const terminalLightActiveTime = page.locator('[data-test="qds-catalog-time"] .q-time__clock-position--active').first()
    await expect(terminalLightActiveTime).toBeVisible()
    expect.soft(
      await terminalLightActiveTime.evaluate((el) => getComputedStyle(el as Element).color),
      'Terminal light active time uses dark on-primary text, not white',
    ).toBe(terminalLightOnPrimary)
    expect.soft(
      await terminalLightActiveTime.evaluate((el) => getComputedStyle(el as Element).color),
      'Terminal light active time text is not white',
    ).not.toBe('rgb(255, 255, 255)')

    // Terminal dark: primary is still yellow, on-primary should be dark (#0d0f12)
    await applyTheme(page, 'dark', 'terminal')
    const terminalDarkOnPrimary = await resolvedColor(page, '--qds-text-on-primary')
    const terminalDarkSelectedDate = page.locator('[data-test="qds-catalog-date"]').getByRole('button', { name: '17', exact: true })
    await expect(terminalDarkSelectedDate).toBeVisible()
    expect.soft(
      await terminalDarkSelectedDate.evaluate((el) => getComputedStyle(el as Element).color),
      'Terminal dark selected date uses dark on-primary text, not white',
    ).toBe(terminalDarkOnPrimary)
    expect.soft(
      await terminalDarkSelectedDate.evaluate((el) => getComputedStyle(el as Element).color),
      'Terminal dark selected date text is not white',
    ).not.toBe('rgb(255, 255, 255)')

    const terminalDarkActiveTime = page.locator('[data-test="qds-catalog-time"] .q-time__clock-position--active').first()
    await expect(terminalDarkActiveTime).toBeVisible()
    expect.soft(
      await terminalDarkActiveTime.evaluate((el) => getComputedStyle(el as Element).color),
      'Terminal dark active time uses dark on-primary text, not white',
    ).toBe(terminalDarkOnPrimary)
    expect.soft(
      await terminalDarkActiveTime.evaluate((el) => getComputedStyle(el as Element).color),
      'Terminal dark active time text is not white',
    ).not.toBe('rgb(255, 255, 255)')

    // Ink dark: primary is light cream (#f0e9db), on-primary should be dark (#25231f)
    await applyTheme(page, 'dark', 'ink')
    const inkDarkOnPrimary = await resolvedColor(page, '--qds-text-on-primary')
    const inkDarkSelectedDate = page.locator('[data-test="qds-catalog-date"]').getByRole('button', { name: '17', exact: true })
    await expect(inkDarkSelectedDate).toBeVisible()
    expect.soft(
      await inkDarkSelectedDate.evaluate((el) => getComputedStyle(el as Element).color),
      'Ink dark selected date uses dark on-primary text, not white',
    ).toBe(inkDarkOnPrimary)
    expect.soft(
      await inkDarkSelectedDate.evaluate((el) => getComputedStyle(el as Element).color),
      'Ink dark selected date text is not white',
    ).not.toBe('rgb(255, 255, 255)')

    const inkDarkActiveTime = page.locator('[data-test="qds-catalog-time"] .q-time__clock-position--active').first()
    await expect(inkDarkActiveTime).toBeVisible()
    expect.soft(
      await inkDarkActiveTime.evaluate((el) => getComputedStyle(el as Element).color),
      'Ink dark active time uses dark on-primary text, not white',
    ).toBe(inkDarkOnPrimary)
    expect.soft(
      await inkDarkActiveTime.evaluate((el) => getComputedStyle(el as Element).color),
      'Ink dark active time text is not white',
    ).not.toBe('rgb(255, 255, 255)')
  })
})
