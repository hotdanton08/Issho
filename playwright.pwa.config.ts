import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/pwa',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:9002',
    launchOptions: { channel: 'msedge' },
    serviceWorkers: 'allow',
  },
  webServer: {
    command: 'node scripts/preview-pwa.mjs',
    url: 'http://127.0.0.1:9002',
    reuseExistingServer: !process.env.CI,
  },
});
