import { test, expect, type Page } from '@playwright/test'

const VARIANTS = ['fluent', 'air', 'mobile', 'feather', 'terminal'] as const

async function forceLightMode(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { __qdsGallery?: unknown }).__qdsGallery))
  await page.evaluate(() => {
    ;(window as unknown as { __qdsGallery: { setMode: (mode: 'light') => void } }).__qdsGallery.setMode('light')
  })
}

test.describe('QDS scene gallery', () => {
  test('hash route mounts scenic variant matrix', async ({ page }) => {
    await page.goto('/#scenes')
    await forceLightMode(page)

    await expect(page.getByRole('tab', { name: 'Scenes' })).toHaveClass(/q-tab--active/)
    await expect(page.locator('[data-test="qds-scenes-section"]')).toBeVisible()

    for (const variant of VARIANTS) {
      const scene = page.locator(`[data-test="qds-scene-${variant}"]`)
      await expect(scene, `${variant} scene frame`).toBeVisible()
      await expect(scene.locator(`[data-test="qds-scene-card-${variant}"]`)).toBeVisible()

      const backgroundImage = await scene.evaluate((el) => getComputedStyle(el).backgroundImage)
      expect.soft(backgroundImage, `${variant} scene uses owned wallpaper`).toContain(
        `/scenes/qds-wallpaper-${variant}.svg`,
      )
    }
  })

  test('Air scene exposes pure SwiftUI-like material tokens', async ({ page }) => {
    await page.goto('/#scenes')
    await forceLightMode(page)

    const air = page.locator('[data-test="qds-scene-air"]')
    await expect(air).toBeVisible()

    const airTokens = await air.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        surfaceGlass: cs.getPropertyValue('--qds-surface-glass').trim(),
        tintRgb: cs.getPropertyValue('--qds-card-acrylic-tint-rgb').trim(),
        tonalOpacity: Number(cs.getPropertyValue('--qds-card-tonal-opacity').trim()),
        fallbackOpacity: Number(cs.getPropertyValue('--qds-card-fallback-tonal-opacity').trim()),
        blur: cs.getPropertyValue('--qds-card-backdrop-blur').trim(),
        saturate: Number(cs.getPropertyValue('--qds-card-backdrop-saturate').trim()),
        cardBorder: cs.getPropertyValue('--qds-card-border').trim(),
        chromeShadow: cs.getPropertyValue('--qds-chrome-shadow').trim(),
      }
    })

    expect.soft(airTokens.surfaceGlass).toMatch(/^rgba\(250, 252, 255, 0?\.78\)$/)
    expect.soft(airTokens.tintRgb).toBe('232, 242, 252')
    expect.soft(airTokens.tonalOpacity).toBeGreaterThanOrEqual(0.07)
    expect.soft(airTokens.tonalOpacity).toBeLessThan(0.1)
    expect.soft(airTokens.fallbackOpacity).toBeGreaterThanOrEqual(0.05)
    expect.soft(airTokens.blur).toBe('1.75rem')
    expect.soft(airTokens.saturate).toBeGreaterThanOrEqual(1.12)
    expect.soft(airTokens.cardBorder).toContain('10%')
    expect.soft(airTokens.chromeShadow).toBe('none')
  })

  test('Feather scene remains paper-first, not glass-first', async ({ page }) => {
    await page.goto('/#scenes')
    await forceLightMode(page)

    const feather = page.locator('[data-test="qds-scene-feather"]')
    await expect(feather).toBeVisible()

    const featherTokens = await feather.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        surface: cs.getPropertyValue('--qds-surface-0').trim(),
        glass: cs.getPropertyValue('--qds-surface-glass').trim(),
        blur: cs.getPropertyValue('--qds-card-backdrop-blur').trim(),
      }
    })

    expect.soft(featherTokens.surface).toBe('#fbf6ea')
    expect.soft(featherTokens.glass).toMatch(/^rgba\(251, 246, 234, 0?\.96\)$/)
    expect.soft(featherTokens.blur).toBe('0')
  })
})
