import { expect, type Page } from '@playwright/test'

export type Mode = 'light' | 'dark'
export type Variant = 'fluent' | 'ink' | 'mobile' | 'terminal'

export const CANONICAL_VARIANTS: Variant[] = ['fluent', 'ink', 'mobile', 'terminal']
export const MATRIX_VARIANTS: Exclude<Variant, 'terminal'>[] = ['fluent', 'ink', 'mobile']

export async function applyTheme(page: Page, mode: Mode, variant: Variant) {
  await page.waitForFunction(() => Boolean((window as unknown as { __qdsGallery?: unknown }).__qdsGallery))
  await page.evaluate(
    ({ mode, variant }) => {
      const ds = (window as unknown as { __qdsGallery: { setMode: (value: Mode) => Mode; setVariant: (value: Variant) => Variant } }).__qdsGallery
      ds.setMode(mode)
      ds.setVariant(variant)
    },
    { mode, variant },
  )
  await expect(page.locator('body')).toHaveClass(new RegExp(`qds-variant-${variant}`))
  await expect(page.locator('body')).toHaveClass(new RegExp(mode === 'dark' ? 'qds-theme-dark' : 'qds-theme-light'))
}

export async function computed(page: Page, selector: string, property: string, pseudo?: string): Promise<string> {
  return page.locator(selector).first().evaluate(
    (element, args) => getComputedStyle(element, args.pseudo).getPropertyValue(args.property).trim(),
    { property, pseudo },
  )
}

export async function customProperty(page: Page, property: string): Promise<string> {
  return page.locator('body').evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim(), property)
}

export async function resolvedColor(page: Page, property: string): Promise<string> {
  return page.locator('body').evaluate((element, name) => {
    const probe = document.createElement('span')
    probe.style.color = `var(${name})`
    element.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, property)
}
