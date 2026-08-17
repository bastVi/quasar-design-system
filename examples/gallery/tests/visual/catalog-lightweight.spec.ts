import { expect, test } from '@playwright/test'
import { applyTheme, computed, customProperty, resolvedColor } from './helpers'

function durationMs(value: string): number {
  return Math.max(
    ...value.split(',').map((part) => {
      const duration = part.trim()
      return duration.endsWith('ms') ? Number.parseFloat(duration) : Number.parseFloat(duration) * 1_000
    }),
  )
}

test.describe('QDS catalog lightweight primitives gate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#catalog')
    await page.waitForFunction(() => Boolean((window as unknown as { __qdsGallery?: unknown }).__qdsGallery))
    await expect(page.getByRole('tab', { name: 'Catalog' })).toHaveAttribute('aria-selected', 'true')
  })

  test('renders accessible QRating inactive, selected, half, readonly, and disabled states', async ({ page }) => {
    await applyTheme(page, 'light', 'fluent')

    const inactive = page.locator('[data-test="qds-rating-inactive"]')
    const selected = page.locator('[data-test="qds-rating-active"]')
    const half = page.locator('[data-test="qds-rating-half"]')
    const readonly = page.locator('[data-test="qds-rating-readonly"]')
    const disabled = page.locator('[data-test="qds-rating-disabled"]')

    await expect(inactive).toHaveAttribute('role', 'radiogroup')
    await expect(inactive).toHaveAttribute('aria-label', 'Product rating')
    await expect(inactive.getByRole('radio')).toHaveCount(5)
    await expect(inactive.getByRole('radio').first()).toHaveAttribute('aria-label', 'Product rating 1')
    await expect(selected.getByRole('radio').nth(2)).toHaveAttribute('aria-checked', 'true')
    await expect(readonly).toHaveAttribute('aria-readonly', 'true')
    await expect(disabled).toHaveAttribute('aria-disabled', 'true')

    expect(await selected.locator('.q-rating__icon--active').count()).toBe(3)
    expect(await half.locator('.q-rating__icon--active').count()).toBe(3)
    expect(
      await half.locator('.q-rating__icon').nth(2).innerHTML(),
      'half value uses the owned Phosphor half-star glyph rather than the normal star glyph',
    ).not.toBe(await half.locator('.q-rating__icon').first().innerHTML())
    expect(
      await selected.locator('.q-rating__icon').first().innerHTML(),
      'selected value uses the owned Phosphor filled-star glyph',
    ).not.toBe(await inactive.locator('.q-rating__icon').first().innerHTML())

    await expect(inactive.locator('.q-rating__icon').first()).toHaveCSS('opacity', '0.34')
    await expect(selected.locator('.q-rating__icon--active').first()).toHaveCSS('opacity', '1')
    await expect(readonly.locator('.q-rating__icon--active').first()).toHaveCSS('opacity', '0.85')
    await expect(disabled.locator('.q-rating__icon').first()).toHaveCSS('opacity', '0.24')
  })

  test('renders QRating hover preview, no-dimming, and keyboard focus states', async ({ page }) => {
    await applyTheme(page, 'light', 'fluent')

    const active = page.locator('[data-test="qds-rating-active"]')
    const iconContainers = active.locator('.q-rating__icon-container')
    await iconContainers.nth(1).hover()

    await expect(active.locator('.q-rating__icon').nth(1)).toHaveClass(/q-rating__icon--hovered/)
    await expect(active.locator('.q-rating__icon').nth(2)).toHaveClass(/q-rating__icon--exselected/)
    await expect(active.locator('.q-rating__icon--exselected')).toHaveCSS('opacity', '0.72')

    const focusTarget = iconContainers.first()
    await focusTarget.focus()
    await page.keyboard.press('ArrowRight')
    const keyboardFocusTarget = iconContainers.nth(1)
    await expect(keyboardFocusTarget).toBeFocused()
    expect(await keyboardFocusTarget.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid')
    expect(await keyboardFocusTarget.evaluate((element) => getComputedStyle(element).outlineWidth)).toBe('2px')

    const noDimming = page.locator('[data-test="qds-rating-no-dimming"]')
    await expect(noDimming).toHaveClass(/q-rating--no-dimming/)
    await expect(noDimming.locator('.q-rating__icon').first()).toHaveCSS('opacity', '1')
  })

  test('keeps Ink rating state contrast instead of resetting active states', async ({ page }) => {
    await applyTheme(page, 'light', 'ink')

    await expect(page.locator('[data-test="qds-rating-inactive"] .q-rating__icon').first()).toHaveCSS('opacity', '0.28')
    await expect(page.locator('[data-test="qds-rating-active"] .q-rating__icon--active').first()).toHaveCSS('opacity', '1')
    await expect(page.locator('[data-test="qds-rating-readonly"] .q-rating__icon--active').first()).toHaveCSS('opacity', '0.85')
    await expect(page.locator('[data-test="qds-rating-disabled"] .q-rating__icon').first()).toHaveCSS('opacity', '0.2')
    await expect(page.locator('[data-test="qds-rating-no-dimming"] .q-rating__icon').first()).toHaveCSS('opacity', '1')
  })

  test('renders QRating semantic colors and sizes in Fluent dark, One, and Terminal', async ({ page }) => {
    await applyTheme(page, 'dark', 'fluent')
    const positive = await resolvedColor(page, '--qds-color-positive')
    const negative = await resolvedColor(page, '--qds-color-negative')
    const primary = await resolvedColor(page, '--qds-color-primary')

    await expect(page.locator('[data-test="qds-rating-positive"] .q-rating__icon--active').first()).toHaveCSS('color', positive)
    await expect(page.locator('[data-test="qds-rating-negative"] .q-rating__icon--active').first()).toHaveCSS('color', negative)
    await expect(page.locator('[data-test="qds-rating-primary"] .q-rating__icon--active').first()).toHaveCSS('color', primary)
    await expect(page.locator('[data-test="qds-rating-active"] .q-rating__icon--active').first()).toHaveCSS('opacity', '1')

    for (const variant of ['mobile', 'terminal'] as const) {
      await applyTheme(page, 'light', variant)
      await expect(page.locator('[data-test="qds-rating-active"]')).toBeVisible()
      await expect(page.locator('[data-test="qds-rating-disabled"]')).toHaveClass(/disabled/)
    }

    const smSize = Number.parseFloat(await computed(page, '[data-test="qds-rating-sm"]', 'font-size'))
    const mdSize = Number.parseFloat(await computed(page, '[data-test="qds-rating-md"]', 'font-size'))
    const lgSize = Number.parseFloat(await computed(page, '[data-test="qds-rating-lg"]', 'font-size'))
    expect(smSize).toBeLessThan(mdSize)
    expect(mdSize).toBeLessThan(lgSize)
  })

  test('owns QToolbar, QBar, and QSeparator direct surfaces with exact geometry', async ({ page }) => {
    await applyTheme(page, 'light', 'fluent')

    const surface1 = await resolvedColor(page, '--qds-surface-1')
    const radius = await customProperty(page, '--qds-radius-control')
    const separatorColor = await resolvedColor(page, '--qds-stroke-divider')
    const toolbar = page.locator('[data-test="qds-toolbar-surface"]')
    const denseToolbar = page.locator('[data-test="qds-toolbar-dense"]')
    const wrapToolbar = page.locator('[data-test="qds-toolbar-wrap"]')
    const longTitle = page.locator('[data-test="qds-toolbar-long-title"]')
    const standardBar = page.locator('[data-test="qds-bar-standard"]')
    const denseBar = page.locator('[data-test="qds-bar-dense"]')

    await expect(toolbar).toHaveAttribute('role', 'toolbar')
    await expect(denseToolbar).toHaveClass(/q-toolbar--dense/)
    await expect(standardBar).toHaveAttribute('role', 'toolbar')
    await expect(denseBar).toHaveClass(/q-bar--dense/)
    expect(await computed(page, '[data-test="qds-toolbar-surface"]', 'background-color')).toBe(surface1)
    expect(await computed(page, '[data-test="qds-bar-standard"]', 'background-color')).toBe(surface1)
    expect(await computed(page, '[data-test="qds-bar-standard"]', 'height')).toBe('36px')
    expect(await computed(page, '[data-test="qds-bar-dense"]', 'height')).toBe('28px')
    expect(await computed(page, '[data-test="qds-bar-standard"]', 'border-top-left-radius')).toBe(radius)
    expect(await computed(page, '[data-test="qds-bar-standard"]', 'padding-left')).toBe('8px')
    expect(await computed(page, '[data-test="qds-bar-dense"]', 'padding-left')).toBe('8px')
    expect((await denseToolbar.boundingBox())!.height).toBeLessThan((await toolbar.boundingBox())!.height)
    expect((await denseToolbar.boundingBox())!.height).toBeGreaterThanOrEqual(
      (await denseToolbar.getByRole('button', { name: 'Save dense toolbar' }).boundingBox())!.height,
    )
    await expect(wrapToolbar).toHaveCSS('flex-wrap', 'wrap')
    expect((await wrapToolbar.boundingBox())!.height).toBeGreaterThan((await toolbar.boundingBox())!.height)
    await expect(wrapToolbar.getByRole('button', { name: 'Share responsive toolbar' })).toBeVisible()
    await expect(wrapToolbar.getByRole('button', { name: 'More responsive toolbar actions' })).toBeVisible()
    expect(await longTitle.evaluate((title) => title.scrollWidth > title.clientWidth)).toBe(true)
    await expect(longTitle).toHaveCSS('overflow', 'hidden')
    await expect(longTitle).toHaveCSS('text-overflow', 'ellipsis')

    await expect(page.locator('[data-test="qds-separator-horizontal"]')).toHaveAttribute('aria-orientation', 'horizontal')
    await expect(page.locator('[data-test="qds-separator-vertical"]')).toHaveAttribute('aria-orientation', 'vertical')
    expect(await computed(page, '[data-test="qds-separator-horizontal"]', 'background-color')).toBe(separatorColor)
    expect(await computed(page, '[data-test="qds-separator-vertical"]', 'background-color')).toBe(separatorColor)
    expect(await computed(page, '[data-test="qds-separator-horizontal"]', 'height')).toBe('1px')
    expect(await computed(page, '[data-test="qds-separator-vertical"]', 'width')).toBe('1px')

    const darkSeparator = page.locator('[data-test="qds-separator-inset-dark"]')
    const textOnSolid = await resolvedColor(page, '--qds-text-on-solid')
    await expect(darkSeparator).toHaveClass(/q-separator--dark/)
    await expect(darkSeparator).toHaveClass(/q-separator--horizontal-inset/)
    expect(await computed(page, '[data-test="qds-separator-inset-dark"]', 'background-color')).toBe(textOnSolid)
    const insetGeometry = await page.locator('[data-test="qds-separator-inset-host"]').evaluate((host) => {
      const separator = host.querySelector('[data-test="qds-separator-inset-dark"]')!.getBoundingClientRect()
      const container = host.getBoundingClientRect()
      return { leftInset: separator.left - container.left, rightInset: container.right - separator.right }
    })
    expect(insetGeometry.leftInset).toBeGreaterThan(0)
    expect(insetGeometry.rightInset).toBeGreaterThan(0)

    const siblingRow = page.locator('[data-test="qds-bar-separator-row"]')
    expect(await siblingRow.locator(':scope > [data-test="qds-bar-dense"]').count()).toBe(1)
    expect(await siblingRow.locator(':scope > [data-test="qds-separator-vertical"]').count()).toBe(1)
    expect(await siblingRow.locator(':scope > [data-test="qds-bar-dense-secondary"]').count()).toBe(1)
  })

  test('keeps lightweight primitives stable in dark, Ink, Terminal, RTL, and reduced motion', async ({ page }) => {
    await applyTheme(page, 'dark', 'fluent')
    await expect(page.locator('[data-test="qds-bar-standard"]')).toBeVisible()
    expect(await computed(page, '[data-test="qds-bar-standard"]', 'background-color')).toBe(
      await resolvedColor(page, '--qds-color-primary-dark'),
    )

    await applyTheme(page, 'light', 'ink')
    const surface0 = await resolvedColor(page, '--qds-surface-0')
    expect(await computed(page, '[data-test="qds-bar-standard"]', 'background-color')).toBe(surface0)

    await applyTheme(page, 'light', 'terminal')
    expect(await computed(page, '[data-test="qds-bar-standard"]', 'border-top-style')).toBe('solid')

    await page.evaluate(() => {
      document.documentElement.dir = 'rtl'
      document.body.dir = 'rtl'
      document.documentElement.style.direction = 'rtl'
      document.body.style.direction = 'rtl'
    })
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    expect(await computed(page, '[data-test="qds-bar-standard"]', 'padding-right')).toBe('8px')
    const rtlGeometry = await page.locator('[data-test="qds-bar-separator-row"]').evaluate((row) => {
      const item = (selector: string) => (row.querySelector(selector) as HTMLElement).getBoundingClientRect()
      const first = item('[data-test="qds-bar-dense"]')
      const separator = item('[data-test="qds-separator-vertical"]')
      const second = item('[data-test="qds-bar-dense-secondary"]')
      return {
        direction: getComputedStyle(row).direction,
        separatorCenter: separator.left + separator.width / 2,
        firstCenter: first.left + first.width / 2,
        secondCenter: second.left + second.width / 2,
      }
    })
    expect(rtlGeometry.direction).toBe('rtl')
    expect(rtlGeometry.separatorCenter).toBeGreaterThan(Math.min(rtlGeometry.firstCenter, rtlGeometry.secondCenter))
    expect(rtlGeometry.separatorCenter).toBeLessThan(Math.max(rtlGeometry.firstCenter, rtlGeometry.secondCenter))

    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(
      durationMs(await computed(page, '[data-test="qds-rating-active"] .q-rating__icon', 'transition-duration')),
      'QRating decorative transition honors the global reduced-motion clamp',
    ).toBeLessThanOrEqual(1)
  })

  test('honors explicit QBar dark semantics inside light QDS variants', async ({ page }) => {
    await applyTheme(page, 'light', 'fluent')

    const darkBar = page.locator('[data-test="qds-bar-dark"]')
    await expect(darkBar).toHaveClass(/q-bar--dark/)
    expect(await computed(page, '[data-test="qds-bar-dark"]', 'background-color')).toBe(
      await resolvedColor(page, '--qds-color-primary-dark'),
    )
    expect(await computed(page, '[data-test="qds-bar-dark"]', 'color')).toBe(
      await resolvedColor(page, '--qds-text-on-primary'),
    )
    await expect(darkBar.getByRole('button', { name: 'Close dark bar' })).toBeVisible()

    for (const variant of ['ink', 'mobile'] as const) {
      await applyTheme(page, 'light', variant)
      const expectedStandardSurface = variant === 'ink'
        ? await resolvedColor(page, '--qds-surface-0')
        : await resolvedColor(page, '--qds-surface-1')

      expect(await computed(page, '[data-test="qds-bar-standard"]', 'background-color')).toBe(expectedStandardSurface)
      expect(await computed(page, '[data-test="qds-bar-dark"]', 'background-color')).toBe(
        await resolvedColor(page, '--qds-color-primary-dark'),
      )
      expect(await computed(page, '[data-test="qds-bar-dark"]', 'color')).toBe(
        await resolvedColor(page, '--qds-text-on-primary'),
      )
    }
  })
})
