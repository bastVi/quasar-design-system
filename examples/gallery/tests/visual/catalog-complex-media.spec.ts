import { expect, test, type Page } from '@playwright/test'
import { MATRIX_VARIANTS } from './helpers'

type Mode = 'light' | 'dark'
type Variant = 'fluent' | 'ink' | 'mobile' | 'terminal'

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
    expect.soft(await computed(page, sentStamp, 'color'), 'sent chat stamp keeps contrast on primary bubble').not.toBe(sentBg)
    expect.soft(await computed(page, receivedBubble, 'border-top-width'), 'received chat bubble keeps QDS border').toBe('1px')

    const stepper = page.locator('[data-test="qds-stepper"]')
    await expect(stepper).toHaveClass(/q-stepper--vertical/)
    await expect(stepper.locator('.q-stepper__tab--done')).toHaveCount(2)
    await expect(stepper.locator('.q-stepper__tab--active')).toContainText('Components')
    await expect(stepper.locator('.q-stepper__tab--error')).toContainText('Native parity')
    await expect(page.locator('[data-test="qds-stepper-nav"]')).toBeVisible()
    expect.soft(await computed(page, '[data-test="qds-stepper"] .q-stepper__step-content', 'border-left-width'), 'vertical stepper uses QDS progress rail').toBe('2px')

    const carousel = page.locator('[data-test="qds-carousel"]')
    await expect(carousel).toBeVisible()
    await expect(carousel.locator('.q-carousel__slide:not(.q-carousel__slide--hidden) .catalog-carousel-image')).toBeVisible()
    await expect(
      carousel.locator('.q-carousel__slide:not(.q-carousel__slide--hidden) .catalog-carousel-image img').first(),
      'carousel image uses owned SVG data',
    ).toHaveAttribute('src', /^data:image\/svg\+xml/)
    expect.soft(await computed(page, '[data-test="qds-carousel"]', 'border-radius'), 'carousel QDS radius').toBe('12px')
    await expect(page.locator('[data-test="qds-carousel-controls"]')).toBeVisible()
    await expect(carousel.locator('.q-carousel__navigation .q-btn')).toHaveCount(3)
    expect.soft(await computed(page, '[data-test="qds-carousel"] .q-carousel__navigation .q-btn', 'border-top-width'), 'carousel thumbnail navigation gets QDS frame').toBe('1px')
    await page.locator('[data-test="qds-carousel-autoplay"]').click()
    await expect(page.locator('[data-test="qds-carousel-autoplay"]')).toHaveAttribute('aria-pressed', 'true')

    await expect(page.locator('[data-test="qds-video"] iframe')).toHaveAttribute('src', /^data:text\/html/)
    expect.soft(await computed(page, '[data-test="qds-video"]', 'border-top-width'), 'QVideo QDS frame').toBe('1px')

    expect.soft(await computed(page, '[data-test="qds-scroll-area"]', 'overflow'), 'QScrollArea frame clips scrollbar overlap').toBe('hidden')
    expect.soft(await computed(page, '[data-test="qds-splitter"]', 'overflow'), 'QSplitter frame clips separator hitbox').toBe('hidden')
    expect.soft(await computed(page, '[data-test="qds-splitter"] > .q-splitter__separator', 'width'), 'QSplitter separator is softened beyond raw 1px seam').toBe('6px')

    // No Material Icons ligature text in custom controls (carousel, uploader, Fab)
    await expect(page.locator('[data-test="qds-carousel-controls"] .material-icons')).toHaveCount(0)
    await expect(page.locator('.catalog-uploader-header .material-icons')).toHaveCount(0)
    await expect(page.locator('.catalog-fab-stage .material-icons')).toHaveCount(0)
    await expect(page.locator('[data-test="qds-editor"] .material-icons')).toHaveCount(0)

    for (const variant of ['fluent', 'ink', 'mobile', 'terminal'] as const) {
      await applyTheme(page, 'dark', variant)
      const sentContentFg = await computed(page, '[data-test="qds-chat-sent"] .q-message-text-content', 'color')
      const receivedContentFg = await computed(page, '[data-test="qds-chat-received"] .q-message-text-content', 'color')
      expect.soft(sentContentFg, `${variant} dark sent chat content inherits bubble foreground`).toBe(
        await computed(page, '[data-test="qds-chat-sent"] .q-message-text', 'color'),
      )
      expect.soft(receivedContentFg, `${variant} dark received chat content inherits bubble foreground`).toBe(
        await computed(page, '[data-test="qds-chat-received"] .q-message-text', 'color'),
      )
    }
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
      await expect(page.locator('[data-test="qds-uploader-disabled"]')).toBeVisible()

      expect.soft(await computed(page, '[data-test="qds-carousel"]', 'border-radius'), `${variant} carousel radius`).toBe(EXPECTED_MEDIA_RADIUS[variant])
      expect.soft(await computed(page, '[data-test="qds-stepper"] .q-stepper__tab--error', 'background-color'), `${variant} stepper error tab is themed`).not.toBe('rgba(0, 0, 0, 0)')
      expect.soft(await computed(page, '[data-test="qds-editor"]', 'border-top-width'), `${variant} editor keeps framed chrome`).toBe('1px')
      expect.soft(await computed(page, '[data-test="qds-uploader"]', 'border-top-width'), `${variant} uploader keeps framed chrome`).toBe('1px')
      expect.soft(await computed(page, '[data-test="qds-uploader-disabled"]', 'opacity'), `${variant} disabled uploader state is softened`).toBe('0.6')
      expect.soft(await computed(page, '[data-test="qds-scroll-area"] .q-scrollarea__thumb', 'background-color'), `${variant} scroll thumb is themed`).not.toBe('rgba(0, 0, 0, 0)')
      expect.soft(await computed(page, '[data-test="qds-splitter"] > .q-splitter__separator', 'background-color', '::before'), `${variant} splitter handle is themed`).not.toBe('rgba(0, 0, 0, 0)')

      const carouselControls = page.locator('[data-test="qds-carousel-controls"]')
      const uploaderHeader = page.locator('.catalog-uploader-header')
      await expect(carouselControls.locator('.material-icons')).toHaveCount(0)
      await expect(uploaderHeader.locator('.material-icons')).toHaveCount(0)

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

    await expect(uploader.locator('[data-test="qds-uploader-add"]')).toBeVisible()
    await expect(uploader.locator('[data-test="qds-uploader-upload"]')).toBeEnabled()
    await expect(uploader.locator('[data-test="qds-uploader-clear"]')).toBeEnabled()
    await expect(queued.locator('.q-btn').first(), 'queued file exposes remove affordance').toBeVisible()
    await expect(page.locator('[data-test="qds-uploader-disabled"]')).toHaveClass(/disabled/)
  })

  test('QEditor exposes focused and dropdown toolbar states', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Catalog' }).click()
    await applyTheme(page, 'light', 'fluent')

    const editor = page.locator('[data-test="qds-editor"]')
    await page.focus('[data-test="qds-editor"] .q-editor__content')
    expect.soft(await computed(page, '[data-test="qds-editor"]', 'border-top-color'), 'focused editor receives QDS focus border').toBe('rgb(0, 90, 158)')
    await expect(editor.locator('.q-btn-dropdown')).toHaveCount(2)

    await editor.locator('.q-btn-dropdown').first().click()
    await expect(page.locator('.q-menu').first()).toBeVisible()
  })

  test('complex and media fixtures preserve Fluent, Ink, and One proof in light and dark', async ({ page }) => {
    await page.goto('/#catalog')
    for (const mode of ['light', 'dark'] as const) {
      for (const variant of MATRIX_VARIANTS) {
        await applyTheme(page, mode, variant)
        await expect(page.locator('[data-test="qds-stepper"]')).toBeVisible()
        await expect(page.locator('[data-test="qds-carousel"]')).toBeVisible()
        await expect(page.locator('[data-test="qds-editor"]')).toBeVisible()
        await expect(page.locator('[data-test="qds-uploader"]')).toBeVisible()
        expect.soft(await computed(page, '[data-test="qds-carousel"]', 'border-radius'), `${mode}/${variant} carousel geometry`).toBe(variant === 'mobile' ? '20px' : variant === 'ink' ? '16px' : '12px')
        expect.soft(await computed(page, '[data-test="qds-uploader"]', 'border-top-color'), `${mode}/${variant} uploader surface boundary`).not.toBe('rgba(0, 0, 0, 0)')
        expect.soft(await computed(page, '[data-test="qds-stepper"] .q-stepper__tab--error', 'background-color'), `${mode}/${variant} error state is painted`).not.toBe('rgba(0, 0, 0, 0)')
        if (variant === 'ink') {
          expect.soft(await computed(page, '[data-test="qds-editor"]', 'box-shadow'), `${mode}/Ink editor is matte`).toBe('none')
        }
        if (variant === 'mobile') {
          expect.soft(await computed(page, '[data-test="qds-editor"]', 'background-color'), `${mode}/One editor is grouped on a visible surface`).not.toBe('rgba(0, 0, 0, 0)')
        }
      }
    }
  })
})
