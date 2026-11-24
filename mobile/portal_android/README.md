# G&F Portal EU (Android)

Flutter WebView shell for [https://portal.gfelektro.com](https://portal.gfelektro.com).

| Item | Value |
| --- | --- |
| Application ID | `com.gfelektro.portal.android` |
| Display name | G&F Portal EU |
| Version | `pubspec.yaml` (`1.0.78+10078`; Play version code **10078**) |

## Requirements

- Flutter stable (3.24+). Install from [flutter.dev](https://docs.flutter.dev/get-started/install).

**App icon:** iOS and Android launcher icons are generated from the repo root [`icon-512.png`](../../icon-512.png). After changing that file, run `./scripts/sync-app-icons.sh` from the Portal-App root.

## Run

```bash
cd mobile/portal_android
flutter pub get
flutter run
```

## Distribution

- **Google Play:** [play.google.com/store/apps/details?id=com.gfelektro.portal.android](https://play.google.com/store/apps/details?id=com.gfelektro.portal.android)
- **Sideload APK** (Google Android and Huawei EMUI / HarmonyOS 4): [docs.gfelektro.com/downloads/GFElektroPortal.apk](https://docs.gfelektro.com/downloads/GFElektroPortal.apk)
- HarmonyOS NEXT does not install this APK. That shell is [`harmony/portal_next`](../../harmony/portal_next/README.md). Store notes for both Huawei listings are in the root [README](../../README.md#huawei-appgallery).

## Release

Production builds are signed with the upload key in `android/key.properties`. That file and the keystore stay off git. Release builds fail when `android/key.properties` is missing. Debug builds use the Android debug key.

```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`. GitHub Actions does not build this package.

## Clipboard

Pasting into text fields uses the Android system clipboard (long-press → Paste). No custom API is required.

## Firebase (FCM push)

`portalNativeAPI.push.getNativeToken()` intentionally returns `null` until Firebase is configured.

When `google-services.json` is available locally (never commit it):

1. Place the file in `android/app/google-services.json`.
2. In `android/settings.gradle.kts`, apply the Google Services plugin per [Firebase Flutter setup](https://firebase.google.com/docs/flutter/setup).
3. In `android/app/build.gradle.kts`, add `id("com.google.gms.google-services")` and dependencies `firebase_core` / `firebase_messaging`.
4. Replace the stub in `lib/portal_webview_screen.dart` prelude with a call to `FirebaseMessaging.instance.getToken()`.

Until then, background push uses only the web stack inside the portal; local notifications from 1.0.34 still work while the app is open.
