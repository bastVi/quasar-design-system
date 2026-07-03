import { expect, test, type Page } from '@playwright/test'

type Mode = 'light' | 'dark'
type Variant = 'fluent' | 'air' | 'mobile' | 'feather' | 'terminal'

const EXPECTED_MEDIA_RADIUS: Record<Extract<Variant, 'fluent' | 'mobile' | 'terminal'>, string> = {
  fluent: '12px',
  mobile: '20px',
  terminal: '10px',
}

async function applyTheme(page: Page, mode: Mode, variant: Variant) {
  await page.waitForFunction(() => Boolean((window as unknown as { __qdsGallery?: unknown }).__qdsGallery))
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

async function computed(page: Page, selector: string, prop: string, pseudo: string | null = null): Promise<string> {
  return page.locator(selector).first().evaluate(
    (el, { prop, pseudo }) => getComputedStyle(el as Element, pseudo ?? undefined).getPropertyValue(prop),
    { prop, pseudo },
  )
}

test.describe('QDS catalog complex media gate', () => {
  test('skins chat, local media, video, scroll area, and splitter without raw seams', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Catalog' }).click()
    await applyTheme(page, 'light', 'fluent')

    const sentBubble = '[data-test="qds-chat-sent"] .q-message-text'
    const sentContent = '[data-test="qds-chat-sent"] .q-message-text-content'
    const sentStamp = '[data-test="qds-chat-sent"] .q-message-stamp'
    const receivedBubble = '[data-test="qds-chat-received"] .q-message-text'
    const sentBg = await computed(page, sentBubble, 'background-color')
    const sentTail = await computed(page, sentBubble, 'border-bottom-color', '::before')
    const sentFg = await computed(page, sentContent, 'color')

    await expect(page.locator('[data-test="qds-chat-sent"] .q-message-avatar')).toHaveAttribute('src', /^data:image\/svg\+xml/)
    await expect(page.locator('[data-test="qds-chat-received"] .q-message-avatar')).toHaveAttribute('src', /^data:image\/svg\+xml/)
    expect.soft(sentBg, 'sent chat bubble is painted').not.toBe('rgba(0, 0, 0, 0)')
    expect.soft(sentTail, 'sent chat tail inherits bubble color').toBe(await computed(page, sentBubble, 'color'))
    expect.soft(sentFg, 'sent chat content contrasts with bubble paint').not.toBe(sentBg)
    expect.soft(await computed(page, sentStamp, 'color'), 'sent chat stamp keeps contrast on primary bubble').not.toBe('rgb(100, 116, 139)')
    expect.soft(await computed(page, receivedBubble, 'border-top-width'), 'received chat bubble keeps QDS border').toBe('1px')

    const carousel = page.locator('[data-test="qds-carousel"]')
    await expect(carousel).toBeVisible()
    await expect(carousel.locator('.q-carousel__slide:not(.q-carousel__slide--hidden) .catalog-carousel-image')).toBeVisible()
    await expect(
      carousel.locator('.q-carousel__slide:not(.q-carousel__slide--hidden) .catalog-carousel-image img').first(),
      'carousel image uses owned SVG data',
    ).toHaveAttribute('src', /^data:image\/svg\+xml/)
    expect.soft(await computed(page, '[data-test="qds-carousel"]', 'border-radius'), 'carousel QDS radius').toBe('12px')

    await expect(page.locator('[data-test="qds-video"] iframe')).toHaveAttribute('src', /^data:text\/html/)
    expect.soft(await computed(page, '[data-test="qds-video"]', 'border-top-width'), 'QVideo QDS frame').toBe('1px')

    expect.soft(await computed(page, '[data-test="qds-scroll-area"]', 'overflow'), 'QScrollArea frame clips scrollbar overlap').toBe('hidden')
    expect.soft(await computed(page, '[data-test="qds-splitter"]', 'overflow'), 'QSplitter frame clips separator hitbox').toBe('hidden')
    expect.soft(await computed(page, '[data-test="qds-splitter"] > .q-splitter__separator', 'width'), 'QSplitter separator is softened beyond raw 1px seam').toBe('6px')
  })

  test('complex media surfaces keep variant and dark proof coverage', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Catalog' }).click()

    for (const variant of ['mobile', 'terminal'] as const) {
      await applyTheme(page, 'dark', variant)

      await expect(page.locator('[data-test="qds-timeline"]')).toBeVisible()
      await expect(page.locator('[data-test="qds-carousel"]')).toBeVisible()
      await expect(page.locator('[data-test="qds-scroll-area"]')).toBeVisible()
      await expect(page.locator('[data-test="qds-splitter"]')).toBeVisible()
      await expect(page.locator('[data-test="qds-editor"]')).toBeVisible()
      await expect(page.locator('[data-test="qds-uploader"]')).toBeVisible()

      expect.soft(await computed(page, '[data-test="qds-carousel"]', 'border-radius'), `${variant} carousel radius`).toBe(EXPECTED_MEDIA_RADIUS[variant])
      expect.soft(await computed(page, '[data-test="qds-editor"]', 'border-top-width'), `${variant} editor keeps framed chrome`).toBe('1px')
      expect.soft(await computed(page, '[data-test="qds-uploader"]', 'border-top-width'), `${variant} uploader keeps framed chrome`).toBe('1px')
      expect.soft(await computed(page, '[data-test="qds-scroll-area"] .q-scrollarea__thumb', 'background-color'), `${variant} scroll thumb is themed`).not.toBe('rgba(0, 0, 0, 0)')
      expect.soft(await computed(page, '[data-test="qds-splitter"] > .q-splitter__separator', 'background-color', '::before'), `${variant} splitter handle is themed`).not.toBe('rgba(0, 0, 0, 0)')

      if (variant === 'terminal') {
        expect.soft(await computed(page, '[data-test="qds-editor"]', 'font-family'), 'terminal editor uses monospace family').toContain('ui-monospace')
      }
    }
  })

  test('QUploader exposes deterministic queued, progress, error, and uploaded states', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Catalog' }).click()
    await applyTheme(page, 'light', 'fluent')

    const uploader = page.locator('[data-test="qds-uploader"]')
    await expect(uploader.locator('.q-uploader__file')).toHaveCount(4)

    const queued = uploader.locator('.q-uploader__file').filter({ hasText: 'media-queued.txt' })
    const progress = uploader.locator('.q-uploader__file').filter({ hasText: 'media-progress.bin' })
    const failed = uploader.locator('.q-uploader__file').filter({ hasText: 'media-error.txt' })
    const uploaded = uploader.locator('.q-uploader__file').filter({ hasText: 'media-uploaded.txt' })

    await expect(queued).toContainText('0.00%')
    await expect(progress.locator('.q-circular-progress')).toBeVisible()
    await expect(progress).toContainText(/58\.0\d%/)
    await expect(failed).toHaveClass(/q-uploader__file--failed/)
    await expect(failed.locator('.q-uploader__file-status')).toBeVisible()
    await expect(uploaded).toHaveClass(/q-uploader__file--uploaded/)
    await expect(uploaded).toContainText('100.00%')
  })
})
