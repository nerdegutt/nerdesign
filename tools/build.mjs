// Build dist/ from src/. Pure concatenation with a version banner – no
// preprocessor, no minification. Consumers copy dist/ files verbatim, so
// readability in the output matters more than bytes.
//
// Conventions this script enforces:
//  - src/tokens/*.dark.css contain DECLARATIONS ONLY (no selectors). They are
//    wrapped twice – once under the prefers-color-scheme media query and once
//    under [data-theme="dark"] – so the two dark blocks can never drift.
//  - src/print.css is always last, so its token overrides win.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => join(root, 'src', p);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const banner = (what, style = 'css') => {
  const text = `Nerdesign v${pkg.version} – ${what}. Copied from github.com/nerdegutt/nerdesign – do not edit here; change the source and copy again.`;
  return style === 'css' ? `/* ${text} */\n` : `// ${text}\n`;
};

const read = (p) => readFileSync(src(p), 'utf8').replace(/\s+$/, '') + '\n';
const section = (p) => `\n/* ===== ${p} ===== */\n` + read(p);
const cssIn = (dir, { dark = false } = {}) =>
  existsSync(src(dir))
    ? readdirSync(src(dir))
        .filter((f) => f.endsWith('.css') && f.endsWith('.dark.css') === dark)
        .sort()
        .map((f) => `${dir}/${f}`)
    : [];

// --- nd.css -----------------------------------------------------------------
let css = banner('tokens, base styles and components');

// 1. Tokens (light values on :root)
for (const f of ['tokens/primitives.css', 'tokens/semantic.css', 'tokens/data.css']) css += section(f);

// 2. Dark theme – generated from every tokens/*.dark.css
const darkFiles = cssIn('tokens', { dark: true });
const darkDecls = darkFiles
  .map((f) => {
    const body = read(f);
    if (/[{}]/.test(body)) throw new Error(`${f} must contain declarations only (no selectors/braces)`);
    return `    /* -- ${f} -- */\n` + body.replace(/^(?!\s*$)/gm, '    ');
  })
  .join('');
css += `
/* ===== dark theme (generated from ${darkFiles.join(', ') || 'no *.dark.css yet'}) =====
   Same declarations twice: the media query follows the OS unless the page
   opted out with data-theme="light"; the attribute selector lets a toggle win. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${darkDecls}  }
}
:root[data-theme="dark"] {
${darkDecls}}
`;

// 2b. Paper: physical previews (fixed sheets, label sheets) are always light,
//     whatever the theme. Generated from the light :root declarations so the
//     two can never drift. Custom properties set on the element beat inherited
//     dark values regardless of selector specificity.
const lightDecls = ['tokens/semantic.css', 'tokens/data.css']
  .map((f) => { const m = /:root\s*\{([\s\S]*?)\n\}/.exec(read(f)); return m ? m[1] : ''; })
  .join('\n')
  .split('\n').filter((l) => /^\s*--nd-/.test(l)).map((l) => '  ' + l.trim()).join('\n');
css += `
/* ===== paper (generated from the light tokens) =====
   Physical previews stay paper-white in dark mode. Add .nd-paper to anything
   that represents a printed object. */
.nd-paper, .nd-sheet--fixed, .nd-label-sheet {
  color-scheme: light;
${lightDecls}
  color: var(--nd-text);          /* color inherits as a computed value – re-apply so the paper's own tokens win */
  background: var(--nd-surface);
}
`;

// 3. Base, layout, components, print (print MUST be last)
for (const f of ['base/reset.css', 'base/typography.css', 'base/a11y.css']) if (existsSync(src(f))) css += section(f);
if (existsSync(src('layout.css'))) css += section('layout.css');
for (const f of [...cssIn('components/document'), ...cssIn('components/dashboard')]) css += section(f);
if (existsSync(src('print.css'))) css += section('print.css');

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/nd.css'), css);

// --- nd-fonts.css (separate: single-file documents may leave it out) ---------
if (existsSync(src('fonts.css'))) writeFileSync(join(root, 'dist/nd-fonts.css'), banner('self-hosted fonts; expects ./fonts/ next to this file') + read('fonts.css'));

// --- JS helpers ---------------------------------------------------------------
for (const [file, what] of [
  ['nd-echarts.js', 'ECharts theme and option helpers that read nd tokens at runtime'],
  ['nd-theme.js', 'optional light/dark/auto toggle'],
  ['nd-lightbox.js', 'PhotoSwipe lightbox for every image; expects ./vendor/photoswipe/'],
]) {
  if (existsSync(src(file))) writeFileSync(join(root, 'dist', file), banner(what, 'js') + read(file));
}

// --- vendored third-party (PhotoSwipe, MIT) -------------------------------------
import('node:fs').then(({ cpSync }) => cpSync(src('vendor'), join(root, 'dist/vendor'), { recursive: true }));

const out = readdirSync(join(root, 'dist')).map((f) => `dist/${f}`);
console.log(`Nerdesign v${pkg.version} → ${out.join(', ')}`);
