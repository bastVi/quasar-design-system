import { expect, test, type Page } from '@playwright/test'

async function forceTheme(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { __qdsGallery?: unknown }).__qdsGallery))
  await page.evaluate(() => {
    const ds = (window as unknown as { __qdsGallery: { setMode: (mode: 'light') => void; setVariant: (variant: 'fluent') => void } }).__qdsGallery
    ds.setMode('light')
    ds.setVariant('fluent')
  })
}

test.describe('QDS optional QWindow extension', () => {
  test('mounts the optional QWindow wrapper with QDS BEM chrome', async ({ page }) => {
    await page.goto('/#window')
    await forceTheme(page)

    await expect(page.getByRole('tab', { name: 'Window' })).toHaveAttribute('aria-selected', 'true')

    const windowShell = page.locator('.qds-window').filter({ hasText: 'QDS window shell' })
    await expect(windowShell).toBeVisible()
    await expect(windowShell).toHaveClass(/qds-window/)
    await expect(windowShell).toHaveClass(/qds-window--embedded/)

    await expect(windowShell.locator('.qds-window__titlebar')).toBeVisible()
    await expect(windowShell.locator('.qds-window__title')).toContainText('QDS window shell')
    await expect(windowShell.locator('.qds-window__actions')).toBeVisible()
    await expect(windowShell.locator('.qds-window__action--close')).toBeVisible()

    const styles = await windowShell.evaluate((el) => {
      const shell = getComputedStyle(el as Element)
      const titlebar = getComputedStyle((el as Element).querySelector('.qds-window__titlebar') as Element)
      return {
        background: shell.backgroundColor,
        borderRadius: shell.borderRadius,
        titlebarBackground: titlebar.backgroundColor,
      }
    })

    expect.soft(styles.background, 'QDS QWindow shell receives tokenized surface').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(parseFloat(styles.borderRadius), 'QDS QWindow shell receives tokenized radius').toBeGreaterThan(0)
    expect.soft(styles.titlebarBackground, 'QDS QWindow titlebar receives tokenized toolbar surface').not.toBe('rgba(0, 0, 0, 0)')
  })
})
