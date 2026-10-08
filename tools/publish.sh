#!/usr/bin/env bash
# Release a new version.
#
#   tools/publish.sh vX.Y.Z
#
# 1. sets package.json version, builds dist/ and site/, runs the tests
# 2. commits "Release vX.Y.Z" and tags it
# 3. tools/deploy.sh --release: copies the site into nettsted/ (root + frozen /vX.Y.Z/), commits, pushes with the tag
# 4. creates a GitHub Release on nerdegutt/nerdesign with every dist file attached (copy-to.sh --release uses them)
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
v="${1:-}"; [[ "$v" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "usage: tools/publish.sh vX.Y.Z" >&2; exit 1; }
[ "$(git -C "$here" branch --show-current)" = main ] || { echo "release from main" >&2; exit 1; }
[ -z "$(git -C "$here" status --porcelain)" ] || { echo "commit your changes first" >&2; exit 1; }
grep -q "^## $v" "$here/CHANGELOG.md" || { echo "CHANGELOG.md has no section '## $v'" >&2; exit 1; }

cd "$here"
# stamp the date on the CHANGELOG heading if missing
today="$(date +%Y-%m-%d)"
grep -q "^## $v – " CHANGELOG.md || sed -i '' "s/^## $v\$/## $v – $today/" CHANGELOG.md
npm version --no-git-tag-version "${v#v}" >/dev/null
npm run -s build
node tools/build-site.mjs --release="$v"
npm run -s contrast >/dev/null && npm run -s palette >/dev/null && npx playwright test >/dev/null || { echo "tests failed – release aborted"; git checkout -- package.json package-lock.json CHANGELOG.md; exit 1; }

git add -A && git commit -qm "Release $v" && git tag -a "$v" -m "Nerdesign $v"
tools/deploy.sh --release "$v"

notes="$(awk -v v="## $v" '$0==v{f=1;next} /^## /{if(f)exit} f' CHANGELOG.md)"
tmp="$(mktemp -d)"
(zip -qrj "$tmp/fonts.zip" fonts 2>/dev/null || true)
(cd dist && zip -qr "$tmp/vendor.zip" vendor 2>/dev/null || true)
gh release create "$v" -R nerdegutt/nerdesign --title "Nerdesign $v" --notes "$notes" dist/*.css dist/*.js "$tmp"/*.zip   # every dist file, so copy-to.sh --release always finds what it copies
rm -rf "$tmp"
echo "Published Nerdesign $v → github.com/nerdegutt/nerdesign and https://nerdesign.offline.no/"
