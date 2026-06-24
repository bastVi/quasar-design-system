import { test, expect, type Page } from '@playwright/test'

type Mode = 'light' | 'dark'
type Variant = 'fluent' | 'air' | 'mobile'

const EXPECTED_CARD_RADIUS: Record<Variant, string> = {
  fluent: '12px',
  air: '16px',
  mobile: '20px',
}

/** Drive the runtime controller exactly as an external app would. */
async function applyTheme(page: Page, mode: Mode, variant: Variant) {
  await page.evaluate(
    ({ mode, variant }) => {
      const ds = (window as unknown as { __qdsGallery: any }).__qdsGallery
      ds.setMode(mode)
      ds.setVariant(variant)
    },
    { mode, variant },
  )
  // Confirm the controller wrote the scope classes onto <body> before asserting.
  await expect(page.locator('body')).toHaveClass(new RegExp(`qds-variant-${variant}`))
  await expect(page.locator('body')).toHaveClass(
    new RegExp(mode === 'dark' ? 'qds-theme-dark' : 'qds-theme-light'),
  )
}

/** computed style of the first matching element. */
async function computed(page: Page, selector: string, prop: string, pseudo: string | null = null): Promise<string> {
  return page.locator(selector).first().evaluate(
    (el, { prop, pseudo }) => getComputedStyle(el as Element, pseudo ?? undefined).getPropertyValue(prop),
    { prop, pseudo },
  )
}

test.describe('QDS catalog data display gate', () => {
  test('catalog coverage tab skins remaining Quasar primitives', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Catalog' }).click()
    await applyTheme(page, 'light', 'fluent')
    const expectVisible = async (selector: string) => {
      await expect(page.locator(selector).first(), selector).toBeVisible()
    }

    await expect(page.getByText('Remaining Quasar components')).toBeVisible()
    await expectVisible('.q-breadcrumbs')
    await expectVisible('.q-btn-dropdown')
    await expectVisible('.q-btn-toggle')
    await expectVisible('.q-fab')
    await expectVisible('.q-banner')
    await expectVisible('.q-option-group')
    await expectVisible('.q-color-picker')
    await expectVisible('.q-date')
    await expectVisible('.q-time')
    await expectVisible('.q-linear-progress')
    await expectVisible('.q-circular-progress')
    await expectVisible('.q-skeleton')
    await expectVisible('.q-expansion-item')
    await expectVisible('.q-tree')
    await expectVisible('.q-virtual-scroll')
    await expectVisible('.q-markup-table')
    await expectVisible('.q-stepper')
    await expectVisible('.q-timeline')
    await expectVisible('.q-carousel')
    await expectVisible('.q-message')
    await expect(page.locator('.catalog-image').first(), 'QImg example is mounted').toBeAttached()
    await expectVisible('.q-parallax')
    await expectVisible('.q-video')
    await expectVisible('.q-scrollarea')
    await expectVisible('.q-splitter')
    await expectVisible('.q-slide-item')
    await expectVisible('.q-knob')
    await expectVisible('.q-editor')
    await expectVisible('.q-uploader')

    expect.soft(await computed(page, '.q-banner', 'border-top-width'), 'QBanner QDS border').toBe('1px')
    expect.soft(await computed(page, '.catalog-panel', 'border-radius'), 'QTabPanels QDS radius').toBe(EXPECTED_CARD_RADIUS.fluent)
    expect.soft(await computed(page, '.q-stepper', 'border-radius'), 'QStepper QDS radius').toBe(EXPECTED_CARD_RADIUS.fluent)
    expect.soft(await computed(page, '.q-markup-table', 'border-radius'), 'QMarkupTable QDS radius').toBe(EXPECTED_CARD_RADIUS.fluent)
    expect.soft(await computed(page, '.q-editor', 'border-top-width'), 'QEditor QDS border').toBe('1px')
    expect.soft(await computed(page, '.q-uploader', 'border-radius'), 'QUploader QDS radius').toBe(EXPECTED_CARD_RADIUS.fluent)
  })

  test('QExpansionItem and QTree expose deterministic deep states', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Catalog' }).click()
    await applyTheme(page, 'light', 'fluent')

    const expandedExpansion = page.locator('[data-test="qds-expansion-expanded"]')
    const expandedHeader = expandedExpansion.locator('.q-expansion-item__container > .q-item').first()
    await expect(expandedExpansion).toHaveClass(/q-expansion-item--expanded/)
    await expect(expandedHeader).toHaveAttribute('aria-expanded', 'true')
    await expect(expandedExpansion.locator('.q-expansion-item__content')).toBeVisible()
    await expect(expandedExpansion.locator('.q-expansion-item__toggle-icon')).toHaveClass(/q-expansion-item__toggle-icon--rotated/)
    expect.soft(await computed(page, '[data-test="qds-expansion-expanded"] > .q-expansion-item__container > .q-item', 'background-color'), 'expanded header background').not.toBe('rgba(0, 0, 0, 0)')

    const collapsedExpansion = page.locator('[data-test="qds-expansion-collapsed"]')
    await expect(collapsedExpansion).toHaveClass(/q-expansion-item--collapsed/)
    await expect(collapsedExpansion.getByRole('button', { name: /Expand/ })).toHaveAttribute('aria-expanded', 'false')
    await expect(collapsedExpansion.locator('.q-expansion-item__content')).toBeHidden()
    await expect(collapsedExpansion.locator('.q-expansion-item__toggle-icon')).not.toHaveClass(/q-expansion-item__toggle-icon--rotated/)

    await expect(page.locator('[data-test="qds-expansion-dense"] .q-expansion-item__container > .q-item').first()).toHaveClass(/q-item--dense/)
    await expect(page.locator('[data-test="qds-expansion-disabled"] .q-expansion-item__container > .q-item').first()).toHaveClass(/disabled/)

    const primaryTree = page.locator('[data-test="qds-tree-primary"]')
    await expect(primaryTree.locator('.q-tree__node-header[aria-expanded="true"]').first()).toContainText('Design system')
    const selectedTreeHeader = primaryTree.locator('.q-tree__node-header.q-tree__node--selected').first()
    await expect(selectedTreeHeader).toContainText('Components')
    expect.soft(await selectedTreeHeader.evaluate((el) => getComputedStyle(el).backgroundColor), 'selected QTree row background').not.toBe('rgba(0, 0, 0, 0)')
    await expect(primaryTree.locator('.q-tree__tickbox .q-checkbox__inner--truthy').first()).toBeVisible()
    const disabledTreeHeader = primaryTree.locator('.q-tree__node-header.q-tree__node--disabled').first()
    await expect(disabledTreeHeader).toContainText('Deprecated alias bridge')
    expect.soft(await disabledTreeHeader.evaluate((el) => getComputedStyle(el).cursor), 'disabled QTree cursor').toBe('not-allowed')

    const denseTree = page.locator('[data-test="qds-tree-dense"]')
    await expect(denseTree).toHaveClass(/q-tree--dense/)
    await expect(denseTree).toHaveClass(/q-tree--no-connectors/)
    await expect(denseTree.locator('.q-tree__node-header.q-tree__node--selected').first()).toContainText('Controls')
    expect.soft(await computed(page, '[data-test="qds-tree-dense"] .q-tree__node-header', 'min-height'), 'dense QTree header height').toBe('30px')
    expect.soft(await computed(page, '[data-test="qds-tree-dense"] .q-tree__node-header', 'display', '::before'), 'no-connectors rail display').toBe('none')
  })
})
