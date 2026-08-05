<!-- markdownlint-disable MD033 MD041 -->
<p align="center">
  <img src="icon-512.png" alt="G&F Portal EU" width="80" />
</p>

<h1 align="center">G&F Portal EU</h1>

<p align="center">
  <strong>Desktop application for the G&F Elektro project management portal</strong>
</p>

<p align="center">
  <a href="https://github.com/GF-Elektro/Portal-App/releases"><img src="https://img.shields.io/github/v/release/GF-Elektro/Portal-App?style=for-the-badge&logo=github&logoColor=white" alt="Latest release" /></a>
  <a href="https://docs.gfelektro.com"><img src="https://img.shields.io/badge/download-docs.gfelektro.com-d32f2f?style=for-the-badge" alt="Download site" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-yellow?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-0078d4?style=flat-square&logo=windows&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/Electron-43-47848f?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/source-open%20on%20GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="Open source" />
  <img src="https://img.shields.io/badge/maintained-yes-brightgreen?style=flat-square" alt="Maintained" />
</p>

<p align="center">
  <a href="https://github.com/GF-Elektro/Portal-App/actions/workflows/virustotal.yml"><img src="https://img.shields.io/github/actions/workflow/status/GF-Elektro/Portal-App/virustotal.yml?style=flat-square&label=VirusTotal%20scan&logo=virustotal&logoColor=white" alt="VirusTotal workflow" /></a>
  <img src="https://img.shields.io/badge/release%20binaries-VirusTotal%20scanned-success?style=flat-square&logo=virustotal&logoColor=white" alt="VirusTotal scanned" />
  <img src="https://img.shields.io/badge/VT%20API%20quota-4%2Fmin%20%7C%20500%2Fday-informational?style=flat-square" alt="VT API quota" />
  <img src="https://img.shields.io/badge/SHA256-in%20release%20notes-blue?style=flat-square" alt="SHA256 hashes" />
  <img src="https://img.shields.io/badge/dependabot-enabled-025E8C?style=flat-square&logo=dependabot&logoColor=white" alt="Dependabot" />
  <a href="SECURITY.md"><img src="https://img.shields.io/badge/security-policy-blue?style=flat-square&logo=github&logoColor=white" alt="Security policy" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/context--isolation-enabled-brightgreen?style=flat-square" alt="Context isolation" />
  <img src="https://img.shields.io/badge/sandbox-enabled-brightgreen?style=flat-square" alt="Sandbox" />
  <img src="https://img.shields.io/badge/nodeIntegration-disabled-brightgreen?style=flat-square" alt="nodeIntegration disabled" />
  <img src="https://img.shields.io/badge/portal-HTTPS%20only-brightgreen?style=flat-square&logo=letsencrypt&logoColor=white" alt="HTTPS only" />
  <img src="https://img.shields.io/badge/navigation-allowlist%20only-brightgreen?style=flat-square" alt="Navigation allowlist" />
  <img src="https://img.shields.io/badge/external%20links-system%20browser-brightgreen?style=flat-square" alt="External links in browser" />
</p>

<p align="center">
  <a href="https://github.com/GF-Elektro/Portal-App/actions/workflows/release.yml"><img src="https://img.shields.io/github/actions/workflow/status/GF-Elektro/Portal-App/release.yml?style=flat-square&label=release%20build&logo=githubactions&logoColor=white" alt="Release CI" /></a>
  <a href="https://github.com/GF-Elektro/Portal-App/actions/workflows/pages.yml"><img src="https://img.shields.io/github/actions/workflow/status/GF-Elektro/Portal-App/pages.yml?branch=main&style=flat-square&label=docs%20site&logo=githubpages&logoColor=white" alt="Docs site CI" /></a>
  <img src="https://img.shields.io/badge/Homebrew-gfe--portal--eu-FBB040?style=flat-square&logo=homebrew&logoColor=white" alt="Homebrew cask" />
  <img src="https://img.shields.io/badge/org-GF--Elektro-24292f?style=flat-square&logo=github&logoColor=white" alt="GF-Elektro org" />
  <img src="https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</p>

---

## About

**G&F Portal EU** is a lightweight desktop wrapper for [portal.gfelektro.com](https://portal.gfelektro.com) — the internal project management platform used by G&F Elektro s.r.o. to coordinate electrical installation teams across Germany.

The app provides a native desktop experience with:

- Full-screen web view — No browser chrome, toolbars, or address bars
- Native notifications — Portal page notifications appear as native desktop notifications
- System tray integration — Minimize to tray, always accessible with one click
- Single instance — Only one instance of the app can run at a time
- External link handling — External links open in your default browser
- macOS Homebrew updates — Tray *Check for Update* runs `brew upgrade --cask gfe-portal-eu`
- Camera, microphone, and optional geolocation — OS prompts when the portal needs expense photos, voice dictation, or AddFast report GPS

---

## Security & trust

This repository is **public and auditable** ([Apache 2.0](LICENSE)). Installers are built in GitHub Actions from tagged releases — not hand-uploaded binaries. The shell loads **`https://portal.gfelektro.com`** only.

### Top facts

| # | What we do |
| - | ---------- |
| 1 | **VirusTotal on every release** — Setup.exe, `.dmg`, `.AppImage`, `.deb` scanned (~70 engines); report links + **SHA256** in [GitHub Releases](https://github.com/GF-Elektro/Portal-App/releases) |
| 2 | **Quota-safe VT API use** — Free tier **4 req/min**, **500/day**; **4 installers** per release (~**8 API calls**, files >32 MB) |
| 3 | **Electron hardening** — Context isolation, sandbox, `nodeIntegration: false`, minimal `contextBridge` preload ([SECURITY.md](SECURITY.md)) |
| 4 | **HTTPS-only + navigation allowlist** — Auth popups limited to Google/Firebase; other URLs open in the **system browser** |
| 5 | **Least-privilege permissions** — Notifications, camera, microphone, and optional geolocation for portal features (expenses, dictation, AddFast GPS); see [SECURITY.md](SECURITY.md) |
| 6 | **Single-instance lock** — One tray process only |
| 7 | **Dependabot** — Weekly npm + GitHub Actions update PRs |
| 8 | **Reproducible CI builds** — [Release workflow](.github/workflows/release.yml) on every `v*` tag (Windows, macOS, Linux) |
| 9 | **Homebrew checksums** — [`gfe-portal-eu`](https://github.com/GF-Elektro/homebrew-tap) cask pins version + SHA256 each release |
| 10 | **Responsible disclosure** — **security@gfelektro.com** ([SECURITY.md](SECURITY.md)) |

### Verify a download

1. Download from [Releases](https://github.com/GF-Elektro/Portal-App/releases) or [docs.gfelektro.com](https://docs.gfelektro.com).
2. Compare **SHA256** with the hash in the release notes.
3. Open the **VirusTotal report link** in the same release and review all engines.

> **Note:** Builds are **unsigned** today (no Apple Developer ID / Windows Authenticode). Some AV engines flag new Electron apps heuristically — read the **full** VirusTotal report, not a single engine. VirusTotal free API is for release transparency; see [SECURITY.md](SECURITY.md) for quota and usage notes.

---

## Installation

### macOS (Homebrew — recommended)

```bash
brew tap GF-Elektro/tap
brew install --cask gfe-portal-eu
```

Upgrade later:

```bash
brew upgrade --cask gfe-portal-eu
```

Or use the tray menu item **Nach Updates suchen** / **Check for Update**.

The cask installs `/Applications/G&F Portal EU.app` and clears Gatekeeper quarantine (`xattr` / `chmod`) in a postflight step (unsigned builds without an Apple Developer ID).

If you previously installed **G&F Elektro Portal**, delete the old app from Applications after installing the new name.

If Homebrew asks you to trust a third-party cask:

```bash
brew trust --cask GF-Elektro/tap/gfe-portal-eu
```

### Pre-built Installers

Download the latest release from the [Releases](https://github.com/GF-Elektro/Portal-App/releases) page:

| Platform | File                               | Notes                        |
| -------- | ---------------------------------- | ---------------------------- |
| Windows  | `GFElektroPortal-x.x.x-Setup.exe` | NSIS Desktop Installer       |
| Windows  | `GFElektroPortal-x.x.x.exe`       | Portable Windows App         |
| macOS    | `GFElektroPortal-x.x.x.dmg`       | Installs as **G&F Portal EU** |
| Linux    | `GFElektroPortal-x.x.x.AppImage`  | Portable Linux executable    |
| Linux    | `GFElektroPortal-x.x.x.deb`       | Debian/Ubuntu package        |

Each release is scanned with [VirusTotal](https://www.virustotal.com). Report links and SHA256 hashes are in the GitHub Release notes (**Setup.exe**, `.dmg`, `.AppImage`, `.deb`). Portable `.exe` matches Setup — use the Setup scan or SHA256 from the release.

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

# Build for the current platform
npm run build

# Windows installers on this machine
npm run build:win

# macOS DMG on a Mac
npm run build:mac
```

The built binaries will be generated in the `release/` directory.

---

## Usage

### Starting the App

Launch **G&F Portal EU** from Applications (macOS), Start Menu (Windows), or your desktop environment (Linux). The portal loads automatically.

### System Tray

When you **minimize** or **close** the window, the app minimizes to the system tray instead of quitting. Right-click the tray icon for:

1. *Version* — current app version
2. *Portal öffnen* — show the portal window
3. *Neu laden* — reload the portal
4. *Nach Updates suchen* (macOS) — `brew upgrade --cask gfe-portal-eu`
5. *Tray-Symbol* — tray icon preset
6. *Benachrichtigung testen* — test OS notification
7. *Sprache* / *Fenstergröße* — language and window size
8. *Beenden* — quit

### Notifications

The app automatically bridges web notifications from the portal to your operating system's notification center. Make sure notifications are enabled in your system settings.

---

## Maintainers

- **Branch protection** — `main` should block force-push and deletion ([setup guide](.github/BRANCH_PROTECTION.md) · `scripts/apply-branch-protection.sh`; requires **repo admin**)
- **`VT_API_KEY`** — VirusTotal free API key ([my-apikey](https://www.virustotal.com/gui/my-apikey)); respect **4/min** and **500/day** limits (see [SECURITY.md](SECURITY.md))
- **`HOMEBREW_TAP_TOKEN`** — fine-grained PAT (Contents: Read and write on `GF-Elektro/homebrew-tap`) for the *Bump Homebrew Cask* workflow
- Re-scan a past release: **Actions → VirusTotal scan → Run workflow** (tag e.g. `v1.0.12`)
- Staff install: `brew tap GF-Elektro/tap` then `brew install --cask gfe-portal-eu`

## Development


### Project Structure

```text
gf-elektro-portal/
├── build/
│   ├── icon.ico                  # Windows icon
│   ├── dmg-background.png        # DMG installer background
│   ├── mac-tray-*Template.png    # macOS menu bar icons
│   ├── tray-*.png                # Windows tray icons
│   └── flags/                    # Tray language flags
├── icon-192.png
├── icon-512.png                  # macOS / Linux app icon
├── icon.png
├── scripts/
│   └── create-ico.js             # PNG to ICO converter
├── src/
│   ├── main.js                   # Electron main process
│   ├── preload.js
│   └── toast-preload.js
├── package.json
├── CHANGELOG.md
└── README.md
```

### Key Technologies

- **[Electron](https://www.electronjs.org/)** — Cross-platform desktop apps with web technologies
- **[electron-builder](https://www.electron.build/)** — Build tooling and distribution
- **[NSIS](https://nsis.sourceforge.io/)** — Windows installer target via electron-builder

### Scripts

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `npm start`          | Run the app in development mode            |
| `npm run build`      | Build executables for the current platform |
| `npm run build:win`  | Build Windows NSIS and portable packages   |
| `npm run build:mac`  | Build the macOS DMG on a Mac               |
| `npm run build:linux` | Build Linux AppImage and deb packages     |
| `npm run create-ico` | Regenerate the Windows icon from PNG       |

---

## Configuration

The portal URL and other constants are defined in `src/main.js`:

```javascript
const PORTAL_URL = 'https://portal.gfelektro.com';
const APP_NAME = 'G&F Portal EU';
```

---

## License

This project is licensed under the [Apache License 2.0](LICENSE). See the [LICENSE](LICENSE) file for details.

---

<!-- markdownlint-enable MD033 -->
<p align="center">
  <sub>Built with care by <a href="https://www.gfelektro.com">G&F Elektro s.r.o.</a></sub>
</p>
