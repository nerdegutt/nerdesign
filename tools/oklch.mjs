// OKLCH ⇄ sRGB helpers for designing palettes. No dependencies.
//   node tools/oklch.mjs 0.62 0.12 35            → hex for one OKLCH colour (chroma clipped to gamut)
//   node tools/oklch.mjs "#8e3b2f" "#faf7f2"     → OKLCH of hex colours
export function oklchToHex(L, C, H) {
  // reduce chroma until the colour fits sRGB
  for (let c = C; c >= 0; c -= 0.002) {
    const rgb = oklabToLinear(L, c * Math.cos((H * Math.PI) / 180), c * Math.sin((H * Math.PI) / 180));
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) return toHex(rgb.map(gamma));
  }
  return toHex(oklabToLinear(L, 0, 0).map(gamma));
}
function oklabToLinear(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const gamma = (c) => { c = Math.min(1, Math.max(0, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
export function hexToOklch(hex) {
  const s = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s_;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s_;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s_;
  return { L: +L.toFixed(3), C: +Math.hypot(a, bb).toFixed(3), H: +(((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360).toFixed(1) };
}
if (process.argv[1]?.endsWith('oklch.mjs')) {
  const args = process.argv.slice(2);
  if (args[0]?.startsWith('#')) for (const h of args) console.log(h, hexToOklch(h));
  else for (let i = 0; i + 2 < args.length; i += 3) console.log(oklchToHex(+args[i], +args[i + 1], +args[i + 2]));
}
