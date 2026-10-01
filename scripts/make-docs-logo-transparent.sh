#!/usr/bin/env bash
# Regenerate docs/assets/logo.png (transparent) from logo-white-bg.png.
# Requires: brew install imagemagick oxipng  (optional: pngquant optipng)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="${ROOT}/docs/assets/logo-white-bg.png"
OUTPUT="${ROOT}/docs/assets/logo.png"
BRAND_OUTPUT="${ROOT}/docs/assets/brand-logo.png"
FUZZ="${LOGO_FUZZ:-3}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required tool: $1" >&2
    echo "Install with: brew install imagemagick oxipng pngquant optipng" >&2
    exit 1
  fi
}

require_cmd magick
require_cmd oxipng

if [[ ! -f "$SOURCE" ]]; then
  echo "Source not found: $SOURCE" >&2
  echo "Keep the flat white-background master as logo-white-bg.png." >&2
  exit 1
fi

TMP="$(mktemp "${TMPDIR:-/tmp}/logo-transparent.XXXXXX.png")"
trap 'rm -f "$TMP"' EXIT

magick "$SOURCE" -fuzz "${FUZZ}%" -transparent white "$TMP"
mv "$TMP" "$OUTPUT"
cp "$OUTPUT" "$BRAND_OUTPUT"
trap - EXIT

oxipng -o 4 --strip safe "$OUTPUT"
cp "$OUTPUT" "$BRAND_OUTPUT"

if command -v pngquant >/dev/null 2>&1; then
  pngquant --quality=85-100 --skip-if-larger --force --output "$OUTPUT" "$OUTPUT" || true
fi

if command -v optipng >/dev/null 2>&1; then
  optipng -quiet -o2 "$OUTPUT" || true
fi

cp "$OUTPUT" "$BRAND_OUTPUT"
echo "Wrote $OUTPUT and $BRAND_OUTPUT (${FUZZ}% white fuzz, $(magick identify -format '%wx%h' "$OUTPUT"))"
