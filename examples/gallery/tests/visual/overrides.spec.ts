import { expect, test } from '@playwright/test'
import { applyTheme, computed, customProperty, MATRIX_VARIANTS, resolvedColor, type Mode, type Variant } from './helpers'

const EXPECTED: Record<Mode, Record<Variant, { surface: string; primary: string; controlRadius: string; cardRadius: string }>> = {
  light: {
    fluent: { surface: '#fffdf9', primary: 'rgb(0, 90, 158)', controlRadius: '8px', cardRadius: '12px' },
    ink: { surface: '#fdf9f1', primary: 'rgb(48, 48, 45)', controlRadius: '10px', cardRadius: '16px' },
    mobile: { surface: '#f9f9ff', primary: 'rgb(46, 95, 184)', controlRadius: '14px', cardRadius: '20px' },
    terminal: { surface: '#f5f3ef', primary: 'rgb(252, 196, 13)', controlRadius: '6px', cardRadius: '10px' },
  },
  dark: {
    fluent: { surface: '#1d2024', primary: 'rgb(0, 90, 158)', controlRadius: '8px', cardRadius: '12px' },
    ink: { surface: '#25231f', primary: 'rgb(240, 233, 219)', controlRadius: '10px', cardRadius: '16px' },
    mobile: { surface: '#20212a', primary: 'rgb(173, 198, 255)', controlRadius: '14px', cardRadius: '20px' },
    terminal: { surface: '#0d0f12', primary: 'rgb(252, 196, 13)', controlRadius: '6px', cardRadius: '10px' },
  },
}

test.describe('QDS override gate', () => {
  for (const mode of ['light', 'dark'] as const) {
    for (const variant of MATRIX_VARIANTS) {
      test(`${mode} / ${variant} renders the catalog family with its resolved system`, async ({ page }) => {
        await page.goto('/#components')
        await applyTheme(page, mode, variant)
        const expected = EXPECTED[mode][variant]
        const panel = '.q-tab-panel'

        expect.soft(await customProperty(page, '--qds-surface-0'), 'surface token tracks the requested mode and variant').toBe(expected.surface)
        expect.soft(await resolvedColor(page, '--qds-color-primary'), 'primary color resolves from source tokens').toBe(expected.primary)
        expect.soft(await customProperty(page, '--qds-radius-control'), 'control radius token tracks the variant').toBe(expected.controlRadius)
        expect.soft(await computed(page, `${panel} .q-card`, 'border-radius'), 'QCard consumes the resolved card radius').toBe(expected.cardRadius)
        expect.soft(await computed(page, `${panel} .q-field--outlined .q-field__control`, 'border-radius'), 'QField consumes the resolved control geometry').toBe(variant === 'mobile' ? '18px' : expected.controlRadius)
        expect.soft(await computed(page, `${panel} .q-card`, 'background-color'), 'QCard has a rendered surface').not.toBe('rgba(0, 0, 0, 0)')
        expect.soft(await computed(page, `${panel} .q-card`, 'border-top-color'), 'QCard maintains a visible low-border boundary').not.toBe('rgba(0, 0, 0, 0)')

        if (variant === 'fluent') {
          expect.soft(await computed(page, `${panel} .q-card`, 'backdrop-filter'), 'Fluent content has no blur').toBe('none')
          expect.soft(await computed(page, `${panel} .q-card`, 'box-shadow'), 'Fluent resting content has no small shadow').toBe('none')
          expect.soft(await customProperty(page, '--qds-card-border-mix'), 'Fluent low-border content mix').toBe('22%')
        }
        if (variant === 'ink') {
          expect.soft(await customProperty(page, '--qds-surface-negative-soft'), 'Ink negative pastel wash token').toBe(mode === 'light' ? '#f8dce3' : '#563842')
          expect.soft(await computed(page, `${panel} .q-card`, 'backdrop-filter'), 'Ink content has no blur').toBe('none')
          expect.soft(await computed(page, `${panel} .q-card`, 'box-shadow'), 'Ink content stays flat').toBe('none')
          expect.soft(await computed(page, `${panel} .qds-display`, 'font-family'), 'Ink display type is editorial serif').toMatch(/Iowan Old Style|Palatino|Georgia/)
        }
        if (variant === 'mobile') {
          expect.soft(await customProperty(page, '--qds-surface-focus-block'), 'One focus-block token differs by mode').toBe(mode === 'light' ? '#d7e4ff' : '#3c4d75')
          expect.soft(await computed(page, `${panel} .q-btn--unelevated:not(.q-btn--dense)`, 'min-height'), 'One controls meet 44px touch target').toBe('44px')
          expect.soft(await computed(page, `${panel} .q-card`, 'background-color'), 'One groups content on a visible focus-block surface').not.toBe('rgba(0, 0, 0, 0)')
        }
      })
    }
  }

  test('Terminal focused regression preserves compact uppercase monospace contrast', async ({ page }) => {
    await page.goto('/#components')
    await applyTheme(page, 'dark', 'terminal')
    const panel = '.q-tab-panel'
    expect.soft(await customProperty(page, '--qds-font-family'), 'Terminal font token').toContain('ui-monospace')
    expect.soft(await computed(page, `${panel} .q-btn--unelevated:not(.q-btn--dense)`, 'text-transform'), 'Terminal controls uppercase').toBe('uppercase')
    expect.soft(await computed(page, `${panel} .q-btn--unelevated:not(.q-btn--dense)`, 'min-height'), 'Terminal controls remain compact').toBe('32px')
    expect.soft(await computed(page, `${panel} .q-card`, 'background-color'), 'Terminal card has visible contrast surface').not.toBe(await resolvedColor(page, '--qds-text-strong'))
  })

  test('legacy aliases normalize to canonical state, classes, and four switcher entries', async ({ page }) => {
    await page.goto('/')
    const aliases = [
      ['studio', 'fluent'], ['air', 'fluent'], ['glass', 'fluent'], ['feather', 'ink'],
    ] as const
    for (const [input, canonical] of aliases) {
      const state = await page.evaluate(({ input, canonical }) => {
        const ds = (window as unknown as { __qdsGallery: { setVariant: (value: string) => string; variant: { value: string } } }).__qdsGallery
        const returned = ds.setVariant(input)
        return {
          returned,
          value: ds.variant.value,
          canonicalClass: document.body.classList.contains(`qds-variant-${canonical}`),
          oldClass: document.body.classList.contains(`qds-variant-${input}`),
          labels: Array.from(document.querySelectorAll('[aria-label="Variant"] .gallery-switcher__button'))
            .map((el) => el.getAttribute('aria-label')),
        }
      }, { input, canonical })
      expect.soft(state.returned, `${input} returns canonical value`).toBe(canonical)
      expect.soft(state.value, `${input} stores canonical value`).toBe(canonical)
      expect.soft(state.canonicalClass, `${input} writes canonical class`).toBe(true)
      expect.soft(state.oldClass, `${input} old class is absent`).toBe(false)
      expect.soft(state.labels, `${input} exposes only canonical switcher entries`).toEqual(['Fluent', 'Ink', 'One', 'Terminal'])
    }
  })

  test('system mode follows emulated light and dark preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    const setSystem = () => page.evaluate(() => {
      const ds = (window as unknown as { __qdsGallery: { setMode: (value: 'system') => string; resolvedMode: { value: string } } }).__qdsGallery
      return { returned: ds.setMode('system'), resolved: ds.resolvedMode.value, body: document.body.dataset.qdsResolved }
    })
    expect(await setSystem()).toMatchObject({ returned: 'system', resolved: 'light', body: 'light' })
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect.poll(setSystem).toMatchObject({ returned: 'system', resolved: 'dark', body: 'dark' })
  })
})
