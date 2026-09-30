# Native shell bridge (maintainers)

The hosted portal at `https://portal.gfelektro.com` can run inside **Electron** (desktop), **iOS** (`ios/PortalEU`), or **Android** (`mobile/portal_android`). Each shell exposes a small JavaScript API so the web app can show **OS notifications** and register **FCM device tokens**.

## `window.portalNativeAPI` (iOS / Android)

| Member | Type | Description |
| --- | --- | --- |
| `platform` | `'ios'` \| `'android'` | Shell identifier |
| `isNativeShell` | `true` | Detection flag for the web app |
| `notifications.requestPermission()` | `Promise<'granted'\|'denied'\|'default'>` | Ask the user for notification permission |
| `notifications.checkPermission()` | same | Current permission state |
| `notifications.show(title, options?)` | `void` | Show an OS notification. `options` may include `body`, `tag`, `id`, `data` |
| `push.getNativeToken()` | `Promise<string \| null>` | FCM registration token for Firestore, or `null` if not configured |

Injection order:

1. Native prelude defines `portalNativeAPI` (Swift: [`ios/PortalEU/PortalNativeBridge.swift`](../ios/PortalEU/PortalNativeBridge.swift), Android: prelude in [`mobile/portal_android/lib/portal_webview_screen.dart`](../mobile/portal_android/lib/portal_webview_screen.dart)).
2. [`src/portal-native-bridge.js`](../src/portal-native-bridge.js) patches `window.Notification` and `ServiceWorkerRegistration.prototype.showNotification`.
3. Clicks are delivered via `portal-notification-clicked` `CustomEvent` on `window`.

## `window.electronNotificationAPI` (desktop)

Electron continues to use [`src/preload.js`](../src/preload.js) and `electron-notification-clicked`. Do not remove it.

## Digital-Platform (web app repo)

Implement in `/Users/patrikgajdos/Projects/Digital-Platform` (not in this repo):

- `src/utils/openExternalUrl.ts` — `isNativePortalShell()`, include in `isEmbeddedAppShell()`.
- `src/services/pushSubscriptionService.ts` — store native FCM tokens under `users/{uid}/fcmTokens` with `platform: 'ios' | 'android'`.
- `src/utils/browserNotifications.ts` — route `showBrowserNotification` through `portalNativeAPI` when present.
- `src/utils/notificationCapability.ts` — return `'full'` for native shells.

Server: `functions/src/webPushNotify.ts` already multicasts to all tokens in `fcmTokens`; no change required when tokens are valid FCM registration tokens.

## Security

Never commit `GoogleService-Info.plist`, `google-services.json`, `.p8`, or `.p12` files. Users install the macOS app from the **DMG** only ([macos-install.html](macos-install.html)).
