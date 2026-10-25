// WCAG 2.x contrast math. No dependencies, no Node APIs – usable both from
// tools/contrast.mjs and from patternbook.html via <script type="module">.

/** Parse #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() → [r, g, b, a] (0–255, 0–1). */
export function parseColor(input) {
  const s = String(input).trim();
  const hex = s.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = parseInt(h.padEnd(8, 'f'), 16);
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, (n & 255) / 255];
  }
  const fn = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i);
  if (fn) {
    const a = fn[4] === undefined ? 1 : fn[4].endsWith('%') ? parseFloat(fn[4]) / 100 : parseFloat(fn[4]);
    return [+fn[1], +fn[2], +fn[3], a];
  }
  throw new Error(`Unsupported color: ${input}`);
}

/** Composite a (possibly translucent) foreground over an opaque background. */
export function blend(fg, bg) {
  const [fr, fg_, fb, fa] = parseColor(fg);
  const [br, bg_, bb] = parseColor(bg);
  return [fr * fa + br * (1 - fa), fg_ * fa + bg_ * (1 - fa), fb * fa + bb * (1 - fa), 1];
}

export function luminance([r, g, b]) {
  const lin = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast ratio between fg (blended over bg if translucent) and bg. */
export function contrast(fg, bg) {
  const l1 = luminance(blend(fg, bg));
  const l2 = luminance(parseColor(bg));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Grade a ratio. kind: 'text' (4.5 / 7), 'large' (3 / 4.5), 'graphic' (3).
 * Returns 'AAA' | 'AA' | 'fail'.
 */
export function grade(ratio, kind = 'text') {
  const [aa, aaa] = { text: [4.5, 7], large: [3, 4.5], graphic: [3, 3] }[kind];
  return ratio >= aaa ? 'AAA' : ratio >= aa ? 'AA' : 'fail';
}

export const fmt = (ratio) => `${(Math.round(ratio * 100) / 100).toFixed(2)}:1`;
