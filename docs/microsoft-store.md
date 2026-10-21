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

## Today

Users install Windows builds from the [docs download page](https://docs.gfelektro.com) or GitHub Releases until the Store listing is certified. Camera and microphone prompts are handled in [`src/main.js`](../src/main.js) (including Windows privacy settings links when access is denied).
