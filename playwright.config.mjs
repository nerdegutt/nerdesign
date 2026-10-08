import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './test',
  testMatch: /.*\.spec\.mjs/,
  fullyParallel: true,
  reporter: [['list']],
  use: { browserName: 'chromium', viewport: { width: 1280, height: 900 }, baseURL: 'http://localhost:4173/' },
  webServer: { command: 'node tools/serve.mjs 4173', url: 'http://localhost:4173/site/index.html', reuseExistingServer: true },
  outputDir: 'test-results',
});
