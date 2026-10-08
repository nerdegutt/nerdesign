// WCAG contrast for every pair in src/tokens/pairs.json, in both themes, read
// from the BUILT css via a real browser (so var() chains resolve exactly as
// they will for users). Prints a markdown table; exits 1 on any failure.
//   npm run contrast
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { contrast, grade, fmt } from './wcag.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { pairs } = JSON.parse(readFileSync(join(root, 'src/tokens/pairs.json'), 'utf8'));
const css = readFileSync(join(root, 'dist/nd.css'), 'utf8');
const names = [...new Set(pairs.flatMap((p) => [p.fg, p.bg]))];

const browser = await chromium.launch();
const page = await browser.newPage();
const results = {};
for (const theme of ['light', 'dark']) {
  await page.setContent(`<!doctype html><html data-theme="${theme}"><head><style>${css}</style></head><body></body></html>`);
  results[theme] = await page.evaluate((names) => {
    const cs = getComputedStyle(document.documentElement);
    const probe = document.createElement('div'); document.body.appendChild(probe);
    return Object.fromEntries(names.map((n) => { probe.style.color = `var(${n})`; return [n, getComputedStyle(probe).color]; }));
  }, names);
}
await browser.close();

let failed = false;
console.log('| pair | kind | light | dark |\n|---|---|---|---|');
for (const p of pairs) {
  const cells = ['light', 'dark'].map((theme) => {
    const fg = results[theme][p.fg], bg = results[theme][p.bg];
    const ratio = contrast(fg, bg);
    if (p.kind === 'decorative') return `${fmt(ratio)} (dekor)`;
    const g = grade(ratio, p.kind);
    if (g === 'fail') failed = true;
    return `${fmt(ratio)} ${g === 'fail' ? '✗' : g}`;
  });
  console.log(`| ${p.fg} on ${p.bg} | ${p.kind} | ${cells[0]} | ${cells[1]} |`);
}
console.log(failed ? '\nFAIL – at least one pair is below WCAG AA' : '\nAll pairs pass WCAG AA');
process.exit(failed ? 1 : 0);
