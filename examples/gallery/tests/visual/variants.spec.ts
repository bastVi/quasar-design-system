import { expect, test, type Page } from '@playwright/test'

async function forceLightMode(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { __qdsGallery?: unknown }).__qdsGallery))
  await page.evaluate(() => {
    ;(window as unknown as { __qdsGallery: { setMode: (mode: 'light') => void } }).__qdsGallery.setMode('light')
  })
}

test.describe('QDS variant distinctiveness lab', () => {
  test('mounts variant comparison cards with distinct typography and pagination geometry', async ({ page }) => {
    await page.goto('/#variants')
    await forceLightMode(page)

    await expect(page.getByRole('tab', { name: 'Variants' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('[data-test="qds-variant-card-fluent"]')).toBeVisible()
    await expect(page.locator('[data-test="qds-variant-card-air"]')).toBeVisible()
    await expect(page.locator('[data-test="qds-variant-card-mobile"]')).toContainText('One')
    await expect(page.locator('[data-test="qds-variant-card-feather"]')).toBeVisible()
    await expect(page.locator('[data-test="qds-variant-card-terminal"]')).toBeVisible()

    const readVariant = (selector: string) => page.locator(selector).evaluate((el) => {
      const card = el as Element
      const firstRow = card.querySelector('.q-list .q-item')
      const nestedCard = card.querySelector('.variant-card__nested')
      const table = card.querySelector('.q-markup-table')
      const tableCell = table?.querySelector('td')

      return {
        itemMinHeight: firstRow ? getComputedStyle(firstRow as Element).minHeight : '',
        itemRadius: firstRow ? getComputedStyle(firstRow as Element).borderRadius : '',
        nestedShadow: nestedCard ? getComputedStyle(nestedCard as Element).boxShadow : '',
        nestedBackdrop: nestedCard ? getComputedStyle(nestedCard as Element).backdropFilter : '',
        tableShadow: table ? getComputedStyle(table as Element).boxShadow : '',
        tableBorder: table ? getComputedStyle(table as Element).borderTopColor : '',
        tableCellBorder: tableCell ? getComputedStyle(tableCell as Element).borderTopColor : '',
      }
    })

    const fluentVars = await readVariant('[data-test="qds-variant-card-fluent"]')
    const airVars = await readVariant('[data-test="qds-variant-card-air"]')
    const oneVars = await readVariant('[data-test="qds-variant-card-mobile"]')
    const featherVars = await readVariant('[data-test="qds-variant-card-feather"]')

    expect.soft(parseFloat(oneVars.itemMinHeight), 'One list rows are touch-forward').toBeGreaterThan(parseFloat(fluentVars.itemMinHeight))
    expect.soft(parseFloat(oneVars.itemRadius), 'One list rows are rounder').toBeGreaterThanOrEqual(14)
    expect.soft(airVars.nestedShadow, 'Air nested chrome is shadowless').toBe('none')
    expect.soft(airVars.nestedBackdrop, 'Air nested chrome disables nested blur').toBe('none')
    expect.soft(featherVars.nestedShadow, 'Feather nested card is matte').toBe('none')
    expect.soft(featherVars.tableShadow, 'Feather table is document-flat').toBe('none')
    expect.soft(featherVars.tableBorder, 'Feather table keeps a paper-rule border').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(featherVars.tableCellBorder, 'Feather table cells keep paper-rule separators').not.toBe('rgba(0, 0, 0, 0)')

    const terminal = page.locator('[data-test="qds-variant-card-terminal"]')
    const terminalVars = await terminal.evaluate((el) => {
      const cs = getComputedStyle(el as Element)
      const button = (el as Element).querySelector('.q-btn')
      const pagination = Array.from((el as Element).querySelectorAll('.q-pagination .q-btn'))
      const paginationBoxes = pagination.map((item) => {
        const rect = item.getBoundingClientRect()
        return {
          ariaLabel: item.getAttribute('aria-label') || '',
          text: item.textContent?.trim() || '',
          width: rect.width,
          height: rect.height,
        }
      })

      return {
        font: cs.getPropertyValue('--qds-font-family').trim(),
        displayFont: cs.getPropertyValue('--qds-font-family-display').trim(),
        controlTransform: cs.getPropertyValue('--qds-control-text-transform').trim(),
        buttonTransform: button ? getComputedStyle(button as Element).textTransform : '',
        paginationBoxes,
      }
    })

    expect.soft(terminalVars.font, 'Terminal body font token uses monospace').toContain('ui-monospace')
    expect.soft(terminalVars.displayFont, 'Terminal display font token uses monospace').toContain('ui-monospace')
    expect.soft(terminalVars.controlTransform, 'Terminal controls request uppercase').toBe('uppercase')
    expect.soft(terminalVars.buttonTransform, 'Terminal button text is uppercase').toBe('uppercase')

    const numericButtons = terminalVars.paginationBoxes.filter((box) => /^\d+$/.test(box.text))
    const multiDigit = numericButtons.find((box) => box.text.length > 1)
    const navButtons = terminalVars.paginationBoxes.filter((box) => /^(First|Previous|Next|Last) page$/.test(box.ariaLabel))
    expect.soft(numericButtons.length, 'Terminal pagination exposes numeric pages').toBeGreaterThan(0)
    expect.soft(navButtons.length, 'Terminal pagination exposes nav controls').toBeGreaterThan(0)
    expect.soft(Math.min(...numericButtons.map((box) => box.height)), 'Terminal numeric page height').toBeGreaterThanOrEqual(31)
    expect.soft(Math.max(...navButtons.map((box) => box.width)), 'Terminal nav buttons are compact squares').toBeLessThanOrEqual(34)
    expect.soft(multiDigit?.width ?? 0, 'Terminal multi-digit page can grow past square nav size').toBeGreaterThan(34)
  })
})
