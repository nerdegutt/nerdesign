# Changelog

Release notes for Nerdesign. Versions follow semver. This file is the single
source for notes: `tools/publish.sh` uses the matching section for the GitHub
Release, and the website's «Versjoner» page is generated from it.

Format: `## vX.Y.Z – YYYY-MM-DD`, then bullet points in Norwegian (they are shown
on the website). `## Unreleased` collects what is coming.

## Unreleased

## v1.0.1 – 2026-08-27

- Temabryteren fra `nd-theme.js` har nå stil i `nd.css` (segmentert gruppe), ikke bare på nettstedet.
- Releasen inkluderer `vendor.zip` (PhotoSwipe), og `copy-to.sh --release` pakker den ut.
- Nettstedet: nøktern tekst; ingen dev-merking.

## v1.0.0 – 2026-08-27

- Tokens i to lag: lyst tema (den opprinnelige dokumentpaletten) og mørkt tema, datapaletter validert for fargesyn og kontrast i begge.
- Typografi, tilgjengelighetsbase og layout-primitiver (`.nd-page`, `.nd-grid`, `.nd-keyfacts`, `.nd-sheet`, `.nd-label-sheet`).
- Dokumentkomponenter: dokumenthode, nøkkelfakta, tabell, bilder og kort, galleri, merknad, kontakt, kolofon, fotnote, ark (A4/A5/fast), etiketter.
- Dashboardkomponenter: toppstripe, periodevelger, knapper, nøkkeltall, graf med datatabell, status, ferskhet, skjema.
- `nd-echarts.js`: ECharts-tema fra tokens, option-hjelpere, `mount` med temabytte, redusert bevegelse, aria og datatabell.
- `nd-lightbox.js`: PhotoSwipe for alle bilder, uten endringer i markup.
- Selvhostet JetBrains Mono (OFL) via `nd-fonts.css`; `nd-theme.js` for auto/lyst/mørkt.
- Print: alltid lyst på hvitt; faste ark og etikettark er alltid papir, også på skjerm i mørkt tema.
- Nettsted med Om, Kom i gang, Grunnlag, Komponenter, Eksempler, Tilgjengelighet og Versjoner; fire eksempler med PDF.
