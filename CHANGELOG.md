# Changelog

All notable changes to the **G&F Elektro Portal** desktop application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-04-09

### Added

- **Initial Release** of the G&F Elektro Portal desktop application
- Full-screen webview loading [portal.gfelektro.com](https://portal.gfelektro.com)
- No browser chrome — no menu bar, status bar, or toolbars
- **System tray integration** — app minimizes to Windows system tray on minimize/close
- Tray context menu with options: *Portal öffnen*, *Neu laden*, *Beenden*
- Click/double-click tray icon to show/hide window
- **Native notification support** — web push notifications bridge to Windows notification center
- Automatic notification permission grants for the portal
- **Single instance lock** — prevents multiple instances from running simultaneously
- **External link handling** — non-portal links open in the default browser
- Dark background (`#1a1a2e`) shown during initial load to prevent white flash
- App icon derived from the G&F Elektro brand assets (512x512 → ICO)
- Windows installer via Squirrel (Electron Forge)
- Preload script exposing `electronAPI` with platform detection
- GitHub documentation: README, CHANGELOG, SECURITY, CONTRIBUTING

### Technical Details

- Built with Electron 35
- Electron Forge for packaging and distribution
- ASAR packaging enabled for production builds
- Minimum window size: 800×600
- Default window size: 1280×800

---

[1.0.0]: https://github.com/your-org/gf-elektro-portal/releases/tag/v1.0.0
