#!/usr/bin/env bash
# Publish the pattern book (+ dist, examples, fonts) to https://nerdesign.offline.no/
# The site is served by the `nerdesign` app on the home server (Dokploy) from nettsted/ in this repo.
# This script builds site/ (ignored), copies it into nettsted/ (tracked), commits and pushes. The push is the
# deploy: Dokploy builds main.
#   tools/deploy.sh                  → current state to the site root (no dev concept – straight to prod)
#   tools/deploy.sh --release vX.Y.Z → release build to the root AND a frozen snapshot at /vX.Y.Z/
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
release=""; [ "${1:-}" = "--release" ] && release="${2:?version}"
[ "$(git -C "$here" branch --show-current)" = main ] || { echo "deploy from main" >&2; exit 1; }

(cd "$here" && npm run -s build && node tools/build-site.mjs ${release:+--release=$release})
site="$here/site"; dest="$here/nettsted/"
# examples link ../dist/nd.css – they live under /examples/, so ../dist resolves to /dist. Good.
# ship the PDFs the tests produced (if any)
for f in "$here"/test/screenshots/*.pdf; do [ -f "$f" ] && cp "$f" "$site/examples/"; done

# never delete the frozen snapshots (v*/) when syncing the root
rsync -a --delete --exclude '.DS_Store' --exclude '/v[0-9]*/' "$site/" "$dest"
[ -n "$release" ] && rsync -a --delete --exclude '.DS_Store' "$site/" "${dest}${release}/"

git -C "$here" add nettsted
if git -C "$here" diff --cached --quiet; then
  echo "Nothing changed on https://nerdesign.offline.no/"
else
  git -C "$here" commit -qm "Nettsted: ${release:-$(git -C "$here" rev-parse --short HEAD)}"
fi
git -C "$here" push -q --follow-tags
echo "Pushed – Dokploy deploys https://nerdesign.offline.no/${release:+ (snapshot /${release}/)}"
echo "Check in a minute or two: curl -s https://nerdesign.offline.no/dist/nd.css | grep -o 'Nerdesign v[0-9][^ <]*' | head -1"
