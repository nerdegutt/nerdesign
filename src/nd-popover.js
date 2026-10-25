// Popover: a small floating menu or dialog (.nd-popover) anchored to a button. One is open at a time.
//
//   <button type="button" class="nd-drop" aria-haspopup="dialog" aria-expanded="false">Kilder: alle</button>
//   <script type="module">
//     import { ndPopover } from './nd/nd-popover.js';
//     button.addEventListener('click', () => {
//       const pop = ndPopover(button, '<p class="nd-popover-title">Kilder</p><ul>…</ul>', { label: 'Kilder' });
//       pop?.el.addEventListener('change', (e) => { … });
//     });
//   </script>
//
// ndPopover(anchor, content, { label, onClose }) → { el, close } – or null when it closed instead:
//   content  an HTML string (set as innerHTML – escape your data) or a Node to put inside
//   label    the dialog's name for screen readers (aria-label); default: the anchor's text
//   onClose  called after it has closed, however that happened
// Calling it again for the same anchor while it is open closes it (a toggle).
//
// Placed below the anchor, or above when there is no room below; always kept inside the viewport. Closes on
// Esc (focus goes back to the anchor), on a pointerdown outside it and the anchor, when focus moves to
// something else on the page, and when fullscreen starts or ends. Appended to document.fullscreenElement
// when there is one, else to <body>. Keeps aria-expanded on the anchor up to date and focuses the first
// control inside. closePopover() closes whatever is open.

let open = null; // { anchor, el, close }

export function closePopover() { open?.close(); }

export function ndPopover(anchor, content, { label, onClose } = {}) {
  if (open?.anchor === anchor) { open.close(); return null; }
  closePopover();

  const el = document.createElement('div');
  el.className = 'nd-popover';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', label || anchor.textContent.trim());
  if (typeof content === 'string') el.innerHTML = content; else el.append(content);
  (document.fullscreenElement ?? document.body).append(el);

  const place = () => {
    const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight, gap = 4, edge = 8;
    const below = r.bottom + gap + h + edge <= vh || vh - r.bottom >= r.top;   // above only when it fits better there
    const top = below ? r.bottom + gap : r.top - gap - h;
    el.style.left = `${Math.max(edge, Math.min(vw - w - edge, r.left))}px`;
    el.style.top = `${Math.max(edge, Math.min(vh - h - edge, top))}px`;
  };
  const outside = (t) => !el.contains(t) && !anchor.contains(t);
  const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); anchor.focus(); } };
  const onDown = (e) => { if (outside(e.target)) close(); };
  const onFocus = (e) => { if (outside(e.target)) close(); };
  const listeners = [[document, 'keydown', onKey, true], [document, 'pointerdown', onDown, true], [document, 'focusin', onFocus],
    [document, 'scroll', place, { capture: true, passive: true }], [window, 'resize', place], [document, 'fullscreenchange', closePopover]];

  const close = () => {
    if (open?.el !== el) return;
    open = null;
    el.remove();
    anchor.setAttribute('aria-expanded', 'false');
    for (const [target, type, fn, opt] of listeners) target.removeEventListener(type, fn, opt);
    onClose?.();
  };

  place();
  for (const [target, type, fn, opt] of listeners) target.addEventListener(type, fn, opt);
  anchor.setAttribute('aria-expanded', 'true');
  open = { anchor, el, close };
  el.querySelector('input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])')?.focus();
  return open;
}
