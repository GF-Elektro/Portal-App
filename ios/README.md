# G&F Portal EU (iOS)

Native SwiftUI + WKWebView client for the employee portal at [https://portal.gfelektro.com](https://portal.gfelektro.com). Xcode project: `PortalEU.xcodeproj` (target **PortalEU**).

| Item | Value |
| --- | --- |
| Bundle ID | `com.gfelektro.portal.ios` |
| Display name | G&F Portal EU |
| Marketing version | 1.0.30 (see Xcode **General**) |

**Behavior (see `PortalEU/PortalWebView.swift`):** Portal and Google/Firebase auth hosts load inside the web view; other links open in Safari. MIME types the web view cannot preview (e.g. PDFs) are downloaded into the app **Documents** folder.

**Notifications:** [`src/portal-native-bridge.js`](../src/portal-native-bridge.js) is injected at document start once `window.portalNativeAPI` is wired in Swift (see release notes from 1.0.29 onward).

**Privacy:** `PortalEU/Info.plist` includes German usage strings for camera, microphone, and location (when-in-use). `PortalEU/PrivacyInfo.xcprivacy` declares no tracking (`NSPrivacyTracking` = false).

The Electron **`release.yml`** workflow still builds only the desktop app. On each `v*` tag it also runs an **`ios-testflight`** job when GitHub Actions has the App Store Connect API key secrets (see [`docs/apple-signing.md`](../docs/apple-signing.md)). On a maintainer Mac, put `AuthKey_<KeyID>.p8` in gitignored `_archive/`, copy [`.env.local.example`](../.env.local.example) to `.env.local`, then run `source scripts/load-apple-env.sh && ./scripts/ios-testflight.sh`.

## Maintainer checklist

1. **Open the project** — On a Mac, open `ios/PortalEU.xcodeproj` in Xcode.
2. **Signing** — In **Signing & Capabilities**, select the **G&F Elektro** Apple Developer team. Do **not** commit certificates, private keys, or `.mobileprovision` files.
3. **App icon** — Brand source is [`icon-512.png`](../icon-512.png) (same as the desktop app). Regenerate `PortalEU/Assets.xcassets` with `./scripts/sync-app-icons.sh`, then rebuild in Xcode or the simulator to confirm the home-screen icon matches the macOS dock icon.
4. **App Store Connect** — Create a new iOS app with bundle ID `com.gfelektro.portal.ios`. This is separate from the macOS app (`com.gfelektro.portal`).
5. **TestFlight & review** — **Product → Archive**, upload to App Store Connect, distribute via TestFlight, then submit for review.
   - **Guideline 4.2:** Position this as the company **employee portal client** (camera/microphone for field workflows, file downloads)—not a generic browser bookmark to a website. App Review may need a **demo login**; provide test credentials in App Store Connect notes if required.
6. **CLI upload (maintainer Mac or CI)** — After App Store Connect has an app for `com.gfelektro.portal.ios`, create an **Apple Distribution** certificate (Xcode → Settings → Accounts → Manage Certificates → **+**). Export the `.p12` into `APPLE_IOS_CERTIFICATE_BASE64` if CI cannot provision alone. Then:

   ```bash
   export APPLE_API_KEY="$HOME/AuthKey_XXXXXXXXXX.p8"
   export APPLE_API_KEY_ID="XXXXXXXXXX"
   export APPLE_API_ISSUER="issuer-uuid"
   export MARKETING_VERSION=1.0.30
   export CURRENT_PROJECT_VERSION=2
   ./scripts/ios-testflight.sh
   ```

## Signing errors in Xcode

### “Your team has no devices…” / “No profiles for com.gfelektro.portal.ios”

Xcode is trying to create an **iOS App Development** profile (certificate **Apple Development**). Apple requires **at least one physical iPhone or iPad** registered for your team. **Simulators do not count** and will not clear this warning.

**Fix (pick one):**

1. **USB iPhone/iPad (easiest)** — Connect the device, unlock it, tap **Trust** on the device. In Xcode: **Window → Devices and Simulators → Devices** — Xcode registers the UDID with Apple. Return to **Signing & Capabilities** and click **Try Again**.
2. **Manual UDID** — On the phone: **Settings → General → About** (or Finder sidebar when connected). On the web: [Register a device](https://developer.apple.com/account/resources/devices/add) → **iPhone** → paste the UDID → save. Then **Try Again** in Xcode.

The app can still **Run** on the **iPhone 18 Pro simulator** even while this warning shows; the warning matters for a **real device** and for some archive flows until profiles exist.

### TestFlight / Archive

Uploading to TestFlight needs **Apple Distribution** in your Mac keychain, not only Apple Development:

**Xcode → Settings → Accounts → G&F Elektro s.r.o. → Manage Certificates → + → Apple Distribution**

Then **Product → Archive** (destination **Any iOS Device**, not a simulator). Or use `scripts/ios-testflight.sh` with `.env.local` (see [`docs/apple-signing.md`](../docs/apple-signing.md)).

## Simulator

1. **Xcode → Settings → Platforms** — install the **iOS** runtime that matches your Xcode (e.g. **Xcode 27** with **iOS 27.0** simulator).
2. **Window → Devices and Simulators → Simulators** — use an installed device such as **iPhone 18 Pro** (already available on maintainer Macs with Xcode 27). Create another model only if you need a different screen size.
3. Open `ios/PortalEU.xcodeproj`, select scheme **PortalEU**, destination **iPhone 18 Pro**, press **Run** (⌘R).
4. Smoke test: the Digital Platform login loads at `https://portal.gfelektro.com`, paste into a text field, and open a page that requests camera or microphone to see the system prompt.

CLI (optional): `xcrun simctl list devices available` — look for `iPhone 18 Pro` under the iOS 27 runtime.

## Push notifications (APNs / Firebase)

Remote push when the app is closed needs native FCM, not web push inside WKWebView.

1. **Apple Developer** → Identifiers → `com.gfelektro.portal.ios` → enable **Push Notifications**.
2. Create an **APNs Auth Key** (`.p8`). Upload it in **Firebase Console → Project settings → Cloud Messaging → Apple app configuration**. Never commit the `.p8` file.
3. **Xcode** → target PortalEU → **Signing & Capabilities** → add **Push Notifications** and **Background Modes → Remote notifications** when you are ready to ship push.
4. Download **`GoogleService-Info.plist`** from Firebase for this iOS app. Place it in `ios/PortalEU/` locally. The file is **gitignored** (see root `.gitignore`).
5. Add the **Firebase iOS SDK** (Swift Package: `https://github.com/firebase/firebase-ios-sdk`, product **FirebaseMessaging**) only after the plist is on your Mac. Wire `Messaging.messaging().token` into `portalNativeAPI.push.getNativeToken` in [`PortalNativeBridge.swift`](PortalEU/PortalNativeBridge.swift).

Until Firebase is configured, `getNativeToken` returns `null` and the portal still receives in-app and local notifications via the bridge from 1.0.29.

## Clipboard

Pasting into text fields uses the **system pasteboard** (long-press → Einfügen). There is no custom paste API. Verify paste manually on a simulator or device after portal login.
