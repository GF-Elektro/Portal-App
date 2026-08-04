# Changelog

All notable changes to the **G&F Elektro Portal** desktop application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.7] - 2026-08-04

### Added

#### Window & usability

- **Smarter default window size** — the desktop app now opens at the ideal dashboard size (1024 × 598) instead of a larger generic window, so users no longer need to resize on every launch.
- **Tray menu: Fenstergröße** — right-click the tray icon to switch between Kompakt, Standard, Groß, and Maximal. The app remembers the last choice and adapts to smaller screens automatically (never opens off-screen).
- **Screen-aware sizing** — on laptops or smaller monitors, window presets scale down proportionally while keeping the correct layout ratio.

---

## [1.0.6] - 2026-08-04

### Fixed

#### Auth & MFA

- **Fixed Google login crash (about:blank)** — allowed `about:blank` in URL checks so Firebase can safely initialize the OAuth popup window without being blocked.
- **Fixed MFA loop** — OAuth popups no longer reload `mainWindow` on close or redirect, keeping in-memory MFA challenge state intact. Popup auto-close on portal return is safely deferred (`setImmediate`) to prevent Electron navigation crashes.
- **Restored GPU hardware acceleration** — preserved full GPU acceleration for 3D graphics, live video conferences, and WebGL rendering.

---

## [1.0.4] - 2026-08-04

### Fixed

#### Auth & MFA

- **Google login + Firebase MFA no longer loops to the login screen** — OAuth auth popups no longer reload the main window when the popup closes or returns to the portal. Reloading wiped the web app's in-memory MFA challenge state after the first factor completed; Firebase/React now keep the session and MFA overlay intact (same as Chrome/Firefox). Popup open/close behavior otherwise matches 1.0.3.

---

## [1.0.3] - 2026-07-21

### Fixed

#### Downloads & Popups

- **Certificate PDFs download instead of opening as auth popups** — `window.open` targets that are `blob:` URLs, `.pdf` paths, or Firebase Storage hosts are saved to the Downloads folder via Electron's download pipeline.
- **No more main-window reload after closing a certificate popup** — close/reload handlers are attached only to genuine Google/Firebase auth popups, not every child window.
- **Auth redirect hardening** — portal `/__/auth/*` navigations no longer close the auth popup mid-flow.

#### OS Permissions

- **Windows notification association** — `app.setAppUserModelId` is applied before `ready` so OS toasts map to the installed app shortcut.
- **Tray notification self-test** — right-click tray → *Benachrichtigung testen*; if blocked on Windows, a dialog offers to open notification settings.
- **Microphone OS access** — macOS prompts via `askForMediaAccess('microphone')` with `NSMicrophoneUsageDescription`; Windows shows a one-time privacy-settings hint when mic access is denied.

### Added

- Session-level `will-download` handler that auto-saves files to Downloads with collision-safe names and shows a completion notification (click opens the file location).

---

## [1.0.2] - 2026-06-25

### Fixed

#### Security & Auth Routing

- **Hardened auth URL allowlisting** — replaced broad substring matching with exact host and explicit suffix checks for the portal, Google, Firebase, and related authentication endpoints.
- **Restricted notification IPC senders** — notification requests are now accepted only from the trusted portal renderer, reducing exposure from auth popups or unexpected frames.
- **Prevented duplicate IPC registration** — app-level notification handlers now register once for the application lifetime instead of every time the main window is recreated.

#### Notifications

- **Safer macOS toast fallback** — custom toast windows now run with `nodeIntegration` disabled, `contextIsolation` enabled, and a dedicated preload bridge for click handling.
- **Clarified notification bridge behavior** — page-created notifications are bridged to Electron, while true Service Worker push handlers are documented as outside the preload context.
- **Prevented duplicate page notification display** — page calls to `ServiceWorkerRegistration.showNotification()` no longer trigger both Electron and browser notification paths.

#### Build & Documentation

- **Aligned build scripts with Electron Builder** — removed the obsolete custom Forge/create-dmg path and added explicit platform build commands.
- **Updated release documentation** — refreshed README, contributor guidance, and agent instructions for the `electron-builder` workflow.
- **Fixed Linux download hint copy** on the GitHub Pages download page.

---

## [1.0.1] - 2026-04-17

### Fixed

#### Background Processing & Notification Delivery

- **Fixed application sleep when minimized** — disabled Chromium timer throttling (`backgroundThrottling: false`) to ensure background checks and polling continue seamlessly when the app is minimized to the system tray.
- **Fixed invisible macOS Menu Bar Icon** — the `mac-tray-iconTemplate.png` was previously excluded from the `.asar` build archive. It is now properly bundled, resolving the invisible (but clickable) gap in the top bar.
- **Fixed macOS unsigned native notification dropping** — Apple restricts native Electron Notification API broadcasts for unsigned distributions. Completely bypassed this OS-level restriction by engineering a custom HTML/CSS `BrowserWindow` Toast Notification system that glides natively onto the desktop, completely avoiding macOS permissions handling.
- **Fixed Service Worker Web Push interceptions** — completely reformed `src/preload.js` to override `ServiceWorkerRegistration.prototype.showNotification` globally, accurately routing native Web Push dispatches transparently into Electron.

### Added

- **Tray Version Display** — added the current iteration number (e.g., `Version 1.0.1`) precisely to the top of the system tray context menu for rapid verification.
- **Linux Packages** — officially added `.AppImage` (Ubuntu/Linux) and `.deb` (Debian) target deployments via GitHub Releases.
- **Automated CI/CD** — introduced standard GitHub Action pipelines for automated public deployment to GitHub Pages (landing page) and synchronized tagging deployment for application release assets.

### Changed

#### Build System Migration

- **Electron Builder Migration** — Swapped `electron-forge` setup for `electron-builder` to accommodate the requested target coverage natively (NSIS, Portable, AppImage, deb, dmg).

#### Enhanced Notification System

- **Complete rewrite of notification bridge** (`src/preload.js`):
  - Abstracted to override native prototypes directly, halting complex state-checking and ensuring total compatibility with standard frontend dispatch mechanisms.
  - Implemented `ipcRenderer.on('notification:clicked')` handler dispatched globally as `electron-notification-clicked`, granting correct contextual window-focusing when interacting with background OS banners.

---

## [1.0.0] - 2026-04-09

### Added

- **Initial Release** of the G&F Elektro Portal desktop application
- Full-screen webview loading [portal.gfelektro.com](https://portal.gfelektro.com)
- No browser chrome — no menu bar, status bar, or toolbars
- Dark background (`#1a1a2e`) shown during initial load to prevent white flash

#### Windows

- **System tray integration** — app minimizes to Windows system tray on minimize/close
- Click tray icon to toggle window visibility, double-click to always open
- Right-click tray icon for context menu: *Portal öffnen*, *Neu laden*, *Beenden*
- Windows installer via Squirrel (`GFElektroPortal-1.0.0-Setup.exe`)

#### macOS

- **Menu bar icon** — app stays accessible from the macOS top-right menu bar
- Left-click menu bar icon to toggle window, right-click for context menu
- Custom G&F template icon for macOS menu bar (auto-adapts to dark/light mode)
- Custom macOS dock icon using high-resolution `icon-512.png`
- Dock icon hides when app is minimized to tray, restores when window is shown
- macOS DMG installer with professional layout (`GFElektroPortal-1.0.0.dmg`)
- macOS `.icns` app icon generated from brand assets

#### Notifications

- **Native OS notification support** — web push notifications bridge to OS notification center
- IPC-based notification bridge from web content to Electron's native Notification API
- Notification permission automatically granted for the portal

#### Security & Auth

- **Google OAuth / Firebase Auth** handled inside the app (popup windows)
- Auth domain allowlist for Google Sign-In, Firebase, and related services
- Auth popup windows auto-close on redirect back to portal
- External links open in default system browser

#### Core

- **Single instance lock** — prevents multiple instances from running simultaneously
- Preload script exposing `electronAPI` with platform detection
- `contextIsolation` and `sandbox` enabled for security

### Technical Details

- Built with Electron 35
- Electron Forge for packaging and distribution
- `create-dmg` for professional macOS DMG creation
- ASAR packaging enabled for production builds
- Minimum window size: 800×600
- Default window size: 1280×800

### Build Scripts

| Script | Description |
| -------- | ------------- |
| `npm start` | Run in development mode |
| `npm run make` | Build Windows installer (via Electron Forge) |
| `npm run make-dmg` | Build macOS DMG installer (via create-dmg) |
| `npm run create-ico` | Regenerate Windows icon from PNG |

---

[1.0.7]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.7
[1.0.6]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.6
[1.0.3]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.3
[1.0.2]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.2
[1.0.1]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.1
[1.0.0]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.0
