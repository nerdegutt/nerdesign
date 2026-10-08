# Tokens (roles) – use these, never primitives

Surfaces: `--nd-bg` (page), `--nd-surface` (cards, tables, panels), `--nd-surface-raised` (sticky heads, tooltips), `--nd-line`, `--nd-line-faint`.
Text: `--nd-text`, `--nd-text-muted` (≥4.5:1), `--nd-text-inverse` (on accent), `--nd-text-empty` (decorative dash).
Accent: `--nd-accent` (graphics), `--nd-accent-text` (text), `--nd-link`, `--nd-focus`.
Status: `--nd-ok`, `--nd-warn`, `--nd-error`, `--nd-info` – always with a word/icon.
Charts: `--nd-chart-text`, `--nd-chart-axis`, `--nd-chart-grid`, `--nd-chart-tooltip-bg`, `--nd-chart-tooltip-line`; series `--nd-series-1..8` (fixed order; 9th → «Annet»); `--nd-seq-100..700` (one hue, light→dark); `--nd-div-neg` / `--nd-div-mid` / `--nd-div-pos`.
Type: `--nd-font-text` (Iowan Old Style/Palatino/Georgia), `--nd-font-numeric` (JetBrains Mono); sizes `--nd-size-xs|sm|md|lg|xl|2xl|display`; `--nd-tracking-caps`, `--nd-tracking-kicker`.
Space/shape: `--nd-space-1..8` (0.25rem … 4rem), `--nd-radius` 6px, `--nd-radius-sm` 1px, `--nd-measure` 42em, `--nd-page-width` 960px.

Themes: light on `:root`; dark via `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])` and via `:root[data-theme="dark"]`; print forces light. `.nd-paper` forces light on an element.
Light values are the original document palette: bg #faf7f2, surface #fff, line #e5ddd0, text #2b2620, muted #6f6659, accent #8e3b2f.
