<p align="center">
  <img src="build/icon.ico" alt="G&F Elektro Portal" width="80" />
</p>

<h1 align="center">G&F Elektro Portal</h1>

<p align="center">
  <strong>Desktop application for the G&F Elektro project management portal</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/electron-35-47848f?style=flat-square&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/version-1.0.0-green?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square" alt="License" />
</p>

---

## About

**G&F Elektro Portal** is a lightweight desktop wrapper for [portal.gfelektro.com](https://portal.gfelektro.com) — the internal project management platform used by G&F Elektro s.r.o. to coordinate electrical installation teams across Germany.

The app provides a native desktop experience with:

- 🖥️ **Full-screen web view** — No browser chrome, toolbars, or address bars
- 🔔 **Native notifications** — Web push notifications appear as native Windows/macOS notifications
- 📌 **System tray integration** — Minimize to tray, always accessible with one click
- 🔒 **Single instance** — Only one instance of the app can run at a time
- 🌐 **External link handling** — External links open in your default browser

---

## Installation

### Pre-built Installers

Download the latest release from the [Releases](https://github.com/GF-Elektro/Portal-App/releases) page:

| Platform | File | Notes |
|----------|------|-------|
| Windows  | `GFElektroPortal-x.x.x-Setup.exe` | Squirrel installer with auto-updates |
| macOS    | `GFElektroPortal-x.x.x.dmg` | Drag & drop to Applications |

### Building from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Git](https://git-scm.com/)
- Windows: No additional requirements
- macOS: Xcode Command Line Tools

#### Steps

```bash
# Clone the repository
git clone https://github.com/GF-Elektro/Portal-App.git
cd Portal-App

# Install dependencies
npm install

# Run in development mode
npm start

# Build the installer (Windows)
npm run make

# Build the macOS DMG installer
npm run make-dmg
```

The built installer will be in the `out/make/` directory.

---

## Usage

### Starting the App

Launch the app from the Start Menu (Windows) or Applications folder (macOS). The portal will load automatically.

### System Tray

When you **minimize** or **close** the window, the app minimizes to the system tray instead of quitting. You can:

- **Click** the tray icon to show/hide the window
- **Right-click** the tray icon for options:
  - *Portal öffnen* — Show the portal window
  - *Neu laden* — Reload the portal
  - *Beenden* — Quit the application completely

### Notifications

The app automatically bridges web notifications from the portal to your operating system's notification center. Make sure notifications are enabled in your system settings.

---

## Development

### Project Structure

```
gf-elektro-portal/
├── build/
│   ├── icon.ico                  # Windows icon
│   ├── icon.icns                 # macOS app icon
│   ├── icon.png                  # Base icon (PNG)
│   ├── mac-tray-iconTemplate.png # macOS menu bar icon
│   └── dmg-background.png        # DMG installer background
├── icon-192.png                  # PWA icon (192x192)
├── icon-512.png                  # PWA icon (512x512)
├── icon.png                      # Base icon
├── logo.png                      # Logo image
├── scripts/
│   ├── create-ico.js             # PNG to ICO converter
│   ├── create-mac-icon.js        # macOS menu bar icon generator
│   ├── create-dmg-bg.js          # DMG background generator
│   └── build-dmg.js              # Custom DMG builder (uses create-dmg)
├── src/
│   ├── main.js                   # Electron main process
│   └── preload.js                # Preload script for renderer
├── package.json
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

### Key Technologies

- **[Electron](https://www.electronjs.org/)** — Cross-platform desktop apps with web technologies
- **[Electron Forge](https://www.electronforge.io/)** — Build tooling and distribution
- **[Squirrel.Windows](https://github.com/Squirrel/Squirrel.Windows)** — Windows installer framework

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the app in development mode |
| `npm run package` | Package the app (no installer) |
| `npm run make` | Build Windows distributable installer |
| `npm run make-dmg` | Build macOS DMG installer |
| `npm run create-ico` | Regenerate the Windows icon from PNG |

---

## Configuration

The portal URL and other constants are defined in `src/main.js`:

```javascript
const PORTAL_URL = 'https://portal.gfelektro.com';
const APP_NAME = 'G&F Elektro Portal';
```

---

## License

This project is licensed under the [Apache License 2.0](LICENSE). See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://www.gfelektro.com">G&F Elektro s.r.o.</a></sub>
</p>
