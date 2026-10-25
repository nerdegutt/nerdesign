// Komponenter: the live toolbar example. «Kilder: alle» opens a popover with made-up sources; the
// segmented groups switch. Nothing is stored.
import { ndPopover } from './dist/nd-popover.js';

const sources = [['kamera', 'Kamera', 1204], ['mobil', 'Mobil', 8532], ['skanner', 'Skanner', 312]];
let chosen = sources.map(([id]) => id);
const button = document.getElementById('demo-sources');
const label = () => chosen.length === sources.length ? 'Kilder: alle'
  : !chosen.length ? 'Kilder: ingen'
  : chosen.length === 1 ? sources.find(([id]) => id === chosen[0])[1]
  : `Kilder: ${chosen.length} av ${sources.length}`;

button?.addEventListener('click', () => {
  const pop = ndPopover(button, `<p class="nd-popover-title">Kilder</p>
    <ul>${sources.map(([id, name, n]) => `<li><label title="${name}"><input type="checkbox" value="${id}"${chosen.includes(id) ? ' checked' : ''}>
      <span class="nd-popover-name">${name}</span><small>${n.toLocaleString('nb-NO')} filer</small></label></li>`).join('')}</ul>
    <div class="nd-popover-foot"><button type="button" class="nd-button nd-button--quiet" data-all>Alle</button><button type="button" class="nd-button nd-button--quiet" data-none>Ingen</button></div>`,
  { label: 'Kilder' });
  if (!pop) return;
  const set = (ids) => {
    chosen = ids;
    for (const box of pop.el.querySelectorAll('input[type="checkbox"]')) box.checked = ids.includes(box.value);
    button.textContent = label();
  };
  pop.el.addEventListener('change', () => set([...pop.el.querySelectorAll('input:checked')].map((b) => b.value)));
  pop.el.querySelector('[data-all]').addEventListener('click', () => set(sources.map(([id]) => id)));
  pop.el.querySelector('[data-none]').addEventListener('click', () => set([]));
});

for (const group of document.querySelectorAll('#toolbar-demo .nd-segmented')) {
  group.addEventListener('click', (e) => {
    const pressed = e.target.closest('button'); if (!pressed) return;
    for (const b of group.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === pressed));
  });
}
