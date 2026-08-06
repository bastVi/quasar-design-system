import { expect, test } from '@playwright/test'
import { applyTheme, computed, customProperty, resolvedColor } from './helpers'

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
  test('derives field, button, chip, and compact-action geometry from the shared control scale', async ({ page }) => {
    await page.goto('/#components')
    await applyTheme(page, 'light', 'fluent')

    const panel = '.q-tab-panel'
    expect(await computed(page, `${panel} .q-btn.q-btn--unelevated:not(.q-btn--dense)`, 'min-height')).toBe('36px')
    expect(await computed(page, `${panel} .q-field--outlined .q-field__control`, 'min-height')).toBe('36px')
    expect(await customProperty(page, '--qds-button-dense-min-height')).toBe('2rem')
    expect(await customProperty(page, '--qds-field-dense-min-height')).toBe('2rem')
    expect(await customProperty(page, '--qds-chip-min-height')).toBe('1.875rem')
    expect(await customProperty(page, '--qds-chip-padding')).toBe('.25rem .625rem')
    expect(await customProperty(page, '--qds-chip-dense-min-height')).toBe('1.625rem')
    expect(await customProperty(page, '--qds-chip-dense-padding')).toBe('.125rem .5rem')
    expect(await customProperty(page, '--qds-badge-min-height')).toBe('1.375rem')
    expect(await customProperty(page, '--qds-compact-action-size')).toBe('2.25rem')
    expect(await customProperty(page, '--qds-compact-action-icon-size')).toBe('1rem')

    await applyTheme(page, 'light', 'mobile')
    expect(await computed(page, `${panel} .q-btn.q-btn--unelevated:not(.q-btn--dense)`, 'min-height')).toBe('44px')
    expect(await computed(page, `${panel} .q-field--outlined .q-field__control`, 'min-height')).toBe('44px')
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
