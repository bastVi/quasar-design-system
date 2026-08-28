import { expect, test } from '@playwright/test'
import { applyTheme, computed, resolvedColor } from './helpers'

test.describe('QDS variant distinctiveness lab', () => {
  test('mounts four canonical comparison cards with deliberate visual systems', async ({ page }) => {
    await page.goto('/#variants')
    await applyTheme(page, 'light', 'fluent')

    await expect(page.getByRole('tab', { name: 'Variants' })).toHaveAttribute('aria-selected', 'true')
    for (const variant of ['fluent', 'ink', 'mobile', 'terminal'] as const) {
      await expect(page.locator(`[data-test="qds-variant-card-${variant}"]`), `${variant} card`).toBeVisible()
      await expect(page.locator(`[data-test="qds-variant-roles-${variant}"]`), `${variant} role fixtures`).toBeVisible()
      await expect(page.locator(`[data-test="qds-variant-progress-${variant}"] .q-linear-progress`), `${variant} progress fixtures`).toHaveCount(2)
    }
    await expect(page.locator('[data-test="qds-variant-card-air"], [data-test="qds-variant-card-feather"]')).toHaveCount(0)

    const fluent = page.locator('[data-test="qds-variant-card-fluent"]')
    expect.soft(await computed(page, '[data-test="qds-variant-card-fluent"] .variant-card__nested', 'backdrop-filter'), 'Fluent content has no blur').toBe('none')
    expect.soft(await computed(page, '[data-test="qds-variant-card-fluent"] .variant-card__nested', 'box-shadow'), 'Fluent content has no resting small shadow').toBe('none')
    expect.soft(await computed(page, '[data-test="qds-variant-card-fluent"] .q-card', 'border-radius'), 'Fluent compact card radius').toBe('8px')
    expect.soft(await fluent.evaluate((el) => getComputedStyle(el).getPropertyValue('--qds-card-border-mix').trim()), 'Fluent uses low-border content').toBe('22%')

    const ink = page.locator('[data-test="qds-variant-card-ink"]')
    const inkTitleFont = await computed(page, '[data-test="qds-variant-card-ink"] .variant-card__title', 'font-family')
    expect.soft(inkTitleFont, 'Ink display uses serif editorial family').toMatch(/Iowan Old Style|Palatino|Georgia/)
    expect.soft(await ink.evaluate((el) => getComputedStyle(el).getPropertyValue('--qds-surface-positive-soft').trim()), 'Ink exposes pastel positive role token').toBe('#d9f1e4')
    expect.soft(await ink.locator('.variant-role--positive').evaluate((el) => getComputedStyle(el).backgroundColor), 'Ink role fixture is painted').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(await computed(page, '[data-test="qds-variant-card-ink"] .variant-card__nested', 'backdrop-filter'), 'Ink is flat, not blurred').toBe('none')
    expect.soft(await computed(page, '[data-test="qds-variant-card-ink"] .variant-card__nested', 'box-shadow'), 'Ink content is matte').toBe('none')

    const one = page.locator('[data-test="qds-variant-card-mobile"]')
    const fluentRow = await fluent.locator('.q-list .q-item').first().evaluate((el) => getComputedStyle(el).minHeight)
    const oneRow = await one.locator('.q-list .q-item').first().evaluate((el) => getComputedStyle(el).minHeight)
    expect.soft(parseFloat(oneRow), 'One list rows are touch-forward').toBeGreaterThanOrEqual(44)
    expect.soft(parseFloat(oneRow), 'One rows exceed Fluent density').toBeGreaterThan(parseFloat(fluentRow))
    expect.soft(await one.evaluate((el) => getComputedStyle(el).getPropertyValue('--qds-surface-focus-block').trim()), 'One focus-block token is available').toBe('#d7e4ff')

    const terminal = page.locator('[data-test="qds-variant-card-terminal"]')
    expect.soft(await terminal.evaluate((el) => getComputedStyle(el).getPropertyValue('--qds-font-family').trim()), 'Terminal body font token is monospace').toContain('ui-monospace')
    expect.soft(await terminal.evaluate((el) => getComputedStyle(el).getPropertyValue('--qds-control-text-transform').trim()), 'Terminal controls request uppercase').toBe('uppercase')
    expect.soft(await computed(page, '[data-test="qds-variant-card-terminal"] .q-btn', 'text-transform'), 'Terminal button renders uppercase').toBe('uppercase')
    expect.soft(await resolvedColor(page, '--qds-color-primary'), 'Fluent primary remains calibrated from source tokens').toBe('rgb(0, 90, 158)')
  })
})
