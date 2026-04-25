---
name: "Portal-App Agent Instructions"
description: "Instructions for AI agents working on the GF-Elektro Electron desktop wrapper."
---

# Portal-App Agent Instructions

Thin Electron desktop wrapper that loads `https://portal.gfelektro.com` in a `BrowserWindow`. No frontend code. Two source files: `src/main.js` (main process) and `src/preload.js` (preload/bridge).

## Essential Commands
```bash
npm start          # Run in dev mode (electron .)
npm run build      # Build installers → release/ (electron-builder)
npm run make-dmg   # Build macOS DMG → out/make/ (electron-forge + create-dmg)
```

## Key Constraints

- **JavaScript only** (no TypeScript, no transpiler, no bundler for app code).
- **No test runner** — `test-*.js` files are scratch scripts, not a suite.
- **Tray-first lifecycle** — window close hides, does not quit. Use `showWindowFromTray()` / `hideWindowToTray()`.
- **`isCreatingToast` flag** — must not be removed; guards toast BrowserWindow from auth popup handler.
- **`AUTH_ALLOWED_DOMAINS`** — add any new Firebase/Google auth domains here or auth flows break.
- **Two build toolchains** — `electron-builder` (primary/CI) vs `electron-forge + create-dmg` (macOS DMG). Do not mix config.

For detailed coding rules, see `.agent/rules/`.
For authorized scripts, see `.agent/workflows/allow_scripts.md`.
