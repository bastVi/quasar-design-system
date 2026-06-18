import { defineConfig, devices } from '@playwright/test'

// Visual verification gate (board T10): proves the design-system overrides
// actually apply on real rendered Quasar components, after Quasar's unlayered
// CSS, across every mode/variant cell. Runs against the *built* gallery via
// `vite preview` so the gate exercises the same artifact a release ships.
const PORT = 4317
const BASE_URL = `http://127.0.0.1:${PORT}/`

export default defineConfig({
  testDir: './tests/visual',
  // The override-vs-Quasar assertions are deterministic; never retry-mask a gap.
  retries: 0,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
  },
  // Desktop + mobile viewports; mode × variant are driven inside the spec.
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    // Build then preview the production bundle so the gate matches the release.
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
