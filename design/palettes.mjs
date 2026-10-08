// Direction palettes for checkpoint 1, defined in OKLCH and validated with the
// dataviz validator in both themes. Run: node design/palettes.mjs [--json]
import { oklchToHex } from '../tools/oklch.mjs';
import { validate, contrast } from '/private/tmp/claude-501/-Users-erlend-dev-nerdegutt-nerdesign/0d708b80-25d6-432b-8a4f-8f1dfde82797/scratchpad/validate_palette.mjs';

const c = (L, C, H) => oklchToHex(L, C, H);

export const directions = {
  A: {
    name: 'Linolje', tagline: 'Materialene – malte paneler, tegl, jord og mose',
    light: { bg: '#faf7f2', surface: '#ffffff', line: '#e5ddd0', text: '#2b2620', muted: '#6a6154', accent: '#8e3b2f', accentText: '#7d3226',
      series: ["#c4685a","#4c5a01","#5d408a","#008a63","#823564","#0897a9","#7e5403","#3d73b6"] },
    dark:  { bg: c(0.21,0.012,60), surface: c(0.26,0.014,60), line: c(0.34,0.014,60), text: '#f1e9dc', muted: c(0.74,0.02,75), accent: c(0.66,0.13,36), accentText: c(0.74,0.12,40),
      series: ["#c06557","#03a1b5","#a67110","#5d94da","#a25281","#778a2d","#987aca","#249c74"] },
  },
  B: {
    name: 'Arkivet', tagline: 'Dokumentene – skjøter, matrikkelkart, oppmålinger',
    light: { bg: '#f6f1e6', surface: '#fcfaf4', line: '#d9cfbd', text: '#1d1a16', muted: '#5f584e', accent: '#7a2e25', accentText: '#6b2820',
      series: ["#5188cd","#883327","#0a9068","#634590","#6c7e1e","#883b6a","#0897a9","#7e5403"] },
    dark:  { bg: c(0.20,0.018,265), surface: c(0.25,0.018,265), line: c(0.34,0.018,265), text: '#ece4d3', muted: c(0.74,0.02,80), accent: c(0.70,0.10,40), accentText: c(0.76,0.09,45),
      series: ["#5d94da","#b05649","#028a9b","#bd8630","#9b7dcd","#36a980","#a25281","#7d9034"] },
  },
  C: {
    name: 'Jeløya', tagline: 'Landskapet – fjord, åker, skifer, sjøvær',
    light: { bg: '#f4f4f0', surface: '#fdfdfb', line: '#d8d9d2', text: '#1f2428', muted: '#59636a', accent: '#2f6e63', accentText: '#28605a',
      series: ["#19966e","#8d5e00","#467cc0","#9f473b","#0897a9","#823564","#617209","#5d408a"] },
    dark:  { bg: c(0.22,0.016,235), surface: c(0.27,0.017,235), line: c(0.35,0.017,235), text: '#e8ecea', muted: c(0.74,0.015,220), accent: c(0.72,0.10,185), accentText: c(0.78,0.09,185),
      series: ["#36a980","#b05649","#01a4b9","#a55584","#6c7e1e","#5a91d7","#ad771b","#8062b0"] },
  },
  D: {
    name: 'Nytt i gammelt', tagline: 'Kontrasten – presis teknologi i et vernet hus',
    light: { bg: '#fbfaf8', surface: '#ffffff', line: '#e4e1db', text: '#17150f', muted: '#5c5a54', accent: '#8e3b2f', accentText: '#7d3226',
      series: ["#8c2e23","#0a94a5","#853166","#7a8e24","#7252a5","#029e72","#7e5403","#4985cf"] },
    dark:  { bg: c(0.18,0.006,70), surface: c(0.23,0.007,70), line: c(0.32,0.007,70), text: '#efece6', muted: c(0.72,0.01,75), accent: c(0.68,0.13,36), accentText: c(0.75,0.12,40),
      series: ["#cf6b5b","#01a4b9","#986600","#9c7bd2","#01976d","#a54f83","#718516","#5894e0"] },
  },
};

export function resolved() {
  const out = {};
  for (const [k, d] of Object.entries(directions)) {
    out[k] = { name: d.name, tagline: d.tagline };
    for (const mode of ['light', 'dark']) {
      const t = d[mode];
      const series = t.series;
      const v = validate(series, { mode, surface: t.surface });
      out[k][mode] = { ...t, series, ok: v.ok, report: v.report,
        textContrast: contrast(t.text, t.bg), mutedContrast: contrast(t.muted, t.bg), accentTextContrast: contrast(t.accentText, t.bg), accentContrast: contrast(t.accent, t.bg) };
    }
  }
  return out;
}

if (process.argv[1]?.endsWith('palettes.mjs')) {
  const r = resolved();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(r, null, 1)); }
  else for (const [k, d] of Object.entries(r)) for (const mode of ['light', 'dark']) {
    const t = d[mode];
    console.log(`\n== ${k} ${d.name} · ${mode} · surface ${t.surface} · ${t.ok ? 'PASS' : 'FAIL'}`);
    console.log('   series', t.series.join(' '));
    console.log(`   text ${t.textContrast.toFixed(1)}:1  muted ${t.mutedContrast.toFixed(1)}:1  accentText ${t.accentTextContrast.toFixed(1)}:1  accent(graphic) ${t.accentContrast.toFixed(1)}:1`);
    for (const line of t.report) if (!/PASS|^ok/i.test(line.status ?? line)) console.log('   ', typeof line === 'string' ? line : JSON.stringify(line));
  }
}
