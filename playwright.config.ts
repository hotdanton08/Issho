import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:9000', launchOptions: { channel: 'msedge' } },
  webServer: {
    command: 'pnpm exec quasar dev --hostname 127.0.0.1 --port 9000',
    url: 'http://127.0.0.1:9000',
    reuseExistingServer: !process.env.CI,
  },
});
