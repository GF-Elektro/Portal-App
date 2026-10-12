#!/usr/bin/env bash
# Build Mac App Store .pkg and open it in Transporter for TestFlight / App Store Connect.
# Requires Apple Distribution + Mac Installer Distribution in login keychain (see docs/apple-signing.md).
#
# Usage:
#   ./scripts/mac-mas-transporter.sh
#   ./scripts/mac-mas-transporter.sh --upload-cli   # iTMSTransporter instead of Transporter.app

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=/dev/null
source "$ROOT/scripts/load-apple-env.sh"

unset CSC_NAME CSC_LINK CSC_KEY_PASSWORD

if ! security find-identity -v -p codesigning 2>/dev/null | grep -q 'Apple Distribution: G&F Elektro'; then
  echo "Missing Apple Distribution certificate in the login keychain."
  echo "Xcode → Settings → Accounts → G&F Elektro → Manage Certificates → + → Apple Distribution"
  echo "Also add Mac Installer Distribution if prompted when packaging."
  open -a Xcode 2>/dev/null || true
  exit 1
fi

if ! bash "$ROOT/scripts/check-mas-provisionprofile.sh"; then
  open "https://developer.apple.com/account/resources/profiles/list" 2>/dev/null || true
  exit 1
fi

echo "Building Mac App Store package (npm run build:mac:mas) ..."
npm run build:mac:mas
npm run verify:mas-signing

PKG="$(find "$ROOT/release" -name '*.pkg' -not -path '*/.*' | head -1)"
if [[ -z "$PKG" ]]; then
  echo "No .pkg found under release/ after build."
  exit 1
fi

echo "Package: $PKG"

if [[ "${1:-}" == "--upload-cli" ]]; then
  if [[ -z "${APPLE_API_KEY:-}" || -z "${APPLE_API_KEY_ID:-}" || -z "${APPLE_API_ISSUER:-}" ]]; then
    echo "Set APPLE_API_KEY, APPLE_API_KEY_ID, APPLE_API_ISSUER (e.g. source scripts/load-apple-env.sh)."
    exit 1
  fi
  ITMS="$(xcrun --find iTMSTransporter)"
  # Transporter only loads AuthKey_<id>.p8 from a private_keys directory
  # (cwd, ~/private_keys, ~/.private_keys, or ~/.appstoreconnect/private_keys).
  STAGE="$(mktemp -d)"
  mkdir -p "$STAGE/private_keys"
  cp "$APPLE_API_KEY" "$STAGE/private_keys/AuthKey_${APPLE_API_KEY_ID}.p8"
  echo "Uploading via iTMSTransporter ..."
  (
    cd "$STAGE"
    "$ITMS" -m upload -assetFile "$PKG" \
      -apiKey "$APPLE_API_KEY_ID" \
      -apiIssuer "$APPLE_API_ISSUER"
  )
  rm -rf "$STAGE"
  echo "Upload submitted. Processing in App Store Connect usually takes a few minutes."
else
  echo "Opening Transporter ..."
  open -a Transporter "$PKG"
fi
