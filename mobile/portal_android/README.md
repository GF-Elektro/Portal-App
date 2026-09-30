# G&F Portal EU (Android)

Flutter WebView shell for [https://portal.gfelektro.com](https://portal.gfelektro.com).

| Item | Value |
| --- | --- |
| Application ID | `com.gfelektro.portal.android` |
| Display name | G&F Portal EU |

## Requirements

- Flutter stable (3.24+). Install from [flutter.dev](https://docs.flutter.dev/get-started/install).

## Run

```bash
cd mobile/portal_android
flutter pub get
flutter run
```

## Release

```bash
flutter build apk --release
flutter build appbundle
```

## Clipboard

Pasting into text fields uses the Android system clipboard (long-press → Paste). No custom API is required.

## Firebase

Place `google-services.json` in `android/app/` locally. It is **gitignored** at the repo root. Without it, push token registration stays a stub until you add the Google Services Gradle plugin (see release notes in the root `CHANGELOG.md`).
