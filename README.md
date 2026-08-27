# Nerdesign

A small personal design system for [Helgerød gård](https://offline.no/nerdesign/) –
tokens, CSS components, print styles and an ECharts theme that work in both light
and dark mode and meet WCAG 2.2 AA. Used for printable documents and smart-home
dashboards alike.

- Pattern book: https://offline.no/nerdesign/
- Source: `src/` · Built output: `dist/` (committed)

## Use it in a project

Vendor a pinned release – no build step needed in your project:

```bash
tools/copy-to.sh ../my-project --with-fonts --release v1.0.0
```

This places `nd.css`, `nd-echarts.js`, `nd-theme.js` (and optionally
`nd-fonts.css` + `fonts/`) in `my-project/nd/`. Include them like any static file:

```html
<link rel="stylesheet" href="nd/nd-fonts.css">
<link rel="stylesheet" href="nd/nd.css">
<script type="module">
  import * as hg from './nd/nd-echarts.js';
</script>
```

Single-file documents paste `dist/nd.css` into their `<style>`. Never edit the
copied files – change this repo and copy again.

## Develop

```bash
npm install && npx playwright install chromium
npm run build && npm test
```

See `CLAUDE.md` for conventions.
