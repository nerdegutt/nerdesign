// Toolbar, dropdown and popover on the Komponenter page: controls line up, the popover opens and closes
// as nd-popover.js promises, and axe is clean with it open in both themes.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page) => { await page.goto('/site/komponenter.html'); await page.waitForLoadState('networkidle'); };
const box = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height }; });

test('toolbar controls are as tall as the segmented control', async ({ page }) => {
  await open(page);
  const bar = page.locator('#toolbar-demo');
  const seg = (await box(bar.locator('.nd-segmented').first())).height;
  for (const sel of ['button.nd-drop', '.nd-drop--select', '.nd-toolbar-check']) expect((await box(bar.locator(sel).first())).height, sel).toBe(seg);
});

test('toolbar end group stops pushing right on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await open(page);
  expect(await page.locator('#toolbar-demo .nd-toolbar-end').evaluate((el) => getComputedStyle(el).marginInlineStart)).toBe('0px');
});

for (const theme of ['light', 'dark']) {
  test(`popover opens, works and closes · ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await open(page);
    const btn = page.locator('#demo-sources');
    await btn.click();
    const pop = page.locator('body > .nd-popover[role="dialog"]');
    await expect(pop).toBeVisible();
    await expect(pop).toHaveAttribute('aria-label', 'Kilder');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(pop.locator('input').first()).toBeFocused();
    expect((await box(pop)).top, 'below the button').toBeGreaterThanOrEqual((await box(btn)).bottom);
    const results = await new AxeBuilder({ page }).include('.nd-popover').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const violations = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
    expect(violations, violations.join('\n')).toEqual([]);

    await pop.getByText('Mobil').click();
    await expect(btn).toHaveText('Kilder: 2 av 3');
    await page.keyboard.press('Escape');
    await expect(pop).toHaveCount(0);
    await expect(btn).toBeFocused();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');

    await btn.click(); await expect(pop).toBeVisible();
    await btn.click(); await expect(pop, 'the button toggles').toHaveCount(0);
    await btn.click(); await expect(pop).toBeVisible();
    await page.mouse.click(5, 5); await expect(pop, 'a click outside closes').toHaveCount(0);
  });
}

test('popover opens above when there is no room below, inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  await open(page);
  const btn = page.locator('#demo-sources');
  await btn.evaluate((el) => el.scrollIntoView({ block: 'end' }));
  await btn.click();
  const pop = page.locator('.nd-popover[role="dialog"]');
  const p = await box(pop), b = await box(btn);
  expect(p.bottom, 'above the button').toBeLessThanOrEqual(b.top);
  expect(p.top).toBeGreaterThanOrEqual(0);
});

test('popover goes into the fullscreen element', async ({ page }) => {
  await open(page);
  const btn = page.locator('#demo-sources');
  await page.locator('#toolbar-demo').evaluate((bar) => bar.addEventListener('dblclick', () => bar.requestFullscreen(), { once: true }));
  await page.locator('#toolbar-demo').dblclick({ position: { x: 2, y: 2 } });
  await page.waitForFunction(() => document.fullscreenElement?.id === 'toolbar-demo');
  await btn.click();
  await expect(page.locator('#toolbar-demo > .nd-popover[role="dialog"]')).toBeVisible();
  await page.evaluate(() => document.exitFullscreen());
  await expect(page.locator('.nd-popover[role="dialog"]'), 'closes when fullscreen ends').toHaveCount(0);
});
