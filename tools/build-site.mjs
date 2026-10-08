// Assemble site/*.html from site-src/*.html fragments inside a shared shell.
// The site is built with the system itself (nd.css) plus a small site.css for
// navigation chrome. Run: node tools/build-site.mjs   (also run by deploy/publish)
import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const releaseArg = process.argv.find((a) => a.startsWith('--release='));
const isRelease = !!releaseArg;                       // publish.sh builds with --release=vX.Y.Z
const version = isRelease ? releaseArg.slice(10).replace(/^v/, '') : pkg.version;   // no dev concept: the root is always what is deployed

// --- CHANGELOG → releases ------------------------------------------------------
// Split on the "## " headings instead of one big regex: `$` in multiline mode
// matches at every line end, which silently truncated every section to nothing.
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
const sections = changelog.split(/^## /m).slice(1).map((block) => {
  const nl = block.indexOf('\n');
  const heading = block.slice(0, nl === -1 ? undefined : nl).trim();
  const notes = block.slice(nl + 1).split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim());
  const m = /^v(\d+\.\d+\.\d+)(?:\s*[–-]\s*(\d{4}-\d{2}-\d{2}))?$/.exec(heading);
  return m ? { version: m[1], date: m[2] || '', notes } : { heading, notes };
});
const releases = sections.filter((s) => s.version);
const unreleased = (sections.find((s) => s.heading === 'Unreleased') || { notes: [] }).notes;
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/`([^`]+)`/g, '<code>$1</code>');
const NAV = [
  ['index.html', 'Om'],
  ['kom-i-gang.html', 'Kom i gang'],
  ['grunnlag.html', 'Grunnlag'],
  ['komponenter.html', 'Komponenter'],
  ['eksempler.html', 'Eksempler'],
  ['tilgjengelighet.html', 'Tilgjengelighet'],
  ['versjoner.html', 'Versjoner'],
];

const shell = (file, title, body) => `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title} · Nerdesign</title>
<script>try{var t=localStorage.getItem('nd-theme');if(t&&t!=='auto')document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="stylesheet" href="dist/nd-fonts.css">
<link rel="stylesheet" href="dist/nd.css">
<link rel="stylesheet" href="dist/vendor/photoswipe/photoswipe.min.css">
<link rel="stylesheet" href="site.css">
</head>
<body data-nd-version="${version}">
<a class="nd-skip-link" href="#innhold">Hopp til innhold</a>
<div class="site-version-banner" id="version-banner" hidden></div>
<header class="site-header">
  <a class="site-brand" href="index.html"><span class="site-mark" aria-hidden="true"></span>Nerdesign <small class="nd-numeric">v${version}</small></a>
  <nav class="site-nav" aria-label="Hovedmeny">
    ${NAV.map(([f, l]) => `<a href="${f}"${f === file ? ' aria-current="page"' : ''}>${l}</a>`).join('\n    ')}
  </nav>
  <div id="theme" class="site-theme"></div>
</header>
<main id="innhold" class="nd-page nd-page--wide">
${body}
</main>
<footer class="nd-colophon">Nerdesign · et designsystem for Helgerød gård, Jeløya · v${version}</footer>
<script>
  // Snapshot banner: tell the reader when a newer release exists. versions.json lives at the site root.
  (async () => {
    try {
      if (!location.pathname.match(/\/v\d+\.\d+\.\d+\//)) return;   // only frozen snapshots get a banner
      const mine = document.body.dataset.ndVersion;
      const r = await fetch('../versions.json', { cache: 'no-store' }); if (!r.ok) return;
      const { latest } = await r.json();
      if (!latest || latest === mine) return;
      const b = document.getElementById('version-banner');
      b.innerHTML = 'Du ser Nerdesign v' + mine + '. Nyeste versjon er <a href="../">v' + latest + '</a>.';
      b.hidden = false;
    } catch {}
  })();
</script>
<script type="module">
  import { ndTheme } from './dist/nd-theme.js';
  import { ndLightbox } from './dist/nd-lightbox.js';
  ndTheme.init(); ndTheme.mount(document.getElementById('theme'));
  ndLightbox();
</script>
${existsSync(join(root, 'site-src', file.replace('.html', '.js'))) ? `<script type="module" src="${file.replace('.html', '.js')}"></script>` : ''}
</body>
</html>
`;

rmSync(join(root, 'site'), { recursive: true, force: true });
mkdirSync(join(root, 'site'), { recursive: true });
for (const f of readdirSync(join(root, 'site-src'))) {
  const src = readFileSync(join(root, 'site-src', f), 'utf8');
  if (f.endsWith('.html')) {
    const title = /<h1[^>]*>([^<]*)<\/h1>/.exec(src)?.[1]?.replace(/<[^>]+>/g, '') ?? 'Nerdesign';
    writeFileSync(join(root, 'site', f), shell(f, title, src));
  } else writeFileSync(join(root, 'site', f), src);
}
// --- Versjoner page + versions.json --------------------------------------------
const relBlock = (r) => `
<section class="nd-panel" style="margin-bottom: var(--nd-space-4);">
  <h2 style="margin-top: 0;">v${r.version} <small class="nd-muted" style="font-size: 0.6em; font-weight: 400;">${r.date}</small></h2>
  <ul class="nd-list">${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
  <p class="nd-row" style="margin: 0;"><a class="nd-button" href="v${r.version}/">Se nettstedet for v${r.version}</a><a class="nd-button" href="v${r.version}/dist/nd.css">nd.css</a><a class="nd-button" href="https://github.com/nerdegutt/nerdesign/releases/tag/v${r.version}">GitHub-release</a></p>
</section>`;
const versjoner = `<header class="nd-header">
  <p class="nd-kicker">Nerdesign · versjoner</p>
  <h1>Versjoner</h1>
  <p class="nd-subtitle">Utgivelser, endringer og frosne kopier av nettstedet</p>
</header>
<p class="nd-lead">Prosjekter låser seg til én versjon. Hver utgivelse har egne filer og en frossen kopi av nettstedet, lenket under.</p>
${unreleased.length ? `<section class="nd-note"><h4>${isRelease ? 'Kommer i neste versjon' : `Endringer siden v${releases[0]?.version ?? '0'}`}</h4><ul class="nd-list" style="margin: 0;">${unreleased.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>` : ''}
${releases.length ? releases.map(relBlock).join('') : '<p class="nd-muted">Ingen utgivelser enda.</p>'}`;
writeFileSync(join(root, 'site/versjoner.html'), shell('versjoner.html', 'Versjoner', versjoner));
writeFileSync(join(root, 'site/versions.json'), JSON.stringify({ latest: releases[0]?.version || null, versions: releases.map((r) => ({ version: r.version, date: r.date })) }, null, 2) + '\n');

cpSync(join(root, 'dist'), join(root, 'site/dist'), { recursive: true });
cpSync(join(root, 'fonts'), join(root, 'site/dist/fonts'), { recursive: true });
cpSync(join(root, 'tools/wcag.mjs'), join(root, 'site/wcag.mjs'));
// examples need ECharts (dev dependency) – copy it next to them in both places
mkdirSync(join(root, 'examples/vendor'), { recursive: true });
cpSync(join(root, 'node_modules/echarts/dist/echarts.min.js'), join(root, 'examples/vendor/echarts.min.js'));
if (existsSync(join(root, 'examples'))) {
  cpSync(join(root, 'examples'), join(root, 'site/examples'), { recursive: true });
  // examples reference ../dist/nd.css – valid both in repo and in site/
}
console.log('site/ built:', readdirSync(join(root, 'site')).filter((f) => f.endsWith('.html')).join(', '));
