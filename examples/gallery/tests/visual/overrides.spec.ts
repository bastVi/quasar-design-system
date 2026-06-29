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
type Variant = 'fluent' | 'air' | 'mobile' | 'feather' | 'terminal'

// Expected resolved values, derived from src/tokens/_default.scss (Fluent refinement).
// --qds-radius-control: fluent 8 / air 14 / mobile 14 / feather 12 / terminal 6.
const EXPECTED_CONTROL_RADIUS: Record<Variant, string> = {
  fluent: '8px',
  air: '14px',
  mobile: '14px',
  feather: '12px',
  terminal: '6px',
}
// --qds-card-radius = --qds-radius-lg: fluent 12 / air 24 / mobile 20 / feather 22 / terminal 10.
const EXPECTED_CARD_RADIUS: Record<Variant, string> = {
  fluent: '12px',
  air: '24px',
  mobile: '20px',
  feather: '22px',
  terminal: '10px',
}

type Semantic = 'positive' | 'negative' | 'warning' | 'info'
type VariantExpectations = {
  surface: string
  lightSurface: string
  primary: string
  primaryHex: string
  primaryRgbPattern: RegExp
  fieldBorder: string
  subtleBorder: string
  semantic: Record<Semantic, string>
}

const BASE_SEMANTIC: Record<Semantic, string> = {
  positive: 'rgb(106, 143, 102)',
  negative: 'rgb(196, 43, 28)',
  warning: 'rgb(247, 99, 12)',
  info: 'rgb(85, 124, 153)',
}

const TERMINAL_SEMANTIC: Record<Semantic, string> = {
  positive: 'rgb(92, 184, 92)',
  negative: 'rgb(224, 85, 85)',
  warning: 'rgb(240, 160, 48)',
  info: 'rgb(108, 160, 220)',
}

const BASE_LIGHT: VariantExpectations = {
  surface: 'rgb(255, 253, 248)', // #fffdf8
  lightSurface: 'rgb(255, 253, 248)',
  primary: 'rgb(0, 90, 158)',
  primaryHex: '#005a9e',
  primaryRgbPattern: /^rgba\(0,\s*90,\s*158/,
  fieldBorder: 'rgb(143, 143, 143)', // #8f8f8f
  subtleBorder: 'rgb(181, 181, 181)', // #b5b5b5
  semantic: BASE_SEMANTIC,
}

const BASE_DARK: VariantExpectations = {
  surface: 'rgb(32, 34, 37)', // #202225
  lightSurface: BASE_LIGHT.lightSurface,
  primary: BASE_LIGHT.primary,
  primaryHex: BASE_LIGHT.primaryHex,
  primaryRgbPattern: BASE_LIGHT.primaryRgbPattern,
  fieldBorder: 'rgb(106, 122, 142)', // #6a7a8e
  subtleBorder: 'rgb(87, 97, 115)', // #576173
  semantic: BASE_SEMANTIC,
}

const AIR_SEMANTIC: Record<Semantic, string> = {
  positive: 'rgb(52, 199, 89)',
  negative: 'rgb(255, 59, 48)',
  warning: 'rgb(255, 149, 0)',
  info: 'rgb(90, 200, 250)',
}

const AIR_DARK_SEMANTIC: Record<Semantic, string> = {
  positive: 'rgb(48, 209, 88)',
  negative: 'rgb(255, 69, 58)',
  warning: 'rgb(255, 159, 10)',
  info: 'rgb(100, 210, 255)',
}

const EXPECTED_TOKENS: Record<Mode, Record<Variant, VariantExpectations>> = {
  light: {
    fluent: BASE_LIGHT,
    air: {
      surface: 'rgb(251, 251, 253)', // #fbfbfd
      lightSurface: 'rgb(251, 251, 253)',
      primary: 'rgb(0, 122, 255)', // #007aff
      primaryHex: '#007aff',
      primaryRgbPattern: /^rgba\(0,\s*122,\s*255/,
      fieldBorder: 'rgb(210, 210, 215)', // #d2d2d7
      subtleBorder: 'rgb(229, 229, 234)', // #e5e5ea
      semantic: AIR_SEMANTIC,
    },
    mobile: BASE_LIGHT,
    feather: {
      surface: 'rgb(251, 246, 234)', // #fbf6ea
      lightSurface: 'rgb(251, 246, 234)',
      primary: 'rgb(95, 111, 82)', // #5f6f52
      primaryHex: '#5f6f52',
      primaryRgbPattern: /^rgba\(95,\s*111,\s*82/,
      fieldBorder: 'rgb(157, 146, 127)', // #9d927f
      subtleBorder: 'rgb(210, 199, 180)', // #d2c7b4
      semantic: {
        positive: 'rgb(111, 132, 98)',
        negative: 'rgb(155, 90, 80)',
        warning: 'rgb(168, 111, 63)',
        info: 'rgb(98, 122, 120)',
      },
    },
    terminal: {
      surface: 'rgb(245, 243, 239)', // #f5f3ef
      lightSurface: 'rgb(245, 243, 239)',
      primary: 'rgb(252, 196, 13)', // #fcc40d
      primaryHex: '#fcc40d',
      primaryRgbPattern: /^rgba\(252,\s*196,\s*13/,
      fieldBorder: 'rgb(168, 164, 152)', // #a8a498
      subtleBorder: 'rgb(201, 197, 184)', // #c9c5b8
      semantic: TERMINAL_SEMANTIC,
    },
  },
  dark: {
    fluent: BASE_DARK,
    air: {
      surface: 'rgb(28, 28, 30)', // #1c1c1e
      lightSurface: 'rgb(251, 251, 253)',
      primary: 'rgb(10, 132, 255)', // #0a84ff
      primaryHex: '#0a84ff',
      primaryRgbPattern: /^rgba\(10,\s*132,\s*255/,
      fieldBorder: 'rgb(72, 72, 74)', // #48484a
      subtleBorder: 'rgb(44, 44, 46)', // #2c2c2e
      semantic: AIR_DARK_SEMANTIC,
    },
    mobile: BASE_DARK,
    feather: {
      surface: 'rgb(36, 42, 39)', // #242a27
      lightSurface: BASE_LIGHT.lightSurface,
      primary: 'rgb(101, 118, 87)', // #657657
      primaryHex: '#657657',
      primaryRgbPattern: /^rgba\(101,\s*118,\s*87/,
      fieldBorder: 'rgb(124, 134, 120)', // #7c8678
      subtleBorder: 'rgb(88, 98, 87)', // #586257
      semantic: {
        positive: 'rgb(120, 144, 106)',
        negative: 'rgb(177, 107, 97)',
        warning: 'rgb(189, 133, 81)',
        info: 'rgb(113, 139, 137)',
      },
    },
    terminal: {
      surface: 'rgb(13, 15, 18)', // #0d0f12
      lightSurface: BASE_LIGHT.lightSurface,
      primary: 'rgb(252, 196, 13)', // #fcc40d
      primaryHex: '#fcc40d',
      primaryRgbPattern: /^rgba\(252,\s*196,\s*13/,
      fieldBorder: 'rgb(74, 72, 56)', // #4a4838
      subtleBorder: 'rgb(52, 50, 40)', // #343228
      semantic: TERMINAL_SEMANTIC,
    },
  },
}

const MODES: Mode[] = ['light', 'dark']
const VARIANTS: Variant[] = ['fluent', 'air', 'mobile', 'feather', 'terminal']

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

async function resolvedCustomLength(page: Page, selector: string, customProperty: string): Promise<string> {
  return page.locator(selector).first().evaluate((el, customProperty) => {
    const probe = document.createElement('div')
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    probe.style.pointerEvents = 'none'
    probe.style.width = `var(${customProperty})`
    el.appendChild(probe)
    const width = getComputedStyle(probe).width
    probe.remove()
    return width
  }, customProperty)
}

async function waitForVariantTokens(page: Page, expected: VariantExpectations) {
  await expect
    .poll(
      () => page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--qds-color-primary').trim()),
      { message: 'variant primary token settled' },
    )
    .toBe(expected.primaryHex)
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
        const expected = EXPECTED_TOKENS[mode][variant]
        await waitForVariantTokens(page, expected)
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
        const denseBtn = `${PANEL} .q-btn--dense:not(.q-btn--round):not(.q-btn--fab):not(.q-btn--fab-mini)`
        const buttonGap = await computed(page, `${btn} .q-btn__content`, 'column-gap')
        const denseButtonGap = await computed(page, `${denseBtn} .q-btn__content`, 'column-gap')
        expect.soft(buttonGap, 'QBtn icon/text gap follows component token').toBe(
          await resolvedCustomLength(page, btn, '--qds-button-icon-gap'),
        )
        expect.soft(denseButtonGap, 'QBtn dense icon/text gap follows dense token').toBe(
          await resolvedCustomLength(page, denseBtn, '--qds-button-dense-icon-gap'),
        )
        expect.soft(parseFloat(buttonGap), 'QBtn default gap remains more comfortable than dense').toBeGreaterThan(
          parseFloat(denseButtonGap),
        )

        // Semantic colored default: tonal tint, not filled Material-style color.
        const semantic = `${PANEL} .q-btn--unelevated.bg-primary:not(.qds-solid):not(.q-btn--dense)`
        const semanticBg = await computed(page, semantic, 'background-color')
        expect.soft(semanticBg, 'QBtn semantic tonal bg').toMatch(/^rgba\(/)
        expect.soft(semanticBg, 'QBtn semantic not Quasar Material primary').not.toBe('rgb(25, 118, 210)')
        if (variant === 'feather') {
          expect.soft(semanticBg, 'QBtn feather semantic not default Fluent primary').not.toMatch(/^rgba\(0,\s*90,\s*158/)
        } else {
          expect.soft(semanticBg, 'QBtn semantic tonal bg primary channel').toMatch(expected.primaryRgbPattern)
        }
        expect.soft(await computed(page, semantic, 'color'), 'QBtn semantic tonal text').not.toBe('rgb(255, 255, 255)')

        // Explicit solid CTA remains available through .qds-solid.
        const solid = `${PANEL} .q-btn--unelevated.qds-solid.bg-primary:not(.q-btn--dense)`
        expect.soft(await computed(page, solid, 'background-color'), 'QBtn solid bg').toBe(expected.primary)
        expect.soft(await computed(page, solid, 'color'), 'QBtn solid text').toBe('rgb(255, 255, 255)')

        // TONAL: colored non-solid buttons share the same soft treatment.
        const tonal = `${PANEL} .q-btn.bg-primary:not(.qds-solid):not(.q-btn--flat):not(.q-btn--outline)`
        expect.soft(await computed(page, tonal, 'background-color'), 'QBtn tonal bg').toMatch(
          expected.primaryRgbPattern, // primary rgb, translucent
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
        expect.soft(focusResolved.primary, 'QBtn focus outline-color (primary)').toBe(expected.primaryHex)

        // --- QInput (outlined): border token-driven (= --qds-border, strong) ---
        // Border lives on .q-field__control::before; Quasar animates border-color
        // (.36s) so read after it settles, not mid-animation.
        const fieldControl = page.locator(`${PANEL} .q-field--outlined .q-field__control`).first()
        const fieldBefore = await settledComputed(page, () =>
          fieldControl.evaluate((el) => getComputedStyle(el as Element, '::before').borderTopColor),
        )
        expect.soft(fieldBefore, 'QField outlined border color').toBe(expected.fieldBorder)
        expect.soft(await fieldControl.evaluate((el) => getComputedStyle(el as Element).minHeight), 'QField thin height').toBe('36px')

        // --- QBadge/QChip: Quasar bg-* utilities must not leak Material solid fills ---
        const badge = `${PANEL} .q-badge.bg-primary`
        expect.soft(await computed(page, badge, 'background-color'), 'QBadge tonal bg').toMatch(
          expected.primaryRgbPattern,
        )
        expect.soft(await computed(page, badge, 'background-color'), 'QBadge not Quasar Material primary').not.toBe(
          'rgb(25, 118, 210)',
        )
        const chip = `${PANEL} .q-chip.bg-primary`
        expect.soft(await computed(page, chip, 'background-color'), 'QChip tonal bg').toMatch(
          expected.primaryRgbPattern,
        )
        expect.soft(await computed(page, chip, 'background-color'), 'QChip not Quasar Material primary').not.toBe(
          'rgb(25, 118, 210)',
        )
        const chipContent = `${PANEL} .q-chip.bg-positive .q-chip__content`
        const denseChipContent = `${PANEL} .q-chip.q-chip--dense .q-chip__content`
        const chipGap = await computed(page, chipContent, 'column-gap')
        const denseChipGap = await computed(page, denseChipContent, 'column-gap')
        expect.soft(chipGap, 'QChip icon/text gap follows component token').toBe(
          await resolvedCustomLength(page, chipContent, '--qds-chip-icon-gap'),
        )
        expect.soft(denseChipGap, 'QChip dense icon/text gap follows dense token').toBe(
          await resolvedCustomLength(page, denseChipContent, '--qds-chip-dense-icon-gap'),
        )
        expect.soft(parseFloat(chipGap), 'QChip dense gap stays compact').toBeGreaterThan(parseFloat(denseChipGap))
        const badgeGap = await computed(page, `${PANEL} .qds-demo-icon-badge`, 'column-gap')
        expect.soft(badgeGap, 'QBadge icon/text gap follows component token').toBe(
          await resolvedCustomLength(page, `${PANEL} .qds-demo-icon-badge`, '--qds-badge-icon-gap'),
        )

        // --- QCard: tonal acrylic surface, bg/border/radius/shadow token-driven ---
        const card = `${PANEL} .q-card`
        expect.soft(await computed(page, card, 'border-radius'), 'QCard radius').toBe(
          EXPECTED_CARD_RADIUS[variant],
        )
        const cardShadow = await computed(page, card, 'box-shadow')
        if (variant === 'air') {
          expect.soft(cardShadow, 'Air QCard removes resting card shadow').toBe('none')
        } else {
          expect.soft(cardShadow, 'QCard shadow (restrained)').not.toBe('none')
        }
        expect.soft(await computed(page, card, 'border-top-width'), 'QCard border width').toBe('1px')
        expect.soft(await computed(page, card, 'border-top-color'), 'QCard border color').not.toBe('rgba(0, 0, 0, 0)')
        const cardBg = await computed(page, card, 'background-color')
        expect.soft(cardBg, 'QCard bg (acrylic base)').not.toBe('rgba(0, 0, 0, 0)')
        if (mode === 'dark') {
          expect.soft(cardBg, 'QCard dark bg != light surface').not.toBe(expected.lightSurface)
        }
        const cardVars = await page.locator(card).first().evaluate((el) => {
          const cs = getComputedStyle(el as Element)
          return {
            bg: cs.getPropertyValue('--qds-card-bg').trim(),
            fallback: cs.getPropertyValue('--qds-card-bg-fallback').trim(),
            tintRgb: cs.getPropertyValue('--qds-card-acrylic-tint-rgb').trim(),
            primaryRgb: cs.getPropertyValue('--qds-color-primary-rgb').trim(),
            tonalOpacity: Number(cs.getPropertyValue('--qds-card-tonal-opacity').trim()),
          }
        })
        expect.soft(cardVars.bg, 'QCard token resolved').toContain('linear-gradient')
        expect.soft(cardVars.fallback, 'QCard fallback token resolved').toContain('linear-gradient')
        expect.soft(cardVars.tintRgb, 'QCard explicit acrylic tint token resolves').toMatch(/^\d+/)
        expect.soft(cardVars.bg, 'QCard bg uses resolved acrylic tint').toContain(`rgba(${cardVars.tintRgb}`)
        expect.soft(cardVars.fallback, 'QCard fallback uses resolved acrylic tint').toContain(`rgba(${cardVars.tintRgb}`)
        if (variant === 'fluent') {
          expect.soft(cardVars.tintRgb, 'Fluent QCard resting tint is neutral, not primary').not.toBe(cardVars.primaryRgb)
          expect.soft(cardVars.tonalOpacity, 'Fluent QCard resting tonal opacity is restrained').toBeLessThan(0.04)
        }
        if (variant === 'feather') {
          expect.soft(cardVars.tintRgb, 'Feather QCard keeps variant tint behavior').toBe(cardVars.primaryRgb)
        }

        // --- QMenu (open it): bg + shadow token-driven ---
        await page.getByRole('button', { name: 'Open menu' }).click()
        const menu = '.q-menu'
        await expect(page.locator(menu).first()).toBeVisible()
        expect.soft(await computed(page, menu, 'background-color'), 'QMenu bg').toBe(expected.surface)
        expect.soft(await computed(page, menu, 'border-top-color'), 'QMenu border').toBe(expected.subtleBorder)
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
        expect.soft(await computed(page, notify, 'background-color'), 'QNotification bg').toBe(expected.surface)
        const assertNotifyState = async (type: Semantic) => {
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
          expect.soft(state.bg, `QNotification ${type} keeps QDS surface`).toBe(expected.surface)
          expect.soft(state.rail, `QNotification ${type} semantic rail`).toBe(expected.semantic[type])
          expect.soft(state.border, `QNotification ${type} semantic border`).toMatch(/^rgba?\(/)
          if (state.icon) {
            expect.soft(state.icon, `QNotification ${type} semantic icon`).toBe(expected.semantic[type])
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
        const multiChip = `${PANEL} .q-select--multiple .q-chip`
        const multiChipGapToken = await page.locator(multiChip).first().evaluate((chip) =>
          chip.classList.contains('q-chip--dense') || Boolean(chip.closest('.q-field--dense'))
            ? '--qds-chip-dense-icon-gap'
            : '--qds-chip-icon-gap',
        )
        expect
          .soft(
            await computed(page, `${multiChip} .q-chip__content`, 'column-gap'),
            'QSelect multiple chips keep their density-aware chip gap',
          )
          .toBe(await resolvedCustomLength(page, multiChip, multiChipGapToken))

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
        const tableShadow = await computed(page, table, 'box-shadow')
        if (variant === 'air') {
          expect.soft(tableShadow, 'Air QTable container stays shadowless').toBe('none')
        } else {
          expect.soft(tableShadow, 'QTable container shadow').not.toBe('none')
        }
        expect.soft(await computed(page, `${PANEL} .q-table th`, 'text-transform'), 'QTable header casing').toBe('none')

        // --- QPagination: current page is tonal, not Material solid primary ---
        const currentPage = `${PANEL} .q-pagination .q-btn.bg-primary`
        expect.soft(await computed(page, currentPage, 'background-color'), 'QPagination active tonal bg').toMatch(
          expected.primaryRgbPattern,
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
          expected.primaryRgbPattern,
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
          expected.primaryRgbPattern,
        )
        expect.soft(await computed(page, `${PANEL} .q-radio:has-text("Comfortable density") .q-radio__bg`, 'border-top-width'), 'QRadio selected ring width').toBe('1px')
        expect.soft(await computed(page, `${PANEL} .q-radio:has-text("Comfortable density") .q-radio__bg`, 'border-top-color'), 'QRadio selected ring color').toBe(expected.primary)
        expect.soft(await computed(page, `${PANEL} .q-radio:has-text("Comfortable density") .q-radio__check`, 'fill'), 'QRadio selected dot color').toBe(expected.primary)
        const unselectedRadio = page.locator(`${PANEL} .q-radio:has-text("Compact density")`).first()
        const unselectedRadioState = await unselectedRadio.evaluate((el) => {
          const bg = el.querySelector('.q-radio__bg') as Element
          const check = el.querySelector('.q-radio__check') as Element
          return {
            bg: getComputedStyle(bg).backgroundColor,
            dotTransform: getComputedStyle(check).transform,
          }
        })
        expect.soft(unselectedRadioState.bg, 'QRadio unselected not primary-filled').not.toMatch(expected.primaryRgbPattern)
        expect.soft(unselectedRadioState.dotTransform, 'QRadio unselected dot hidden').not.toBe('matrix(1, 0, 0, 1, 0, 0)')
        const toggleTrack = `${PANEL} .q-toggle .q-toggle__track`
        expect.soft(await computed(page, toggleTrack, 'background-color'), 'QToggle selected track').toMatch(
          expected.primaryRgbPattern,
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
        const sliderThumbShadow = await computed(page, `${PANEL} .q-slider .q-slider__thumb`, 'box-shadow')
        if (variant === 'air') {
          expect.soft(sliderThumbShadow, 'Air QSlider thumb stays shadowless').toBe('none')
        } else {
          expect.soft(sliderThumbShadow, 'QSlider thumb shadow').not.toBe('none')
        }
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
