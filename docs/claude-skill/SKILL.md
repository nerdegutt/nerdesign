---
name: nerdesign
description: Use when building or changing any HTML for Erlend's private projects (Helgerød gård – documents, printable sheets, labels, dashboards, charts) or when asked to release/update the Nerdesign design system. Covers nd- tokens, component markup, ECharts via nd-echarts.js, vendoring dist/ into a project, and cutting a release.
---

# Nerdesign – how to use and maintain the design system

Nerdesign (`nd-` prefix) is Erlend's design system for everything HTML at
Helgerød gård: printable documents and smart-home dashboards, light + dark,
WCAG 2.2 AA. Repo (public, source and releases): `~/dev/nerdegutt/nerdesign`
(https://github.com/nerdegutt/nerdesign). Website: https://nerdesign.offline.no/

## Where things stand

Released **v1.0.4**. Website https://nerdesign.offline.no/ (old links to offline.no/nerdesign/ redirect).
Each consumer project documents its own adoption in its own AGENTS.md.

Dark theme is «variant D»: dark tiles `#0b0c0e` on a lighter page `#151719`, neutral greys, eight
distinct series hues, cool sequential ramp. Light theme is the original document palette, unchanged.

## Rules that always apply
- **English in code, Norwegian in everything a reader sees** (`lang="nb"`, `·` and `–` as typographic separators).
- Use roles (`--nd-text`, `--nd-surface`), never primitives (`--nd-earth-900`). Components use only roles.
- `h2` carries the brick square automatically. One `h1` per document.
- Numbers in dashboards get `.nd-numeric` (JetBrains Mono, tabular). Numbers in documents stay serif.
- Every chart has a data table (`nd.mount` builds it). Every `.nd-empty` dash has hidden text «ikke oppgitt».
- Status is a dot + a word (`.nd-status--ok` + «tilkoblet»), never colour alone.
- Print is always light on white; fixed sheets and label sheets are paper even in dark mode.
- Consumers never edit their `nd/` folder – change `~/dev/nerdegutt/nerdesign` and copy again.

## Using it in a project (consumer)
```bash
~/dev/nerdegutt/nerdesign/tools/copy-to.sh <project> --with-fonts [--release vX.Y.Z]
```
Then, in the page head (order matters – the inline script prevents a light flash):
```html
<script>try{var t=localStorage.getItem('nd-theme');if(t&&t!=='auto')document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="stylesheet" href="nd/nd-fonts.css">
<link rel="stylesheet" href="nd/nd.css">
<link rel="stylesheet" href="nd/vendor/photoswipe/photoswipe.min.css"><!-- only with images -->
```
Single-file documents paste `dist/nd.css` into `<style>` instead (keep the version banner line; skip fonts).
See `references/markup.md` for component markup, `references/tokens.md` for tokens, `references/echarts.md` for charts.

## Maintaining the system (in ~/dev/nerdegutt/nerdesign)
- Edit `src/`, never `dist/`. `npm run build` → dist. `node tools/build-site.mjs` → site/.
- `npm test` (Playwright: axe both themes, screenshots, print page counts, dashboard), `npm run contrast`, `npm run palette` must all pass.
- Dark tokens live in `src/tokens/*.dark.css` as declarations only; the build wraps them.
- Website pages are fragments in `site-src/`; examples in `examples/` use synthetic data (farm photos allowed, no addresses/contacts).
- `tools/deploy.sh` builds the site into `nettsted/`, commits and pushes; the push deploys https://nerdesign.offline.no/ (Dokploy).

## Cutting a release (Erlend asks «lag release vX.Y.Z»)
1. Make sure the tree is committed and `CHANGELOG.md` has a `## vX.Y.Z` section (move items from `## Unreleased`; notes in Norwegian – they appear on the website).
2. Run `tools/publish.sh vX.Y.Z` on `main`. It bumps `package.json`, builds dist + site with `--release`, runs all tests (aborts on failure), commits and tags, runs `tools/deploy.sh --release` (site root + frozen snapshot `/vX.Y.Z/` in `nettsted/`, pushed with the tag), and creates the GitHub Release with dist files attached.
3. Report the release URL and snapshot URL. Consumers upgrade with `copy-to.sh <project> --release vX.Y.Z`.
See `references/release.md` for what to check if a step fails.

## Local preview of a consumer project
`cp ~/dev/nerdegutt/nerdesign/tools/dev-server.mjs .` then `node dev-server.mjs`
(`PORT=3111` to change port). Serves `public/` when it exists, else the project root, and
answers `/api/config` with SUPABASE_URL / SUPABASE_ANON_KEY from `.env`/`.env.local`.
Erlend tests locally, not on Vercel previews – and his system runs light mode, so send
screenshots when a dark-theme change needs review.
