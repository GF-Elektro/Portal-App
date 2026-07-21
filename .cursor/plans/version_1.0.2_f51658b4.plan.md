---
name: Version 1.0.2
overview: Prepare a focused `1.0.2` patch release for Portal-App that fixes the review findings from the incoming `1.0.1` work and documents the changes in `CHANGELOG.md`.
todos:
  - id: harden-runtime
    content: Harden URL allowlist, IPC registration, sender validation, and macOS toast handling in src/main.js.
    status: completed
  - id: fix-preload-notifications
    content: Clarify and fix notification bridge behavior in src/preload.js without duplicate notifications or unsupported service-worker claims.
    status: completed
  - id: cleanup-build
    content: Align package scripts, lockfile, and release workflow with electron-builder for version 1.0.2.
    status: completed
  - id: update-docs-changelog
    content: Document 1.0.2 in CHANGELOG.md and fix stale README, CONTRIBUTING, and docs copy.
    status: completed
  - id: validate-release
    content: Run static validation and report remaining manual test requirements.
    status: completed
isProject: false
---

# Portal-App 1.0.2 Improvement Plan

## Goal

Ship a safer `1.0.2` patch release for `[Portal-App](T:/Projekte/GF%20Elektro/Portal%20App)` that keeps the `1.0.1` packaging/release improvements but fixes the review findings around notification handling, URL trust boundaries, stale scripts, and documentation.

## Runtime Fixes

- Harden URL trust checks in `[src/main.js](T:/Projekte/GF%20Elektro/Portal%20App/src/main.js)`:
  - Replace broad `hostname.includes(...)` / `pathname.includes(...)` matching with exact origins or explicit suffix rules.
  - Keep required Google/Firebase auth domains working.
  - Ensure unrelated external URLs always open through `shell.openExternal()`.

- Move global Electron event/IPC registration out of `createWindow()` where possible:
  - Prevent duplicate `ipcMain.on()` listeners and duplicate `ipcMain.handle()` registration if the window is recreated.
  - Keep per-window handlers attached only to the current `mainWindow`.

- Validate notification IPC sender origin:
  - Accept notification requests only from the trusted portal origin.
  - Reject or ignore IPC from auth popups, custom toast windows, or unexpected frames.

- Replace or isolate the macOS custom toast path:
  - Avoid `nodeIntegration: true` and `contextIsolation: false` for the toast window.
  - Prefer a small preload-based bridge or no renderer IPC in the toast window.
  - Escape notification content robustly before rendering.

## Preload / Notification Fixes

- Rework `[src/preload.js](T:/Projekte/GF%20Elektro/Portal%20App/src/preload.js)` so notification behavior is explicit and testable:
  - Keep `window.Notification` bridging for page-created notifications.
  - Do not claim full Service Worker push interception unless it is verified to work in the service worker execution context.
  - Avoid duplicate notification display when calling `ServiceWorkerRegistration.prototype.showNotification()`.
  - Preserve notification click forwarding to the portal where supported.

## Build And Release Cleanup

- Align `[package.json](T:/Projekte/GF%20Elektro/Portal%20App/package.json)` scripts with the actual `electron-builder` toolchain:
  - Remove or fix `npm run make-dmg` if Electron Forge / `create-dmg` are no longer dependencies.
  - Keep `npm run build` as the primary release build path.
  - Update version to `1.0.2`.

- Check `[package-lock.json](T:/Projekte/GF%20Elektro/Portal%20App/package-lock.json)` after dependency/script changes.

- Keep `[.github/workflows/release.yml](T:/Projekte/GF%20Elektro/Portal%20App/.github/workflows/release.yml)` aligned with `electron-builder` and tag-based publishing.

## Documentation And Changelog

- Update `[CHANGELOG.md](T:/Projekte/GF%20Elektro/Portal%20App/CHANGELOG.md)` with a new `1.0.2` entry documenting:
  - Hardened auth/external URL routing.
  - Safer notification IPC and macOS toast handling.
  - Clarified notification bridge behavior.
  - Build script cleanup.
  - Documentation corrections.

- Update `[README.md](T:/Projekte/GF%20Elektro/Portal%20App/README.md)` and `[CONTRIBUTING.md](T:/Projekte/GF%20Elektro/Portal%20App/CONTRIBUTING.md)` to remove stale Forge/Squirrel/`npm run make` references.

- Fix user-facing download page copy in `[docs/script.js](T:/Projekte/GF%20Elektro/Portal%20App/docs/script.js)`.

## Validation

- Run lightweight static checks after implementation:
  - `git diff --check`
  - package metadata inspection
  - dependency lock consistency check

- If approved to create build artifacts, run the platform-appropriate build command separately:
  - `npm run build`

- Manually smoke-test the app behavior:
  - Google/Firebase sign-in popup.
  - External links.
  - Tray minimize/show/quit.
  - Page-created notifications and notification click behavior.
  - macOS toast behavior if tested on macOS.