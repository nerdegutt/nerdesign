// Find, per direction and mode, 8 series colours (fixed hue set) with chroma
// ≥ 0.10 inside the lightness band and ≥3:1 on the surface, then the order
// that maximises worst adjacent CVD ΔE. Prints a JS snippet for palettes.mjs.
import { oklchToHex, hexToOklch } from '../tools/oklch.mjs';
import { validate, contrast } from '/private/tmp/claude-501/-Users-erlend-dev-nerdegutt-nerdesign/0d708b80-25d6-432b-8a4f-8f1dfde82797/scratchpad/validate_palette.mjs';

const band = { light: [0.44, 0.62], dark: [0.55, 0.66] };
function candidatesForHue(H, mode, surface, cap) {
  const out = [];
  for (let L = band[mode][0]; L <= band[mode][1] + 1e-9; L += 0.01) {
    const hex = oklchToHex(L, cap, H);           // chroma clipped to gamut
    const { C, L: Lr } = hexToOklch(hex);
    if (C < 0.1 || Lr > band[mode][1] || Lr < band[mode][0] || contrast(hex, surface) < 3) continue;
    out.push({ hex, L: +L.toFixed(2), C });
  }
  return out;
}
function worstDE(rep) {
  const m = (name) => { const r = rep.find((x) => x[0] === name); const n = /ΔE ([\d.]+)/.exec(r?.[2] ?? ''); return n ? +n[1] : 99; };
  return Math.min(m('CVD separation'), m('Normal-vision floor') / 2);
}
function optimize(cands, mode, surface) {
  // state: order of hue indices + chosen candidate index per hue
  const n = cands.length;
  const hexes = (st) => st.order.map((h) => cands[h][st.pick[h]].hex);
  const score = (st) => { const v = validate(hexes(st), { mode, surface }); return (v.ok ? 100 : 0) + worstDE(v.report); };
  let best = null;
  for (let restart = 0; restart < 10; restart++) {
    let st = { order: [...cands.keys()].sort(() => Math.random() - 0.5), pick: cands.map((c) => Math.floor(Math.random() * c.length)) };
    let cur = score(st), improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const o = st.order.slice(); [o[i], o[j]] = [o[j], o[i]];
          const s2 = { ...st, order: o }, sc = score(s2); if (sc > cur) { cur = sc; st = s2; improved = true; }
        }
        for (let k = 0; k < cands[i].length; k++) {
          if (k === st.pick[i]) continue;
          const p = st.pick.slice(); p[i] = k;
          const s2 = { ...st, pick: p }, sc = score(s2); if (sc > cur) { cur = sc; st = s2; improved = true; }
        }
      }
    }
    if (!best || cur > best.score) best = { score: cur, order: hexes(st), leadHex: cands.map((c, h) => c[st.pick[h]].hex) };
  }
  return best;
}

const HUES = [30, 75, 120, 165, 210, 255, 300, 345];
const specs = {
  A: { light: { surface: '#ffffff', cap: 0.12 }, dark: { surface: '#29231d', cap: 0.12 } },
  B: { light: { surface: '#fcfaf4', cap: 0.12 }, dark: { surface: '#1d222a', cap: 0.12 } },
  C: { light: { surface: '#fdfdfb', cap: 0.12 }, dark: { surface: '#1e282e', cap: 0.12 } },
  D: { light: { surface: '#ffffff', cap: 0.13 }, dark: { surface: '#1f1c19', cap: 0.13 } },
};
const lead = { A: 30, B: 255, C: 165, D: 30 }; // series-1 hue per direction (identity)
for (const [k, s] of Object.entries(specs)) for (const mode of ['light', 'dark']) {
  const cands = HUES.map((H) => candidatesForHue(H, mode, s[mode].surface, s[mode].cap));
  if (cands.some((c) => !c.length)) { console.log(k, mode, 'no candidates for hue', HUES.filter((_, i) => !cands[i].length)); continue; }
  const { order, leadHex: leads } = optimize(cands, mode, s[mode].surface);
  // rotate so the lead hue is series-1
  const leadHex = leads[HUES.indexOf(lead[k])]; const i = order.indexOf(leadHex);
  const rotated = [...order.slice(i), ...order.slice(0, i)];
  const v = validate(rotated, { mode, surface: s[mode].surface });
  console.log(`${k} ${mode} ${v.ok ? 'PASS' : 'FAIL'} worstΔE=${worstDE(v.report).toFixed(1)} → ${JSON.stringify(rotated)}`);
  if (!v.ok) for (const r of v.report) if (r[1] !== true && r[1] !== 'pass') console.log('   ', r.join(' | '));
}
