import { test, expect, type Page } from '@playwright/test'

/**
 * T10 visual verification gate.
 *
 * Proves the QDS overrides win on real rendered Quasar components after Quasar's
 * own (unlayered) CSS, across every mode × variant cell. Assertions read
 * getComputedStyle on the *rendered* DOM — not the source tokens — so a regression
 * where Quasar's defaults strand the override (e.g. dark QCard keeping a light bg)
 * makes the gate FAIL.
 */

type Mode = 'light' | 'dark'
type Variant = 'fluent' | 'air' | 'mobile'

// Expected resolved values, derived from src/tokens/_default.scss (Fluent refinement).
// --qds-radius-control: fluent 8 / air 10 / mobile 14.
const EXPECTED_CONTROL_RADIUS: Record<Variant, string> = {
  fluent: '8px',
  air: '10px',
  mobile: '14px',
}
// --qds-card-radius = --qds-radius-lg: fluent 12 / air 16 / mobile 20.
const EXPECTED_CARD_RADIUS: Record<Variant, string> = {
  fluent: '12px',
  air: '16px',
  mobile: '20px',
}

// --qds-surface-0 per mode (drives --qds-card-bg / --qds-menu-bg / notify bg).
const LIGHT_SURFACE = 'rgb(255, 253, 248)' // #fffdf8
const DARK_SURFACE = 'rgb(32, 34, 37)' //   #202225
const SURFACE: Record<Mode, string> = { light: LIGHT_SURFACE, dark: DARK_SURFACE }

// Primary #005a9e (solid fill + focus outline).
const PRIMARY = 'rgb(0, 90, 158)'
const PRIMARY_RGB_PATTERN = /^rgba\(0,\s*90,\s*158/
const SEMANTIC_RGB: Record<'positive' | 'negative' | 'warning' | 'info', string> = {
  positive: 'rgb(106, 143, 102)',
  negative: 'rgb(196, 43, 28)',
  warning: 'rgb(247, 99, 12)',
  info: 'rgb(85, 124, 153)',
}
// QField outlined border = --qds-border (strong): light #8f8f8f / dark #6a7a8e.
const FIELD_BORDER: Record<Mode, string> = {
  light: 'rgb(143, 143, 143)',
  dark: 'rgb(106, 122, 142)',
}
// QCard/QNotification border = --qds-border-subtle: light #b5b5b5 / dark #576173.
const SUBTLE_BORDER: Record<Mode, string> = {
  light: 'rgb(181, 181, 181)',
  dark: 'rgb(87, 97, 115)',
}

const MODES: Mode[] = ['light', 'dark']
const VARIANTS: Variant[] = ['fluent', 'air', 'mobile']

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
async function computed(page: Page, selector: string, prop: string): Promise<string> {
  return page.locator(selector).first().evaluate(
    (el, prop) => getComputedStyle(el as Element).getPropertyValue(prop as string),
    prop,
  )
}

// Scope component selectors to the open tab panel so the header's q-btn-toggle
// segments (also .q-btn--unelevated, but radius-clipped by Quasar) never match.
const PANEL = '.q-tab-panel'

/**
 * Read a computed style and wait for it to settle, since Quasar animates several
 * properties (e.g. .q-field__control::before border-color over .36s) — sampling
 * mid-transition yields a transient value. Polls until two consecutive reads match.
 */
async function settledComputed(
  page: Page,
  read: () => Promise<string>,
  { tries = 12, interval = 80 }: { tries?: number; interval?: number } = {},
): Promise<string> {
  let prev = await read()
  for (let i = 0; i < tries; i++) {
    await page.waitForTimeout(interval)
    const next = await read()
    if (next === prev) return next
    prev = next
  }
  return prev
}

test.describe('QDS override gate', () => {
  for (const mode of MODES) {
    for (const variant of VARIANTS) {
      test(`${mode} / ${variant}`, async ({ page }, testInfo) => {
        await page.goto('/')
        await page.getByRole('tab', { name: 'Components' }).click()
        await applyTheme(page, mode, variant)
        // Quasar transitions + token re-resolution settle.
        await page.waitForTimeout(150)

        // Computed-style checks use expect.soft so every cell reports ALL override
        // gaps in one run (and still captures a screenshot) instead of aborting at
        // the first failure — a soft failure still fails the gate.

        // --- QBtn: radius + weight are token-driven (override applied) ---
        // Non-dense unelevated button in the panel (avoids the dense toolbar toggles).
        const btn = `${PANEL} .q-btn--unelevated:not(.q-btn--dense)`
        expect.soft(await computed(page, btn, 'border-radius'), 'QBtn radius').toBe(
          EXPECTED_CONTROL_RADIUS[variant],
        )
        expect.soft(await computed(page, btn, 'font-weight'), 'QBtn font-weight').toBe('500')

        // Semantic colored default: tonal tint, not filled Material-style color.
        const semantic = `${PANEL} .q-btn--unelevated.bg-primary:not(.qds-solid):not(.q-btn--dense)`
        expect.soft(await computed(page, semantic, 'background-color'), 'QBtn semantic tonal bg').toMatch(
          PRIMARY_RGB_PATTERN,
        )
        expect.soft(await computed(page, semantic, 'color'), 'QBtn semantic tonal text').not.toBe('rgb(255, 255, 255)')

        // Explicit solid CTA remains available through .qds-solid.
        const solid = `${PANEL} .q-btn--unelevated.qds-solid.bg-primary:not(.q-btn--dense)`
        expect.soft(await computed(page, solid, 'background-color'), 'QBtn solid bg').toBe(PRIMARY)
        expect.soft(await computed(page, solid, 'color'), 'QBtn solid text').toBe('rgb(255, 255, 255)')

        // TONAL: colored non-solid buttons share the same soft treatment.
        const tonal = `${PANEL} .q-btn.bg-primary:not(.qds-solid):not(.q-btn--flat):not(.q-btn--outline)`
        expect.soft(await computed(page, tonal, 'background-color'), 'QBtn tonal bg').toMatch(
          PRIMARY_RGB_PATTERN, // primary rgb, translucent
        )

        // Standard/elevated buttons get a subtle QDS depth effect, not Quasar's Material shadow.
        const elevated = `${PANEL} .q-btn--standard.bg-primary:not(.q-btn--flat):not(.q-btn--outline)`
        expect.soft(await computed(page, elevated, 'box-shadow'), 'QBtn elevated QDS shadow').not.toBe('none')

        // --- focus: Fluent 2px solid outline with offset, not a glow ---
        // Headless Chromium won't reliably enter :focus-visible, so prove the override
        // from the rendered cascade: the QDS :focus-visible rule sets the outline
        // (width/style/primary color/offset) and clears box-shadow.
        const focusRule = await page.evaluate(() => {
          for (const sheet of Array.from(document.styleSheets)) {
            let rules: CSSRuleList
            try {
              rules = sheet.cssRules
            } catch {
              continue // cross-origin sheet; skip
            }
            for (const r of Array.from(rules)) {
              const sel = (r as CSSStyleRule).selectorText
              if (sel && sel.includes('.q-btn') && sel.includes(':focus-visible')) {
                const s = (r as CSSStyleRule).style
                // outline is set as a shorthand, so read .outline (not .outlineStyle).
                return { outline: s.outline, offset: s.outlineOffset, boxShadow: s.boxShadow }
              }
            }
          }
          return null
        })
        // Outline props resolve via tokens; assert the resolved computed values too.
        const ringTarget = page.locator(btn).first()
        const focusResolved = await ringTarget.evaluate((el) => {
          const cs = getComputedStyle(el as Element)
          return {
            width: cs.getPropertyValue('--qds-focus-ring-width').trim(),
            offset: cs.getPropertyValue('--qds-focus-ring-offset').trim(),
            primary: cs.getPropertyValue('--qds-color-primary').trim(),
          }
        })
        expect.soft(focusRule?.outline, 'QBtn focus outline (solid stroke)').toContain('solid')
        expect.soft(focusRule?.outline, 'QBtn focus outline width').toContain('var(--qds-focus-ring-width)')
        expect.soft(focusRule?.boxShadow, 'QBtn focus box-shadow cleared').toBe('none')
        expect.soft(focusResolved.width, 'QBtn focus outline-width').toBe('2px')
        expect.soft(focusResolved.offset, 'QBtn focus outline-offset').toBe('2px')
        expect.soft(focusResolved.primary, 'QBtn focus outline-color (primary)').toBe('#005a9e')

        // --- QInput (outlined): border token-driven (= --qds-border, strong) ---
        // Border lives on .q-field__control::before; Quasar animates border-color
        // (.36s) so read after it settles, not mid-animation.
        const fieldControl = page.locator(`${PANEL} .q-field--outlined .q-field__control`).first()
        const fieldBefore = await settledComputed(page, () =>
          fieldControl.evaluate((el) => getComputedStyle(el as Element, '::before').borderTopColor),
        )
        expect.soft(fieldBefore, 'QField outlined border color').toBe(FIELD_BORDER[mode])
        expect.soft(await fieldControl.evaluate((el) => getComputedStyle(el as Element).minHeight), 'QField thin height').toBe('36px')

        // --- QBadge/QChip: Quasar bg-* utilities must not leak Material solid fills ---
        const badge = `${PANEL} .q-badge.bg-primary`
        expect.soft(await computed(page, badge, 'background-color'), 'QBadge tonal bg').toMatch(
          PRIMARY_RGB_PATTERN,
        )
        expect.soft(await computed(page, badge, 'background-color'), 'QBadge not Quasar Material primary').not.toBe(
          'rgb(25, 118, 210)',
        )
        const chip = `${PANEL} .q-chip.bg-primary`
        expect.soft(await computed(page, chip, 'background-color'), 'QChip tonal bg').toMatch(
          PRIMARY_RGB_PATTERN,
        )
        expect.soft(await computed(page, chip, 'background-color'), 'QChip not Quasar Material primary').not.toBe(
          'rgb(25, 118, 210)',
        )

        // --- QCard: tonal acrylic surface, bg/border/radius/shadow token-driven ---
        const card = `${PANEL} .q-card`
        expect.soft(await computed(page, card, 'border-radius'), 'QCard radius').toBe(
          EXPECTED_CARD_RADIUS[variant],
        )
        expect.soft(await computed(page, card, 'box-shadow'), 'QCard shadow (restrained)').not.toBe('none')
        expect.soft(await computed(page, card, 'border-top-width'), 'QCard border width').toBe('1px')
        expect.soft(await computed(page, card, 'border-top-color'), 'QCard border color').not.toBe('rgba(0, 0, 0, 0)')
        const cardBg = await computed(page, card, 'background-color')
        expect.soft(cardBg, 'QCard bg (acrylic base)').not.toBe('rgba(0, 0, 0, 0)')
        if (mode === 'dark') {
          expect.soft(cardBg, 'QCard dark bg != light surface').not.toBe(LIGHT_SURFACE)
        }
        const cardVars = await page.locator(card).first().evaluate((el) => {
          const cs = getComputedStyle(el as Element)
          return {
            bg: cs.getPropertyValue('--qds-card-bg').trim(),
            fallback: cs.getPropertyValue('--qds-card-bg-fallback').trim(),
          }
        })
        expect.soft(cardVars.bg, 'QCard token resolved').toContain('linear-gradient')
        expect.soft(cardVars.fallback, 'QCard fallback token resolved').toContain('linear-gradient')

        // --- QMenu (open it): bg + shadow token-driven ---
        await page.getByRole('button', { name: 'Open menu' }).click()
        const menu = '.q-menu'
        await expect(page.locator(menu).first()).toBeVisible()
        expect.soft(await computed(page, menu, 'background-color'), 'QMenu bg').toBe(SURFACE[mode])
        expect.soft(await computed(page, menu, 'box-shadow'), 'QMenu shadow').not.toBe('none')
        // Dismiss via a v-close-popup item (reliable on touch; Escape is flaky on mobile).
        await page.locator(`${menu} .q-item`).first().click()
        await expect(page.locator(menu)).toHaveCount(0)

        // --- QNotification (trigger it): radius + shadow token-driven ---
        await page.getByRole('button', { name: 'Info', exact: true }).click()
        const notify = '.q-notification'
        await expect(page.locator(notify).first()).toBeVisible()
        // notification-radius = --qds-radius-md (8px), constant across variants.
        expect.soft(await computed(page, notify, 'border-radius'), 'QNotification radius').toBe('8px')
        expect.soft(await computed(page, notify, 'box-shadow'), 'QNotification shadow').not.toBe('none')
        expect.soft(await computed(page, notify, 'background-color'), 'QNotification bg').toBe(SURFACE[mode])
        const assertNotifyState = async (type: keyof typeof SEMANTIC_RGB) => {
          const item = page.locator('.q-notification', { hasText: `This is a ${type} notification` }).first()
          await expect(item, `QNotification ${type} visible`).toBeVisible()
          const state = await item.evaluate((el) => {
            const cs = getComputedStyle(el as Element)
            const rail = getComputedStyle(el as Element, '::before')
            const icon = (el as Element).querySelector('.q-notification__icon')
            return {
              bg: cs.backgroundColor,
              border: cs.borderTopColor,
              rail: rail.backgroundColor,
              icon: icon ? getComputedStyle(icon).color : '',
            }
          })
          expect.soft(state.bg, `QNotification ${type} keeps QDS surface`).toBe(SURFACE[mode])
          expect.soft(state.rail, `QNotification ${type} semantic rail`).toBe(SEMANTIC_RGB[type])
          expect.soft(state.border, `QNotification ${type} semantic border`).toMatch(/^rgba?\(/)
          if (state.icon) {
            expect.soft(state.icon, `QNotification ${type} semantic icon`).toBe(SEMANTIC_RGB[type])
          }
        }
        await assertNotifyState('info')
        const notifyLabels = { positive: 'Positive', negative: 'Negative', warning: 'Warning' } as const
        for (const type of ['positive', 'negative', 'warning'] as const) {
          await page.getByRole('button', { name: notifyLabels[type], exact: true }).click()
          await assertNotifyState(type)
        }

        // --- ripple suppressed (Material tell removed) ---
        // Quasar may leave inert ripple nodes mounted depending on the interaction
        // path, so assert there is no *visible* ripple instead of relying on one
        // arbitrary first node's `display` value.
        const visibleRipples = await page.locator(PANEL).first().evaluate((panel) =>
          Array.from(panel.querySelectorAll('.q-ripple')).filter((el) => {
            const style = getComputedStyle(el as Element)
            const rect = (el as Element).getBoundingClientRect()
            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              style.opacity !== '0' &&
              rect.width > 0 &&
              rect.height > 0
            )
          }).length,
        )
        expect.soft(visibleRipples, 'QRipple suppressed').toBe(0)

        // --- QTabs: remove Quasar's Material underline and use a short Fluent indicator ---
        expect.soft(await computed(page, '.q-tab__indicator', 'display'), 'QTab Material indicator suppressed').toBe('none')
        const activeTab = page.locator('.gallery-tabs .q-tab--active').first()
        const tabAfter = await activeTab.evaluate((el) => {
          const cs = getComputedStyle(el as Element, '::after')
          return {
            height: cs.height,
            insetInlineStart: cs.insetInlineStart,
            insetInlineEnd: cs.insetInlineEnd,
            borderRadius: cs.borderRadius,
            opacity: cs.opacity,
          }
        })
        expect.soft(await computed(page, '.gallery-tabs .q-tab--active', 'box-shadow'), 'QTab active no outline box').toBe('none')
        expect.soft(await computed(page, '.gallery-tabs .q-tab--active', 'background-color'), 'QTab active no filled pill').toBe(
          'rgba(0, 0, 0, 0)',
        )
        expect.soft(tabAfter.height, 'QTab active indicator height').toBe('3px')
        expect.soft(tabAfter.insetInlineStart, 'QTab active indicator respects start padding').not.toBe('0px')
        expect.soft(tabAfter.insetInlineEnd, 'QTab active indicator respects end padding').not.toBe('0px')
        expect.soft(tabAfter.borderRadius, 'QTab active indicator rounded').not.toBe('0px')
        expect.soft(tabAfter.opacity, 'QTab active indicator visible').toBe('1')
        const verticalTab = page.locator(`${PANEL} .q-tabs--vertical .q-tab--active`).first()
        const verticalAfter = await verticalTab.evaluate((el) => {
          const cs = getComputedStyle(el as Element, '::after')
          return { width: cs.width, height: cs.height, opacity: cs.opacity, insetInlineStart: cs.insetInlineStart }
        })
        expect.soft(verticalAfter.width, 'QTab vertical indicator width').toBe('3px')
        expect.soft(verticalAfter.height, 'QTab vertical indicator is short').not.toBe('auto')
        expect.soft(verticalAfter.insetInlineStart, 'QTab vertical indicator inset').not.toBe('0px')
        expect.soft(verticalAfter.opacity, 'QTab vertical indicator visible').toBe('1')

        // --- QField/QSelect: floated labels must not collide with icons or multiple-select chips ---
        const iconField = page.locator(`${PANEL} .q-field:has-text("With icon")`).first()
        const iconLabelBottomOffset = await iconField.evaluate((field) => {
          const label = field.querySelector('.q-field__label')?.getBoundingClientRect()
          const native = field.querySelector('.q-field__native')?.getBoundingClientRect()
          return label && native ? Math.round(label.bottom - native.top) : null
        })
        expect.soft(iconLabelBottomOffset, 'QField icon label measured against value row').not.toBeNull()
        expect.soft(iconLabelBottomOffset ?? 0, 'QField icon label stays above value row midpoint').toBeLessThan(12)
        const multiSelect = page.locator(`${PANEL} .q-select--multiple`).first()
        const multiLabelGap = await multiSelect.evaluate((field) => {
          const label = field.querySelector('.q-field__label')?.getBoundingClientRect()
          const chip = field.querySelector('.q-chip')?.getBoundingClientRect()
          return label && chip ? Math.round(chip.top - label.bottom) : null
        })
        expect.soft(multiLabelGap, 'QSelect multiple label clears chips').not.toBeNull()
        expect.soft(multiLabelGap ?? 0, 'QSelect multiple label clears chips').toBeGreaterThanOrEqual(4)

        // --- legacy variant alias: caller/storage glass migrates to canonical air ---
        const legacyVariant = await page.evaluate(() => {
          const ds = (window as unknown as { __qdsGallery: any }).__qdsGallery
          const returned = ds.setVariant('glass')
          return { returned, variant: ds.variant.value, hasAir: document.body.classList.contains('qds-variant-air') }
        })
        expect.soft(legacyVariant.returned, 'legacy glass setVariant return').toBe('air')
        expect.soft(legacyVariant.variant, 'legacy glass canonical state').toBe('air')
        expect.soft(legacyVariant.hasAir, 'legacy glass applies air class').toBe(true)
        await applyTheme(page, mode, variant)

        // --- QTable: shell, rows, and header consume QDS surface tokens ---
        const table = `${PANEL} .q-table__container`
        expect.soft(await computed(page, table, 'border-radius'), 'QTable container radius').toBe(
          EXPECTED_CARD_RADIUS[variant],
        )
        expect.soft(await computed(page, table, 'box-shadow'), 'QTable container shadow').not.toBe('none')
        expect.soft(await computed(page, `${PANEL} .q-table th`, 'text-transform'), 'QTable header casing').toBe('none')

        // --- QPagination: current page is tonal, not Material solid primary ---
        const currentPage = `${PANEL} .q-pagination .q-btn.bg-primary`
        expect.soft(await computed(page, currentPage, 'background-color'), 'QPagination active tonal bg').toMatch(
          PRIMARY_RGB_PATTERN,
        )
        expect.soft(await computed(page, currentPage, 'background-color'), 'QPagination not Material primary').not.toBe(
          'rgb(25, 118, 210)',
        )

        // --- QDrawer: layout shell uses tokenized acrylic side surface ---
        const drawer = `${PANEL} .q-drawer`
        expect.soft(await computed(page, drawer, 'color'), 'QDrawer text color').not.toBe('rgba(0, 0, 0, 0)')
        expect.soft(await computed(page, drawer, 'border-right-color'), 'QDrawer border').not.toBe('rgba(0, 0, 0, 0)')
        expect.soft(await computed(page, drawer, 'border-right-style'), 'QDrawer explicit border style').toBe('solid')

        // --- QFooter: tokenized surface + border-top (not border-bottom) ---
        const footer = `${PANEL} .q-footer`
        await expect(page.locator(footer).first(), 'QFooter rendered').toBeVisible()
        expect.soft(await computed(page, footer, 'background-color'), 'QFooter bg matches toolbar').toBe(
          await computed(page, `${PANEL} .q-toolbar`, 'background-color'),
        )
        expect.soft(await computed(page, footer, 'color'), 'QFooter text color').not.toBe('rgba(0, 0, 0, 0)')
        expect.soft(await computed(page, footer, 'border-top-width'), 'QFooter border-top width').toBe('1px')
        expect.soft(await computed(page, footer, 'border-top-style'), 'QFooter border-top style').toBe('solid')
        expect.soft(await computed(page, footer, 'border-top-color'), 'QFooter border-top color').not.toBe('rgba(0, 0, 0, 0)')
        // Border-bottom must be cleared by the footer override.
        expect.soft(await computed(page, footer, 'border-bottom-width'), 'QFooter border-bottom cleared').toBe('0px')
        expect.soft(await computed(page, footer, 'box-shadow'), 'QFooter no box-shadow').toBe('none')

        // --- QPageSticky: layout helper present, transparent background ---
        const stickyBtn = `${PANEL} .q-page-sticky .q-btn`
        await expect(page.locator(stickyBtn).first(), 'QPageSticky button rendered').toBeVisible()
        const stickyParent = page.locator(`${PANEL} .q-page-sticky`).first()
        expect.soft(
          await stickyParent.evaluate((el) => getComputedStyle(el as Element).backgroundColor),
          'QPageSticky transparent bg',
        ).toBe('rgba(0, 0, 0, 0)')

        // --- selection controls: selected states are primary tonal, not default Material blue ---
        const checkboxBg = `${PANEL} .q-checkbox .q-checkbox__bg`
        expect.soft(await computed(page, checkboxBg, 'background-color'), 'QCheckbox selected tonal bg').toMatch(
          PRIMARY_RGB_PATTERN,
        )
        expect.soft(await computed(page, `${PANEL} .q-checkbox .q-checkbox__inner`, 'font-size'), 'QCheckbox compact inner').toBe('32px')
        const checkboxGeometry = await page.locator(`${PANEL} .q-checkbox:has-text("Checkbox selected")`).first().evaluate((el) => {
          const bg = (el as Element).querySelector('.q-checkbox__bg')!.getBoundingClientRect()
          const svg = (el as Element).querySelector('.q-checkbox__svg')!.getBoundingClientRect()
          return {
            bg: { left: bg.left, top: bg.top, right: bg.right, bottom: bg.bottom },
            svg: { left: svg.left, top: svg.top, right: svg.right, bottom: svg.bottom },
          }
        })
        expect.soft(checkboxGeometry.svg.left, 'QCheckbox svg stays inside bg left').toBeGreaterThanOrEqual(checkboxGeometry.bg.left - 0.5)
        expect.soft(checkboxGeometry.svg.top, 'QCheckbox svg stays inside bg top').toBeGreaterThanOrEqual(checkboxGeometry.bg.top - 0.5)
        expect.soft(checkboxGeometry.svg.right, 'QCheckbox svg stays inside bg right').toBeLessThanOrEqual(checkboxGeometry.bg.right + 0.5)
        expect.soft(checkboxGeometry.svg.bottom, 'QCheckbox svg stays inside bg bottom').toBeLessThanOrEqual(checkboxGeometry.bg.bottom + 0.5)
        expect.soft(await computed(page, `${PANEL} .q-radio .q-radio__bg`, 'background-color'), 'QRadio selected tonal bg').toMatch(
          PRIMARY_RGB_PATTERN,
        )
        expect.soft(await computed(page, `${PANEL} .q-radio:has-text("Comfortable density") .q-radio__bg`, 'border-top-width'), 'QRadio selected ring width').toBe('1px')
        expect.soft(await computed(page, `${PANEL} .q-radio:has-text("Comfortable density") .q-radio__bg`, 'border-top-color'), 'QRadio selected ring color').toBe(PRIMARY)
        expect.soft(await computed(page, `${PANEL} .q-radio:has-text("Comfortable density") .q-radio__check`, 'fill'), 'QRadio selected dot color').toBe(PRIMARY)
        const unselectedRadio = page.locator(`${PANEL} .q-radio:has-text("Compact density")`).first()
        const unselectedRadioState = await unselectedRadio.evaluate((el) => {
          const bg = el.querySelector('.q-radio__bg') as Element
          const check = el.querySelector('.q-radio__check') as Element
          return {
            bg: getComputedStyle(bg).backgroundColor,
            dotTransform: getComputedStyle(check).transform,
          }
        })
        expect.soft(unselectedRadioState.bg, 'QRadio unselected not primary-filled').not.toMatch(PRIMARY_RGB_PATTERN)
        expect.soft(unselectedRadioState.dotTransform, 'QRadio unselected dot hidden').not.toBe('matrix(1, 0, 0, 1, 0, 0)')
        const toggleTrack = `${PANEL} .q-toggle .q-toggle__track`
        expect.soft(await computed(page, toggleTrack, 'background-color'), 'QToggle selected track').toMatch(
          PRIMARY_RGB_PATTERN,
        )
        expect.soft(await computed(page, `${PANEL} .q-toggle .q-toggle__inner`, 'height'), 'QToggle compact shell').toBe('32px')
        const toggleGeometry = await page.locator(`${PANEL} .q-toggle:has-text("Enable tonal surfaces")`).first().evaluate((el) => {
          const track = (el as Element).querySelector('.q-toggle__track')!.getBoundingClientRect()
          const thumb = (el as Element).querySelector('.q-toggle__thumb')!.getBoundingClientRect()
          return {
            verticalDelta: Math.abs((track.top + track.height / 2) - (thumb.top + thumb.height / 2)),
            thumbInsideTrack: thumb.left >= track.left && thumb.right <= track.right,
          }
        })
        expect.soft(toggleGeometry.verticalDelta, 'QToggle thumb centered vertically').toBeLessThanOrEqual(1)
        expect.soft(toggleGeometry.thumbInsideTrack, 'QToggle thumb stays inside track').toBe(true)
        const denseControls = await page.locator(`${PANEL} .q-checkbox--dense`).first().evaluate((el) => {
          const radio = document.querySelector('.q-tab-panel .q-radio--dense') as Element
          const toggle = document.querySelector('.q-tab-panel .q-toggle--dense') as Element
          const denseCheckboxBg = (el.querySelector('.q-checkbox__bg') as Element).getBoundingClientRect()
          const denseCheckboxSvg = (el.querySelector('.q-checkbox__svg') as Element).getBoundingClientRect()
          const denseToggleTrack = (toggle.querySelector('.q-toggle__track') as Element).getBoundingClientRect()
          const denseToggleThumb = (toggle.querySelector('.q-toggle__thumb') as Element).getBoundingClientRect()
          return {
            checkboxWidth: getComputedStyle(el.querySelector('.q-checkbox__inner') as Element).width,
            radioWidth: getComputedStyle(radio.querySelector('.q-radio__inner') as Element).width,
            toggleHeight: getComputedStyle(toggle.querySelector('.q-toggle__inner') as Element).height,
            checkboxSvgInside:
              denseCheckboxSvg.left >= denseCheckboxBg.left - 0.5 &&
              denseCheckboxSvg.top >= denseCheckboxBg.top - 0.5 &&
              denseCheckboxSvg.right <= denseCheckboxBg.right + 0.5 &&
              denseCheckboxSvg.bottom <= denseCheckboxBg.bottom + 0.5,
            toggleVerticalDelta: Math.abs(
              (denseToggleTrack.top + denseToggleTrack.height / 2) - (denseToggleThumb.top + denseToggleThumb.height / 2),
            ),
          }
        })
        expect.soft(denseControls.checkboxWidth, 'QCheckbox dense branch preserved').toBe('20px')
        expect.soft(denseControls.radioWidth, 'QRadio dense branch preserved').toBe('20px')
        expect.soft(denseControls.toggleHeight, 'QToggle dense branch preserved').toBe('20px')
        expect.soft(denseControls.checkboxSvgInside, 'QCheckbox dense svg stays clipped inside bg').toBe(true)
        expect.soft(denseControls.toggleVerticalDelta, 'QToggle dense thumb centered vertically').toBeLessThanOrEqual(1)
        expect.soft(await computed(page, `${PANEL} .q-slider .q-slider__track`, 'height'), 'QSlider compact track').toBe('6px')
        expect.soft(await computed(page, `${PANEL} .q-slider .q-slider__thumb`, 'box-shadow'), 'QSlider thumb shadow').not.toBe('none')
        expect.soft(await computed(page, `${PANEL} .q-range .q-slider__track`, 'height'), 'QRange compact track').toBe('6px')

        // --- QTooltip: teleported overlay still inherits body .qds-ui styling ---
        await page.getByRole('button', { name: /Tooltip target/ }).click()
        const tooltip = '.q-tooltip'
        await expect(page.locator(tooltip).first()).toBeVisible()
        expect.soft(await computed(page, tooltip, 'box-shadow'), 'QTooltip shadow').not.toBe('none')
        expect.soft(await computed(page, tooltip, 'border-top-width'), 'QTooltip border').toBe('1px')
        await page.getByRole('button', { name: /Tooltip target/ }).click()
        await expect(page.locator(tooltip)).toHaveCount(0)

        // --- QDialog: scrim + dialog card depth are token-driven ---
        await page.getByRole('button', { name: 'Open dialog' }).click()
        await expect(page.locator('.q-dialog').first()).toBeVisible()
        expect.soft(await computed(page, '.q-dialog__backdrop', 'background-color'), 'QDialog scrim').not.toBe(
          'rgba(0, 0, 0, 0)',
        )
        expect.soft(await computed(page, '.q-dialog .q-card', 'border-radius'), 'QDialog card radius').toBe('16px')
        await page.getByRole('button', { name: 'Cancel' }).click()

        // --- artifact: one screenshot per matrix cell ---
        await page.screenshot({
          path: testInfo.outputPath(`${mode}-${variant}.png`),
          fullPage: true,
        })
        await testInfo.attach(`${mode}-${variant}`, {
          path: testInfo.outputPath(`${mode}-${variant}.png`),
          contentType: 'image/png',
        })
      })
    }
  }

  test('dense outlined QSelect keeps control height when opened', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Icons' }).click()
    await applyTheme(page, 'light', 'fluent')

    const denseSelect = page.locator('.icons-dense-select').first()
    const control = denseSelect.locator('.q-field__control')
    await expect(denseSelect).toBeVisible()

    const heightBeforeOpen = await control.evaluate((el) => el.getBoundingClientRect().height)
    await control.click()
    await expect(page.getByRole('listbox').first()).toBeVisible()
    const heightAfterOpen = await control.evaluate((el) => el.getBoundingClientRect().height)

    expect(heightBeforeOpen, 'dense select has measurable control height').toBeGreaterThan(0)
    expect(heightAfterOpen - heightBeforeOpen, 'dense select control height must not increase on focus/open').toBeLessThanOrEqual(1)
  })

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

  test('legacy glass variant input migrates to canonical air', async ({ page }) => {
    await page.goto('/')
    const state = await page.evaluate(() => {
      const ds = (window as unknown as { __qdsGallery: any }).__qdsGallery
      const returned = ds.setVariant('glass')
      return {
        returned,
        variant: ds.variant.value,
        hasAir: document.body.classList.contains('qds-variant-air'),
        hasGlass: document.body.classList.contains('qds-variant-glass'),
        labels: Array.from(document.querySelectorAll('.gallery-switcher__button span')).map((el) => el.textContent?.trim()),
      }
    })

    await expect(page.locator('body')).toHaveClass(/qds-variant-air/)
    await expect(page.locator('body')).not.toHaveClass(/qds-variant-glass/)
    expect(state.returned).toBe('air')
    expect(state.variant).toBe('air')
    expect(state.hasAir).toBe(true)
    expect(state.hasGlass).toBe(false)
    expect(state.labels).toContain('Air')
    expect(state.labels).not.toContain('Glass')
  })
})
