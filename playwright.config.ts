import { defineConfig, devices } from '@playwright/test'

// Set PW_CHROMIUM_PATH to use a pre-installed Chromium instead of Playwright's own.
const executablePath = process.env.PW_CHROMIUM_PATH

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/portfolio/',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/portfolio/',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
})
