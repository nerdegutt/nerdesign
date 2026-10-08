// Print the examples to PDF and assert page counts.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const cases = [
  { file: 'circuit-overview.html', pages: 4 },
  { file: 'handout-sheet.html', pages: 1 },
  { file: 'label-sheet.html', pages: 1 },
];
const countPages = (pdf) => (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

for (const c of cases) {
  test(`${c.file} prints to ${c.pages} page(s)`, async ({ page }) => {
    await page.emulateMedia({ media: 'print', colorScheme: 'dark' }); // dark on screen must still print light
    await page.goto(`/examples/${c.file}`);
    await page.waitForLoadState('networkidle');
    // dark on screen must still print light: body background resolves to white under print media
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'print background is white').toBe('rgb(255, 255, 255)');
    const out = join(root, `test/screenshots/${c.file.replace('.html', '')}.pdf`);
    const pdf = await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
    expect(countPages(pdf), `${out} page count`).toBe(c.pages);
    // thumbnail of the first sheet for the examples page
    await page.emulateMedia({ media: 'screen', colorScheme: 'light' });
    await page.setViewportSize({ width: 1000, height: 1400 });
    await page.locator('.nd-sheet, .nd-label-sheet').first().screenshot({ path: join(root, `examples/img/${c.file.replace('.html', '')}.png`) });
  });
}

test('fixed sheets and label sheets stay paper-white in dark theme on screen', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const [file, sel] of [['handout-sheet.html', '.nd-sheet--fixed'], ['label-sheet.html', '.nd-label-sheet']]) {
    await page.goto(`/examples/${file}`);
    const bg = await page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg, `${file} ${sel}`).toBe('rgb(255, 255, 255)');
    const fg = await page.locator(`${sel} strong, ${sel} h1`).first().evaluate((el) => getComputedStyle(el).color);
    expect(fg, `${file} text on paper is dark`).toBe('rgb(43, 38, 32)');
  }
});
