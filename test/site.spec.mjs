// Screenshots of every site page in light and dark + axe-core in both themes.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const pages = readdirSync(join(root, 'site')).filter((f) => f.endsWith('.html'));

for (const file of pages) for (const theme of ['light', 'dark']) {
  test(`${file} · ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(`/site/${file}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(root, `test/screenshots/${file.replace('.html', '')}-${theme}.png`), fullPage: true });
    if (file === 'grunnlag.html') expect(await page.locator('.swatch').count(), 'swatches rendered by grunnlag.js').toBeGreaterThan(20);
    expect(await page.locator('.site-theme input').count(), 'theme toggle rendered').toBe(3);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const violations = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`);
    expect(violations, violations.join('\n')).toEqual([]);
  });
}

test('forced-colors and reduced-motion render', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/site/komponenter.html'); await page.waitForLoadState('networkidle');
  await page.screenshot({ path: join(root, 'test/screenshots/komponenter-forced-colors.png'), fullPage: true });
});
