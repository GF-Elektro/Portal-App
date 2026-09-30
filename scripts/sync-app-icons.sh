#!/usr/bin/env bash
# Regenerate iOS/Android app icons from icon-512.png (PortalEU + Flutter).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node scripts/sync-app-icons.js
