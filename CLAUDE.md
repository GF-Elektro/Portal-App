# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Thin Electron desktop wrapper around the hosted web app at `https://portal.gfelektro.com`. There is no frontend code in this repo — the renderer loads the live portal URL. All native code lives in two files: `src/main.js` (main process) and `src/preload.js` (renderer bridge).

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Run the app in dev mode (`electron .`) |
| `npm run build` | Build installers for the current platform via `electron-builder` → `release/` |
| `npm run make-dmg` | macOS-only: package with `electron-forge` then build a DMG via `create-dmg` → `out/make/` |
| `npm run create-ico` | Regenerate `build/icon.ico` from PNG |

There is no test runner, no linter, and no typecheck. The `test-*.js` files at the repo root are ad-hoc dev scratch scripts, not a test suite. CONTRIBUTING.md references `npm run make` — that script does not exist; use `npm run build` (electron-builder) or `npm run make-dmg` (forge+create-dmg) instead.

`PORTAL_URL` and `APP_NAME` are hardcoded constants at the top of `src/main.js`.

## Architecture

### Two build toolchains coexist
The primary build path is **electron-builder** (driven by the `build` block in `package.json`, used by CI and by `npm run build`). `npm run make-dmg` takes a different path: it shells out to `electron-forge package` first, then runs `create-dmg` against the resulting `.app`. If you change packaging behavior, decide which toolchain you're modifying — they don't share config.

### Notification bridge (the non-obvious piece)
The portal is a PWA that fires web push notifications via the Service Worker. Electron's renderer can't surface those as native OS notifications on its own, so this app intercepts them in two layers:

1. `src/preload.js` injects code into the main world via `webFrame.executeJavaScript` that **monkey-patches `window.Notification` and `ServiceWorkerRegistration.prototype.showNotification`**. Both are routed through `window.electronNotificationAPI.show()` (exposed via `contextBridge`), which sends an IPC message to the main process.
2. `src/main.js` listens on `notification:show` and creates a native `Notification`. Click events flow back via `notification:clicked` IPC → preload dispatches a `electron-notification-clicked` `CustomEvent` on `window` → the patched `Notification` instance fires its `onclick`.

**macOS-specific fallback:** unsigned macOS builds can't reliably trigger the native Notification UI, so the main process draws a custom transparent, frameless `BrowserWindow` as a toast in the top-right of the primary display. The HTML for the toast is built inline in `main.js`. The `isCreatingToast` flag exists to prevent the `browser-window-created` handler (which exists for auth popups) from treating the toast as a child window. Don't remove it.

### Auth popup handling
Google Sign-In / Firebase Auth requires popups to render inside Electron rather than the system browser. `setWindowOpenHandler` checks the URL against `AUTH_ALLOWED_DOMAINS` (defined inline in `createWindow`). Matches open as a child `BrowserWindow`; everything else is opened via `shell.openExternal` and denied.

The `app.on('browser-window-created')` handler watches each child popup for navigation back to `PORTAL_URL` (via both `will-navigate` and `did-navigate`) — when that happens, the popup is closed and the main window is reloaded, which is how a successful auth flow propagates back. The `closed` handler also reloads the main window in case the user dismissed the popup mid-flow. If you add new auth-related domains (Google, Firebase, etc.), add them to `AUTH_ALLOWED_DOMAINS` — otherwise the popup gets shunted to the OS browser and the round-trip breaks.

### Tray-first lifecycle
Closing or minimizing the window does **not** quit the app — it hides the window (and on macOS, hides the dock icon via `app.dock.hide()`). The only paths to actually quit are the tray's "Beenden" menu item and `app.on('before-quit')`, both of which set `isQuitting = true`. The `window-all-closed` handler is gated on `isQuitting`, so don't assume standard Electron quit behavior.

`showWindowFromTray()` / `hideWindowToTray()` are the canonical ways to toggle visibility because they also handle the macOS dock show/hide. On macOS the tray is left-click-toggle; the context menu is bound to `right-click` only (intentional — `tray.setContextMenu()` is **not** called, because doing so makes macOS hijack the left-click).

### Single-instance lock
`app.requestSingleInstanceLock()` runs at module load. A second launch focuses the existing window instead of starting a new process. If you need to debug startup behavior, this is why launching the app twice doesn't give you two windows.

### Permissions
`web-contents-created` installs a permission handler that auto-grants `notifications`, `media`, `clipboard-read`, and `clipboard-sanitized-write`. The check handler returns `true` for everything (this is intentional — the portal is trusted).

## Releases

Pushing a `v*` tag triggers `.github/workflows/release.yml`, which runs `npx electron-builder build --publish always` on a win/mac/linux matrix (`fail-fast: false`). `releaseType: release` in `package.json` means binaries publish directly to a GitHub Release, not a draft. Bump `version` in `package.json`, update `CHANGELOG.md`, then tag and push — no manual upload step.
