import { contrast, grade, fmt } from './wcag.mjs';
const cs = () => getComputedStyle(document.documentElement);
const probe = document.createElement('span'); probe.style.position = 'absolute'; probe.style.visibility = 'hidden'; document.body.appendChild(probe);
const val = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
const hex = (rgb) => '#' + rgb.match(/\d+/g).slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('');
function render() {
  for (const el of document.querySelectorAll('[data-swatches]')) {
    const against = el.dataset.against, kind = el.dataset.kind || 'text';
    el.innerHTML = el.dataset.swatches.split(',').map((spec) => {
      const [n, own] = spec.split('|'); const vs = own || against;
      const v = val(n), b = val(vs);
      const isBg = n.includes('-bg') || n.includes('surface') || n.includes('line');
      const ratio = contrast(isBg ? b : v, isBg ? v : b);
      const decorative = n.includes('line') || n.includes('empty');
      const g = decorative ? 'dekor' : grade(ratio, kind);
      return `<div class="swatch"><i style="background: var(${n});"></i><div><span>${n.replace('--nd-', '')}</span><code>${hex(v)}</code><span class="c ${g === 'fail' ? 'bad' : ''}">${fmt(ratio)} ${g} <small>mot ${vs.replace('--nd-', '')}</small></span></div></div>`;
    }).join('');
  }
  for (const el of document.querySelectorAll('[data-ramp]')) el.innerHTML = el.dataset.ramp.split(',').map((n) => `<i style="background: var(${n});" title="${n}"></i>`).join('');
}
render();
document.addEventListener('nd:theme', () => requestAnimationFrame(render));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => requestAnimationFrame(render));
