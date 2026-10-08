#!/usr/bin/env bash
# Vendor Nerdesign into a consumer project.
#
#   tools/copy-to.sh <target-dir> [--with-fonts] [--release vX.Y.Z]
#
# Copies dist/ (local build, or the assets of a GitHub Release) into
# <target-dir>/nd/, reports the version jump and prints the CHANGELOG entries
# in between. Consumers must never edit nd/ locally – change nerdesign and copy again.
set -euo pipefail

here="$(cd "$(dirname "$0")/.." && pwd)"
target=""; with_fonts=0; release=""
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
  tmp="$(mktemp -d)"
  gh release download "$release" -R nerdegutt/nerdesign -D "$tmp" --clobber
  src_dist="$tmp"; src_fonts="$tmp/fonts"
  [ -d "$src_fonts" ] || { mkdir -p "$src_fonts"; (cd "$src_fonts" && for z in "$tmp"/fonts*.zip; do [ -f "$z" ] && unzip -qo "$z"; done); }
  [ -f "$tmp/vendor.zip" ] && (cd "$tmp" && unzip -qo vendor.zip)   # → $tmp/vendor/
else
  (cd "$here" && npm run -s build)
fi

new_version="$(grep -m1 -o 'Nerdesign v[0-9][^ ]*' "$src_dist/nd.css" | cut -d' ' -f2)"
old_version="$(grep -m1 -o 'Nerdesign v[0-9][^ ]*' "$target/nd/nd.css" 2>/dev/null | cut -d' ' -f2 || true)"

mkdir -p "$target/nd"
cp "$src_dist"/nd.css "$src_dist"/nd-echarts.js "$src_dist"/nd-theme.js "$src_dist"/nd-lightbox.js "$target/nd/"
[ -d "$src_dist/vendor" ] && { rm -rf "$target/nd/vendor"; cp -R "$src_dist/vendor" "$target/nd/vendor"; }
if [ "$with_fonts" = 1 ]; then
  cp "$src_dist"/nd-fonts.css "$target/nd/"
  mkdir -p "$target/nd/fonts"
  cp "$src_fonts"/*.woff2 "$src_fonts"/LICENSE* "$target/nd/fonts/" 2>/dev/null || true
fi

if [ -n "$old_version" ]; then
  echo "Nerdesign: $old_version → $new_version in $target/nd/"
  # Print CHANGELOG sections newer than the old version.
  awk -v old="## $old_version" '/^## /{ if ($0 == old) exit } { print }' "$here/CHANGELOG.md" | sed -n '/^## /,$p'
else
  echo "Nerdesign: installed $new_version in $target/nd/"
fi
