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

## Cursor Cloud specific instructions

### Running the Electron app in a headless Cloud VM

The VM has a VNC display server on `:1` (TigerVNC). To run the app visually:

```bash
DISPLAY=:1 npx electron . --disable-gpu --no-sandbox
```

GPU errors in the logs (WebGL fallback, `viz_main_impl`, `gles2_cmd_decoder`) are expected and harmless — the app still functions correctly with software rendering.

### Verification without a test runner

There is no linter, no test framework, and no typecheck. The minimal verification steps are:

1. `node --check src/main.js && node --check src/preload.js` — syntax validation.
2. `DISPLAY=:1 npx electron . --disable-gpu --no-sandbox` — confirm the app launches and loads the portal URL.
3. `npx electron-builder build --linux --dir` — confirm packaging works (fast, no installer).

### Notes

- The portal URL (`https://portal.gfelektro.com`) must be reachable from the VM for the app to display content.
- `--no-sandbox` is required in the Cloud VM because the container runs as a non-root user without kernel namespace support.
- The build output lands in `release/linux-unpacked/` (for `--dir` mode) or `release/` (for full build).
