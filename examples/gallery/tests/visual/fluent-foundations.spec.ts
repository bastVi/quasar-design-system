import { expect, test } from '@playwright/test'
import { applyTheme, coarsePointer, computed, customProperty, resolvedColor } from './helpers'

type Rgb = readonly [number, number, number]

function contrast(first: Rgb, second: Rgb) {
  const luminance = ([red, green, blue]: Rgb) => {
    const channel = (value: number) => {
      const normalized = value / 255
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
    }

    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  }

  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

function parseRgb(value: string): Rgb {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number)
  if (channels?.length !== 3) throw new Error(`Expected a resolved RGB color, received ${value}`)
  return channels as unknown as Rgb
}

async function tokenColor(page: Parameters<typeof customProperty>[0], token: string) {
  const color = await resolvedColor(page, token)
  return { color, rgb: parseRgb(color) }
}

test.describe('Fluent foundation contract', () => {
  test('uses the 24/32/40 control scale with a label band above the field and an opt-in 48px float field', async ({ page }) => {
    await page.goto('/#components')
    await applyTheme(page, 'light', 'fluent')

    const panel = '.q-tab-panel'
    const defaultField = '[data-test="qds-control-input"] .q-field'
    const floatField = '[data-test="qds-field-float"] .q-field--outlined.qds-field--float'
    // Coarse pointers raise sm/md to the 32/40px touch steps; lg stays 40px.
    const coarse = await coarsePointer(page)
    expect(await customProperty(page, '--qds-control-size-sm')).toBe(coarse ? '2rem' : '1.5rem')
    expect(await customProperty(page, '--qds-control-size-md')).toBe(coarse ? '2.5rem' : '2rem')
    expect(await customProperty(page, '--qds-control-size-lg')).toBe('2.5rem')
    expect(await computed(page, `${panel} .q-btn.q-btn--unelevated:not(.q-btn--dense)`, 'min-height')).toBe(coarse ? '40px' : '32px')
    expect(await computed(page, `${defaultField} .q-field__control`, 'min-height'), 'default field control is 32px (40px touch)').toBe(coarse ? '40px' : '32px')
    expect(await computed(page, defaultField, 'padding-top'), 'default field reserves a 20px label line plus 4px gap above the control').toBe('24px')
    expect(await computed(page, `${floatField} .q-field__control`, 'min-height'), 'opt-in float field keeps a 48px label band').toBe('48px')
    expect(await customProperty(page, '--qds-button-dense-min-height')).toBe(coarse ? '2rem' : '1.5rem')
    expect(await customProperty(page, '--qds-field-min-height')).toBe('3rem')
    expect(await customProperty(page, '--qds-field-dense-min-height')).toBe('2.5rem')
    expect(await customProperty(page, '--qds-chip-min-height')).toBe('1.75rem')
    expect(await customProperty(page, '--qds-chip-padding')).toBe('0 .75rem')
    expect(await customProperty(page, '--qds-chip-dense-min-height')).toBe('1.5rem')
    expect(await customProperty(page, '--qds-chip-dense-padding')).toBe('0 .5rem')
    expect(await customProperty(page, '--qds-badge-min-height')).toBe('1.25rem')
    expect(await customProperty(page, '--qds-compact-action-size')).toBe(coarse ? '2.5rem' : '2rem')
    expect(await customProperty(page, '--qds-compact-action-icon-size')).toBe('1rem')

    await applyTheme(page, 'light', 'one')
    expect(await computed(page, `${panel} .q-btn.q-btn--unelevated:not(.q-btn--dense)`, 'min-height')).toBe('44px')
    expect(await computed(page, `${defaultField} .q-field__control`, 'min-height'), 'One default field control meets the 44px touch height').toBe('44px')
    expect(await computed(page, `${floatField} .q-field__control`, 'min-height')).toBe('48px')
    expect(await customProperty(page, '--qds-button-dense-min-height')).toBe('2.5rem')
    expect(await customProperty(page, '--qds-control-size-sm')).toBe('2.5rem')
  })

  test('uses independently tuned Fluent dark semantic fills, soft surfaces, and focus boundaries', async ({ page }) => {
    await page.goto('/#components')
    await applyTheme(page, 'dark', 'fluent')

    const roles = ['primary', 'secondary', 'accent', 'positive', 'negative', 'warning', 'info'] as const
    for (const role of roles) {
      const fill = await tokenColor(page, `--qds-color-${role}`)
      const foreground = await tokenColor(page, `--qds-text-on-${role}`)
      expect(contrast(fill.rgb, foreground.rgb), `${role} solid text contrast`).toBeGreaterThanOrEqual(4.5)
    }

    const surface = await tokenColor(page, '--qds-surface-0')
    for (const token of ['--qds-color-primary', '--qds-color-negative']) {
      const boundary = await tokenColor(page, token)
      expect(contrast(boundary.rgb, surface.rgb), `${token} boundary contrast`).toBeGreaterThanOrEqual(3)
    }

    const text = await tokenColor(page, '--qds-text')
    const softTokens = [
      '--qds-surface-brand-soft', '--qds-surface-accent-soft', '--qds-surface-positive-soft',
      '--qds-surface-warning-soft', '--qds-surface-negative-soft', '--qds-surface-info-soft',
      '--qds-surface-focus-block', '--qds-surface-transient',
    ]
    const softColors: string[] = []
    for (const token of softTokens) {
      const soft = await tokenColor(page, token)
      softColors.push(soft.color)
      expect(contrast(text.rgb, soft.rgb), `${token} text contrast`).toBeGreaterThanOrEqual(4.5)
    }
    expect(new Set(softColors).size, 'dark semantic soft surfaces are independently tuned').toBe(softColors.length)
  })
})
