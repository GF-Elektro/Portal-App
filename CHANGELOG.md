# Changelog

All notable changes to the **G&F Elektro Portal** desktop application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-04-17

### Fixed

#### Cross-Platform Native Notifications
- **Fixed Service Worker notification interception** — notifications from the portal's Service Worker (`registration.showNotification()`) now properly display as native OS notifications
- **Fixed notification permission handling** — permission requests now properly bridge to the OS-level notification system
- **Fixed "Send Test Notification" button** — test notifications now display correctly on macOS, Windows, and Linux

### Changed

#### Enhanced Notification System
- **Complete rewrite of notification bridge** (`src/preload.js`):
  - Added Service Worker registration proxy to intercept `showNotification()` calls
  - Implemented `electronNotificationAPI` with `requestPermission()`, `checkPermission()`, and `show()` methods
  - Added WeakMap tracking to prevent double-proxying of Service Worker registrations
  - Maintained backward compatibility with legacy `window.Notification` override
  
- **Enhanced main process notification handling** (`src/main.js`):
  - Added `notification:show` IPC handler with full option support (title, body, icon, silent, actions, tag)
  - Added `notification:request-permission` IPC handler for explicit permission requests
  - Added `notification:check-permission` IPC handler to query current permission state
  - Implemented notification click-to-focus: clicking a notification restores and focuses the app window
  - Added notification cleanup on window close
  - Support for notification tags for grouping/replacement
  - Support for notification actions/buttons (platform-dependent)

### Technical Details

- Notifications now work with the portal's **Service Worker + Polling** architecture
- Notifications display in the OS notification center (macOS Notification Center, Windows Action Center, Linux notification daemon)
- Clicking a notification brings the app to the foreground
- Permission is auto-granted via `setPermissionRequestHandler` for seamless UX
- Future-proof design for Flutter mobile migration using compatible API structure

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
|--------|-------------|
| `npm start` | Run in development mode |
| `npm run make` | Build Windows installer (via Electron Forge) |
| `npm run make-dmg` | Build macOS DMG installer (via create-dmg) |
| `npm run create-ico` | Regenerate Windows icon from PNG |

---

[1.0.1]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.1
[1.0.0]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.0
