# G&F Portal EU (iOS)

Native SwiftUI + WKWebView client for the employee portal at [https://portal.gfelektro.com](https://portal.gfelektro.com). Xcode project: `PortalEU.xcodeproj` (target **PortalEU**).

| Item | Value |
| --- | --- |
| Bundle ID | `com.gfelektro.portal.ios` |
| Display name | G&F Portal EU |
| Marketing version | 1.0.26 (see Xcode **General**) |

**Behavior (see `PortalEU/PortalWebView.swift`):** Portal and Google/Firebase auth hosts load inside the web view; other links open in Safari. MIME types the web view cannot preview (e.g. PDFs) are downloaded into the app **Documents** folder.

**Privacy:** `PortalEU/Info.plist` includes German usage strings for camera, microphone, and location (when-in-use). `PortalEU/PrivacyInfo.xcprivacy` declares no tracking (`NSPrivacyTracking` = false).

This target is **not** built by `electron-builder` or the repository’s GitHub release workflow (those produce the Electron desktop app). iOS builds and App Store uploads are done manually in Xcode.

## Maintainer checklist

1. **Open the project** — On a Mac, open `ios/PortalEU.xcodeproj` in Xcode.
2. **Signing** — In **Signing & Capabilities**, select the **G&F Elektro** Apple Developer team. Do **not** commit certificates, private keys, or `.mobileprovision` files.
3. **App icon** — Add an **App Icon** asset before App Store submission; the current scaffold has no icon set.
4. **App Store Connect** — Create a new iOS app with bundle ID `com.gfelektro.portal.ios`. This is separate from the macOS app (`com.gfelektro.portal`).
5. **TestFlight & review** — **Product → Archive**, upload to App Store Connect, distribute via TestFlight, then submit for review.
   - **Guideline 4.2:** Position this as the company **employee portal client** (camera/microphone for field workflows, file downloads)—not a generic browser bookmark to a website. App Review may need a **demo login**; provide test credentials in App Store Connect notes if required.
6. **Out of scope for CI here** — Do not expect `npm run build` or `.github/workflows/release.yml` to produce an iOS `.ipa`.

## Clipboard

Pasting into text fields uses the **system pasteboard** (long-press → Einfügen). There is no custom paste API. Verify paste manually on a simulator or device after portal login.
