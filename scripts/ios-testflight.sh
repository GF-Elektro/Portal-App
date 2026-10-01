#!/usr/bin/env bash
# Archive PortalEU and upload the IPA to TestFlight (App Store Connect).
# Requires: Xcode, paid Apple Developer team, App Store Connect app for com.gfelektro.portal.ios.
#
# Auth (pick one):
#   • App Store Connect API key (recommended for CI and local):
#       APPLE_API_KEY=/path/to/AuthKey_XXXX.p8
#       APPLE_API_KEY_ID=...
#       APPLE_API_ISSUER=...
#     Or APPLE_API_KEY_BASE64 (same as GitHub secret) instead of APPLE_API_KEY path.
#   • Optional: import a distribution .p12 before running (see docs/apple-signing.md).
#
# Optional:
#   MARKETING_VERSION=1.0.38 CURRENT_PROJECT_VERSION=42 ./scripts/ios-testflight.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$ROOT/ios"
ARCHIVE="${ARCHIVE_PATH:-$TMPDIR/PortalEU.xcarchive}"
EXPORT_DIR="${EXPORT_DIR:-$TMPDIR/PortalEU-export}"

if [[ -n "${APPLE_API_KEY_BASE64:-}" && -z "${APPLE_API_KEY:-}" ]]; then
  APPLE_API_KEY="${TMPDIR:-/tmp}/AuthKey.p8"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    printf '%s' "$APPLE_API_KEY_BASE64" | base64 -D > "$APPLE_API_KEY"
  else
    printf '%s' "$APPLE_API_KEY_BASE64" | base64 -d > "$APPLE_API_KEY"
  fi
fi

AUTH_ARGS=()
if [[ -n "${APPLE_API_KEY:-}" && -n "${APPLE_API_KEY_ID:-}" && -n "${APPLE_API_ISSUER:-}" ]]; then
  AUTH_ARGS=(
    -authenticationKeyPath "$APPLE_API_KEY"
    -authenticationKeyID "$APPLE_API_KEY_ID"
    -authenticationKeyIssuerID "$APPLE_API_ISSUER"
  )
elif [[ -z "${AUTH_ARGS[*]:-}" ]]; then
  echo "Warning: no App Store Connect API key env vars; archive may fail unless Xcode is signed in with a Distribution certificate."
fi

BUILD_SETTINGS=()
if [[ -n "${MARKETING_VERSION:-}" ]]; then
  BUILD_SETTINGS+=(MARKETING_VERSION="$MARKETING_VERSION")
fi
if [[ -n "${CURRENT_PROJECT_VERSION:-}" ]]; then
  BUILD_SETTINGS+=(CURRENT_PROJECT_VERSION="$CURRENT_PROJECT_VERSION")
fi

rm -rf "$ARCHIVE" "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR"

cd "$IOS_DIR"

echo "Archiving to $ARCHIVE ..."
xcodebuild -project PortalEU.xcodeproj \
  -scheme PortalEU \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  -allowProvisioningUpdates \
  "${AUTH_ARGS[@]}" \
  "${BUILD_SETTINGS[@]}" \
  archive

echo "Exporting IPA to $EXPORT_DIR ..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$IOS_DIR/ExportOptions.plist" \
  -allowProvisioningUpdates \
  "${AUTH_ARGS[@]}"

IPA="$(find "$EXPORT_DIR" -maxdepth 1 -name '*.ipa' | head -1)"
if [[ -z "$IPA" ]]; then
  echo "No .ipa found in $EXPORT_DIR"
  exit 1
fi

if [[ -n "${APPLE_API_KEY:-}" && -n "${APPLE_API_KEY_ID:-}" && -n "${APPLE_API_ISSUER:-}" ]]; then
  echo "Uploading $IPA to App Store Connect (TestFlight) ..."
  xcrun altool --upload-app -f "$IPA" -t ios \
    --apiKey "$APPLE_API_KEY_ID" \
    --apiIssuer "$APPLE_API_ISSUER" \
    --p8-file-path "$APPLE_API_KEY"
  echo "Upload finished. Processing in App Store Connect usually takes a few minutes."
else
  echo "Exported $IPA (set APPLE_API_KEY* to upload automatically, or use Transporter / Xcode Organizer)."
fi
