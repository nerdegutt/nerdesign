// Generates the checkpoint-1 canvas: Main (overview), Reference, DirectionA–D,
// Typography as .dc.html artboards + canvas.json. Same synthetic content in
// every direction; only the design changes. Run: node design/build-artboards.mjs
import { writeFileSync } from 'node:fs';
import { resolved } from './palettes.mjs';
const P = resolved();
const out = (name, html) => writeFileSync(new URL(`./${name}`, import.meta.url), html);

const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=JetBrains+Mono:wght@400;600&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap">`;
const SERIF = `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
const PLEX_MONO = `"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace`;
const JB_MONO = `"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`;
const SRC_SANS = `"Source Sans 3", "Gill Sans", "Segoe UI", sans-serif`;
const PLEX_SANS = `"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif`;
const GARAMOND = `"EB Garamond", "Iowan Old Style", Palatino, Georgia, serif`;

const dc = (title, css, body, bg) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <title>${title}</title>
  ${FONTS}
  <style>
    html, body { margin: 0; background: ${bg}; }
    * { box-sizing: border-box; }
    a { color: inherit; } a:hover { color: inherit; }
    ${css}
  </style>
</helmet>
${body}
</x-dc>
</body>
</html>
`;

// ---------------------------------------------------------------- synthetic data
const rows = [
  ['1', 'Kjøkken stikk', '16 A', 'B', 'Kjøkken'],
  ['2', 'Stue lys', '10 A', 'B', 'Stue, hall'],
  ['3', 'Bad gulvvarme', '16 A', 'C', 'Bad 1. etg.'],
  ['4', 'Vaskerom', '16 A', 'B', 'Vaskerom'],
  ['5', 'Varmepumpe', '20 A', 'C', 'Teknisk rom'],
  ['6', 'Ladeboks', '32 A', 'C', 'Gårdsplass'],
  ['7', 'Utelys tun', '10 A', 'B', 'Tun, innkjørsel'],
  ['8', 'Reserve', '–', '–', '–'],
];
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const series = [3.1, 1.6, 0.9].map((base, si) =>
  Array.from({ length: 84 }, (_, i) => {
    const h = (i * 2) % 24; const day = h >= 6 && h <= 22 ? 1 : 0.45;
    return +(base * day * (0.8 + 0.4 * rnd()) + (si === 0 && (h === 7 || h === 17) ? 1.2 : 0)).toFixed(2);
  })
);
function chartSvg(colors, { grid, axis, text, font, area = false, weight = 2, dots = false }) {
  const W = 620, H = 220, L = 40, R = 12, T = 12, B = 28, max = 6;
  const x = (i) => L + (i / 83) * (W - L - R), y = (v) => T + (1 - v / max) * (H - T - B);
  const gridLines = [0, 2, 4, 6].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${grid}" stroke-width="1"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="${text}" font-family='${font}'>${v}</text>`).join('');
  const days = ['ma', 'ti', 'on', 'to', 'fr', 'lø', 'sø'].map((d, i) => `<text x="${x(i * 12 + 6)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="${text}" font-family='${font}'>${d}</text>`).join('');
  const paths = series.map((s, si) => {
    const pts = s.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const fill = area ? `<polygon points="${x(0)},${y(0)} ${pts} ${x(83)},${y(0)}" fill="${colors[si]}" opacity="0.10"/>` : '';
    const dot = dots ? s.filter((_, i) => i % 12 === 6).map((v, k) => `<circle cx="${x(k * 12 + 6)}" cy="${y(v)}" r="3" fill="${colors[si]}"/>`).join('') : '';
    return `${fill}<polyline points="${pts}" fill="none" stroke="${colors[si]}" stroke-width="${weight}" stroke-linejoin="round" stroke-linecap="round"/>${dot}`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Forbruk siste 7 dager, tre bygninger">${gridLines}<line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" stroke="${axis}" stroke-width="1"/>${days}${paths}</svg>`;
}

// ---------------------------------------------------------------- shared markup
const sheetHtml = (t) => `
<section class="sheet" style="background: ${t.bg}; color: ${t.text};">
  <p class="kicker">Helgerød gård · Hovedhuset</p>
  <h1>Kursoversikt</h1>
  <p class="subtitle">Sikringsskap 1 · kjeller · oppdatert august 2026</p>
  <dl class="keyfacts">
    <div><dt>Hovedsikring</dt><dd>63 A</dd></div>
    <div><dt>Kurser</dt><dd>14</dd></div>
    <div><dt>Jordfeilbryter</dt><dd>30 mA</dd></div>
  </dl>
  <h2>Kurser</h2>
  <table>
    <thead><tr><th>Nr</th><th>Kurs</th><th>Sikring</th><th>Kar.</th><th>Rom</th></tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${c === '–' ? ' class="empty"' : ''}${i === 0 || i === 2 ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>
  <p class="note">Kurs 5 og 6 er reservert varmepumpe og ladeboks – ikke flytt disse uten elektriker.</p>
  <footer class="colophon">Helgerød gård · Jeløya · side 1 av 2</footer>
</section>`;

const dashHtml = (d, chart) => `
<section class="dash" style="background: ${d.bg}; color: ${d.text};">
  <header class="topbar">
    <div class="brand">Helgerød <span>· Hovedhuset</span></div>
    <nav class="segmented" aria-label="Periode"><button>24 t</button><button class="active" aria-current="true">7 d</button><button>28 d</button><button>1 år</button></nav>
  </header>
  <div class="stats">
    <div class="stat"><span class="label">Effekt nå</span><span class="value">3,8 <small>kW</small></span><span class="sub">Snitt 7 d · 2,9 kW</span></div>
    <div class="stat"><span class="label">Innetemperatur</span><span class="value">21,4 <small>°C</small></span><span class="sub">Mål 21 °C</span></div>
    <div class="stat"><span class="label">Strømpris nå</span><span class="value">0,84 <small>kr/kWh</small></span><span class="sub">Lav · neste time 0,91</span></div>
  </div>
  <div class="panel chart">
    <div class="chart-head"><h3>Forbruk siste 7 dager</h3><span class="fresh">Oppdatert for 4 min siden</span></div>
    ${chart}
    <div class="chart-foot">
      <ul class="legend"><li><i style="background: ${d.series[0]};"></i>Hovedhuset</li><li><i style="background: ${d.series[1]};"></i>Sidebygningen</li><li><i style="background: ${d.series[2]};"></i>Låven</li></ul>
      <button class="btn">Vis datatabell</button>
    </div>
  </div>
</section>`;

const swatch = (hex, label, textOn) => `<div class="sw"><i style="background: ${hex}; color: ${textOn};"></i><span>${label}</span><code>${hex}</code></div>`;
const paletteHtml = (key) => {
  const D = P[key];
  const row = (t, mode) => `
  <div class="prow" style="background: ${t.bg}; color: ${t.text}; border: 1px solid ${t.line};">
    <div class="pl">${mode}</div>
    ${swatch(t.bg, 'bakgrunn', t.text)}${swatch(t.surface, 'flate', t.text)}${swatch(t.line, 'strek', t.text)}${swatch(t.text, 'tekst', t.bg)}${swatch(t.muted, 'dempet', t.bg)}${swatch(t.accent, 'aksent', t.bg)}
    <div class="gap"></div>
    ${t.series.map((s, i) => swatch(s, `serie ${i + 1}`, '#fff')).join('')}
    <div class="pv">tekst ${t.textContrast.toFixed(1)}:1 · dempet ${t.mutedContrast.toFixed(1)}:1 · aksent ${t.accentContrast.toFixed(1)}:1 · seriepalett ${t.ok ? 'validert ✓' : 'stryker'}</div>
  </div>`;
  return `<div class="palette">${row(D.light, 'Lys')}${row(D.dark, 'Mørk')}</div>`;
};

const BOARD_CSS = `
  .board { width: 1440px; min-height: 100vh; padding: 36px 40px 40px; display: flex; flex-direction: column; gap: 28px; }
  .head { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
  .head .name { font-size: 40px; line-height: 1.05; margin: 0 0 6px; font-weight: 500; }
  .head .tag { font-size: 19px; font-style: italic; margin: 0 0 14px; opacity: 0.8; }
  .head dl { margin: 0; display: grid; grid-template-columns: 110px 1fr; gap: 6px 14px; font-size: 15px; line-height: 1.45; }
  .head dt { font-weight: 600; } .head dd { margin: 0; }
  .pair { display: grid; grid-template-columns: 600px 1fr; gap: 32px; align-items: stretch; }
  .sheet { padding: 44px 48px; min-height: 700px; display: flex; flex-direction: column; gap: 0; box-shadow: 0 1px 0 rgba(0,0,0,.05), 0 10px 30px rgba(0,0,0,.10); }
  .sheet .colophon { margin-top: auto; }
  .dash { padding: 24px; min-height: 700px; display: flex; flex-direction: column; gap: 20px; }
  .topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .segmented { display: flex; gap: 0; }
  .segmented button { min-height: 34px; padding: 0 14px; border: 1px solid transparent; background: transparent; color: inherit; cursor: default; font: inherit; }
  .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .stat { display: flex; flex-direction: column; gap: 6px; padding: 18px 20px; }
  .stat .label { font-size: 12px; } .stat .value { font-size: 34px; line-height: 1; } .stat .value small { font-size: 15px; } .stat .sub { font-size: 12px; opacity: 0.8; }
  .panel { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .chart-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .chart-head h3 { margin: 0; font-size: 16px; font-weight: 600; } .fresh { font-size: 12px; opacity: 0.75; }
  .chart-foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .legend { list-style: none; margin: 0; padding: 0; display: flex; gap: 18px; font-size: 12px; }
  .legend li { display: flex; align-items: center; gap: 8px; } .legend i { width: 14px; height: 4px; border-radius: 2px; display: inline-block; }
  .btn { min-height: 32px; padding: 0 14px; font: inherit; font-size: 13px; cursor: default; }
  .palette { display: flex; flex-direction: column; gap: 10px; }
  .prow { display: flex; align-items: flex-end; gap: 8px; padding: 12px 14px; }
  .pl { width: 48px; font-size: 12px; font-weight: 600; align-self: center; }
  .sw { display: flex; flex-direction: column; gap: 4px; font-size: 10px; width: 66px; }
  .sw i { display: block; height: 30px; border-radius: 3px; } .sw code { font-size: 9px; opacity: 0.7; font-family: ${PLEX_MONO}; }
  .gap { width: 12px; } .pv { margin-left: auto; font-size: 11px; opacity: 0.8; max-width: 200px; text-align: right; align-self: center; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; } th, td { text-align: left; padding: 7px 10px; vertical-align: top; } .num { text-align: right; }
  .keyfacts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; } .keyfacts div { display: flex; flex-direction: column; gap: 4px; } .keyfacts dt { font-size: 11px; } .keyfacts dd { margin: 0; font-size: 22px; }
`;

const head = (key, why, tradeoff, typo) => `
<div class="head">
  <div><p class="name">Retning ${key} · ${P[key].name}</p><p class="tag">${P[key].tagline}</p></div>
  <dl><dt>Hvorfor</dt><dd>${why}</dd><dt>Avveining</dt><dd>${tradeoff}</dd><dt>Typografi</dt><dd>${typo}</dd></dl>
</div>`;

const direction = (key, { why, tradeoff, typo, css, chartOpts, boardBg, boardText, boardFont }) => {
  const D = P[key], l = D.light, d = D.dark;
  const chart = chartSvg(d.series, { grid: d.line, axis: d.muted, text: d.muted, font: chartOpts.font, ...chartOpts });
  const body = `<div class="board" style="background: ${boardBg}; color: ${boardText}; font-family: ${boardFont};">
  ${head(key, why, tradeoff, typo)}
  <div class="pair">${sheetHtml(l)}${dashHtml(d, chart)}</div>
  ${paletteHtml(key)}
</div>`;
  out(`Direction${key}.dc.html`, dc(`Retning ${key} · ${D.name}`, BOARD_CSS + css(l, d), body, boardBg));
};

// ---------------------------------------------------------------- A · Linolje
direction('A', {
  why: 'Gården som materiale: malte paneler, tegl og jord. Varm, rolig og nær det du allerede liker – men bygget som ett system med en mørk variant som er «samme hus etter mørkets frembrudd».',
  tradeoff: 'Minst overraskende. Dark mode blir varm brun heller enn nøytral, som kan kjennes tung på store skjermflater.',
  typo: 'Iowan Old Style/Palatino for alt; IBM Plex Mono for tall. Sperret overtittel, rødt kvadrat foran h2, 1 px streker.',
  boardBg: '#ebe6dc', boardText: '#2b2620', boardFont: SERIF,
  chartOpts: { font: PLEX_MONO, weight: 2.2 },
  css: (l, d) => `
  .sheet { font-family: ${SERIF}; line-height: 1.5; }
  .kicker { text-transform: uppercase; letter-spacing: 0.22em; font-size: 12px; color: ${l.accentText}; margin: 0 0 12px; }
  .sheet h1 { font-size: 40px; font-weight: 500; margin: 0 0 6px; letter-spacing: 0.01em; }
  .subtitle { font-style: italic; color: ${l.muted}; margin: 0 0 28px; font-size: 16px; }
  .keyfacts { gap: 1px; background: ${l.line}; border: 1px solid ${l.line}; border-radius: 6px; overflow: hidden; margin-bottom: 30px; }
  .keyfacts div { background: ${l.surface}; padding: 12px 14px; } .keyfacts dt { text-transform: uppercase; letter-spacing: 0.12em; color: ${l.muted}; } .keyfacts dd { font-family: ${PLEX_MONO}; font-size: 20px; }
  .sheet h2 { font-size: 22px; font-weight: 500; margin: 0 0 12px; padding-bottom: 6px; border-bottom: 1px solid ${l.line}; display: flex; align-items: center; gap: 10px; }
  .sheet h2::before { content: ""; width: 0.5em; height: 0.5em; background: ${l.accent}; border-radius: 1px; display: inline-block; }
  .sheet table { background: ${l.surface}; border: 1px solid ${l.line}; border-radius: 6px; overflow: hidden; }
  .sheet th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: ${l.muted}; font-weight: 500; border-bottom: 1px solid ${l.line}; }
  .sheet td { border-bottom: 1px solid ${l.line}; } .sheet tr:last-child td { border-bottom: 0; } .sheet .num { font-family: ${PLEX_MONO}; font-size: 13px; } .empty { color: ${l.line}; }
  .note { font-size: 14px; color: ${l.muted}; font-style: italic; margin: 16px 0 0; }
  .colophon { font-size: 12px; color: ${l.muted}; font-style: italic; border-top: 1px solid ${l.line}; padding-top: 10px; text-align: center; }
  .dash { font-family: ${SERIF}; border-radius: 8px; }
  .brand { font-size: 22px; font-weight: 500; } .brand span { color: ${d.muted}; font-style: italic; font-size: 16px; }
  .segmented { border: 1px solid ${d.line}; border-radius: 6px; overflow: hidden; } .segmented button { font-size: 13px; color: ${d.muted}; } .segmented .active { background: ${d.surface}; color: ${d.text}; }
  .stat, .panel { background: ${d.surface}; border: 1px solid ${d.line}; border-radius: 8px; }
  .stat .label { text-transform: uppercase; letter-spacing: 0.12em; color: ${d.muted}; } .stat .value { font-family: ${PLEX_MONO}; } .stat .value small { color: ${d.muted}; font-family: ${SERIF}; } .stat .sub { color: ${d.muted}; }
  .chart-head h3 { font-weight: 500; display: flex; align-items: center; gap: 10px; } .chart-head h3::before { content: ""; width: 0.5em; height: 0.5em; background: ${d.accent}; border-radius: 1px; }
  .fresh, .legend { color: ${d.muted}; } .btn { background: transparent; color: ${d.accentText}; border: 1px solid ${d.line}; border-radius: 6px; }
  `,
});

// ---------------------------------------------------------------- B · Arkivet
direction('B', {
  why: 'Gårdens papirer: skjøter, matrikkelkart og oppmålinger. Fin typografisk detalj – hårlinjer, kapitéler, gammelstil-tall, nummererte marger. Det gir dokumentene tyngde og dashboardene en «instrumentpanel i eik»-ro.',
  tradeoff: 'Krever mest disiplin i dashboards; små tall og hårlinjer kan bli for fine på dårlige skjermer. Mørk variant er blekk-blå, ikke brun.',
  typo: 'Palatino med kapitéler og gammelstil-tall; IBM Plex Mono for tabulære tall. Doble hårlinjer, §-nummerering, ingen avrundede hjørner.',
  boardBg: '#e6e1d6', boardText: '#1d1a16', boardFont: SERIF,
  chartOpts: { font: PLEX_MONO, weight: 1.5, dots: true },
  css: (l, d) => `
  .sheet { font-family: ${SERIF}; line-height: 1.5; font-variant-numeric: oldstyle-nums; }
  .kicker { font-variant: small-caps; letter-spacing: 0.14em; font-size: 14px; text-align: center; margin: 0 0 14px; color: ${l.muted}; }
  .sheet h1 { font-size: 42px; font-weight: 400; margin: 0 0 4px; text-align: center; font-variant: small-caps; letter-spacing: 0.04em; }
  .subtitle { font-style: italic; color: ${l.muted}; margin: 0 0 22px; text-align: center; font-size: 15px; }
  .subtitle::after { content: ""; display: block; width: 100%; border-top: 1px solid ${l.text}; border-bottom: 1px solid ${l.text}; height: 3px; margin-top: 18px; }
  .keyfacts { gap: 24px; margin-bottom: 26px; } .keyfacts div { border-left: 1px solid ${l.line}; padding-left: 14px; } .keyfacts div:first-child { border-left: 0; padding-left: 0; }
  .keyfacts dt { font-variant: small-caps; letter-spacing: 0.1em; color: ${l.muted}; font-size: 13px; } .keyfacts dd { font-size: 24px; font-variant-numeric: oldstyle-nums; }
  .sheet h2 { font-size: 15px; font-weight: 400; margin: 0 0 8px; font-variant: small-caps; letter-spacing: 0.16em; color: ${l.accentText}; }
  .sheet h2::before { content: "§ 1  "; color: ${l.muted}; }
  .sheet th { font-variant: small-caps; letter-spacing: 0.1em; font-weight: 400; font-size: 13px; border-top: 1px solid ${l.text}; border-bottom: 0.5px solid ${l.text}; color: ${l.text}; }
  .sheet td { border-bottom: 0.5px solid ${l.line}; padding: 6px 10px; } .sheet tbody tr:last-child td { border-bottom: 1px solid ${l.text}; }
  .sheet .num { font-family: ${PLEX_MONO}; font-size: 12.5px; font-variant-numeric: tabular-nums; } .empty { color: ${l.line}; }
  .note { font-size: 13.5px; margin: 16px 0 0; padding-left: 14px; border-left: 2px solid ${l.accent}; }
  .colophon { font-size: 12px; color: ${l.muted}; text-align: center; font-variant: small-caps; letter-spacing: 0.12em; padding-top: 10px; }
  .dash { font-family: ${SERIF}; border: 1px solid ${d.line}; }
  .brand { font-size: 20px; font-variant: small-caps; letter-spacing: 0.06em; } .brand span { color: ${d.muted}; font-variant: normal; font-style: italic; font-size: 15px; }
  .segmented { border-bottom: 1px solid ${d.line}; } .segmented button { font-size: 13px; color: ${d.muted}; font-variant: small-caps; letter-spacing: 0.06em; } .segmented .active { color: ${d.text}; border-bottom: 2px solid ${d.accent}; margin-bottom: -1px; }
  .stat, .panel { background: ${d.surface}; border: 0.5px solid ${d.line}; }
  .stat .label { font-variant: small-caps; letter-spacing: 0.1em; color: ${d.muted}; font-size: 13px; } .stat .value { font-family: ${PLEX_MONO}; font-weight: 400; } .stat .value small { color: ${d.muted}; font-family: ${SERIF}; font-style: italic; } .stat .sub { color: ${d.muted}; font-style: italic; }
  .chart-head h3 { font-weight: 400; font-variant: small-caps; letter-spacing: 0.1em; } .chart-head h3::before { content: "§ 2  "; color: ${d.muted}; }
  .fresh, .legend { color: ${d.muted}; font-style: italic; } .legend i { height: 1px; width: 18px; } .btn { background: transparent; color: ${d.accentText}; border: 0.5px solid ${d.line}; font-variant: small-caps; letter-spacing: 0.06em; }
  `,
});

// ---------------------------------------------------------------- C · Jeløya
direction('C', {
  why: 'Stedet mer enn huset: fjord, åker, skifer og sjøvær. Kjøligere og luftigere; sjøgrønn aksent, romslig layout, humanist grotesk til etiketter og tall så dataflater leses raskt. Sterkest på grafer i mørkt.',
  tradeoff: 'Mindre «herregård», mer «landskap». Grotesken må selvhostes (én font til i pakken). Kan oppleves som en helt annen familie enn dagens dokumenter.',
  typo: 'Palatino til overskrifter og løpetekst; Source Sans 3 til etiketter, knapper og tabellhoder; IBM Plex Mono til tall. Luft i stedet for streker.',
  boardBg: '#e4e6e2', boardText: '#1f2428', boardFont: SRC_SANS,
  chartOpts: { font: SRC_SANS, weight: 2, area: true },
  css: (l, d) => `
  .head .name, .head .tag { font-family: ${SERIF}; }
  .sheet { font-family: ${SERIF}; line-height: 1.55; padding: 52px 52px 44px; }
  .kicker { font-family: ${SRC_SANS}; font-weight: 600; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: ${l.accentText}; margin: 0 0 18px; }
  .sheet h1 { font-size: 44px; font-weight: 400; margin: 0 0 8px; letter-spacing: -0.01em; }
  .subtitle { font-family: ${SRC_SANS}; color: ${l.muted}; margin: 0 0 36px; font-size: 15px; }
  .keyfacts { gap: 20px; margin-bottom: 36px; } .keyfacts div { background: ${l.surface}; padding: 14px 16px; border-radius: 10px; }
  .keyfacts dt { font-family: ${SRC_SANS}; color: ${l.muted}; font-size: 12px; font-weight: 600; } .keyfacts dd { font-family: ${PLEX_MONO}; font-size: 22px; }
  .sheet h2 { font-size: 24px; font-weight: 400; margin: 0 0 14px; }
  .sheet th { font-family: ${SRC_SANS}; font-size: 12px; font-weight: 600; color: ${l.muted}; padding-bottom: 10px; }
  .sheet td { border-top: 1px solid ${l.line}; padding: 9px 10px; } .sheet .num { font-family: ${PLEX_MONO}; font-size: 13px; } .empty { color: ${l.line}; }
  .note { font-family: ${SRC_SANS}; font-size: 14px; color: ${l.muted}; margin: 18px 0 0; }
  .colophon { font-family: ${SRC_SANS}; font-size: 12px; color: ${l.muted}; padding-top: 10px; }
  .dash { font-family: ${SRC_SANS}; border-radius: 14px; padding: 28px; gap: 24px; }
  .brand { font-family: ${SERIF}; font-size: 24px; } .brand span { color: ${d.muted}; font-family: ${SRC_SANS}; font-size: 15px; }
  .segmented { gap: 4px; } .segmented button { font-size: 13px; font-weight: 600; color: ${d.muted}; border-radius: 999px; } .segmented .active { background: ${d.accent}; color: ${d.bg}; }
  .stat, .panel { background: ${d.surface}; border-radius: 12px; }
  .stat .label { color: ${d.muted}; font-weight: 600; } .stat .value { font-family: ${PLEX_MONO}; } .stat .value small { color: ${d.muted}; font-family: ${SRC_SANS}; } .stat .sub { color: ${d.muted}; }
  .chart-head h3 { font-family: ${SERIF}; font-weight: 400; font-size: 18px; }
  .fresh, .legend { color: ${d.muted}; } .legend i { height: 8px; width: 8px; border-radius: 50%; } .btn { background: transparent; color: ${d.accentText}; border: 1px solid ${d.line}; border-radius: 999px; font-weight: 600; }
  `,
});

// ---------------------------------------------------------------- D · Nytt i gammelt
direction('D', {
  why: 'Det som faktisk er der: presis, moderne teknologi inne i et vernet hus. Nøytral, lys grotesk og mono til alt som er data og grensesnitt; én klassisk serif kun til titler; tegl som eneste farge; synlige rutenett. Mest dashboard-vennlig.',
  tradeoff: 'Står lengst fra prospekt-varmen; dokumenter kan kjennes tekniske. To ekstra fonter å selvhoste (grotesk + mono).',
  typo: 'IBM Plex Sans til grensesnitt og tabeller, JetBrains Mono til tall, Iowan Old Style bare til h1. Tette, synlige rutenett; 2 px hjørner.',
  boardBg: '#e8e7e3', boardText: '#17150f', boardFont: PLEX_SANS,
  chartOpts: { font: JB_MONO, weight: 1.75 },
  css: (l, d) => `
  .head .name { font-family: ${SERIF}; }
  .sheet { font-family: ${PLEX_SANS}; line-height: 1.45; padding: 40px 44px; }
  .kicker { font-family: ${JB_MONO}; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: ${l.accentText}; margin: 0 0 20px; }
  .sheet h1 { font-family: ${SERIF}; font-size: 46px; font-weight: 400; margin: 0 0 6px; }
  .subtitle { color: ${l.muted}; margin: 0 0 28px; font-size: 14px; font-family: ${JB_MONO}; }
  .keyfacts { gap: 0; border: 1px solid ${l.text}; margin-bottom: 28px; } .keyfacts div { padding: 12px 14px; border-left: 1px solid ${l.text}; } .keyfacts div:first-child { border-left: 0; }
  .keyfacts dt { font-family: ${JB_MONO}; color: ${l.muted}; font-size: 11px; text-transform: uppercase; } .keyfacts dd { font-family: ${JB_MONO}; font-size: 22px; }
  .sheet h2 { font-size: 13px; font-weight: 600; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 10px; }
  .sheet h2::after { content: ""; flex: 1; border-top: 1px solid ${l.text}; }
  .sheet table { border: 1px solid ${l.text}; } .sheet th { font-family: ${JB_MONO}; font-size: 11px; text-transform: uppercase; font-weight: 500; color: ${l.muted}; border-bottom: 1px solid ${l.text}; }
  .sheet td { border-bottom: 1px solid ${l.line}; border-right: 1px solid ${l.line}; font-size: 13.5px; } .sheet td:last-child { border-right: 0; } .sheet tr:last-child td { border-bottom: 0; }
  .sheet .num { font-family: ${JB_MONO}; font-size: 12.5px; } .empty { color: ${l.line}; }
  .note { font-size: 13px; color: ${l.text}; margin: 16px 0 0; padding: 10px 12px; border: 1px solid ${l.accent}; border-radius: 2px; }
  .colophon { font-family: ${JB_MONO}; font-size: 11px; color: ${l.muted}; padding-top: 10px; display: flex; justify-content: space-between; }
  .dash { font-family: ${PLEX_SANS}; border-radius: 2px; }
  .brand { font-family: ${SERIF}; font-size: 24px; } .brand span { color: ${d.muted}; font-family: ${JB_MONO}; font-size: 13px; }
  .segmented { border: 1px solid ${d.line}; border-radius: 2px; } .segmented button { font-family: ${JB_MONO}; font-size: 12px; color: ${d.muted}; border-right: 1px solid ${d.line}; } .segmented button:last-child { border-right: 0; } .segmented .active { background: ${d.text}; color: ${d.bg}; }
  .stat, .panel { background: ${d.surface}; border: 1px solid ${d.line}; border-radius: 2px; }
  .stat .label { font-family: ${JB_MONO}; text-transform: uppercase; font-size: 11px; color: ${d.muted}; } .stat .value { font-family: ${JB_MONO}; } .stat .value small { color: ${d.muted}; font-size: 13px; } .stat .sub { color: ${d.muted}; font-family: ${JB_MONO}; font-size: 11px; }
  .chart-head h3 { font-weight: 500; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; }
  .fresh, .legend { color: ${d.muted}; font-family: ${JB_MONO}; font-size: 11px; } .legend i { height: 2px; width: 18px; border-radius: 0; } .btn { background: transparent; color: ${d.text}; border: 1px solid ${d.text}; border-radius: 2px; font-family: ${JB_MONO}; font-size: 12px; }
  `,
});

// ---------------------------------------------------------------- Reference (today's look, synthetic content)
{
  const chart = chartSvg(['#22d3ee', '#f97316', '#a78bfa'], { grid: 'rgba(255,255,255,0.08)', axis: '#333', text: '#a0a0b0', font: JB_MONO, weight: 2 });
  const css = `
  .board { background: #e9e6df; }
  .refhead { font-family: ${SERIF}; display: flex; flex-direction: column; gap: 6px; }
  .refhead .name { font-size: 34px; margin: 0; font-weight: 500; } .refhead p { margin: 0; font-style: italic; opacity: 0.8; font-size: 17px; }
  .sheet { font-family: ${SERIF}; line-height: 1.6; background: #faf7f2; color: #2b2620; }
  .kicker { text-transform: uppercase; letter-spacing: 0.22em; font-size: 12.8px; color: #8e3b2f; margin: 0 0 12px; text-align: center; }
  .sheet h1 { font-size: 40px; font-weight: 500; margin: 0 0 8px; text-align: center; letter-spacing: 0.01em; }
  .subtitle { font-style: italic; color: #6f6659; margin: 0 0 30px; text-align: center; font-size: 17px; }
  .keyfacts { gap: 1px; background: #e5ddd0; border: 1px solid #e5ddd0; border-radius: 6px; overflow: hidden; margin-bottom: 30px; }
  .keyfacts div { background: #fff; padding: 12px 14px; } .keyfacts dt { text-transform: uppercase; letter-spacing: 0.12em; color: #6f6659; font-size: 12px; } .keyfacts dd { font-size: 20px; }
  .sheet h2 { font-size: 24px; font-weight: 500; margin: 0 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e5ddd0; display: flex; align-items: center; gap: 10px; }
  .sheet h2::before { content: ""; width: 0.55em; height: 0.55em; background: #8e3b2f; border-radius: 1px; display: inline-block; }
  .sheet table { background: #fff; border: 1px solid #e5ddd0; border-radius: 6px; overflow: hidden; }
  .sheet th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #6f6659; font-weight: 500; border-bottom: 1px solid #e5ddd0; }
  .sheet td { border-bottom: 1px solid #e5ddd0; } .sheet tr:last-child td { border-bottom: 0; } .empty { color: #e5ddd0; }
  .note { font-size: 14px; color: #6f6659; font-style: italic; margin: 16px 0 0; }
  .colophon { font-size: 13px; color: #6f6659; font-style: italic; border-top: 1px solid #e5ddd0; padding-top: 10px; text-align: center; }
  .dash { font-family: ${JB_MONO}; background: #0f0f23; color: #a0a0b0; border-radius: 12px; }
  .brand { font-size: 20px; font-weight: 600; color: #22d3ee; } .brand span { color: #666; font-size: 13px; font-weight: 400; }
  .segmented { gap: 6px; } .segmented button { font-size: 12px; color: #666; border: 1px solid #333; border-radius: 6px; } .segmented .active { background: rgba(34,211,238,0.15); color: #22d3ee; border-color: rgba(34,211,238,0.3); }
  .stat, .panel { background: rgba(26,26,46,0.8); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; }
  .stat .label { color: #666; font-size: 12px; } .stat .value { color: #22d3ee; font-size: 30px; } .stat .value small { color: #666; } .stat .sub { color: #666; }
  .chart-head h3 { font-size: 13px; color: #a0a0b0; font-weight: 600; } .fresh { color: #666; } .legend { color: #a0a0b0; } .btn { background: transparent; color: #666; border: 1px solid #333; border-radius: 6px; font-family: ${JB_MONO}; font-size: 12px; }
  `;
  const body = `<div class="board" style="min-height: 760px; color: #2b2620;">
  <div class="refhead"><p class="name">Referanse · dagens uttrykk</p><p>Til venstre: dokumentstilen slik den er i dag (serif, tegl, krem). Til høyre: dashboardstilen slik den er i dag (Grafana-aktig, cyan, JetBrains Mono). Samme fiktive innhold som i retningene, så du kan sammenligne direkte.</p></div>
  <div class="pair">${sheetHtml({ bg: '#faf7f2', text: '#2b2620' })}${dashHtml({ bg: '#0f0f23', text: '#a0a0b0', series: ['#22d3ee', '#f97316', '#a78bfa'] }, chart)}</div>
</div>`;
  out('Reference.dc.html', dc('Referanse · dagens uttrykk', BOARD_CSS + css, body, '#e9e6df'));
}

// ---------------------------------------------------------------- Typography
{
  const col = (title, note, fText0, fNum0, fLabel0) => { const q = (f) => f.replace(/"/g, "'"); const [fText, fNum, fLabel] = [q(fText0), q(fNum0), q(fLabel0)]; return `
  <section class="col">
    <h2>${title}</h2>
    <div class="sample" style="font-family: ${fText};">
      <p class="k" style="font-family: ${fLabel};">Helgerød gård · Hovedhuset</p>
      <p class="h1">Kursoversikt</p>
      <p class="body">Sjøvær på Jeløya gir økt forbruk i fjøset – særlig når varmepumpa går for fullt i februar. Oversikten under viser kursene i hovedhuset, sortert etter nummer.</p>
      <p class="nums" style="font-family: ${fNum};">3,8 kW · 1 234,5 kWh · 27,4 °C · 0,84 kr</p>
      <table style="font-family: ${fText};"><thead><tr><th style="font-family: ${fLabel};">Nr</th><th style="font-family: ${fLabel};">Kurs</th><th style="font-family: ${fLabel};">Sikring</th></tr></thead>
      <tbody>${rows.slice(0, 4).map((r) => `<tr><td style="font-family: ${fNum};">${r[0]}</td><td>${r[1]}</td><td style="font-family: ${fNum};">${r[2]}</td></tr>`).join('')}</tbody></table>
    </div>
    <p class="note">${note}</p>
  </section>`; };
  const css = `
  .board { background: #ebe6dc; color: #2b2620; font-family: ${SERIF}; min-height: 100vh; }
  .thead .name { font-size: 34px; margin: 0 0 6px; font-weight: 500; } .thead p { margin: 0; font-style: italic; opacity: 0.8; font-size: 17px; }
  .cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
  .col { display: flex; flex-direction: column; gap: 14px; }
  .col h2 { font-size: 15px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; color: #8e3b2f; }
  .sample { background: #faf7f2; padding: 32px 30px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.10); min-height: 470px; }
  .k { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #8e3b2f; }
  .h1 { margin: 0; font-size: 40px; line-height: 1.05; font-weight: 500; }
  .body { margin: 0; font-size: 16px; line-height: 1.55; }
  .nums { margin: 6px 0; font-size: 20px; font-variant-numeric: tabular-nums; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; } th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6f6659; font-weight: 500; padding: 6px 8px; border-bottom: 1px solid #e5ddd0; } td { padding: 6px 8px; border-bottom: 1px solid #e5ddd0; }
  .note { margin: 0; font-size: 14px; line-height: 1.45; opacity: 0.85; }
  `;
  const body = `<div class="board">
  <div class="thead"><p class="name">Typografi · tre kandidater</p><p>Samme tekst og tall i tre parkombinasjoner. Alternativ 1 og 2 bruker systemfonter for tekst (ingen filer å frakte); alternativ 3 legger til én selvhostet serif med mer karakter. Tall er alltid i monospace med tabulære siffer.</p></div>
  <div class="cols">
    ${col('1 · Systemserif + JetBrains Mono', 'Iowan Old Style/Palatino for tekst, JetBrains Mono for tall. Kontinuitet med dagens dashboards. Monoen er tydelig «kode»-preget – skarp, litt kald mot serifen.', SERIF, JB_MONO, SERIF)}
    ${col('2 · Systemserif + IBM Plex Mono', 'Samme serif, IBM Plex Mono for tall. Plex har varmere, mer humanistiske former som sitter bedre sammen med Palatino. Begge er OFL og kan selvhostes.', SERIF, PLEX_MONO, SERIF)}
    ${col('3 · EB Garamond + IBM Plex Mono', 'EB Garamond (OFL) for tekst og titler – tydeligere karakter og eldre, «arkiv»-aktig preg. Koster én selvhostet fontfamilie (≈ 4 filer). Mindre x-høyde: trenger litt større grunnstørrelse.', GARAMOND, PLEX_MONO, GARAMOND)}
  </div>
</div>`;
  out('Typography.dc.html', dc('Typografi · tre kandidater', BOARD_CSS + css, body, '#ebe6dc'));
}

// ---------------------------------------------------------------- Main (overview)
{
  const card = (k, tone) => `<div class="card"><p class="ck">Retning ${k}</p><p class="cn">${P[k].name}</p><p class="ct">${P[k].tagline}</p><p class="cd">${tone}</p></div>`;
  const css = `
  .board { width: 560px; min-height: 100vh; background: #faf7f2; color: #2b2620; font-family: ${SERIF}; padding: 44px 44px 40px; gap: 22px; }
  .k { margin: 0; text-transform: uppercase; letter-spacing: 0.22em; font-size: 12px; color: #8e3b2f; }
  h1 { margin: 0; font-size: 40px; font-weight: 500; line-height: 1.05; }
  .lead { margin: 0; font-size: 17px; line-height: 1.55; }
  .cards { display: flex; flex-direction: column; gap: 12px; }
  .card { background: #fff; border: 1px solid #e5ddd0; border-radius: 6px; padding: 14px 16px; display: flex; flex-direction: column; gap: 3px; }
  .ck { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: #6f6659; } .cn { margin: 0; font-size: 20px; font-weight: 500; } .ct { margin: 0; font-style: italic; color: #6f6659; font-size: 14px; } .cd { margin: 4px 0 0; font-size: 14px; line-height: 1.45; }
  h2 { margin: 8px 0 0; font-size: 20px; font-weight: 500; padding-bottom: 6px; border-bottom: 1px solid #e5ddd0; display: flex; align-items: center; gap: 10px; }
  h2::before { content: ""; width: 0.5em; height: 0.5em; background: #8e3b2f; border-radius: 1px; display: inline-block; }
  ol, ul { margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.5; display: flex; flex-direction: column; gap: 6px; }
  .foot { margin-top: auto; font-size: 13px; font-style: italic; color: #6f6659; border-top: 1px solid #e5ddd0; padding-top: 10px; }
  `;
  const body = `<div class="board">
  <p class="k">Helgerød · designsystem</p>
  <h1>Retningsvalg</h1>
  <p class="lead">Fire tolkninger av én identitet for Helgerød gård. Alle viser samme fiktive kursoversikt (lys) og samme fiktive dashboard (mørk), så det er designet som varierer – ikke innholdet. Referansearket viser dagens uttrykk å sammenligne mot.</p>
  <div class="cards">
    ${card('A', 'Nærmest dagens uttrykk. Trygg, varm; minst overraskende.')}
    ${card('B', 'Mest typografisk karakter; best for print. Krever disiplin i dashboards.')}
    ${card('C', 'Kjøligst og luftigst; sterkest på grafer. Mindre «herregård».')}
    ${card('D', 'Mest teknisk og dashboard-vennlig; dokumenter blir strammere.')}
  </div>
  <h2>Slik velger du</h2>
  <ol>
    <li>Se hver retning i full størrelse – både arket og dashboardet.</li>
    <li>Velg én retning, eller en hybrid: «B, men med aksenten fra A».</li>
    <li>Velg typografi (eget ark): systemserif + JetBrains Mono, systemserif + IBM Plex Mono, eller EB Garamond + Plex Mono.</li>
    <li>Si om aksenten i mørkt tema skal være tegl (som A/D) eller en annen materialtone (som B/C).</li>
  </ol>
  <h2>Det som er likt uansett</h2>
  <ul>
    <li>Alle seriepaletter er validert for fargesyn og kontrast i begge temaer.</li>
    <li>Lys og mørk er ett system med samme roller – ikke to design.</li>
    <li>Print er lys på hvitt; skjerm følger systeminnstilling eller en bryter.</li>
  </ul>
  <p class="foot">Arbeidsdokument · sjekkpunkt 1 · august 2026</p>
</div>`;
  out('Main.dc.html', dc('Helgerød · retningsvalg', css, body, '#faf7f2'));
}

// ---------------------------------------------------------------- canvas.json
const canvas = {
  artboards: [
    { file: 'Main.dc.html', title: 'Oversikt', x: 0, y: 0, w: 560, h: 1180 },
    { file: 'Reference.dc.html', title: 'Referanse · dagens uttrykk', x: 640, y: 0, w: 1440, h: 1100 },
    { file: 'DirectionA.dc.html', title: 'Retning A · Linolje', x: 0, y: 1320, w: 1440, h: 1340 },
    { file: 'DirectionB.dc.html', title: 'Retning B · Arkivet', x: 1520, y: 1320, w: 1440, h: 1340 },
    { file: 'DirectionC.dc.html', title: 'Retning C · Jeløya', x: 0, y: 2800, w: 1440, h: 1440 },
    { file: 'DirectionD.dc.html', title: 'Retning D · Nytt i gammelt', x: 1520, y: 2800, w: 1440, h: 1440 },
    { file: 'Typography.dc.html', title: 'Typografi · tre kandidater', x: 0, y: 4380, w: 1440, h: 860 },
  ],
  launch: { view: 'canvas' },
};
writeFileSync(new URL('./canvas.json', import.meta.url), JSON.stringify(canvas, null, 2) + '\n');
console.log('wrote', canvas.artboards.map((a) => a.file).join(', '), '+ canvas.json');
