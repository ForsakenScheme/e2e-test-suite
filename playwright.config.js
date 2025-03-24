// const path = require('node:path')
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './e2e-tests',
  /* Run tests in files in parallel */
  // fullyParallel: true,
  // /* Fail the build on CI if you accidentally left test.only in the source code. */
  // forbidOnly: !!process.env.CI,
  // /* Retry on CI only */
  // retries: process.env.CI ? 2 : 0,
  // /* Opt out of parallel tests on CI. */
  // workers: process.env.CI ? 1 : undefined,
  // /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // reporter: 'html',
  // /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  // use: {
  //   /* Base URL to use in actions like `await page.goto('/')`. */
  //   // baseURL: 'http://127.0.0.1:3000',

  //   /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
  //   trace: 'on-first-retry',
  // },
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  // timeout: 9000000 ,
  // expect: {
  //   /**
  //    * Maximum time expect() should wait for the condition to be met.
  //    * For example in `await expect(locator).toHaveText();`
  //    */
  //   timeout: 9000000 ,
  // },
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  // retries: 3,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    locale: 'en-GB',
    // Emulates the user timezone.
    timezoneId: 'Europe/London',
    permissions: ['clipboard-read', 'clipboard-write', 'notifications'],

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  projects:
  [
    {
      name: 'chrome@latest:OSX Ventura@browserstack',
      use: {
        permissions: ['clipboard-read', 'clipboard-write', 'notifications'],
        locale: 'en-GB'
      }
    }, {
      name: 'chrome',
      use: {
        permissions: ['clipboard-read', 'clipboard-write', 'notifications'],
        locale: 'en-GB'
      }
    }, {
      name: 'playwright-firefox@latest:OSX Ventura@browserstack',
      use: {
        locale: 'en-GB'
      }
    }, {
      name: 'playwright-firefox',
      use: {
        permissions: ['clipboard-read', 'clipboard-write', 'notifications'],
        locale: 'en-GB'
      }
    }, {
      name: 'edge@latest:OSX Ventura@browserstack',
      use: {
        channel: 'msedge',
        locale: 'en-GB',
        permissions: ['clipboard-read', 'clipboard-write', 'notifications']
      }
    }, {
      name: 'edge',
      use: {
        channel: 'msedge',
        locale: 'en-GB',
        permissions: ['clipboard-read', 'clipboard-write', 'notifications']
      }
    }, {
      name: 'playwright-webkit',
      use: {
        locale: 'en-GB'
      }
    }, {
      name: 'chrome@Samsung Galaxy S22:13',
      use: {
        ...devices['Samsung Galaxy S22:13'],
        hasTouch: true,
        browserName: 'chromium',
        channel: 'chrome',
        locale: 'en-GB',
        permissions: ['clipboard-read', 'clipboard-write', 'notifications'],
        mobile: true
      }
    }, {
      name: 'chrome@Samsung Galaxy S22:13@browserstack-mobile',
      use: {
        hasTouch: true,
        browserName: 'chromium',
        channel: 'chrome',
        locale: 'en-GB',
        permissions: ['clipboard-read', 'clipboard-write', 'notifications'],
        mobile: true,
        acceptDownloads: true

      }
    }, {
      name: 'chrome@Galaxy S9+',
      use: {
        ...devices['Galaxy S9+'],
        hasTouch: true,
        browserName: 'chromium',
        channel: 'chrome',
        locale: 'en-GB',
        permissions: ['clipboard-read', 'clipboard-write', 'notifications'],
        mobile: true
      }
    }
  ]
});
