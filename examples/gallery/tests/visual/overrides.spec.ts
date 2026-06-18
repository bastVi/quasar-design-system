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

// Expected resolved values, derived from src/tokens/_default.scss.
// --qds-radius-control: studio 10 / glass 14 / mobile 16.
const EXPECTED_CONTROL_RADIUS: Record<Variant, string> = {
  studio: '10px',
  glass: '14px',
  mobile: '16px',
}

// --qds-surface-0 resolved per mode (drives --qds-card-bg / --qds-menu-bg / notify).
const LIGHT_SURFACE = 'rgb(255, 255, 255)' // #ffffff
const DARK_SURFACE = 'rgb(31, 31, 31)' //   #1f1f1f
const SURFACE: Record<Mode, string> = { light: LIGHT_SURFACE, dark: DARK_SURFACE }

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
        // Non-dense unelevated button inside the panel (avoids the dense toolbar toggles).
        const btn = `${PANEL} .q-btn--unelevated:not(.q-btn--dense)`
        expect.soft(await computed(page, btn, 'border-radius'), 'QBtn radius').toBe(
          EXPECTED_CONTROL_RADIUS[variant],
        )
        expect.soft(await computed(page, btn, 'font-weight'), 'QBtn font-weight').toBe('500')

        // Tonal semantic button (the gallery's `color=primary text-color=primary`
        // example → `.bg-primary.text-primary`): bg is the token-driven translucent
        // primary, NOT Quasar's solid opaque default. rgba(...) => has alpha.
        const tonal = `${PANEL} .q-btn.bg-primary.text-primary`
        expect.soft(await computed(page, tonal, 'background-color'), 'QBtn tonal bg').toMatch(
          /^rgba\(32,\s*125,\s*211/, // primary rgb, translucent
        )
        // Tonal text = solid primary (token), not white-on-primary.
        expect.soft(await computed(page, tonal, 'color'), 'QBtn tonal text').toBe('rgb(32, 125, 211)')

        // --- focus ring: var(--qds-focus-ring) applies on :focus-visible ---
        // Headless Chromium will not reliably enter :focus-visible (keyboard
        // modality is flaky), so prove the override deterministically in two halves:
        //   (a) the --qds-focus-ring token resolves to the 2px primary @ .18 ring, and
        //   (b) the rendered cascade contains the QDS :focus-visible rule wiring
        //       box-shadow to that token.
        const ringTarget = page.locator(btn).first()
        const ringToken = await ringTarget.evaluate((el) =>
          getComputedStyle(el as Element).getPropertyValue('--qds-focus-ring').trim(),
        )
        expect.soft(ringToken, 'QBtn focus-ring token').toContain('rgba(32, 125, 211, .18)')
        const focusRuleBoxShadow = await page.evaluate(() => {
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
                return (r as CSSStyleRule).style.boxShadow
              }
            }
          }
          return null
        })
        expect.soft(focusRuleBoxShadow, 'QBtn :focus-visible rule wires the ring').toBe(
          'var(--qds-focus-ring)',
        )

        // --- QInput (outlined): border token-driven ---
        // The outlined border lives on .q-field__control::before, which Quasar
        // animates with `transition: border-color .36s` — read after it settles,
        // not mid-animation.
        const fieldControl = page.locator(`${PANEL} .q-field--outlined .q-field__control`).first()
        const fieldBefore = await settledComputed(page, () =>
          fieldControl.evaluate((el) => getComputedStyle(el as Element, '::before').borderTopColor),
        )
        // light border #d9dee7 / dark border #3f3f46
        expect.soft(fieldBefore, 'QField outlined border color').toBe(
          mode === 'dark' ? 'rgb(63, 63, 70)' : 'rgb(217, 222, 231)',
        )

        // --- QCard: bg/border/radius/shadow token-driven ---
        const card = `${PANEL} .q-card`
        expect.soft(await computed(page, card, 'border-radius'), 'QCard radius').toBe(
          variant === 'glass' ? '20px' : variant === 'mobile' ? '22px' : '16px',
        )
        expect.soft(await computed(page, card, 'box-shadow'), 'QCard shadow').not.toBe('none')
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
        // notification-radius = --qds-radius-md (11px), constant across variants.
        expect.soft(await computed(page, notify, 'border-radius'), 'QNotification radius').toBe('11px')
        expect.soft(await computed(page, notify, 'box-shadow'), 'QNotification shadow').not.toBe('none')
        expect.soft(await computed(page, notify, 'background-color'), 'QNotification bg').toBe(SURFACE[mode])

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
