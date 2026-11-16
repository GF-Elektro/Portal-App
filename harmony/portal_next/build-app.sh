#!/bin/bash
# Build the HarmonyOS NEXT shell. Requires DevEco Studio on this Mac.
# Usage: bash harmony/portal_next/build-app.sh [release|debug]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-release}"
if [[ "$MODE" != "release" && "$MODE" != "debug" ]]; then
  echo "Usage: $0 [release|debug]" >&2
  exit 2
fi

find_app() {
  local candidate
  for candidate in \
    "/Applications/DevEco-Studio.app" \
    "$HOME/Applications/DevEco-Studio.app"
  do
    if [[ -d "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

APP="$(find_app || true)"
if [[ -z "$APP" ]]; then
  echo "DevEco Studio is not installed. Install the macOS build from https://developer.huawei.com/consumer/en/download/ and drag DevEco-Studio.app into /Applications." >&2
  exit 1
fi

NODE_BIN="$APP/Contents/tools/node/bin"
HVIGOR_BIN="$APP/Contents/tools/hvigor/bin"
OHPM_BIN="$APP/Contents/tools/ohpm/bin"
SDK_DIR="$APP/Contents/sdk"
if [[ ! -x "$HVIGOR_BIN/hvigorw" && -x "$APP/Contents/tools/hvigor/hvigor/bin/hvigorw" ]]; then
  HVIGOR_BIN="$APP/Contents/tools/hvigor/hvigor/bin"
fi
export PATH="$NODE_BIN:$HVIGOR_BIN:$OHPM_BIN:$PATH"
export DEVECO_SDK_HOME="$SDK_DIR"
printf 'hwsdk.dir=%s\n' "$SDK_DIR" > "$ROOT/local.properties"

cd "$ROOT"
if command -v ohpm >/dev/null 2>&1; then
  ohpm install
fi

BACKUP=""
cleanup() {
  if [[ -n "$BACKUP" && -f "$BACKUP" ]]; then
    mv "$BACKUP" "$ROOT/build-profile.json5"
  fi
}
trap cleanup EXIT

if [[ "$MODE" == "release" ]]; then
  if [[ ! -f "$ROOT/signing.local.json" ]]; then
    echo "Release signing is not configured. Copy signing.local.example.json to signing.local.json and fill in the AppGallery Connect release certificate (.p12), profile (.p7b), and cert (.cer). Those files stay outside git." >&2
    exit 1
  fi
  BACKUP="$ROOT/build-profile.json5.bak"
  cp "$ROOT/build-profile.json5" "$BACKUP"
  node "$ROOT/tools/apply-signing.js"
  hvigorw assembleApp --mode project -p product=default -p buildMode=release --no-daemon
  echo "Release .app is under $ROOT/build/outputs/"
else
  hvigorw assembleHap --mode module -p module=entry@default -p product=default -p buildMode=debug --no-daemon
  echo "Debug HAP is under $ROOT/entry/build/"
fi
