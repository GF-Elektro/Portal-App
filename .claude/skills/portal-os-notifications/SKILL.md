---
name: portal-os-notifications
description: >-
  Delivers GF Portal alerts through the operating-system notification center
  first, and uses the in-app toast only when the shell reports that the system
  rejected the alert. Use for tray tests, portal settings tests, Electron
  Notification, iOS UNUserNotificationCenter, Android notification channels,
  FCM, APNs, Windows toasts, or Linux desktop notifications.
---

# Portal OS notifications

The operating-system notification is priority 1. The in-app toast is the fallback when permission is denied, notifications are off, or the native call fails.

Order: macOS Notification Center, iOS Notification Center, Android notification drawer, Windows notification center, Linux desktop notifications, then the in-app toast.

## Before editing

Run:

```bash
graphify query "showTestNotification notification:show preload"
```

`showTestNotification()` and `notification:show` must share one poster. After the edit, run `graphify update .`

Reference caches stay outside git. On a cache miss, fetch first:

```bash
opensrc path MaikuB/flutter_local_notifications
opensrc path firebase/flutterfire
opensrc fetch MaikuB/flutter_local_notifications firebase/flutterfire
```

Copy behavior from Electron 44 (`node_modules/electron/electron.d.ts`) and `flutter_local_notifications` ^19. FlutterFire `main` deprecates `getToken()` for `register()` / `onRegistered`. This app follows `ios/README.md` and a pinned SDK.

## Files

- `src/main.js` — Electron `Notification`. Mac acceptance is `Notification.getHistory()`, not a missing `show` event. No `icon.icns` on that call. Tray failure opens the blocked dialog. Portal IPC returns `{ accepted }`.
- `src/preload.js` — `electronNotificationAPI.show` awaits that result. The page `onshow` runs only when `accepted` is true.
- `ios/PortalEU/PortalNativeBridge.swift` — local alerts through `UNUserNotificationCenter`. `add` reports `accepted` or `rejected`.
- `src/portal-native-bridge.js` and `mobile/portal_android/assets/portal-native-bridge.js` — page `onshow` waits for that result.
- `mobile/portal_android/lib/portal_webview_screen.dart` — channel `gf_portal_alerts` at high importance.
- Digital-Platform `src/utils/browserNotifications.ts` and `src/utils/notificationDelivery.ts` — shells skip the Chrome focused-tab hint. Toast only when the shell result is rejected.

## Constraints

- Keep the Electron Mac app. A Swift rewrite is not the notification fix.
- Keep `isCreatingToast` so the toast window is not treated as an auth popup.
- Windows Store AUMID stays `GFElektro.GFPortalEU_bmafrkax0y7g8!GFPortalEU`. NSIS stays `com.gfelektro.portal`.
- Leave auth popup handlers alone.
- Do not fake `navigator.serviceWorker`.
- Do not treat `UNErrorDomain` as success. A rejected authorization must reach the page so the toast can run.
- Unsigned Mac builds cannot fill Notification Center. Prove the banner on a signed TestFlight build. GitHub's Mac job builds a DMG, not that TestFlight package.
