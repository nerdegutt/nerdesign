# Release checklist and failure modes

`tools/publish.sh vX.Y.Z` (from `~/dev/nerdegutt/nerdesign`, on `main`) does everything. Preconditions it checks:
- on `main` with a clean git tree (commit first)
- `CHANGELOG.md` has `## vX.Y.Z` (it stamps today's date if missing)
- tests pass (`npm run contrast`, `npm run palette`, `npx playwright test`); on failure it reverts the version bump and aborts

Then: commit «Release vX.Y.Z» + tag; `tools/deploy.sh --release vX.Y.Z` copies the site into `nettsted/` (root + frozen
`/vX.Y.Z/`), commits and pushes with the tag (the push deploys https://nerdesign.offline.no/); `gh release create` on
nerdegutt/nerdesign with dist files + fonts.zip + vendor.zip.

If it stops halfway: check `git status`, `git log origin/main..`, `gh release view vX.Y.Z -R nerdegutt/nerdesign`, and
`curl -s https://nerdesign.offline.no/versions.json`. Re-run only the missing step by hand (the script is not idempotent
across the tag step – delete a half-made local tag with `git tag -d vX.Y.Z` before retrying).
Consumers: `tools/copy-to.sh <project> --with-fonts --release vX.Y.Z` prints the CHANGELOG entries between their version and the new one.
