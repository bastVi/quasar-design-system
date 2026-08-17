import { expect, test, type Locator, type Page } from '@playwright/test'
import { applyTheme, computed, customProperty, resolvedColor } from './helpers'

type Mode = 'light' | 'dark'

async function bounds(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height }
  })
}

function expectContained(inner: Awaited<ReturnType<typeof bounds>>, outer: Awaited<ReturnType<typeof bounds>>, message: string) {
  expect.soft(inner.top, `${message}: top`).toBeGreaterThanOrEqual(outer.top - 1)
  expect.soft(inner.bottom, `${message}: bottom`).toBeLessThanOrEqual(outer.bottom + 1)
  expect.soft(inner.left, `${message}: left`).toBeGreaterThanOrEqual(outer.left - 1)
  expect.soft(inner.right, `${message}: right`).toBeLessThanOrEqual(outer.right + 1)
}

async function expectFieldGeometry(page: Page, hook: string) {
  const fixture = page.locator(`[data-test="${hook}"]`)
  const field = fixture.locator(':scope > .q-field')
  const control = field.locator('.q-field__control')
  const label = field.locator('.q-field__label')
  const native = field.locator('.q-field__native')
  const controlBounds = await bounds(control)

  await expect(label).toBeVisible()
  await expect(native).toBeVisible()
  expectContained(await bounds(label), controlBounds, `${hook} label stays in its control`)
  expectContained(await bounds(native), controlBounds, `${hook} value stays in its control`)

  const labelBounds = await bounds(label)
  const nativeBounds = await bounds(native)
  const nativePaddingTop = await native.evaluate((el) => Number.parseFloat(getComputedStyle(el).paddingTop))
  const floated = await field.evaluate((element) => (
    element.classList.contains('q-field--float') || element.classList.contains('q-field--focused')
  ))

  if (floated) {
    // Floated labels reserve the upper band; values begin below that band.
    expect.soft(labelBounds.bottom, `${hook} floated label stays above value text`).toBeLessThanOrEqual(nativeBounds.top + nativePaddingTop + 0.5)
  } else {
    // Empty fields use the Fluent/Quasar floating-label rest state: the label
    // is centered in the control because there is no value text to separate.
    const controlCenter = controlBounds.top + controlBounds.height / 2
    const labelCenter = labelBounds.top + labelBounds.height / 2
    expect.soft(Math.abs(labelCenter - controlCenter), `${hook} empty label is vertically centered`).toBeLessThanOrEqual(1)
  }

  return { fixture, field, control, native, controlBounds }
}

async function expectMarginalSvgCentered(page: Page, hook: string, tolerancePx = 0.5) {
  const fixture = page.locator(`[data-test="${hook}"]`)
  const control = fixture.locator(':scope > .q-field .q-field__control')
  const svg = control.locator('.q-field__marginal svg').first()
  await expect(svg).toBeVisible()
  const controlBounds = await bounds(control)
  const svgBounds = await bounds(svg)
  const controlCenterY = controlBounds.top + controlBounds.height / 2
  const svgCenterY = svgBounds.top + svgBounds.height / 2
  expect.soft(
    Math.abs(controlCenterY - svgCenterY),
    `${hook} marginal SVG centres vertically within its control (<=${tolerancePx}px)`,
  ).toBeLessThanOrEqual(tolerancePx)
}

async function expectErrorBelowControl(page: Page, hook: string) {
  const fixture = page.locator(`[data-test="${hook}"]`)
  const control = fixture.locator(':scope > .q-field .q-field__control')
  const messages = fixture.locator(':scope > .q-field .q-field__messages')
  await expect(messages).toBeVisible()
  const controlBounds = await bounds(control)
  const messagesBounds = await bounds(messages)
  expect.soft(
    messagesBounds.top,
    `${hook} error messages start at or below the control bottom`,
  ).toBeGreaterThanOrEqual(controlBounds.bottom - 0.5)
}

test.describe('Fluent control geometry and Phosphor icon contract', () => {
  for (const mode of ['light', 'dark'] as const satisfies readonly Mode[]) {
    test(`${mode} keeps field values, labels, chips, and error affordances contained`, async ({ page }) => {
      await page.goto('/#components')
      await applyTheme(page, mode, 'fluent')

      const input = await expectFieldGeometry(page, 'qds-control-input')
      const filled = await expectFieldGeometry(page, 'qds-control-input-filled')
      const select = await expectFieldGeometry(page, 'qds-control-select')
      const dense = await expectFieldGeometry(page, 'qds-control-select-dense')
      const disabled = await expectFieldGeometry(page, 'qds-control-input-disabled')
      const error = await expectFieldGeometry(page, 'qds-control-input-error')

      expect.soft(input.controlBounds.height, 'normal input reserves a label and value band').toBeCloseTo(48, 0)
      expect.soft(filled.controlBounds.height, 'filled input reserves a label and value band').toBeCloseTo(48, 0)
      expect.soft(select.controlBounds.height, 'single select does not grow to chip height').toBeCloseTo(48, 0)
      expect.soft(dense.controlBounds.height, 'dense select follows the compact field height').toBeCloseTo(40, 0)
      expect.soft(disabled.controlBounds.height, 'disabled input keeps the normal field height').toBeCloseTo(48, 0)
      await expect(error.field.locator('.q-field__messages')).toContainText('Required field')
      await expect(error.field.locator('.q-field__append .q-icon svg')).toBeVisible()

      // Error content sits below the control, not overlapping it.
      await expectErrorBelowControl(page, 'qds-control-input-error')

      // Marginal SVG icons (error, dropdown arrow) centre vertically within their control.
      await expectMarginalSvgCentered(page, 'qds-control-input-error')
      await expectMarginalSvgCentered(page, 'qds-control-select')

      const multiple = await expectFieldGeometry(page, 'qds-control-select-multiple')
      await expect(multiple.field.locator('.q-chip')).toHaveCount(2)
      expect.soft(multiple.controlBounds.height, 'multi-select grows only for its chip content').toBeGreaterThanOrEqual(select.controlBounds.height)
      expect.soft(await computed(page, '[data-test="qds-control-select-multiple"] .q-field__native', 'flex-wrap'), 'multi-select native container permits chip wrapping').toBe('wrap')

      await multiple.field.evaluate((element) => { (element as HTMLElement).style.width = '9rem' })
      const chipRows = await multiple.field.locator('.q-chip').evaluateAll((chips) => chips.map((chip) => Math.round(chip.getBoundingClientRect().top)))
      expect.soft(new Set(chipRows).size, 'constrained multi-select wraps chips onto rows').toBeGreaterThan(1)
      for (const chip of await multiple.field.locator('.q-chip').all()) {
        expectContained(await bounds(chip), await bounds(multiple.control), 'multi-select chip stays inside its control')
      }
    })
  }

  for (const mode of ['light', 'dark'] as const satisfies readonly Mode[]) {
    test(`${mode} standalone outlined field label masks the outline with the public label-bg token`, async ({ page }) => {
      await page.goto('/#components')
      await applyTheme(page, mode, 'fluent')

      const fixture = page.locator('[data-test="qds-control-input-standalone"]')
      const label = fixture.locator('.q-field__label')
      await expect(label).toBeVisible()

      const labelBg = await computed(page, '[data-test="qds-control-input-standalone"] .q-field__label', 'background-color')
      expect.soft(labelBg, `${mode} standalone outlined label background is not transparent`).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/)

      const tokenBg = await customProperty(page, '--qds-field-label-bg')
      expect.soft(tokenBg, `${mode} --qds-field-label-bg resolves to a non-empty value`).not.toBe('')

      // The label's resolved background must match the token's resolved value.
      const surfaceResolved = await resolvedColor(page, '--qds-field-label-bg')
      expect.soft(labelBg, `${mode} label background matches the resolved --qds-field-label-bg token`).toBe(surfaceResolved)
    })
  }

  test('uses the shared chip scale, leaves standard buttons borderless, and keeps outline explicit', async ({ page }) => {
    await page.goto('/#components')
    await applyTheme(page, 'light', 'fluent')

    const chip = page.locator('.q-tab-panel .q-chip').first()
    const badge = page.locator('.q-tab-panel .q-badge').first()
    const chipMinimum = Number.parseFloat(await computed(page, '.q-tab-panel .q-chip', 'min-height'))
    const badgeMinimum = Number.parseFloat(await computed(page, '.q-tab-panel .q-badge', 'min-height'))

    expect.soft((await bounds(chip)).height, 'QChip consumes the chip minimum height').toBeGreaterThanOrEqual(chipMinimum)
    expect.soft((await bounds(badge)).height, 'QBadge remains the compact status treatment').toBeLessThan((await bounds(chip)).height)
    expect.soft(chipMinimum, 'chip token is larger than the compact badge token').toBeGreaterThan(badgeMinimum)
    expect.soft(await customProperty(page, '--qds-chip-min-height')).toBe('1.875rem')
    expect.soft(await customProperty(page, '--qds-chip-dense-min-height')).toBe('1.625rem')
    expect.soft(await customProperty(page, '--qds-chip-dense-padding')).toBe('.125rem .5rem')
    expect.soft(await customProperty(page, '--qds-badge-min-height')).toBe('1.375rem')
    expect.soft(await computed(page, '.q-tab-panel .q-chip', 'padding-top'), 'QChip consumes token padding').toBe('4px')
    const denseChipMinimum = Number.parseFloat(await customProperty(page, '--qds-chip-dense-min-height'))
    expect.soft(denseChipMinimum * 16, 'dense chip token sits between normal chip and badge').toBeGreaterThan(badgeMinimum)
    expect.soft(denseChipMinimum * 16, 'dense chip token is smaller than normal chip').toBeLessThan(chipMinimum)
    expect.soft(await computed(page, '[data-test="qds-control-standard-button"]', 'border-top-width'), 'standard button has no implicit resting border').toBe('0px')
    expect.soft(await computed(page, '[data-test="qds-control-outline-button"]', 'border-top-width'), 'outline button keeps its explicit border').toBe('1px')
  })

  test('renders control arrows, remove affordances, ratings, and expansion chevrons as SVG icons on aligned baselines', async ({ page }) => {
    await page.goto('/#icons')
    await applyTheme(page, 'light', 'fluent')

    const iconControls = [
      page.locator('[data-test="qds-icon-dropdown"] .q-btn-dropdown__arrow'),
      page.locator('[data-test="qds-icon-removable-chip"] .q-chip__icon--remove'),
      page.locator('[data-test="qds-icon-select"] .q-field__append .q-icon'),
      page.locator('[data-test="qds-icon-rating"] .q-rating__icon').first(),
      page.locator('[data-test="qds-icon-expansion"] .q-expansion-item__toggle-icon'),
    ]
    for (const control of iconControls) {
      await expect(control).toBeVisible()
      await expect(control.locator('svg')).toBeVisible()
      expect.soft((await control.textContent())?.trim(), 'control icon has no Material ligature text').toBe('')
    }
    await expect(page.locator('[data-test="qds-icon-removable-chip"]')).toContainText('Remove tag')

    const dropdown = page.locator('[data-test="qds-icon-dropdown"] .q-btn-dropdown')
    const dropdownArrow = dropdown.locator('.q-btn-dropdown__arrow')
    const [dropdownBounds, dropdownArrowBounds] = await Promise.all([bounds(dropdown), bounds(dropdownArrow)])
    expect.soft(Math.abs((dropdownBounds.top + (dropdownBounds.height / 2)) - (dropdownArrowBounds.top + (dropdownArrowBounds.height / 2))), 'dropdown arrow centres on its button baseline').toBeLessThanOrEqual(1)

    const expansionRow = page.locator('[data-test="qds-icon-expansion"] .q-item').first()
    const expansionIcon = page.locator('[data-test="qds-icon-expansion"] .q-expansion-item__toggle-icon')
    const [expansionRowBounds, expansionIconBounds] = await Promise.all([bounds(expansionRow), bounds(expansionIcon)])
    expect.soft(Math.abs((expansionRowBounds.top + (expansionRowBounds.height / 2)) - (expansionIconBounds.top + (expansionIconBounds.height / 2))), 'expansion chevron centres on its row').toBeLessThanOrEqual(1)

    await page.getByRole('tab', { name: 'Catalog' }).click()
    for (const hook of ['qds-rating-sm', 'qds-rating-md', 'qds-rating-lg']) {
      const rating = page.locator(`[data-test="${hook}"]`)
      const ratingIcon = rating.locator('.q-rating__icon-container').first()
      await expect(ratingIcon.locator('svg')).toBeVisible()
      const [ratingBounds, ratingIconBounds] = await Promise.all([bounds(rating), bounds(ratingIcon)])
      expect.soft(Math.abs((ratingBounds.top + (ratingBounds.height / 2)) - (ratingIconBounds.top + (ratingIconBounds.height / 2))), `${hook} icon centres in its rating control`).toBeLessThanOrEqual(1)
    }
  })

  test('retains control geometry in Ink, One, and Terminal smoke states', async ({ page }) => {
    await page.goto('/#components')
    for (const variant of ['ink', 'mobile', 'terminal'] as const) {
      await applyTheme(page, 'dark', variant)
      const input = await expectFieldGeometry(page, 'qds-control-input')
      const multiple = await expectFieldGeometry(page, 'qds-control-select-multiple')
      await expect(multiple.field.locator('.q-chip').first()).toBeVisible()
      expect.soft(input.controlBounds.height, `${variant} standard input retains a visible control height`).toBeGreaterThanOrEqual(variant === 'mobile' ? 44 : 32)
    }
  })
})
