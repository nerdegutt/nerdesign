// The dashboard example: charts render in both themes, re-render on theme
// change, every chart has a data table, axe is clean.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { join } from 'node:path';
const root = join(import.meta.dirname, '..');

for (const theme of ['light', 'dark']) {
  test(`dashboard example · ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/examples/dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    expect(await page.locator('.nd-chart-canvas:has(canvas)').count(), 'five charts drawn').toBe(5);
    await page.screenshot({ path: join(root, `test/screenshots/dashboard-${theme}.png`), fullPage: true });
    if (theme === 'dark') await page.screenshot({ path: join(root, 'examples/img/dashboard.png'), clip: { x: 0, y: 0, width: 1280, height: 860 } });
    // data table toggles open and has rows
    await page.locator('#c2 ~ .nd-chart-footer .nd-datatable-toggle').click();
    expect(await page.locator('#c2-t tbody tr').count()).toBe(14);
    expect(await page.locator('#c2 ~ .nd-chart-footer .nd-datatable-toggle').getAttribute('aria-expanded')).toBe('true');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const violations = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`);
    expect(violations, violations.join('\n')).toEqual([]);
  });
}

test('charts re-render when the theme toggles', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/examples/dashboard.html');
  await page.waitForLoadState('networkidle');
  const before = await page.locator('#c1 canvas').evaluate((c) => c.toDataURL().length);
  await page.locator('#theme input[value="dark"]').check({ force: true });
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  const after = await page.locator('#c1 canvas').evaluate((c) => c.toDataURL().length);
  expect(after, 'canvas repainted with the dark theme').not.toBe(before);
});

test('lightbox wraps gallery images and opens', async ({ page }) => {
  await page.goto('/site/komponenter.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  expect(await page.locator('.nd-gallery a.nd-zoom').count()).toBeGreaterThan(0);
  await page.locator('.nd-gallery a.nd-zoom').first().click();
  await expect(page.locator('.pswp')).toBeVisible();
  await expect(page.locator('.pswp__nd-caption')).toContainText(/./);
  await page.keyboard.press('Escape');
});

// Native controls (checkboxes, scrollbars, inputs) are drawn from color-scheme.
// It must follow the theme the page shows, not the OS, when the toggle picks one.
for (const [os, choice, expected] of [
  ['light', 'auto', 'light dark'], ['dark', 'auto', 'dark'],
  ['dark', 'light', 'light'], ['light', 'dark', 'dark'],
]) {
  test(`color-scheme · OS ${os}, toggle ${choice}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: os });
    await page.goto('/examples/dashboard.html');
    await page.evaluate(async (theme) => (await import('/dist/nd-theme.js')).ndTheme.set(theme), choice);
    const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(scheme).toBe(expected);
  });
}
