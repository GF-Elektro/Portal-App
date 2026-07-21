---
name: Certificate downloads and OS permissions
overview: Fix the certificate PDF popup so it becomes a real file download (no reload on close), and wire up OS-level notification and microphone access — released as version 1.0.3.
todos:
  - id: pdf-download
    content: Intercept PDF/storage/blob URLs in setWindowOpenHandler and add will-download auto-save to Downloads with completion notification
    status: completed
  - id: scope-auth-popups
    content: Attach close/reload handlers only to real auth popups via did-create-window; stop main-window reload for other popups
    status: completed
  - id: os-notifications
    content: Early setAppUserModelId, tray 'Benachrichtigung testen' item, Windows settings deep-link when blocked
    status: completed
  - id: os-microphone
    content: askForMediaAccess on macOS, mic-denied hint on Windows, NSMicrophoneUsageDescription in package.json extendInfo
    status: completed
  - id: release-docs
    content: Bump version to 1.0.3 and add CHANGELOG entry
    status: completed
  - id: validate
    content: Run node --check and smoke-test download, notification, and mic flows
    status: completed
isProject: false
---

# Portal-App 1.0.3 – Downloads and OS Permissions

## Problem summary

1. **Certificate PDF**: `window.open(pdfUrl)` matches the auth allowlist in [src/main.js](t:/Projekte/GF Elektro/Portal App/src/main.js) (`isAuthOrAllowedURL`), so the PDF opens in an auth-styled popup ("G&F Elektro – Anmeldung"), saving is unreliable (no `will-download` handling), and the blanket `closed` handler in `attachAuthPopupHandlers` reloads the main window when the popup is closed.
2. **Notifications**: web permission is granted, but nothing verifies OS-level delivery on Windows (AppUserModelId timing, Windows notification settings).
3. **Microphone**: the `media` permission is auto-granted in Electron, but the OS prompt is never triggered (macOS needs `NSMicrophoneUsageDescription` + `askForMediaAccess`; Windows can silently block desktop apps in privacy settings).

## 1. Certificate → real file download (src/main.js)

- Add a `isFileDownloadURL(url)` helper: `blob:` URLs, paths ending in `.pdf` (ignoring query), and the `firebasestorage.googleapis.com` host.
- In `setWindowOpenHandler`, check this **before** the auth check: call `mainWindow.webContents.downloadURL(url)` and return `{ action: 'deny' }` — no popup at all.
- Add a single `session.defaultSession.on('will-download', ...)` handler:
  - Auto-save to `app.getPath('downloads')` with collision-free filename (append ` (1)`, ` (2)`, …) — "drop a download file" like a browser.
  - On completion show a native notification ("Download abgeschlossen – <filename>"); clicking it calls `shell.showItemInFolder(savePath)`.
  - On failure show an error notification.
  - This is also a safety net: any download started inside the app (e.g. `Content-Disposition: attachment`, PDF-viewer download button) now lands in Downloads.

## 2. Stop reload-on-close for non-auth popups (src/main.js)

- Use `mainWindow.webContents.on('did-create-window', (child, { url }) => ...)` to know each popup's opening URL, and attach the close-on-portal-redirect + reload-main-window handlers **only when the URL is a genuine auth URL** (Google/Firebase hosts or portal `/__/auth/*` paths).
- Non-auth child windows keep `setMenu(null)` but no longer reload the portal on close.
- Keep the `isCreatingToast` guard and the `browser-window-created` handler intact (per repo constraints); only the reload behavior gets scoped.
- Small hardening: `closeOnPortalRedirect` should ignore portal `/__/auth/*` URLs so the popup isn't closed while the auth flow is still in progress.

## 3. OS-level notification access (src/main.js)

- Call `app.setAppUserModelId('com.gfelektro.portal')` at module load (before `ready`) so Windows associates toasts with the NSIS shortcut reliably.
- Add tray menu item "Benachrichtigung testen" that fires a native test notification, so users can immediately verify OS delivery.
- If notifications are unsupported/blocked on Windows, the test path shows a dialog offering to open `ms-settings:notifications` via `shell.openExternal`.

## 4. OS-level microphone access

- [src/main.js](t:/Projekte/GF Elektro/Portal App/src/main.js): make the permission request handler async; when the portal requests `media`:
  - **macOS**: call `systemPreferences.askForMediaAccess('microphone')` first (triggers the OS prompt) and grant based on the result.
  - **Windows**: check `systemPreferences.getMediaAccessStatus('microphone')`; if `denied`, show a one-time dialog with a button that opens `ms-settings:privacy-microphone`.
- [package.json](t:/Projekte/GF Elektro/Portal App/package.json): add `build.mac.extendInfo` with `NSMicrophoneUsageDescription` (German text) so packaged macOS builds may access the mic.

## 5. Release housekeeping

- Bump version to `1.0.3` in [package.json](t:/Projekte/GF Elektro/Portal App/package.json).
- Add a `1.0.3` entry to [CHANGELOG.md](t:/Projekte/GF Elektro/Portal App/CHANGELOG.md) (certificate downloads, no more reload-on-close, OS notification/microphone access).
- Tag push (`v1.0.3`) triggers the existing release workflow — done separately when you're ready.

## Verification

- `node --check src/main.js && node --check src/preload.js`
- `npm start` on Windows: tray test notification, mic access inside the portal, and (with your account) finishing-course certificate → file appears in Downloads, no popup, no reload.
- Optional: `npm run build:win` to confirm packaging.

## Out of scope (possible follow-ups)

Auto-update, signed macOS builds (would enable real macOS notification/mic prompts), and an in-app PDF preview window. Say the word if you want any of these included.