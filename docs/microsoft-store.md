# Microsoft Store

The **G&F Portal EU** Windows desktop app is the same Electron build as the NSIS/portable installers on [GitHub Releases](https://github.com/GF-Elektro/Portal-App/releases). The Microsoft Store listing wraps that build as **MSIX**. Microsoft re-signs Store packages; do **not** Authenticode-sign `.msix` / `.msixupload` with Azure Artifact Signing (that path is only for GitHub `Setup.exe`).

**Public docs:** [microsoft-store.html](https://docs.gfelektro.com/microsoft-store.html)

**Partner Center product:** [G&F Portal EU](https://partner.microsoft.com/en-us/dashboard/products/9MXWQW7F7XPT/overview) (MSIX or PWA app, in draft). Store listing: [apps.microsoft.com/detail/9MXWQW7F7XPT](https://apps.microsoft.com/detail/9MXWQW7F7XPT).

## Reserved package identity

Copied from Partner Center → Product identity after reserving the name **G&F Portal EU**. These values are locked for this Store product.

| Manifest field | Value |
| --- | --- |
| Package/Identity/Name | `GFElektro.GFPortalEU` |
| Package/Identity/Publisher | `CN=A13AD157-0238-4037-901B-C007A13489C7` |
| Package/Properties/PublisherDisplayName | `G&F Elektro` |
| Package Family Name (PFN) | `GFElektro.GFPortalEU_bmafrkax0y7g8` |
| Store ID | `9MXWQW7F7XPT` |
| Store protocol | `ms-windows-store://pdp/?productid=9MXWQW7F7XPT` |

The Publisher CN is the **Windows Store identity**, not the Azure Artifact Signing subject (`CN=G&F Elektro s. r. o.`).

Do **not** upload Apple signing files (`.p12`, `.p8`, provisioning profiles) to Microsoft Partner Center.

## Permissions

The Store package must declare the same capabilities the Electron app already uses:

| Capability | Purpose |
| --- | --- |
| `internetClient` | Load `https://portal.gfelektro.com` |
| `microphone` | Dictation and audio in the portal |
| `webcam` | Site photos and camera capture |
| `location` (optional) | GPS in daily reports when enabled in the portal |
| `runFullTrust` | Required for Electron (always added by electron-builder) |

## Store listing (Partner Center)

Use this copy when submitting. The listing must say this is the official G&F Elektro employee client, not a generic browser.

- **Privacy policy:** https://docs.gfelektro.com/permissions.html
- **Category:** Business
- **Price:** Free
- **Markets:** SK, DE, CZ, PL, HU, AT, and other EU markets already served
- **Device family:** Desktop only (not Xbox / HoloLens)

**Description (EN):** G&F Portal EU is the official Windows desktop client for G&F Elektro’s employee portal at https://portal.gfelektro.com. It is not a generic web browser. The native shell keeps the portal in the system tray, shows Windows notifications, opens Google/Firebase sign-in inside the app, and requests camera, microphone, and optional location for site photos, dictation, and daily reports.

**Description (DE):** G&F Portal EU ist der offizielle Windows-Desktop-Client für das Mitarbeiterportal von G&F Elektro unter https://portal.gfelektro.com. Es ist kein generischer Webbrowser. Die native Hülle hält das Portal im Infobereich, zeigt Windows-Benachrichtigungen, öffnet Google-/Firebase-Anmeldung in der App und fragt Kamera, Mikrofon und optional Standort für Baustellenfotos, Diktat und Tagesberichte.

**Description (SK):** G&F Portal EU je oficiálny Windows desktopový klient zamestnaneckého portálu G&F Elektro na https://portal.gfelektro.com. Nie je to všeobecný webový prehliadač. Natívny shell drží portál v systémovej lište, zobrazuje oznámenia Windows, otvára prihlásenie Google/Firebase v aplikácii a žiada kameru, mikrofón a voliteľne polohu pre fotky z stavby, diktát a denné správy.

### Restricted capability `runFullTrust`

Electron’s desktop shell needs full trust for the tray, BrowserWindow (including auth popups), native notifications, and camera/microphone access. The hosted portal stays at https://portal.gfelektro.com.

### Notes for certification

Camera, microphone, and location are used only inside the hosted portal. Location is optional (daily reports). Closing the window hides to the tray by design. A G&F Portal account is required.

Build the unsigned Store package with `npm run build:win:store` (electron-builder `appx`). Do not Azure-sign `.appx` files. GitHub Releases attach `GFElektroPortal-*.appx` from the Windows Store CI job.

## Today

Users install Windows builds from the [docs download page](https://docs.gfelektro.com) or GitHub Releases until the Store listing is certified. Camera and microphone prompts are handled in [`src/main.js`](../src/main.js) (including Windows privacy settings links when access is denied).
