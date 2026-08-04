# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Thin Electron desktop wrapper around the hosted web app at `https://portal.gfelektro.com`. There is no frontend code in this repo — the renderer loads the live portal URL. All native code lives in two files: `src/main.js` (main process) and `src/preload.js` (renderer bridge).

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Run the app in dev mode (`electron .`) |
| `npm run build` | Build installers for the current platform via `electron-builder` → `release/` |
| `npm run build:win` | Build Windows NSIS and portable packages |
| `npm run build:mac` | Build the macOS DMG on a Mac |
| `npm run build:linux` | Build Linux AppImage and deb packages |
| `npm run create-ico` | Regenerate `build/icon.ico` from PNG |

There is no test runner, no linter, and no typecheck. Use `node --check` for syntax validation and `npm run build` or the platform-specific build scripts for packaging verification.

`PORTAL_URL` and `APP_NAME` are hardcoded constants at the top of `src/main.js`.

## Architecture

### Build toolchain
The build path is **electron-builder** (driven by the `build` block in `package.json`, used by CI and by `npm run build`). Use `npm run build:win` on Windows and `npm run build:mac` on a Mac when you need platform-specific artifacts.

### Notification bridge (the non-obvious piece)
The portal can create browser notifications from page code. Electron's renderer can't surface those as native OS notifications on its own, so this app intercepts supported page notification paths in two layers:

1. `src/preload.js` injects code into the main world via `webFrame.executeJavaScript` that **monkey-patches `window.Notification` and page calls to `ServiceWorkerRegistration.prototype.showNotification`**. Both are routed through `window.electronNotificationAPI.show()` (exposed via `contextBridge`), which sends an IPC message to the main process. True push event handlers run inside the service worker context and are not patched by preload code.
2. `src/main.js` listens on `notification:show` and creates a native `Notification`. Click events flow back via `notification:clicked` IPC → preload dispatches a `electron-notification-clicked` `CustomEvent` on `window` → the patched `Notification` instance fires its `onclick`.

**macOS-specific fallback:** unsigned macOS builds can't reliably trigger the native Notification UI, so the main process draws a custom transparent, frameless `BrowserWindow` as a toast in the top-right of the primary display. The toast uses `src/toast-preload.js` as an isolated click bridge with Node integration disabled. The `isCreatingToast` flag exists to prevent the `browser-window-created` handler (which exists for auth popups) from treating the toast as a child window. Don't remove it.

### Auth popup handling
Google Sign-In / Firebase Auth requires popups to render inside Electron rather than the system browser. `setWindowOpenHandler` checks the URL against exact host and suffix allowlists in `src/main.js` (including `about:blank` for initial window creation). Matches open as a child `BrowserWindow` (non-modal); everything else is opened via `shell.openExternal` and denied.

Genuine auth popups (detected via `isGenuineAuthURL` on `did-create-window`) get `attachAuthPopupHandlers` (menu cleared). **Do not close the popup from navigate handlers or reload the main window** — force-closing a child window during Google/Firebase navigation can take down the shell, and a main-window reload wipes in-memory MFA challenge state. Firebase delivers the auth result to the opener and closes the popup itself. The `browser-window-created` handler only clears menus on child windows (and guards toast windows).

### Tray-first lifecycle
Closing or minimizing the window does **not** quit the app — it hides the window (and on macOS, hides the dock icon via `app.dock.hide()`). The only paths to actually quit are the tray's "Beenden" menu item and `app.on('before-quit')`, both of which set `isQuitting = true`. The `window-all-closed` handler is gated on `isQuitting`, so don't assume standard Electron quit behavior.

`showWindowFromTray()` / `hideWindowToTray()` are the canonical ways to toggle visibility because they also handle the macOS dock show/hide. On macOS the tray is left-click-toggle; the context menu is bound to `right-click` only (intentional — `tray.setContextMenu()` is **not** called, because doing so makes macOS hijack the left-click).

### Window size presets
The main window opens at **1024×598** (Standard) by default. Tray → *Fenstergröße* offers Kompakt, Standard, Groß, and Maximal presets; the last choice is persisted in `userData/window-preferences.json`. Sizes scale down on smaller displays while preserving aspect ratio.

### Single-instance lock
`app.requestSingleInstanceLock()` runs at module load. A second launch focuses the existing window instead of starting a new process. If you need to debug startup behavior, this is why launching the app twice doesn't give you two windows.

### Permissions
`web-contents-created` installs permission handlers that grant only `notifications`, `media`, `clipboard-read`, and `clipboard-sanitized-write`.

## Releases

Pushing a `v*` tag triggers `.github/workflows/release.yml`, which runs `npx electron-builder build --publish always` on a win/mac/linux matrix (`fail-fast: false`). `releaseType: release` in `package.json` means binaries publish directly to a GitHub Release, not a draft. Bump `version` in `package.json`, update `CHANGELOG.md`, then tag and push — no manual upload step.
