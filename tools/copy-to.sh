#!/usr/bin/env bash
# Vendor Nerdesign into a consumer project.
#
#   tools/copy-to.sh <target-dir> [--with-fonts] [--release vX.Y.Z]
#
# Copies dist/ (local build, or a release: dist/ and fonts/ from the signed git tag) into
# <target-dir>/nd/, reports the version jump and prints the CHANGELOG entries
# in between. Consumers must never edit nd/ locally – change nerdesign and copy again.
set -euo pipefail

here="$(cd "$(dirname "$0")/.." && pwd)"
target=""; with_fonts=0; release=""; build=""
while [ $# -gt 0 ]; do
  case "$1" in
    --with-fonts) with_fonts=1 ;;
    --release) release="$2"; shift ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) target="$1" ;;
  esac
  shift
done
[ -n "$target" ] || { echo "usage: tools/copy-to.sh <target-dir> [--with-fonts] [--release vX.Y.Z]" >&2; exit 1; }
[ -d "$target" ] || { echo "target not found: $target" >&2; exit 1; }

src_dist="$here/dist"; src_fonts="$here/fonts"
if [ -n "$release" ]; then
  # A release is the signed tag in this clone, not the files on GitHub: git verify-tag checks Erlend's GPG
  # signature (the private key is not on GitHub), and git archive takes dist/ and fonts/ exactly as tagged.
  # A tag that is missing here is fetched; a tag that was moved on GitHub is never overwritten here.
  git -C "$here" rev-parse -q --verify "refs/tags/$release" >/dev/null ||
    git -C "$here" fetch -q origin "refs/tags/$release:refs/tags/$release"
  git -C "$here" verify-tag "$release" 2>/dev/null ||
    { echo "$release: the tag's signature does not verify (git verify-tag $release) – nothing copied" >&2; exit 1; }
  tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
  git -C "$here" archive "$release" dist fonts | tar -x -C "$tmp"
  src_dist="$tmp/dist"; src_fonts="$tmp/fonts"
else
  (cd "$here" && npm run -s build)
  # A local build that differs from the release it is numbered as says so in the banner of the copies
  # («Nerdesign v1.2.0+ad54f83», «.dirty» with uncommitted changes), so nd/ never claims to be a release it is not.
  v="$(grep -m1 -o 'Nerdesign v[0-9][^ ]*' "$src_dist/nd.css" | cut -d' ' -f2)"
  if ! git -C "$here" rev-parse -q --verify "refs/tags/$v" >/dev/null || ! git -C "$here" diff --quiet "$v" -- dist fonts; then
    build="+$(git -C "$here" rev-parse --short HEAD)"
    [ -z "$(git -C "$here" status --porcelain -- src dist fonts)" ] || build="$build.dirty"
  fi
fi

new_version="$(grep -m1 -o 'Nerdesign v[0-9][^ ]*' "$src_dist/nd.css" | cut -d' ' -f2)"
old_version="$(grep -m1 -o 'Nerdesign v[0-9][^ ]*' "$target/nd/nd.css" 2>/dev/null | cut -d' ' -f2 || true)"

mkdir -p "$target/nd"
cp "$src_dist"/nd.css "$src_dist"/nd-echarts.js "$src_dist"/nd-theme.js "$src_dist"/nd-lightbox.js "$target/nd/"
[ -f "$src_dist/nd-popover.js" ] && cp "$src_dist/nd-popover.js" "$target/nd/"   # not in older releases
[ -d "$src_dist/vendor" ] && { rm -rf "$target/nd/vendor"; cp -R "$src_dist/vendor" "$target/nd/vendor"; }
if [ "$with_fonts" = 1 ]; then
  cp "$src_dist"/nd-fonts.css "$target/nd/"
  mkdir -p "$target/nd/fonts"
  cp "$src_fonts"/*.woff2 "$src_fonts"/LICENSE* "$target/nd/fonts/" 2>/dev/null || true
fi
if [ -n "$build" ]; then
  for f in "$target"/nd/nd*.css "$target"/nd/nd*.js; do
    V="$new_version" B="$build" perl -pi -e 's/Nerdesign \Q$ENV{V}\E /Nerdesign $ENV{V}$ENV{B} / if $. == 1; close ARGV if eof' "$f"
  done
  new_version="$new_version$build"
fi

if [ -n "$old_version" ]; then
  echo "Nerdesign: $old_version → $new_version in $target/nd/"
  # Print CHANGELOG sections newer than the old version (headings are «## v1.2.0 – 2026-10-25»; a local build's
  # «+hash» is not part of the heading).
  awk -v old="## ${old_version%%+*}" '/^## /{ if ($0 == old || index($0, old " ") == 1) exit } { print }' "$here/CHANGELOG.md" | sed -n '/^## /,$p'
else
  echo "Nerdesign: installed $new_version in $target/nd/"
fi
