# Changelog

All notable changes to the **G&F Portal EU** desktop application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

From **1.0.19** onward, each release tag matches one section below (one logical change set per patch). Sections are newest-first.

---

## [Unreleased]

---

## [1.0.65] - 2026-10-21

### Added

- **Microsoft Store listing copy** — Partner Center description (EN/DE/SK), privacy URL, `runFullTrust` justification, and certification notes in [`docs/microsoft-store.md`](docs/microsoft-store.md).

---

## [1.0.64] - 2026-10-21

### Fixed

- **Store AppX manifest** — `v1.0.63` `makeappx` rejected the package because the executable is `G&F Portal EU.exe`. Store builds now set `win.executableName=GFPortalEU` (same idea as the MAS name override) so the AppxManifest is valid XML.

---

## [1.0.63] - 2026-10-21

### Fixed

- **electron-builder Store config** — `build.msix` is not in electron-builder 26.17’s schema and broke every platform build on `v1.0.62`. Store packaging now uses the supported `appx` target (`npm run build:win:store`) with the same Partner Center identity.

### Added

- **Windows Store CI job** — `release.yml` builds an unsigned `.appx` on `windows-latest`, uploads it as a workflow artifact, and attaches it to the GitHub Release. Azure Artifact Signing is not applied to Store packages.

---

## [1.0.62] - 2026-10-21

### Added

- **Microsoft Store MSIX packaging** — `npm run build:win:store` builds an unsigned electron-builder `msix` package with Partner Center identity `GFElektro.GFPortalEU` / `CN=A13AD157-0238-4037-901B-C007A13489C7`. Tile assets live in `build/appx/`. GitHub NSIS/portable targets are unchanged.

---

## [1.0.61] - 2026-10-21

### Added

- **Microsoft Store name reservation** — Partner Center product **G&F Portal EU** (`9MXWQW7F7XPT`, MSIX or PWA app). Package identity is `GFElektro.GFPortalEU` / `CN=A13AD157-0238-4037-901B-C007A13489C7` / publisher display name **G&F Elektro**. Documented in [`docs/microsoft-store.md`](docs/microsoft-store.md).

---

## [1.0.60] - 2026-10-21

### Fixed

- **macOS DMG / Homebrew cask** — removed the default `mac.executableName` override so Developer ID DMGs ship `G&F Portal EU.app` and match the tap’s `app "G&F Portal EU.app"` (fixes failed `brew upgrade --cask gfe-portal-eu`). MAS builds still pass `executableName` only via `npm run build:mac:mas`.

### Changed

- **Windows signing in CI** — `release.yml` builds unsigned Windows installers, signs `release/*.exe` with Azure Artifact Signing when `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` are set, then publishes to GitHub Releases. Falls back to PFX (`WINDOWS_CERTIFICATE_*`) or unsigned when Azure secrets are missing. Documented in [`docs/windows-signing.md`](docs/windows-signing.md).
- **Chocolatey package text** — `gfe-portal-eu` now describes the electrical-installation portal, states that an existing G&amp;F Portal account is required, and includes a copyright line. Chocolatey still has 1.0.48 in moderation and rejects a newer version until that one is approved, so this text is resubmitted as 1.0.48.

---

## [1.0.59] - 2026-10-21

### Added

- **Windows Authenticode identity** — Azure Artifact Signing account `gfelektro-signing` (Basic, East US) in resource group `rg-gfe-signing`. The public identity **G&F Elektro s. r. o.** is completed and valid until 16 January 2029. Certificate profile `portal-eu-public` (Public Trust) is active. The certificate subject is the company name, Stropkov, and the Prešov region. Street and postal code stay off the certificate. A second public identity request is still in progress and is not used for signing. Details are in [`docs/windows-signing.md`](docs/windows-signing.md).

### Changed

- **Signed Windows installers** — `GFElektroPortal-1.0.59-Setup.exe` and the portable `GFElektroPortal-1.0.59.exe` are Authenticode-signed with profile `portal-eu-public`. The certificate subject is **G&F Elektro s. r. o.**, Stropkov, Prešovský, SK, issued by Microsoft ID Verified CS EOC CA 03 and timestamped by Microsoft. [docs.gfelektro.com](https://docs.gfelektro.com) downloads that Setup.exe. The same installers are hosted at [gfe-portal-packages.web.app/windows/](https://gfe-portal-packages.web.app/windows/).
- **Signed 1.0.58 Windows assets** — the unsigned `v1.0.58` Setup.exe and portable exe on the GitHub release were replaced with signed builds of that same version.

---

## [1.0.58] - 2026-10-20

### Added

- **Mac App Store screenshots** — German product-page images for the portal, notifications, menu bar, and receipts, at 2880×1800 in [`store-screenshots/`](store-screenshots/).

---

## [1.0.57] - 2026-10-14

### Fixed

- **Mac App Store icon** — App Store Connect lists the Mac app from the asset catalog, so an `.icns` file alone stayed the empty placeholder. The build now includes `Assets.car` with the same red G&F icon as iOS.

---

## [1.0.56] - 2026-10-14

### Fixed

- **Mac App Store blank window** — Renderer helpers still need the JIT entitlements. Without them the page process dies in `v8::Isolate::Initialize` and the window stays empty. `com.apple.security.cs.allow-dyld-environment-variables` stays off the helpers so sandbox inheritance keeps working.
- **Mac icon** — The Dock no longer swaps in `icon-512.png` (red bolt) after launch. The bundle icon is the same red G&F mark as the iOS app.

---

## [1.0.55] - 2026-10-14

### Fixed

- **Mac App Store launch** — Helper processes were signed with JIT entitlements plus `com.apple.security.inherit`. On this macOS that combination stops sandbox inheritance, so TestFlight quits as soon as the helpers start. Child entitlements are now sandbox inheritance only.

---

## [1.0.54] - 2026-10-12

### Fixed

- **Chocolatey checksum source** — [`.github/workflows/bump-chocolatey.yml`](.github/workflows/bump-chocolatey.yml) hashes `Setup.exe` with Python. GNU `sha256sum` on the Windows runner prefixes `\` when the path contains backslashes. The 1.0.48 installer hash starts with `b`, so the published checksum was `\b…` and verification failed. The 1.0.51 script rewrite correctly refused that value; this release fixes the hash itself.

---

## [1.0.53] - 2026-10-12

### Fixed

- **Mac App Store upload** — [`scripts/mac-mas-transporter.sh`](scripts/mac-mas-transporter.sh) stages the App Store Connect API key where iTMSTransporter looks for it (`private_keys/AuthKey_<id>.p8`). The previous command passed only the key id, so Transporter exited before the signed 1.0.52 package was sent.

---

## [1.0.52] - 2026-10-12

### Added

- **Mac App Store location** — [`build/entitlements.mas.plist`](build/entitlements.mas.plist) includes `com.apple.security.personal-information.location` so the sandboxed desktop app can use the portal’s optional GPS for daily reports. Camera, microphone, and notification usage strings stay on the Mac target.
- **iOS Geolocation prompt** — [`ios/PortalEU/PortalWebView.swift`](ios/PortalEU/PortalWebView.swift) grants the location permission request for portal and sign-in origins, matching camera and microphone. Export compliance is declared with `ITSAppUsesNonExemptEncryption` = false on the Mac build, same as iOS.

---

## [1.0.51] - 2026-10-12

### Fixed

- **Chocolatey verification** — [`.github/workflows/bump-chocolatey.yml`](.github/workflows/bump-chocolatey.yml) writes the installer SHA256 with Python instead of PowerShell `-replace`. The old substitution treated `$checksum64` as a .NET replacement token and published a hash prefixed with `\b`, so Chocolatey verification rejected `gfe-portal-eu` 1.0.48. The workflow now refuses to pack unless the script contains the 64-character hash of the downloaded Setup.exe.

---

## [1.0.50] - 2026-10-01

### Added

- **Docs site logo (transparent)** — [`docs/assets/brand-logo.png`](docs/assets/brand-logo.png) (new URL avoids CDN cache on old `logo.png`); master [`docs/assets/logo-white-bg.png`](docs/assets/logo-white-bg.png). Regenerate: `npm run logo:docs-transparent` ([`Brewfile`](Brewfile)).
- **Docs version label** — [`docs/assets/desktop-version.json`](docs/assets/desktop-version.json) tracks `package.json` via `npm run sync:docs-version`; the download page no longer overwrites it with GitHub *latest* (which lagged at 1.0.49).

### Changed

- **Docs landing page** — [docs.gfelektro.com](https://docs.gfelektro.com) redesign: on-brand link styling (no default blue), download panel, install chips, and refreshed feature section ([`docs/index.html`](docs/index.html), [`docs/styles.css`](docs/styles.css)).
- **Firebase packages landing** — [gfe-portal-packages.web.app](https://gfe-portal-packages.web.app/) shows a branded visit card ([`hosting/`](hosting/)), copied into `hosting-dist/` by [`scripts/stage-hosting.sh`](scripts/stage-hosting.sh) on each Hosting deploy.
- **Electron 43 → 44** — Chromium/Node stack update. Verified with `npm run smoke:electron`.

### Fixed

- **Post-release tag resolution** — [`post-release-distribution.yml`](.github/workflows/post-release-distribution.yml) `gh api --jq` no longer passes jq’s `-r` (failed with “accepts 1 arg(s), received 2”).

---

## [1.0.49] - 2026-10-01

### Added

- **Docs site logo (transparent)** — [`docs/assets/brand-logo.png`](docs/assets/brand-logo.png) (new URL avoids CDN cache on old `logo.png`); master [`docs/assets/logo-white-bg.png`](docs/assets/logo-white-bg.png). Regenerate: `npm run logo:docs-transparent` ([`Brewfile`](Brewfile)).
- **Docs version label** — [`docs/assets/desktop-version.json`](docs/assets/desktop-version.json) tracks `package.json` via `npm run sync:docs-version`; the download page no longer overwrites it with GitHub *latest* (which lagged at 1.0.49).

### Changed

- **Docs landing page** — [docs.gfelektro.com](https://docs.gfelektro.com) redesign: on-brand link styling (no default blue), download panel, install chips, and refreshed feature section ([`docs/index.html`](docs/index.html), [`docs/styles.css`](docs/styles.css)).
- **Firebase packages landing** — [gfe-portal-packages.web.app](https://gfe-portal-packages.web.app/) shows a branded visit card ([`hosting/`](hosting/)), copied into `hosting-dist/` by [`scripts/stage-hosting.sh`](scripts/stage-hosting.sh) on each Hosting deploy.

### Fixed

- **Post-release tag resolution** — [`post-release-distribution.yml`](.github/workflows/post-release-distribution.yml) `gh api --jq` no longer passes jq’s `-r` (failed with “accepts 1 arg(s), received 2”).
- **Package CI after release** — [`.github/workflows/post-release-distribution.yml`](.github/workflows/post-release-distribution.yml) runs when *Build and Release* succeeds and dispatches Firebase Hosting, Homebrew, Chocolatey, VirusTotal, and AUR with the release tag (workflows triggered only by `release: published` did not run for electron-builder releases).
- **Arch pacman index on Hosting** — [`scripts/stage-hosting.sh`](scripts/stage-hosting.sh) builds the pacman repo from local AppImage sources, uses `pacman-contrib`/`repo-add`, `MAKEPKGCONF`, and honors `RELEASE_TAG` for staging a specific GitHub release (including Docker volume permissions in CI).
- **Firebase Hosting CI** — retries `docker pull` for the Arch builder image when the registry returns transient errors.

---

## [1.0.48] - 2026-10-01

### Fixed

- **iOS TestFlight upload** — [`scripts/ios-testflight.sh`](scripts/ios-testflight.sh) uses `altool --upload-app` with `--p8-file-path` (the previous `--auth-string` path failed on Xcode 27).

- **iOS OAuth popups** — [`ios/PortalEU/PortalWebView.swift`](ios/PortalEU/PortalWebView.swift) opens Firebase/Google/Apple auth in embedded popups with a shared `WKProcessPool` and data store, aligned with Electron auth allowlists (including LinkedIn hosts). Back-forward gestures are disabled so swiping back does not drop the Firebase session after login.

### Added

- **iOS web console forwarding** — [`ios/PortalEU/PortalNativeBridge.swift`](ios/PortalEU/PortalNativeBridge.swift) mirrors `console.log` / `warn` / `error` and uncaught errors to Xcode logs as `[PORTAL-WEB]` for TestFlight debugging.

### Released (App Store Connect)

- **macOS (TestFlight / Mac App Store)** — **G&F Portal EU Mac** (`com.gfelektro.portal`) built with [`scripts/mac-mas-transporter.sh`](scripts/mac-mas-transporter.sh), uploaded via Transporter, and submitted for **beta / App Store review** (2026-10-01).
- **iOS (TestFlight)** — **PortalEU** (`com.gfelektro.portal.ios`) **1.0.48** archived with [`scripts/ios-testflight.sh`](scripts/ios-testflight.sh), uploaded to App Store Connect, TestFlight beta metadata in seven locales (de-DE, en-US, cs, sk, pl, hu, uk), and **external beta review** submitted (2026-10-01). Xcode [`MARKETING_VERSION`](ios/PortalEU.xcodeproj/project.pbxproj) matches **1.0.48**.

---

## [1.0.47] - 2026-10-01

### Added

- **iOS TestFlight CI** — [`.github/workflows/release.yml`](.github/workflows/release.yml) job `ios-testflight` archives `ios/PortalEU.xcodeproj` on each `v*` tag and uploads via App Store Connect API when secrets are set. [`scripts/ios-testflight.sh`](scripts/ios-testflight.sh), [`ios/ExportOptions.plist`](ios/ExportOptions.plist), [`scripts/load-apple-env.sh`](scripts/load-apple-env.sh), and [`.env.local.example`](.env.local.example) support local maintainer runs.

---

## [1.0.46] - 2026-10-01

### Fixed

- **Mac App Store code signing** — [`package.json`](package.json) `build.mas.identity` uses the team suffix only so electron-builder selects **Apple Distribution** for the app and the Mac App Store installer certificate for the `.pkg` (avoids ITMS-90284 when a full certificate string breaks installer lookup).

### Added

- **MAS signing verification** — [`scripts/verify-mas-signing.sh`](scripts/verify-mas-signing.sh) (`npm run verify:mas-signing`), [`scripts/check-mas-provisionprofile.sh`](scripts/check-mas-provisionprofile.sh), and [`scripts/mac-mas-transporter.sh`](scripts/mac-mas-transporter.sh). [`docs/apple-signing.md`](docs/apple-signing.md) documents certificates, `GF Portal EU.app` bundle paths, CSC pitfalls, and profile/certificate fingerprint checks.

---

## [1.0.45] - 2026-09-30

### Added

- **Install docs** — README plus [`docs/linux-apt.html`](docs/linux-apt.html), [`docs/linux-arch.html`](docs/linux-arch.html), and [`docs/windows-chocolatey.html`](docs/windows-chocolatey.html). Docs download fallbacks match this version.

---

## [1.0.44] - 2026-09-30

### Added

- **Arch package** — [`packaging/arch/PKGBUILD`](packaging/arch/PKGBUILD) builds `gfe-portal-eu` from the AppImage. [`scripts/stage-hosting.sh`](scripts/stage-hosting.sh) adds a `gf-elektro` pacman database under Firebase Hosting when the build succeeds. [`.github/workflows/bump-aur.yml`](.github/workflows/bump-aur.yml) updates the AUR only when `AUR_SSH_PRIVATE_KEY` is set.

---

## [1.0.43] - 2026-09-30

### Added

- **Mobile app icons** — [`scripts/sync-app-icons.sh`](scripts/sync-app-icons.sh) builds PortalEU (`ios/PortalEU/Assets.xcassets`) and Flutter iOS/Android icons from [`icon-512.png`](icon-512.png), matching desktop branding. App Store marketing icons are flattened to an opaque white background.

---

## [1.0.42] - 2026-09-30

### Added

- **Chocolatey package** — [`packaging/chocolatey/`](packaging/chocolatey/) and [`.github/workflows/bump-chocolatey.yml`](.github/workflows/bump-chocolatey.yml). The workflow pushes `gfe-portal-eu` only when the `CHOCOLATEY_API_KEY` secret is set; otherwise it skips.

---

## [1.0.41] - 2026-09-30

### Added

- **Firebase Hosting for packages** — new project `gfe-portal-packages` (Hosting only, Workload Identity from GitHub, no service-account key). [`scripts/stage-hosting.sh`](scripts/stage-hosting.sh) builds an unsigned apt index into `hosting-dist/` and [`.github/workflows/publish-firebase-hosting.yml`](.github/workflows/publish-firebase-hosting.yml) deploys it on a published release.

---

## [1.0.40] - 2026-09-30

### Changed

- **Homebrew cask bump** — [`.github/workflows/bump-homebrew-cask.yml`](.github/workflows/bump-homebrew-cask.yml) still updates version and SHA256, and now removes the quarantine-stripping `postflight` block on the next bump.

---

## [1.0.39] - 2026-09-30

### Added

- **Debian package name** — electron-builder `.deb` packages install as `gfe-portal-eu` (`build.deb.packageName` in [`package.json`](package.json)).

---

## [1.0.38] - 2026-09-30

### Added

- **README mobile section** — links to iOS and Android shells and to [docs.gfelektro.com](https://docs.gfelektro.com) install/permission pages.

### Fixed

- **Desktop package version** — `package.json` version aligned to **1.0.37** after the Microsoft Store docs release.

---

## [1.0.37] - 2026-09-30

### Added

- **Microsoft Store permission notes** — [`docs/microsoft-store.md`](docs/microsoft-store.md) and [`docs/permissions.html`](docs/permissions.html) list planned MSIX capabilities (`internetClient`, `microphone`, `webcam`, optional `location`).

---

## [1.0.36] - 2026-09-30

### Added

- **Native shell bridge contract** — [`docs/native-shell-bridge.md`](docs/native-shell-bridge.md) documents `window.portalNativeAPI` for iOS/Android and points Digital-Platform integrators to the correct files. Linked from [`docs/permissions.html`](docs/permissions.html).

---

## [1.0.35] - 2026-09-30

### Added

- **Android FCM token stub** — `portalNativeAPI.push.getNativeToken()` returns `null` until `google-services.json` is added locally; [`mobile/portal_android/README.md`](mobile/portal_android/README.md) documents the Gradle steps.

---

## [1.0.34] - 2026-09-30

### Added

- **Android notification bridge** — high-importance channel `gf_portal_alerts`, `portalNative` JavaScript channel, and [`assets/portal-native-bridge.js`](mobile/portal_android/assets/portal-native-bridge.js) for OS-level portal alerts.

---

## [1.0.33] - 2026-09-30

### Added

- **Android runtime permissions** — camera, microphone, photos, notifications, and optional location in [`mobile/portal_android/android/app/src/main/AndroidManifest.xml`](mobile/portal_android/android/app/src/main/AndroidManifest.xml). WebView grants media requests and image file selection via `file_picker`.

---

## [1.0.32] - 2026-09-30

### Added

- **Android WebView portal load** — [`mobile/portal_android/lib/portal_webview_screen.dart`](mobile/portal_android/lib/portal_webview_screen.dart) loads `https://portal.gfelektro.com` and opens other HTTPS links externally (`webview_flutter`, `url_launcher`).

---

## [1.0.31] - 2026-09-30

### Added

- **Flutter Android shell scaffold** — [`mobile/portal_android/`](mobile/portal_android/) with application id `com.gfelektro.portal.android` and [`mobile/portal_android/README.md`](mobile/portal_android/README.md).

### Changed

- **iOS simulator docs** — [`ios/README.md`](ios/README.md) uses **iPhone 18 Pro** on **iOS 27.0** (Xcode 27), matching the maintainer simulator already in use.

---

## [1.0.30] - 2026-09-30

### Added

- **iOS push setup documentation** — [`ios/README.md`](ios/README.md) lists APNs, Firebase, and `GoogleService-Info.plist` steps. Root [`.gitignore`](.gitignore) ignores Firebase plist and `google-services.json`.

---

## [1.0.29] - 2026-09-30

### Added

- **iOS Notification Center bridge** — [`ios/PortalEU/PortalNativeBridge.swift`](ios/PortalEU/PortalNativeBridge.swift) wires `window.portalNativeAPI` to `UNUserNotificationCenter`, injects [`src/portal-native-bridge.js`](src/portal-native-bridge.js) at document start, and shows banners while the app is in the foreground.

---

## [1.0.28] - 2026-09-30

### Added

- **Native shell notification bridge** — [`src/portal-native-bridge.js`](src/portal-native-bridge.js) patches `window.Notification` and `ServiceWorkerRegistration.prototype.showNotification` to call `window.portalNativeAPI.notifications`, with click events on `portal-notification-clicked`.

---

## [1.0.27] - 2026-09-30

### Added

- **iPhone 17 simulator runbook** — [`ios/README.md`](ios/README.md) documents installing the iOS simulator runtime, creating an iPhone 17 (or newest) simulator, and smoke-testing the portal shell.

### Changed

- **Ignore Xcode user state** — `xcuserdata` is gitignored; local `UserInterfaceState.xcuserstate` is not tracked.

---

## [1.0.26] - 2026-09-30

### Added

- **iOS media capture for portal hosts** — [`ios/PortalEU/PortalWebView.swift`](ios/PortalEU/PortalWebView.swift) grants camera and microphone capture for in-app origins and enables JavaScript window opening for auth popups. [`ios/README.md`](ios/README.md) documents clipboard testing.

---

## [1.0.25] - 2026-09-30

### Added

- **GitHub Pages permission guide** — [`docs/permissions.html`](docs/permissions.html) explains camera, microphone, notifications, and clipboard for macOS, Windows, iOS, Android, and future Microsoft Store builds. [`docs/index.html`](docs/index.html) and [`docs/macos-install.html`](docs/macos-install.html) link to it. No Apple private keys are published.

---

## [1.0.24] - 2026-09-30

### Added

- **Windows camera privacy settings link** — when Windows blocks camera access for the desktop app, a one-time German dialog offers to open `ms-settings:privacy-webcam`, matching the existing microphone flow in [`src/main.js`](src/main.js).

---

## [1.0.23] - 2026-09-30

### Added

- **GitHub Pages macOS install guide** — [docs/macos-install.html](docs/macos-install.html) explains the DMG install. The Apple Developer private key is not published; users install the DMG only.
- **Latest-release download links** — the docs site reads the newest GitHub Release and points Windows, macOS, and Linux buttons at those files.

### Fixed

- **macOS notarization key decode** — the release workflow uses `base64 -D`, which is the flag on GitHub’s macOS runners.

---

## [1.0.22] - 2026-09-30

### Added

- **iOS app scaffold** — `ios/PortalEU.xcodeproj` is a SwiftUI WKWebView client for `https://portal.gfelektro.com` (bundle id `com.gfelektro.portal.ios`). Portal and Google/Firebase hosts stay in the app; other links open in Safari. See `ios/README.md` for team signing, TestFlight, and App Store review notes. This target is not part of the Electron release build.

---

## [1.0.21] - 2026-09-30

### Added

- **Mac App Store build** — `npm run build:mac:mas` packages a sandboxed app (`build/entitlements.mas.plist`). Place the Mac provisioning profile at `build/embedded.provisionprofile` (gitignored) before building. The Homebrew update tray item is hidden when `process.mas` is set, because App Store builds update through Apple.

---

## [1.0.20] - 2026-09-30

### Added

- **Release workflow signs the macOS DMG** when `APPLE_CERTIFICATE_BASE64`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_TEAM_ID`, `APPLE_API_KEY_BASE64`, `APPLE_API_KEY_ID`, and `APPLE_API_ISSUER` are set. Missing secrets still publish an unsigned DMG so Windows and Linux releases are unaffected.

---

## [1.0.19] - 2026-09-30

### Changed

- **macOS notifications** — packaged builds post to Notification Center. The custom toast remains only for unpackaged local runs, where an unsigned dev build cannot show native notifications.

---

## [1.0.18] - 2026-09-30

### Added

- **macOS Developer ID signing setup** — hardened runtime, `build/entitlements.mac.plist`, and maintainer steps in `docs/apple-signing.md`. Notarization runs when App Store Connect API credentials are present. Private `.p12` / `.p8` keys stay out of git and off GitHub Pages; users install the DMG.

---

## [1.0.17] - 2026-08-05

### Fixed

- **Linux packaging config** — remove invalid `linux.desktop` object rejected by electron-builder 26 schema; keep `executableName: GFElektroPortal` only.

---

## [1.0.16] - 2026-08-05

### Fixed

- **Linux AppImage / deb build** — set `executableName` to `GFElektroPortal` so electron-builder 26 accepts the product name containing `&` (fixes CI failure on ubuntu that left docs Linux download links without assets).

---

## [1.0.15] - 2026-08-05

### Added

- **Geolocation permission** — Chromium `geolocation` is allowlisted so the portal can optionally capture report GPS (AddFast).
- **Camera OS prompt (macOS)** — `askForMediaAccess('camera')` alongside microphone before granting `media`.
- **Info.plist usage strings** — `NSCameraUsageDescription` and `NSLocationWhenInUseUsageDescription` (mic string updated for dictation).
- **Docs site + README** — [docs.gfelektro.com](https://docs.gfelektro.com) download links and version badge set to 1.0.15; README documents camera, microphone, and optional geolocation.

### Changed

- Staff need this **tagged release** (and Homebrew cask bump) before new OS permission strings appear on installed Macs.

---

## [1.0.14] - 2026-08-05

### Changed

- **SECURITY.md permissions table** — Camera, Microphone, and Geolocation are documented as granted for expense photos, voice dictation, and optional AddFast report GPS; Media reason clarified as Chromium camera + microphone access.

---

## [1.0.13] - 2026-08-05

### Changed

- **Electron 35 → 43** and **electron-builder 25 → 26** — Chromium/Node stack update; packaging toolchain upgrade. Verified with `npm run smoke:electron` and a local `npm run build:mac` DMG build.
- **`npm start` launcher** — `scripts/run-electron.js` clears `ELECTRON_RUN_AS_NODE` so agent/CI shells do not start the app as plain Node (which makes `require('electron').app` undefined).

---

## [1.0.12] - 2026-08-04

### Changed

- **Homebrew tap is `GF-Elektro/tap`** — docs, tray *Check for Update* messaging, and the cask-bump workflow now use `GF-Elektro/homebrew-tap` after the org transfer. Secret `HOMEBREW_TAP_TOKEN` is configured on Portal-App.

---

## [1.0.11] - 2026-08-04

### Changed

- **Homebrew tap path** — docs and tray *Check for Update* messaging temporarily used `KurtStevenK/tap` until the tap was transferred to the `GF-Elektro` organization.

---

## [1.0.10] - 2026-08-04

### Changed

#### Branding

- **App renamed to G&F Portal EU** — Finder, Dock, window title, and notifications now use *G&F Portal EU* (bundle remains `com.gfelektro.portal`).
- **New Dock / DMG icon** — uses the Digital Platform `favicon.png` (red G&F with yellow bolt).

### Added

#### Updates (macOS)

- **Tray: Nach Updates suchen / Check for Update** — runs `brew upgrade --cask gfe-portal-eu` (requires Homebrew tap `GF-Elektro/tap`).
- **Tray menu order** — Version → Portal öffnen → Neu laden → Check for Update → Tray-Symbol → Benachrichtigung testen → Sprache → Fenstergröße → Beenden.

#### Tray icon

- **Selectable tray icon** — right-click the tray icon and choose *Tray-Symbol* to use **G&F** (the new default), **GF**, or a yellow/orange **Blitz** symbol.
- **Preference is remembered** — the selected tray icon is restored automatically after restarting the app.
- **Native macOS appearance** — macOS uses the system-required monochrome menu-bar variants; Windows uses the colored G&F and spark assets.
- **Seven tray menu languages** — choose Slovak, Czech, Polish, Hungarian, German, Ukrainian, or English from the new *Sprache* submenu.
- **G⚡F icon** — fourth compact tray symbol combining G, lightning bolt, and F.

### Fixed

- **Clear, undistorted tray symbols** — tray symbols preserve natural proportions; refined 17px macOS text icons; ampersand escaping in Electron menus.

---

## [1.0.9] - 2026-08-04

### Fixed

#### Media & courses

- **Course (and other) HTML5 fullscreen works again** — Electron was denying the Chromium `fullscreen` permission because it was missing from the session allowlist. Native video fullscreen and in-page fullscreen controls now succeed the same way they do in Chrome/Firefox.


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

[1.0.8]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.8
[1.0.7]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.7
[1.0.6]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.6
[1.0.3]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.3
[1.0.2]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.2
[1.0.1]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.1
[1.0.0]: https://github.com/GF-Elektro/Portal-App/releases/tag/v1.0.0
