import { expect, test } from '@playwright/test'
import { QDS_TOKENS } from '../../../../src/tokens'
import { applyTheme, computed, customProperty, MATRIX_VARIANTS, resolvedColor, type Mode, type Variant } from './helpers'

type Rgba = readonly [number, number, number, number]

function contrast(first: Rgba, second: Rgba) {
  const luminance = ([red, green, blue]: Rgba) => {
    const channel = (value: number) => {
      const normalized = value / 255
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  }
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

function parseColor(value: string): Rgba {
  const channels = value.match(/[\d.]+/g)?.map(Number)
  if (!channels || channels.length < 3) throw new Error(`Expected an RGB color, received ${value}`)
  const scale = value.startsWith('color(srgb') ? 255 : 1
  return [channels[0] * scale, channels[1] * scale, channels[2] * scale, channels[3] ?? 1]
}

function composite(foreground: Rgba, backdrop: Rgba): Rgba {
  const alpha = foreground[3] + backdrop[3] * (1 - foreground[3])
  return [
    (foreground[0] * foreground[3] + backdrop[0] * backdrop[3] * (1 - foreground[3])) / alpha,
    (foreground[1] * foreground[3] + backdrop[1] * backdrop[3] * (1 - foreground[3])) / alpha,
    (foreground[2] * foreground[3] + backdrop[2] * backdrop[3] * (1 - foreground[3])) / alpha,
    alpha,
  ]
}

async function renderedContrast(page: Parameters<typeof computed>[0], selector: string, backdropSelector: string) {
  const [foreground, background, backdrop] = await Promise.all([
    computed(page, selector, 'color'),
    computed(page, selector, 'background-color'),
    computed(page, backdropSelector, 'background-color'),
  ])
  return contrast(parseColor(foreground), composite(parseColor(background), parseColor(backdrop)))
}

async function renderedBoundaryContrast(page: Parameters<typeof computed>[0], selector: string, backdropSelector: string) {
  const [border, backdrop] = await Promise.all([
    computed(page, selector, 'border-top-color'),
    computed(page, backdropSelector, 'background-color'),
  ])
  const parsedBackdrop = parseColor(backdrop)
  return contrast(composite(parseColor(border), parsedBackdrop), parsedBackdrop)
}

const EXPECTED: Record<Mode, Record<Variant, { surface: string; primary: string; controlRadius: string; cardRadius: string }>> = {
  light: {
    fluent: { surface: '#fffdf9', primary: 'rgb(0, 90, 158)', controlRadius: '4px', cardRadius: '8px' },
    ink: { surface: '#fdf9f1', primary: 'rgb(48, 48, 45)', controlRadius: '10px', cardRadius: '16px' },
    mobile: { surface: '#f9f9ff', primary: 'rgb(46, 95, 184)', controlRadius: '14px', cardRadius: '20px' },
    terminal: { surface: '#f5f3ef', primary: 'rgb(252, 196, 13)', controlRadius: '6px', cardRadius: '10px' },
  },
  dark: {
    fluent: { surface: '#1a1d22', primary: 'rgb(94, 169, 246)', controlRadius: '4px', cardRadius: '8px' },
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
        const cardBorderStyle = await computed(page, `${panel} .q-card`, 'border-top-style')
        if (variant === 'fluent' || variant === 'ink') {
          expect.soft(cardBorderStyle, `${variant} default card has a quiet hairline border`).toBe('solid')
          expect.soft(await computed(page, `${panel} .q-card`, 'border-top-width'), `${variant} card hairline is 1px`).toBe('1px')
        } else {
          expect.soft(cardBorderStyle, `${variant} card renders a solid boundary`).toBe('solid')
          expect.soft(await computed(page, `${panel} .q-card`, 'border-top-width'), `${variant} card boundary is 1px`).toBe('1px')
          expect.soft(await computed(page, `${panel} .q-card`, 'border-top-color'), `${variant} card boundary has a non-transparent color`).not.toBe('rgba(0, 0, 0, 0)')
        }

        if (variant === 'fluent') {
          expect.soft(await computed(page, `${panel} .q-card`, 'backdrop-filter'), 'Fluent content has no blur').toBe('none')
          expect.soft(await computed(page, `${panel} .q-card`, 'box-shadow'), 'Fluent resting content has no small shadow').toBe('none')
        }
        if (variant === 'ink') {
          expect.soft(await customProperty(page, '--qds-surface-negative-soft'), 'Ink negative pastel wash token').toBe(mode === 'light' ? '#f8dce3' : '#563842')
          expect.soft(await computed(page, `${panel} .q-card`, 'backdrop-filter'), 'Ink content has no blur').toBe('none')
          expect.soft(await computed(page, `${panel} .q-card`, 'box-shadow'), 'Ink content stays flat').toBe('none')
          expect.soft(await computed(page, `${panel} .qds-display`, 'font-family'), 'Ink display type is editorial serif').toMatch(/Iowan Old Style|Palatino|Georgia/)
        }
        if (variant === 'mobile') {
          expect.soft(await customProperty(page, '--qds-surface-focus-block'), 'One focus-block token differs by mode').toBe(mode === 'light' ? '#d7e4ff' : '#3c4d75')
          expect.soft(await customProperty(page, '--qds-button-padding-inline'), 'One button padding token is emitted').toBe('1rem')
          expect.soft(await customProperty(page, '--qds-button-dense-min-height'), 'One dense button size token is emitted').toBe('2.5rem')
          expect.soft(await customProperty(page, '--qds-button-dense-padding-inline'), 'One dense button padding token is emitted').toBe('.875rem')
          expect.soft(await customProperty(page, '--qds-button-round-size'), 'One round button size token is emitted').toBe('2.75rem')
          expect.soft(await customProperty(page, '--qds-field-label-size'), 'One field label token is emitted').toBe('.8125rem')
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

  test('semantic solid foregrounds resolve for every scheme and role', async ({ page }) => {
    await page.goto('/#components')
    const roles = ['primary', 'secondary', 'accent', 'positive', 'negative', 'warning', 'info'] as const

    for (const mode of ['light', 'dark'] as const) {
      for (const variant of ['fluent', 'ink', 'mobile', 'terminal'] as const) {
        await applyTheme(page, mode, variant)
        const roleStyles = await page.evaluate((roles) => {
          const resolve = (property: string, declaration: 'backgroundColor' | 'color') => {
            const probe = document.createElement('span')
            probe.style[declaration] = `var(${property})`
            document.body.append(probe)
            const value = getComputedStyle(probe)[declaration]
            probe.remove()
            return value
          }
          const contrast = (fill: string, foreground: string) => {
            const luminance = (color: string) => {
              const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? []
              const [red, green, blue] = channels.map((channel) => {
                const value = channel / 255
                return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
              })
              return 0.2126 * red + 0.7152 * green + 0.0722 * blue
            }
            const [lighter, darker] = [luminance(fill), luminance(foreground)].sort((a, b) => b - a)
            return (lighter + 0.05) / (darker + 0.05)
          }

          return roles.map((role) => {
            const action = document.createElement('button')
            action.className = `q-btn qds-solid bg-${role}`
            document.body.append(action)
            const actionStyles = getComputedStyle(action)
            const result = {
              role,
              fillToken: resolve(`--qds-color-${role}`, 'backgroundColor'),
              foregroundToken: resolve(`--qds-text-on-${role}`, 'color'),
              actionFill: actionStyles.backgroundColor,
              actionForeground: actionStyles.color,
            }
            action.remove()
            return { ...result, contrast: contrast(result.fillToken, result.foregroundToken) }
          })
        }, roles)

        for (const role of roleStyles) {
          expect.soft(role.fillToken, `${mode} ${variant} ${role.role} fill token resolves`).not.toBe('rgba(0, 0, 0, 0)')
          expect.soft(role.foregroundToken, `${mode} ${variant} ${role.role} foreground token resolves`).not.toBe('rgba(0, 0, 0, 0)')
          expect.soft(role.actionFill, `${mode} ${variant} ${role.role} solid action uses its fill`).toBe(role.fillToken)
          expect.soft(role.actionForeground, `${mode} ${variant} ${role.role} solid action uses its foreground`).toBe(role.foregroundToken)
          expect.soft(role.contrast, `${mode} ${variant} ${role.role} fill and foreground meet text contrast`).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })

  test('semantic foreground utilities match their on-fill tokens in terminal and ink modes', async ({ page }) => {
    await page.goto('/#tokens')
    const roles = ['solid', 'primary', 'secondary', 'accent', 'positive', 'negative', 'warning', 'info'] as const

    for (const mode of ['light', 'dark'] as const) {
      for (const variant of ['terminal', 'ink'] as const) {
        await applyTheme(page, mode, variant)
        await expect(page.locator('[data-test="qds-semantic-foreground-utilities"]')).toBeVisible()

        for (const role of roles) {
          const fixture = page.locator(`[data-test="qds-semantic-foreground-${role}"]`)
          await expect(fixture, `${mode}/${variant} ${role} utility fixture is visible`).toBeVisible()
          await expect(fixture, `${mode}/${variant} ${role} utility class is public`).toHaveClass(new RegExp(`qds-text-on-${role}`))
          expect.soft(
            await computed(page, `[data-test="qds-semantic-foreground-${role}"]`, 'color'),
            `${mode}/${variant} ${role} utility uses its semantic foreground`,
          ).toBe(await resolvedColor(page, `--qds-text-on-${role}`))
        }
      }
    }
  })

  test('semantic text, muted text, tonal badges, active items, and primary button variants retain AA contrast across the mode and variant matrix', async ({ page }) => {
    await page.goto('/#tokens')
    const roles = ['primary', 'secondary', 'accent', 'positive', 'negative', 'warning', 'info'] as const
    const buttonVariants = ['outline', 'flat', 'standard', 'tonal', 'solid'] as const
    const neutralBadgeVariants = ['tonal', 'outline'] as const

    for (const mode of ['light', 'dark'] as const) {
      for (const variant of ['fluent', 'ink', 'mobile', 'terminal'] as const) {
        await applyTheme(page, mode, variant)
        await page.waitForTimeout(250)
        await expect(page.locator('[data-test="qds-semantic-contrast-fixtures"]')).toBeVisible()

        for (const role of roles) {
          expect.soft(
            await renderedContrast(page, `[data-test="qds-semantic-text-${role}"]`, `[data-test="qds-semantic-text-surface-${role}"]`),
            `${mode}/${variant} ${role} semantic text reaches AA contrast`,
          ).toBeGreaterThanOrEqual(4.5)
          expect.soft(
            await renderedContrast(page, `[data-test="qds-tonal-badge-${role}"]`, '[data-test="qds-tonal-badge-surface"]'),
            `${mode}/${variant} ${role} tonal badge reaches AA contrast`,
          ).toBeGreaterThanOrEqual(4.5)
        }

        for (const badge of neutralBadgeVariants) {
          expect.soft(
            await renderedContrast(page, `[data-test="qds-neutral-badge-${badge}"]`, '[data-test="qds-neutral-badge-surface"]'),
            `${mode}/${variant} neutral ${badge} badge reaches AA contrast`,
          ).toBeGreaterThanOrEqual(4.5)
          expect.soft(
            await renderedBoundaryContrast(page, `[data-test="qds-neutral-badge-${badge}"]`, '[data-test="qds-neutral-badge-surface"]'),
            `${mode}/${variant} neutral ${badge} badge boundary reaches contrast guidance`,
          ).toBeGreaterThanOrEqual(3)
        }

        for (const surface of [0, 1, 2, 3] as const) {
          expect.soft(
            await renderedContrast(page, `[data-test="qds-muted-text-${surface}"]`, `[data-test="qds-muted-text-surface-${surface}"]`),
            `${mode}/${variant} muted text on surface ${surface} reaches AA contrast`,
          ).toBeGreaterThanOrEqual(4.5)
        }

        for (const button of buttonVariants) {
          expect.soft(
            await renderedContrast(page, `[data-test="qds-button-${button}-primary"]`, '[data-test="qds-button-contrast-surface"]'),
            `${mode}/${variant} primary ${button} button reaches AA contrast`,
          ).toBeGreaterThanOrEqual(4.5)
        }
        expect.soft(
          await computed(page, '[data-test="qds-button-solid-primary"]', 'color'),
          `${mode}/${variant} primary solid button retains its on-fill foreground`,
        ).toBe(await resolvedColor(page, '--qds-text-on-primary'))

        expect.soft(
          await renderedContrast(page, '[data-test="qds-active-item"]', '[data-test="qds-active-item-surface"]'),
          `${mode}/${variant} active item reaches AA contrast`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  test('public token inventory is exactly the set of fallback/default layer emissions', async ({ page }) => {
    await page.goto('/')
    const emittedTokens = await page.evaluate(() => {
      const tokens = new Set<string>()
      const visit = (rules: CSSRuleList, withinTokenLayer = false) => {
        for (const rule of rules) {
          const groupingRule = rule as CSSRule & { cssRules?: CSSRuleList; name?: string }
          const inTokenLayer = withinTokenLayer || groupingRule.name === 'qds.tokens'
          if (inTokenLayer && rule instanceof CSSStyleRule) {
            for (const property of rule.style) {
              if (property.startsWith('--qds-')) tokens.add(property)
            }
          }
          if (groupingRule.cssRules) visit(groupingRule.cssRules, inTokenLayer)
        }
      }
      for (const stylesheet of document.styleSheets) {
        try {
          visit(stylesheet.cssRules)
        } catch {
          // Ignore inaccessible third-party stylesheets; package styles are same-origin.
        }
      }
      return [...tokens].sort()
    })

    expect(new Set(QDS_TOKENS).size, 'QDS_TOKENS has no duplicate public names').toBe(QDS_TOKENS.length)

    const sortedInventory = [...QDS_TOKENS].sort()
    expect(sortedInventory, 'QDS_TOKENS matches fallback/default layer emission exactly').toEqual(emittedTokens)
  })

  test('horizontal card header round action retains its tokenized end inset', async ({ page }) => {
    await page.goto('/#components')
    const header = page.locator('[data-test="qds-card-header-action"] .qds-card__header')
    const action = header.locator('.q-btn--round')

    for (const mode of ['light', 'dark'] as const) {
      for (const variant of ['fluent', 'ink', 'mobile', 'terminal'] as const) {
        await applyTheme(page, mode, variant)
        const [headerBox, actionBox, paddingEnd] = await Promise.all([
          header.boundingBox(),
          action.boundingBox(),
          header.evaluate((element) => getComputedStyle(element).paddingInlineEnd),
        ])

        expect(headerBox, `${mode}/${variant} card header fixture is rendered`).not.toBeNull()
        expect(actionBox, `${mode}/${variant} round action fixture is rendered`).not.toBeNull()
        expect(headerBox!.x + headerBox!.width - (actionBox!.x + actionBox!.width), `${mode}/${variant} round action stays inset from the header edge`).toBeGreaterThanOrEqual(parseFloat(paddingEnd) - 0.1)
      }
    }
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
