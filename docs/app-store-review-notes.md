# App Store & TestFlight review notes (maintainer checklist)

Apps covered:

| App | Platform | Bundle ID |
| --- | --- | --- |
| **G&F Portal EU** | iOS | `com.gfelektro.portal.ios` |
| **G&F Portal EU Mac** | macOS (Mac App Store) | `com.gfelektro.portal` |

Both are thin native shells that load **only** `https://portal.gfelektro.com`. There is no separate in-app UI beyond the portal web experience and native integrations listed below.

---

## 1. What the reviewer should do

1. Launch the app (iOS or Mac).
2. Sign in with email and password. Use the account saved in App Store Connect for that platform:
   - iOS: `demo.ios@gfelektro.com`
   - Mac: `demo.macos@gfelektro.com`
   - General spare account: `demo@gfelektro.com`
3. When the portal or the system prompts, **allow**:
   - **Notifications** (portal may ask after sign-in or when enabling alerts).
   - **Camera** and **Microphone** (e.g. photo attachments, voice notes — only requested in context).
   - **Location** (optional GPS on daily reports — portal may request when using that feature).
4. Open the three tools this role can use: **Whiteboard**, **Aufmaßblatt**, and **Calculator**, on the project **App Review Demo**. The password stays in App Store Connect, not in this file.

---

## 2. Native behavior (not “just a website”)

Use this when explaining value beyond a bookmark in Safari.

### iOS (`ios/PortalEU/`)

- **WKWebView** hosts the portal; navigation stays in-app for portal and approved auth origins.
- **`PortalNativeBridge.swift`**: JavaScript bridge (`window.portalNativeAPI`) routes notification permission and display through **`UNUserNotificationCenter`** (native push-style alerts, not only Safari web notifications).
- **`PortalWebView.swift`**: Delegates **`requestMediaCapturePermissionFor`** (camera/microphone) and **`requestGeolocationPermissionFor`**; grants capture and location **only** for portal and sign-in origins (`shouldKeepInApp`), and denies other origins.
- In-app handling for auth-related popups and downloads where the portal requires them.

### macOS Electron (`src/main.js`, `src/preload.js`)

- **Menu bar tray**: closing the window hides the app; quit is via tray (tray-first lifecycle).
- **Native notifications**: preload patches page `Notification` / service worker paths; main process shows OS notifications and click routing back into the portal.
- **In-app Google / Firebase auth**: auth URLs open in child `BrowserWindow` popups inside Electron, not the default system browser.
- **Mac App Store builds**: Homebrew “check for update” is **hidden** when `process.mas` is set (direct download update path is not offered in MAS builds).

---

## 3. Copy-paste “Notes” for App Store Connect

Paste into **App Review Information → Notes** (App Store review) and **TestFlight → Beta App Review Information → Notes** (TestFlight beta review). Replace placeholders before submitting.

```
G&F Portal EU is a native shell for our hosted portal at https://portal.gfelektro.com.

Demo account:
  Email: REVIEWER_EMAIL
  Password: REVIEWER_PASSWORD

Steps:
1. Open the app and sign in with the credentials above.
2. Allow notifications, camera, microphone, and location when the portal or iOS/macOS asks (needed for alerts, attachments, and optional GPS on reports).

Native features (beyond Safari):
- iOS: WKWebView with UNUserNotificationCenter bridge (PortalNativeBridge.swift); camera/mic/location granted only for portal and sign-in origins (PortalWebView.swift).
- Mac: Menu bar tray, native notifications (Electron main/preload), in-app Google/Firebase auth popups; no Homebrew update check on Mac App Store builds.

Contact for review questions: CONTACT_EMAIL (suggest: info@gfelektro.com)

The app does not load arbitrary third-party websites; it is scoped to the G&F Portal service.
```

**Placeholders**

| Placeholder | Set to |
| --- | --- |
| `REVIEWER_EMAIL` | iOS `demo.ios@gfelektro.com`, Mac `demo.macos@gfelektro.com`. Both are role `demo` on project `demo-app-review`. |
| `REVIEWER_PASSWORD` | Stored only in App Store Connect (Beta App Review Information). Not committed here. |
| `CONTACT_EMAIL` | e.g. `info@gfelektro.com` |

---

## 4. Before you submit a new marketing version

> **Do not** submit a new **marketing version** to App Review or TestFlight beta review until:
>
> 1. The notes above (with **working** demo credentials) are saved in App Store Connect for **both** iOS and Mac where applicable, and  
> 2. You have smoke-tested sign-in and at least one notification/camera prompt path on a release-like build.

**Build history (internal reference)**

| Status | Platform | Version | Build / package |
| --- | --- | --- | --- |
| Previously accepted (TestFlight) | iOS | 1.0.48 | build **2026100109** |
| Rejected | iOS | 1.0.49 | build **17** |
| Rejected | Mac | 1.0.45 | — |
| Uploaded (awaiting / in review) | iOS | 1.0.54 | build **18** (CI) |
| Uploaded (awaiting / in review) | Mac | 1.0.52 | manual package |
| Uploaded (processing) | Mac | 1.0.54 | `GFElektroPortal-1.0.54.pkg` uploaded 2026-10-12 |

Align marketing version, build numbers, and these notes before each submission.

---

## 5. Where to read Apple’s rejection text

- **App Store Connect**: notification **bell** and **Resolution Center** (thread with Apple’s message and any required metadata fixes).
- **Email** to the **Account Holder** on the Apple Developer team (often duplicates or expands Resolution Center content).

**TestFlight** build pages often show only **Rejected** without the full explanation — always check Resolution Center and Account Holder email for the actionable rejection reason before re-uploading.

---

## Maintainer quick checklist

- [x] Demo accounts exist and email/password sign-in succeeds (`demo@`, `demo.ios@`, `demo.macos@`). Passwords are in App Store Connect only.
- [ ] Notes block pasted; placeholders replaced; contact email set.
- [ ] iOS native bridge and permission scoping mentioned if rejection was “minimum functionality” / web wrapper.
- [ ] Mac MAS build verified (`process.mas`: no Homebrew update menu item).
- [ ] Rejection details read from Resolution Center / email, not only TestFlight status.
- [x] Mac 1.0.54 package uploaded. Submit it for beta review only after the demo account is saved.
