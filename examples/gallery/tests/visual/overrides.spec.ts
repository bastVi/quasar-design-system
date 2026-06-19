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
type Variant = 'studio' | 'glass' | 'mobile'

// Expected resolved values, derived from src/tokens/_default.scss (Fluent refinement).
// --qds-radius-control: studio 6 / glass 10 / mobile 14.
const EXPECTED_CONTROL_RADIUS: Record<Variant, string> = {
  studio: '6px',
  glass: '10px',
  mobile: '14px',
}
// --qds-card-radius = --qds-radius-lg: studio 12 / glass 16 / mobile 20.
const EXPECTED_CARD_RADIUS: Record<Variant, string> = {
  studio: '12px',
  glass: '16px',
  mobile: '20px',
}

// --qds-surface-0 per mode (drives --qds-card-bg / --qds-menu-bg / notify bg).
const LIGHT_SURFACE = 'rgb(255, 255, 255)' // #ffffff
const DARK_SURFACE = 'rgb(31, 31, 31)' //   #1f1f1f
const SURFACE: Record<Mode, string> = { light: LIGHT_SURFACE, dark: DARK_SURFACE }

// Primary accent #0078d4 (solid fill + focus outline).
const PRIMARY = 'rgb(0, 120, 212)'
// QField outlined border = --qds-border (strong): light #d1d1d1 / dark #424242.
const FIELD_BORDER: Record<Mode, string> = {
  light: 'rgb(209, 209, 209)',
  dark: 'rgb(66, 66, 66)',
}
// QCard/QNotification border = --qds-border-subtle: light #e0e0e0 / dark #333333.
const SUBTLE_BORDER: Record<Mode, string> = {
  light: 'rgb(224, 224, 224)',
  dark: 'rgb(51, 51, 51)',
}

const MODES: Mode[] = ['light', 'dark']
const VARIANTS: Variant[] = ['studio', 'glass', 'mobile']

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

        // SOLID: a plain colored button (bg-primary, no .qds-tonal) is now a filled
        // accent — opaque primary bg + white text (Fluent default, not tonal).
        const solid = `${PANEL} .q-btn--unelevated.bg-primary:not(.qds-tonal):not(.q-btn--dense)`
        expect.soft(await computed(page, solid, 'background-color'), 'QBtn solid bg').toBe(PRIMARY)
        expect.soft(await computed(page, solid, 'color'), 'QBtn solid text').toBe('rgb(255, 255, 255)')

        // TONAL: opt-in via .qds-tonal — translucent primary tint + primary text.
        const tonal = `${PANEL} .q-btn.qds-tonal.bg-primary`
        expect.soft(await computed(page, tonal, 'background-color'), 'QBtn tonal bg').toMatch(
          /^rgba\(0,\s*120,\s*212/, // primary rgb, translucent
        )
        expect.soft(await computed(page, tonal, 'color'), 'QBtn tonal text').toBe(PRIMARY)

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
        expect.soft(focusResolved.primary, 'QBtn focus outline-color (primary)').toBe('#0078d4')

        // --- QInput (outlined): border token-driven (= --qds-border, strong) ---
        // Border lives on .q-field__control::before; Quasar animates border-color
        // (.36s) so read after it settles, not mid-animation.
        const fieldControl = page.locator(`${PANEL} .q-field--outlined .q-field__control`).first()
        const fieldBefore = await settledComputed(page, () =>
          fieldControl.evaluate((el) => getComputedStyle(el as Element, '::before').borderTopColor),
        )
        expect.soft(fieldBefore, 'QField outlined border color').toBe(FIELD_BORDER[mode])

        // --- QCard: Fluent stroke-based (NO shadow), bg/border/radius token-driven ---
        const card = `${PANEL} .q-card`
        expect.soft(await computed(page, card, 'border-radius'), 'QCard radius').toBe(
          EXPECTED_CARD_RADIUS[variant],
        )
        // Card is now flat: no elevation shadow, visible 1px subtle stroke instead.
        expect.soft(await computed(page, card, 'box-shadow'), 'QCard shadow (none)').toBe('none')
        expect.soft(await computed(page, card, 'border-top-width'), 'QCard border width').toBe('1px')
        expect.soft(await computed(page, card, 'border-top-color'), 'QCard border color').toBe(
          SUBTLE_BORDER[mode],
        )
        const cardBg = await computed(page, card, 'background-color')
        // CRITICAL stranding guard: dark card bg must resolve to the DARK QDS surface,
        // never the light surface (the regression class this gate exists for).
        expect.soft(cardBg, 'QCard bg (stranding guard)').toBe(SURFACE[mode])
        if (mode === 'dark') {
          expect.soft(cardBg, 'QCard dark bg != light surface').not.toBe(LIGHT_SURFACE)
        }

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

        // --- ripple suppressed (Material tell removed) ---
        expect.soft(await computed(page, `${PANEL} .q-ripple`, 'display'), 'QRipple suppressed').toBe('none')

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
})
