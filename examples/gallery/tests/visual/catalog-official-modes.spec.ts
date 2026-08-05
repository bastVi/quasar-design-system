import { expect, test, type Page } from '@playwright/test'
import { applyTheme, computed, resolvedColor } from './helpers'

async function openComponents(page: Page) {
  await page.goto('/#components')
  await page.getByRole('tab', { name: 'Components' }).click()
}

async function openCatalog(page: Page) {
  await page.goto('/#catalog')
  await page.getByRole('tab', { name: 'Catalog' }).click()
}

function durationInMs(value: string): number {
  const trimmed = value.trim()
  if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed)
  if (trimmed.endsWith('s')) return Number.parseFloat(trimmed) * 1000
  return Number.parseFloat(trimmed)
}

test.describe('QDS official stable data and layout modes', () => {
  test('QTable exposes dark, custom controls, visible columns, fullscreen, and chrome-free modes', async ({ page }) => {
    await openComponents(page)
    await applyTheme(page, 'light', 'fluent')

    const table = page.locator('[data-test="qds-table-official-modes"]')
    await expect(table).toHaveClass(/q-table--dark/)
    await expect(table).toHaveCSS('background-color', await resolvedColor(page, '--qds-text-strong'))
    await expect(table.getByLabel('Visible table columns')).toBeVisible()
    await expect(table.getByRole('button', { name: 'View table fullscreen' })).toBeVisible()
    await expect(table.locator('.q-table__top')).toContainText('Explicit dark mode')
    await expect(table.locator('.q-table__bottom')).toContainText('Showing 3 audited surfaces')
    await expect(table.locator('th')).toHaveCount(2)

    await table.getByLabel('Visible table columns').click()
    await page.getByRole('option', { name: 'State' }).click()
    await page.keyboard.press('Escape')
    await expect(table.locator('th')).toHaveCount(3)

    await table.getByRole('button', { name: 'View table fullscreen' }).click()
    await expect(table).toHaveClass(/fullscreen/)
    expect(await computed(page, '[data-test="qds-table-official-modes"]', 'border-top-left-radius')).toBe('0px')
    await table.getByRole('button', { name: 'Exit table fullscreen' }).click()
    await expect(table).not.toHaveClass(/fullscreen/)

    const noChrome = page.locator('[data-test="qds-table-no-chrome"]')
    await expect(noChrome.locator('thead')).toHaveCount(0)
    await expect(noChrome.locator('.q-table__bottom')).toHaveCount(0)
  })

  test('QTree represents dark and connector-free public modes', async ({ page }) => {
    await openCatalog(page)
    await applyTheme(page, 'dark', 'fluent')

    const tree = page.locator('[data-test="qds-tree-dark-no-connectors"]')
    await expect(tree).toHaveClass(/q-tree--dark/)
    await expect(tree).toHaveClass(/q-tree--no-connectors/)
    await expect(tree.locator('.q-tree__node-header.q-tree__node--selected')).toContainText('Contrast checks')
    expect(await computed(page, '[data-test="qds-tree-dark-no-connectors"] .q-tree__node-header', 'display', '::before')).toBe('none')
  })

  for (const variant of ['ink', 'mobile'] as const) {
    test(`keeps explicit QTable and QTree dark in light/${variant}`, async ({ page }) => {
      await openComponents(page)
      await applyTheme(page, 'light', variant)

      const table = page.locator('[data-test="qds-table-official-modes"]')
      await expect(table).toHaveClass(/q-table--dark/)
      await expect(table).toHaveCSS('background-color', await resolvedColor(page, '--qds-text-strong'))
      const darkHeaderBackground = await table.evaluate((element) => {
        const sample = document.createElement('div')
        sample.style.backgroundColor = getComputedStyle(element).getPropertyValue('--qds-table-header-bg')
        element.append(sample)
        const color = getComputedStyle(sample).backgroundColor
        sample.remove()
        return color
      })
      await expect(table.locator('thead tr')).toHaveCSS('background-color', darkHeaderBackground)
      await expect(table.locator('th').first()).toHaveCSS('color', await resolvedColor(page, '--qds-surface-0'))
      await expect(table.locator('th').first()).toHaveCSS(
        'border-bottom-color',
        await table.locator('td').first().evaluate((element) => getComputedStyle(element).borderBottomColor),
      )
      await expect(table.locator('td').first()).toHaveCSS('color', await resolvedColor(page, '--qds-surface-0'))

      await openCatalog(page)
      const tree = page.locator('[data-test="qds-tree-dark-no-connectors"]')
      await expect(tree).toHaveClass(/q-tree--dark/)
      await expect(tree).toHaveCSS('background-color', await resolvedColor(page, '--qds-text-strong'))
      await expect(tree.locator('.q-tree__node-header').first()).toHaveCSS('color', await resolvedColor(page, '--qds-surface-0'))
    })
  }

  test('QPagination input mode changes page and keeps QDS geometry in mobile', async ({ page }) => {
    await openComponents(page)
    await applyTheme(page, 'light', 'mobile')

    const pagination = page.locator('[data-test="qds-pagination-input"]')
    await expect(page.getByRole('group', { name: 'Input mode pagination' })).toBeVisible()
    const input = pagination.locator('input[type="number"]')
    await expect(input).toBeVisible()
    await input.fill('5')
    await input.press('Enter')
    await expect(page.locator('[data-test="qds-pagination-input-current-page"]')).toHaveText('Current page: 5')
    await expect(input).toHaveAttribute('placeholder', '5 / 7')
    await expect(pagination).toHaveCSS('background-color', await resolvedColor(page, '--qds-surface-focus-block'))
    expect(await computed(page, '[data-test="qds-pagination-input"]', 'border-top-left-radius')).not.toBe('0px')
    await expect(input).toHaveCSS('color', await resolvedColor(page, '--qds-text'))
  })

  test('drawer containers preserve seamless and mini-to-overlay states without behavior automation', async ({ page }) => {
    await openComponents(page)
    await applyTheme(page, 'light', 'ink')

    const seamless = page.locator('[data-test="qds-drawer-seamless"]')
    await expect(seamless).toBeVisible()
    expect(await computed(page, '[data-test="qds-drawer-seamless"]', 'border-inline-end-width')).toBe('0px')

    const miniOverlay = page.locator('[data-test="qds-drawer-mini-overlay"]').locator('..')
    await expect(miniOverlay).toHaveClass(/q-drawer--mini/)
    await expect(miniOverlay).toHaveClass(/q-drawer--on-top/)
    await page.getByRole('button', { name: 'Expand mini drawer' }).click()
    await expect(miniOverlay).toHaveClass(/q-drawer--standard/)
    await expect(miniOverlay).toHaveClass(/q-drawer--on-top/)
    await expect(page.getByRole('button', { name: 'Collapse mini drawer' })).toBeVisible()
  })

  for (const [mode, variant] of [
    ['dark', 'fluent'],
    ['light', 'ink'],
    ['light', 'mobile'],
    ['dark', 'terminal'],
  ] as const) {
    test(`renders stable data/layout modes for ${mode}/${variant}`, async ({ page }) => {
      await openComponents(page)
      await applyTheme(page, mode, variant)
      await expect(page.locator('[data-test="qds-table-official-modes"]')).toBeVisible()
      await expect(page.locator('[data-test="qds-drawer-seamless"]')).toBeVisible()
      await expect(page.locator('[data-test="qds-drawer-mini-overlay"]')).toBeVisible()

      await openCatalog(page)
      await expect(page.locator('[data-test="qds-tree-dark-no-connectors"]')).toBeVisible()
    })
  }

  test('keeps the stable fixtures legible in RTL and reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openComponents(page)
    await applyTheme(page, 'light', 'mobile')
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl'
      document.body.dir = 'rtl'
    })

    const drawer = page.locator('[data-test="qds-drawer-mini-overlay"]').locator('..')
    await expect(drawer).toHaveClass(/q-drawer--mini/)
    expect(durationInMs(await computed(page, '[data-test="qds-table-official-modes"]', 'transition-duration'))).toBeLessThanOrEqual(1)
  })
})
