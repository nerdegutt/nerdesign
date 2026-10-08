# Paste into a consumer project's AGENTS.md

## Design system: Nerdesign

This project uses Nerdesign (https://nerdesign.offline.no/). The files in `nd/`
are vendored from a pinned release – never edit them here; change
`~/dev/nerdegutt/nerdesign` and re-run
`~/dev/nerdegutt/nerdesign/tools/copy-to.sh . --with-fonts --release vX.Y.Z`.
Use `nd-` classes and role tokens only (see the `nerdesign` skill). UI text in
Norwegian, code in English. Every chart uses `nd.mount` from `nd/nd-echarts.js`
and therefore has a data table. Print must be light on white; test with
`npm run test:print`-style headless Chrome PDF before shipping paper.
