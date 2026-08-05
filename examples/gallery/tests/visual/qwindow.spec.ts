import { expect, test, type Page } from '@playwright/test'
import { resolvedColor } from './helpers'

async function forceTheme(page: Page, mode: 'light' | 'dark' = 'light', variant: 'fluent' | 'terminal' = 'fluent') {
  await page.waitForFunction(() => Boolean((window as unknown as { __qdsGallery?: unknown }).__qdsGallery))
  await page.evaluate(({ mode, variant }) => {
    const ds = (window as unknown as { __qdsGallery: { setMode: (mode: 'light' | 'dark') => void; setVariant: (variant: 'fluent' | 'terminal') => void } }).__qdsGallery
    ds.setMode(mode)
    ds.setVariant(variant)
  }, { mode, variant })
  await expect(page.locator('body')).toHaveClass(new RegExp(`qds-variant-${variant}`))
  await expect(page.locator('body')).toHaveClass(new RegExp(mode === 'dark' ? 'qds-theme-dark' : 'qds-theme-light'))
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
      const windowElement = el as HTMLElement
      const titlebar = getComputedStyle(windowElement.querySelector('.qds-window__titlebar') as Element)
      const title = getComputedStyle(windowElement.querySelector('.qds-window__title') as Element)
      const action = getComputedStyle(windowElement.querySelector('.qds-window__action') as Element)
      const titlebarElement = windowElement.querySelector('.qds-window__titlebar') as HTMLElement
      const wasDense = windowElement.classList.contains('qds-window--dense')
      windowElement.classList.toggle('qds-window--dense', true)
      const denseTitlebarMinHeight = getComputedStyle(titlebarElement).minHeight
      const denseTitlebarRect = titlebarElement.getBoundingClientRect()
      const denseActionRects = Array.from(windowElement.querySelectorAll('.qds-window__action')).map((element) => {
        const rect = element.getBoundingClientRect()
        return { top: rect.top, bottom: rect.bottom, height: rect.height }
      })
      windowElement.classList.toggle('qds-window--dense', wasDense)
      titlebarElement.style.height = '3rem'
      const consumerTitlebarHeight = getComputedStyle(titlebarElement).height
      titlebarElement.style.height = ''
      windowElement.classList.add('qds-window--disabled')
      const disabledOpacity = getComputedStyle(windowElement).opacity
      windowElement.classList.remove('qds-window--disabled')
      return {
        background: shell.backgroundColor,
        borderRadius: shell.borderRadius,
        titlebarBackground: titlebar.backgroundColor,
        titlebarMinHeight: titlebar.minHeight,
        denseTitlebarMinHeight,
        denseTitlebarHeight: denseTitlebarRect.height,
        denseActionsFit: denseActionRects.every((rect) => rect.height >= 32 && rect.top >= denseTitlebarRect.top - 1 && rect.bottom <= denseTitlebarRect.bottom + 1),
        consumerTitlebarHeight,
        titleFontFamily: title.fontFamily,
        titleFontSize: title.fontSize,
        titleFontWeight: title.fontWeight,
        actionMinWidth: action.minWidth,
        actionMinHeight: action.minHeight,
        disabledOpacity,
      }
    })

    expect.soft(styles.background, 'QDS QWindow shell receives tokenized surface').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(parseFloat(styles.borderRadius), 'QDS QWindow shell receives tokenized radius').toBeGreaterThan(0)
    expect.soft(styles.titlebarBackground, 'QDS QWindow titlebar receives tokenized toolbar surface').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(parseFloat(styles.titlebarMinHeight), 'QDS QWindow titlebar has rendered geometry').toBeGreaterThan(0)
    expect.soft(styles.denseTitlebarMinHeight, 'QDS dense titlebar uses the small control size').toBe('32px')
    expect.soft(styles.denseTitlebarHeight, 'QDS dense titlebar contains 32px actions').toBeGreaterThanOrEqual(32)
    expect.soft(styles.denseActionsFit, 'QDS dense titlebar does not clip 32px actions').toBe(true)
    expect.soft(styles.consumerTitlebarHeight, 'QDS QWindow preserves consumer titlebarStyle geometry').toBe('48px')
    expect.soft(styles.titleFontFamily, 'QDS QWindow title uses display typography').toMatch(/Selawik|Segoe UI Variable Display/)
    expect.soft(styles.titleFontSize, 'QDS QWindow title uses compact control typography').toBe('14px')
    expect.soft(styles.titleFontWeight, 'QDS QWindow title keeps semibold emphasis').toBe('600')
    expect.soft(styles.actionMinWidth, 'QDS QWindow actions use the small control size').toBe('32px')
    expect.soft(styles.actionMinHeight, 'QDS QWindow actions use the small control size').toBe('32px')
    expect.soft(styles.disabledOpacity, 'QDS QWindow disabled state uses the public opacity token').toBe('0.5')

  })

  test('Terminal rendered close action keeps its negative fill foreground', async ({ page }) => {
    await page.goto('/#window')
    await forceTheme(page, 'dark', 'terminal')

    const windowShell = page.locator('.qds-window').filter({ hasText: 'QDS window shell' })
    const closeAction = windowShell.locator('.qds-window__action--close')
    await expect(closeAction).toHaveClass(/(?:^|\s)q-btn(?:\s|$)/)
    await closeAction.hover()
    await page.waitForTimeout(150)

    const closeStyles = await closeAction.evaluate((el) => {
      const styles = getComputedStyle(el)
      return { hovered: el.matches(':hover'), selectorMatches: el.matches('body.qds-ui.qds-ui.qds-variant-terminal .qds-window .q-btn.q-btn.q-btn--flat.qds-window__action--close:hover'), color: styles.color, background: styles.backgroundColor }
    })
    expect.soft(closeStyles.hovered, 'Terminal QWindow close action receives hover state').toBe(true)
    expect.soft(closeStyles.selectorMatches, 'Terminal QWindow close action matches the scoped override selector').toBe(true)
    expect.soft(closeStyles.color, 'Terminal QWindow close action uses the negative fill foreground').toBe(await resolvedColor(page, '--qds-text-on-negative'))
    expect.soft(closeStyles.background, 'Terminal QWindow close action uses the negative fill').toBe(await resolvedColor(page, '--qds-color-negative'))
  })
})
