# Component markup (copy these)

Layout: `.nd-page` (+`--narrow`/`--wide`), `.nd-measure`, `.nd-grid` (`style="--nd-min: 260px"`), `.nd-two-col`, `.nd-stack`, `.nd-row`.

Document header:
```html
<header class="nd-header"><p class="nd-kicker">Gården · Kursoversikt</p><h1>Vaskerom</h1><p class="nd-subtitle">Sikringsskap · kurs 1–13</p></header>
<p class="nd-lead">Ingress …</p>
```
Key facts: `<dl class="nd-keyfacts"><div><dt>Hovedsikring</dt><dd>63 A</dd></div>…</dl>` (`--2`, `--4`).
Table: `<table class="nd-table [nd-table--compact] [nd-table--end]"><caption>…</caption><thead><tr><th>…</th></tr></thead><tbody><tr><td class="nd-key">1</td><td class="nd-num">16 A</td><td class="nd-empty"><span aria-hidden="true">–</span><span class="nd-sr-only">ikke oppgitt</span></td></tr></tbody><tfoot>…</tfoot></table>`
Images: `<figure class="nd-hero"><img …><figcaption class="nd-caption">…</figcaption></figure>`; `<figure class="nd-figure-card"><img …><figcaption><strong>Tittel</strong>Tekst</figcaption></figure>` inside `.nd-grid`; `<div class="nd-gallery"><figure><img><figcaption>…</figcaption></figure>…</div>`. Lightbox: `import { ndLightbox } from './nd/nd-lightbox.js'; ndLightbox();` (`data-full`, `data-nd-zoom="false"`).
Note: `<div class="nd-note [nd-note--warn|--error]"><h4>Tittel</h4><p>…</p></div>`
Contact: `<div class="nd-contact"><div><p class="nd-contact-name">Navn</p><p class="nd-contact-details"><a href="tel:…">…</a><br><a href="mailto:…">…</a></p></div>…</div>`
Colophon/footnote: `<footer class="nd-colophon">…</footer>`, `<p class="nd-footnote">…</p>`
Sheets: `<section class="nd-sheet [nd-sheet--a5] [nd-sheet--fixed] [nd-sheet--last]">` – one per printed page; fixed = exactly one page with `.nd-bottom` glued to the foot. Labels: `<div class="nd-label-sheet" style="--nd-label-w: 70mm; --nd-label-h: 37mm; --nd-label-cols: 3"><div class="nd-label"><p class="nd-kicker">…</p><strong>…</strong><span>…</span></div>…</div>`.

Dashboard:
```html
<header class="nd-topbar"><h1 class="nd-brand">Gården <span>· Hovedhuset</span></h1>
  <div class="nd-topbar-actions"><nav class="nd-segmented" aria-label="Periode"><button type="button">24 t</button><button type="button" aria-current="true">7 d</button></nav>
  <button class="nd-button">↻ Oppdater</button><button class="nd-button nd-button--primary">Logg inn</button></div></header>
<p class="nd-freshness">Sist oppdatert <time datetime="…">for 4 min siden</time> · <span class="nd-status nd-status--ok">tilkoblet</span></p>
<div class="nd-stats"><div class="nd-stat"><p class="nd-stat-label">Effekt nå</p><p class="nd-stat-value">3,8 <span class="nd-stat-unit">kW</span></p><p class="nd-stat-sub">Snitt 7 d · 2,9 kW</p></div></div>
<div class="nd-charts">
  <section class="nd-chart [nd-chart--wide]" aria-labelledby="c1-h">
    <div class="nd-chart-header"><h2 class="nd-chart-title" id="c1-h">Forbruk</h2><p class="nd-freshness">kW per time</p></div>
    <div class="nd-chart-canvas" id="c1" aria-label="Linjediagram: …"></div>
    <div class="nd-chart-footer"><button type="button" class="nd-button nd-datatable-toggle" aria-expanded="false" aria-controls="c1-t">Vis datatabell</button></div>
    <div class="nd-datatable" id="c1-t" hidden tabindex="0"></div>
  </section>
</div>
```
Form: `<form class="nd-form"><div class="nd-field"><label for="e">E-post</label><input id="e" type="email" autocomplete="username"></div><p class="nd-form-error" role="alert"></p><button class="nd-button nd-button--primary">Logg inn</button></form>`
A11y: `<a class="nd-skip-link" href="#innhold">Hopp til innhold</a>`, `.nd-sr-only`, live region via `nd.announce()`.
