import { defineConfig, devices } from '@playwright/test';

/**
 * NextDocs Playwright Configuration
 * E2E Testing Setup for Documentation Platform
 */
export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,
  
  globalSetup: require.resolve('./tests/playwright/global-setup'),
  globalTeardown: require.resolve('./tests/playwright/global-teardown'),
  
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:9981',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: './tests/.auth/user.json',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev server before tests (optional)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:9980',
  //   reuseExistingServer: !process.env.CI,
  // },
});
