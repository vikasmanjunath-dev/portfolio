import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', timeout: 30000, retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:4300', channel: process.env.CI ? undefined : 'chrome' },
  webServer: { command: 'npx serve out -l 4300', url: 'http://localhost:4300', reuseExistingServer: true, timeout: 60000 },
});
