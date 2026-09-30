# Microsoft Store (planned)

The **G&F Portal EU** Windows desktop app is the same Electron build as the NSIS/portable installers on [GitHub Releases](https://github.com/GF-Elektro/Portal-App/releases). A future **Microsoft Store** listing will wrap that build (MSIX) via Partner Center.

## Permissions

The Store package must declare the same capabilities the Electron app already uses:

| Capability | Purpose |
| --- | --- |
| `internetClient` | Load `https://portal.gfelektro.com` |
| `microphone` | Dictation and audio in the portal |
| `webcam` | Site photos and camera capture |
| `location` (optional) | GPS in daily reports when enabled in the portal |

Do **not** upload Apple signing files (`.p12`, `.p8`, provisioning profiles) to Microsoft Partner Center.

## Today

Users install Windows builds from the [docs download page](https://docs.gfelektro.com) or GitHub Releases. Camera and microphone prompts are handled in [`src/main.js`](../src/main.js) (including Windows privacy settings links when access is denied).
