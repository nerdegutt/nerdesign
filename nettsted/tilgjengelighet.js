import { contrast, grade, fmt } from './wcag.mjs';
const pairs = await (await fetch('pairs.json')).json();
const probe = document.createElement('span'); probe.style.position = 'absolute'; probe.style.visibility = 'hidden'; document.body.appendChild(probe);
const val = (n) => { probe.style.color = `var(${n})`; return getComputedStyle(probe).color; };
const req = { text: '4,5:1', large: '3:1', graphic: '3:1', decorative: '–' };
function render() {
  document.querySelector('#pairs tbody').innerHTML = pairs.pairs.map((p) => {
    const r = contrast(val(p.fg), val(p.bg));
    const g = p.kind === 'decorative' ? 'dekorativ' : grade(r, p.kind);
    return `<tr><td><code>${p.fg}</code></td><td><code>${p.bg}</code></td><td>${req[p.kind]}</td><td class="nd-numeric">${fmt(r)}</td><td class="${g === 'fail' ? 'bad' : 'ok'}">${g === 'fail' ? 'Stryker' : g}</td></tr>`;
  }).join('');
}
render();
document.addEventListener('nd:theme', () => requestAnimationFrame(render));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => requestAnimationFrame(render));
