#!/usr/bin/env bash
# Compile the Mac App Store icon into Assets.car. App Store Connect uses the
# asset catalog, not icon.icns, for the listing icon.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/ios/PortalEU/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png"
SET="$ROOT/build/macos/AppIcon.xcassets/AppIcon.appiconset"
OUT="$ROOT/build/macos/actool-out"

if [[ ! -f "$SRC" ]]; then
  echo "Missing source icon: $SRC" >&2
  exit 1
fi

mkdir -p "$SET"
cp "$SRC" "$SET/icon_512x512@2x.png"

python3 - "$SET/Contents.json" <<'PY'
import json, sys
sizes = [
    ("16x16", "1x", "icon_16x16.png"),
    ("16x16", "2x", "icon_16x16@2x.png"),
    ("32x32", "1x", "icon_32x32.png"),
    ("32x32", "2x", "icon_32x32@2x.png"),
    ("128x128", "1x", "icon_128x128.png"),
    ("128x128", "2x", "icon_128x128@2x.png"),
    ("256x256", "1x", "icon_256x256.png"),
    ("256x256", "2x", "icon_256x256@2x.png"),
    ("512x512", "1x", "icon_512x512.png"),
    ("512x512", "2x", "icon_512x512@2x.png"),
]
images = [
    {"filename": name, "idiom": "mac", "scale": scale, "size": size}
    for size, scale, name in sizes
]
json.dump(
    {"images": images, "info": {"author": "xcode", "version": 1}},
    open(sys.argv[1], "w"),
    indent=2,
)
print(sys.argv[1])
PY

# Only the 1024 image is copied above; generate the smaller files for actool.
sips -z 16 16 "$SRC" --out "$SET/icon_16x16.png" >/dev/null
sips -z 32 32 "$SRC" --out "$SET/icon_16x16@2x.png" >/dev/null
sips -z 32 32 "$SRC" --out "$SET/icon_32x32.png" >/dev/null
sips -z 64 64 "$SRC" --out "$SET/icon_32x32@2x.png" >/dev/null
sips -z 128 128 "$SRC" --out "$SET/icon_128x128.png" >/dev/null
sips -z 256 256 "$SRC" --out "$SET/icon_128x128@2x.png" >/dev/null
sips -z 256 256 "$SRC" --out "$SET/icon_256x256.png" >/dev/null
sips -z 512 512 "$SRC" --out "$SET/icon_256x256@2x.png" >/dev/null
sips -z 512 512 "$SRC" --out "$SET/icon_512x512.png" >/dev/null

rm -rf "$OUT"
mkdir -p "$OUT"
xcrun actool "$ROOT/build/macos/AppIcon.xcassets" \
  --compile "$OUT" \
  --app-icon AppIcon \
  --platform macosx \
  --target-device mac \
  --minimum-deployment-target 13.0 \
  --include-all-app-icons \
  --output-partial-info-plist "$OUT/partial.plist"

if [[ ! -f "$OUT/Assets.car" ]]; then
  echo "actool did not write Assets.car" >&2
  exit 1
fi

cp "$OUT/Assets.car" "$ROOT/build/macos/Assets.car"
cp "$OUT/AppIcon.icns" "$ROOT/build/macos/AppIcon.icns"
echo "Wrote $ROOT/build/macos/Assets.car and AppIcon.icns"
