// Validate the data-viz tokens with the dataviz palette validator (vendored in
// tools/vendor/validate_palette.mjs) on the light and dark surfaces.
//   npm run palette
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate, validateOrdinal } from './vendor/validate_palette.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'dist/nd.css'), 'utf8');

// Resolve --nd-* tokens for one theme from the built CSS (var() chains included).
function tokens(theme) {
  const vars = {};
  const grab = (block) => { for (const m of block.matchAll(/(--nd-[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim(); };
  for (const m of css.matchAll(/:root\s*\{([^}]*)\}/g)) grab(m[1]);            // light
  if (theme === 'dark') { const d = css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/); grab(d[1]); }
  const resolve = (v, depth = 0) => { const m = /^var\((--nd-[\w-]+)\)$/.exec(v); return m && depth < 10 ? resolve(vars[m[1]], depth + 1) : v; };
  return new Proxy({}, { get: (_, k) => resolve(vars[k]) });
}

let failed = false;
for (const theme of ['light', 'dark']) {
  const t = tokens(theme);
  const surface = t['--nd-surface'];
  const series = Array.from({ length: 8 }, (_, i) => t[`--nd-series-${i + 1}`]);
  const seq = [100, 200, 300, 400, 500, 600, 700].map((s) => t[`--nd-seq-${s}`]);
  const div = [t['--nd-div-neg'], t['--nd-div-mid'], t['--nd-div-pos']];
  const cat = validate(series, { mode: theme, surface });
  const ord = validateOrdinal(seq, { mode: theme, surface });
  const dv = validate([div[0], div[2]], { mode: theme, surface });
  console.log(`\n## ${theme} · surface ${surface}`);
  console.log(`categorical ${cat.ok ? 'PASS' : 'FAIL'}  ${series.join(' ')}`);
  for (const r of cat.report) console.log(`  ${r[1] === true || r[1] === 'pass' ? '✓' : r[1] === 'warn' ? '⚠' : '✗'} ${r[0]}: ${r[2]}`);
  console.log(`sequential ${ord.ok ? 'PASS' : 'FAIL'}  ${seq.join(' ')}`);
  for (const r of ord.report) console.log(`  ${r[1] === true || r[1] === 'pass' ? '✓' : r[1] === 'warn' ? '⚠' : '✗'} ${r[0]}: ${r[2]}`);
  console.log(`diverging poles ${dv.ok ? 'PASS' : 'FAIL'}  ${div.join(' ')}`);
  for (const r of dv.report) if (!(r[1] === true || r[1] === 'pass')) console.log(`  ${r[1] === 'warn' ? '⚠' : '✗'} ${r[0]}: ${r[2]}`);
  failed = failed || !cat.ok || !ord.ok || !dv.ok;
}
process.exit(failed ? 1 : 0);
