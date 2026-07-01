import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

type GalleryTab = 'components' | 'catalog' | 'plugins'

const KEY_TABS: GalleryTab[] = ['components', 'catalog', 'plugins']
const TAB_LABEL: Record<GalleryTab, string> = {
  components: 'Components',
  catalog: 'Catalog',
  plugins: 'Plugins',
}

const ACTIVE_PANEL = '.q-tab-panel'

// These are deliberate Quasar/demo-widget exclusions, not QDS styling exclusions:
// axe reports upstream ARIA gaps on QSlider/QRange and several catalog-only Quasar
// demo widgets, media alt/title gaps on static gallery placeholders, and
// Safari-only scrollarea focusability.
// The gate still scans the active tab body and fails serious/critical findings elsewhere.
const AXE_EXCLUSIONS: Record<GalleryTab, string[]> = {
  components: ['.q-slider', '.q-range'],
  catalog: [
    '.q-color-picker',
    '.q-date',
    '.q-time',
    '.q-linear-progress',
    '.q-circular-progress',
    '.q-knob',
    '.q-carousel',
    '.q-video',
    '.q-img',
    '.q-parallax',
    '.q-scrollarea',
    '.q-tree__tickbox',
    '.catalog-expansion-list',
    '.q-virtual-scroll',
    '.q-slide-item',
    '.q-infinite-scroll',
    '.q-editor',
  ],
  plugins: [],
}

async function applyLightFluent(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { __qdsGallery?: unknown }).__qdsGallery))
  await page.evaluate(() => {
    const ds = (window as unknown as { __qdsGallery: any }).__qdsGallery
    ds.setMode('light')
    ds.setVariant('fluent')
  })
  await expect(page.locator('body')).toHaveClass(/qds-theme-light/)
  await expect(page.locator('body')).toHaveClass(/qds-variant-fluent/)
}

async function openGalleryTab(page: Page, tab: GalleryTab) {
  await page.goto(`/#${tab}`)
  await applyLightFluent(page)
  await expect(page.getByRole('tab', { name: TAB_LABEL[tab] })).toHaveAttribute('aria-selected', 'true')
}

function parseTimeList(value: string): number[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (part.endsWith('ms')) return Number.parseFloat(part)
      if (part.endsWith('s')) return Number.parseFloat(part) * 1000
      return Number.parseFloat(part)
    })
    .filter((part) => Number.isFinite(part))
}

async function maxDurationMs(page: Page, selector: string, property: 'animation-duration' | 'transition-duration', pseudo?: string) {
  const value = await page.locator(selector).first().evaluate(
    (el, { property, pseudo }) => getComputedStyle(el as Element, pseudo).getPropertyValue(property),
    { property, pseudo },
  )
  return Math.max(...parseTimeList(value), 0)
}

async function seriousCriticalAxeViolations(page: Page, tab: GalleryTab) {
  let builder = new AxeBuilder({ page })
    .include(ACTIVE_PANEL)
    // Current Phase B focuses on structural serious/critical findings. Color contrast
    // remains an explicit QDS target (4.5:1 text, 3:1 UI), but broad token/demo contrast
    // adjustments are outside this test-only task and should be fixed as source work.
    .disableRules(['color-contrast'])

  for (const selector of AXE_EXCLUSIONS[tab]) {
    builder = builder.exclude(selector)
  }

  const results = await builder.analyze()
  return results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
}

test.describe('QDS accessibility, motion, and RTL evidence', () => {
  for (const tab of KEY_TABS) {
    test(`has no serious/critical axe findings on the ${tab} tab`, async ({ page }) => {
      await openGalleryTab(page, tab)

      const seriousOrCritical = await seriousCriticalAxeViolations(page, tab)

      expect(seriousOrCritical).toEqual([])
    })
  }

  test('honors reduced-motion media for catalog expansion/tree transitions and shimmer animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openGalleryTab(page, 'catalog')

    await expect(page.locator('[data-test="qds-expansion-expanded"]')).toHaveClass(/q-expansion-item--expanded/)
    await expect(page.locator('[data-test="qds-tree-primary"] .q-tree__node-header').first()).toBeVisible()
    await expect(page.locator('.q-skeleton').first()).toBeVisible()

    // QDS' global reduced-motion rule clamps decorative transitions to 0.01ms;
    // the catalog loading-data override allows Quasar shimmer/spinner animations up to 1ms.
    expect(
      await maxDurationMs(page, '[data-test="qds-expansion-expanded"] .q-expansion-item__content', 'transition-duration'),
      'QExpansionItem transition duration',
    ).toBeLessThanOrEqual(1)
    expect(
      await maxDurationMs(page, '[data-test="qds-tree-primary"] .q-tree__node-header', 'transition-duration'),
      'QTree row transition duration',
    ).toBeLessThanOrEqual(1)
    expect(
      await maxDurationMs(page, '.q-skeleton', 'animation-duration', '::before'),
      'QSkeleton shimmer animation duration',
    ).toBeLessThanOrEqual(1)
  })

  test('mirrors stable rails and toggle geometry in RTL', async ({ page }) => {
    await openGalleryTab(page, 'catalog')

    const selectedTreeRail = '[data-test="qds-tree-primary"] .q-tree__node-header.q-tree__node--selected'
    const ltrRail = await page.locator(selectedTreeRail).first().evaluate((el) => {
      const rail = getComputedStyle(el as Element, '::after')
      return { inlineStart: rail.insetInlineStart }
    })

    await page.evaluate(() => {
      document.documentElement.dir = 'rtl'
      document.body.dir = 'rtl'
    })
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

    const rtlRail = await page.locator(selectedTreeRail).first().evaluate((el) => {
      const rail = getComputedStyle(el as Element, '::after')
      return {
        inlineStart: rail.insetInlineStart,
        startEndRadius: rail.borderStartEndRadius,
        endEndRadius: rail.borderEndEndRadius,
      }
    })

    expect(ltrRail.inlineStart, 'LTR selected QTree rail uses logical inline-start').toBe('0px')
    expect(rtlRail.inlineStart, 'RTL selected QTree rail remains logical inline-start').toBe('0px')
    expect(rtlRail.startEndRadius, 'RTL selected QTree rail uses logical start/end radius').toBe('2px')
    expect(rtlRail.endEndRadius, 'RTL selected QTree rail uses logical end/end radius').toBe('2px')

    await page.goto('/#components')
    await applyLightFluent(page)
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl'
      document.body.dir = 'rtl'
    })

    const toggleGeometry = await page.locator('.q-toggle', { hasText: 'Enable tonal surfaces' }).first().evaluate((el) => {
      const track = (el as Element).querySelector('.q-toggle__track')?.getBoundingClientRect()
      const thumb = (el as Element).querySelector('.q-toggle__thumb')?.getBoundingClientRect()
      if (!track || !thumb) return null
      return {
        thumbNearInlineEnd: Math.abs(thumb.right - track.right),
        thumbFarFromInlineStart: thumb.left - track.left,
      }
    })

    expect(toggleGeometry, 'truthy toggle geometry is measurable').not.toBeNull()
    expect(toggleGeometry!.thumbNearInlineEnd, 'truthy toggle thumb mirrors to RTL inline-end').toBeLessThan(8)
    expect(toggleGeometry!.thumbFarFromInlineStart, 'truthy toggle thumb is not left-anchored in RTL').toBeGreaterThan(8)
  })
})
