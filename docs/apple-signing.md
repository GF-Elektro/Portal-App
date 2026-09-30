# Apple signing (maintainers)

G&F Portal EU is signed with the **G&F Elektro Apple Developer Program** membership. End users install the **DMG** from [docs.gfelektro.com](https://docs.gfelektro.com) or [GitHub Releases](https://github.com/GF-Elektro/Portal-App/releases). They never install a private key.

Do **not** commit or publish `.p12`, `.p8`, `.mobileprovision`, or `build/embedded.provisionprofile`. Those files are gitignored. Putting the Developer ID private key on GitHub Pages would let anyone sign software as G&F Elektro.

## What removes the Gatekeeper warning

A direct-download Mac app must be:

1. Signed with a **Developer ID Application** certificate.
2. **Notarized** by Apple (and the ticket stapled to the DMG, which electron-builder does when notarization credentials are present).

A public `.cer` file on a website does not do this. macOS checks the notarization ticket, not a certificate the user downloads.

## Certificates to create

| Use | Certificate | Where it is used |
| --- | --- | --- |
| DMG / direct download | Developer ID Application | Local Mac and GitHub Actions `CSC_LINK` |
| Mac App Store | Apple Distribution (Mac) + Mac App Store provisioning profile | `npm run build:mac:mas` only |
| iOS | Apple Development and Apple Distribution (iOS) | `ios/PortalEU.xcodeproj` |

Bundle IDs:

- macOS (Electron): `com.gfelektro.portal`
- iOS scaffold: `com.gfelektro.portal.ios`

## Local signed DMG

On a Mac with the Developer ID certificate in the login keychain:

```bash
export CSC_NAME="Developer ID Application: G&F Elektro s.r.o. (TEAMID)"
export APPLE_TEAM_ID="TEAMID"
export APPLE_API_KEY="$HOME/AuthKey_XXXXXXXXXX.p8"
export APPLE_API_KEY_ID="XXXXXXXXXX"
export APPLE_API_ISSUER="issuer-uuid"
npm run build:mac
```

`APPLE_API_KEY` is a **path** to the App Store Connect API key (`.p8`). electron-builder notarizes only when those variables are set. Without them, `npm run build:mac` still produces a DMG (unsigned if no identity is in the keychain).

Check a signed app:

```bash
codesign -dv --verbose=4 "release/mac-arm64/G&F Portal EU.app"
spctl -a -vv "release/mac-arm64/G&F Portal EU.app"
```

## GitHub Actions secrets

Add these on `GF-Elektro/Portal-App` (Settings → Secrets → Actions). The macOS release job reads them when a `v*` tag is pushed. If they are empty, that job still publishes an unsigned DMG.

| Secret | Value |
| --- | --- |
| `APPLE_CERTIFICATE_BASE64` | Base64 of the Developer ID Application `.p12` (`base64 -i Certificates.p12`) |
| `APPLE_CERTIFICATE_PASSWORD` | Password for that `.p12` |
| `APPLE_TEAM_ID` | 10-character Team ID |
| `APPLE_API_KEY_BASE64` | Base64 of the `.p8` API key |
| `APPLE_API_KEY_ID` | Key ID |
| `APPLE_API_ISSUER` | Issuer ID |

The workflow decodes `APPLE_API_KEY_BASE64` to a temporary file and passes that path as `APPLE_API_KEY`. It never prints the key.

## Mac App Store

`npm run build:mac:mas` is separate from the DMG. Place the Mac App Store provisioning profile at `build/embedded.provisionprofile` (not committed). App Store builds hide the Homebrew “Check for Update” tray item (`process.mas`). Upload the `.pkg` with Transporter.

## iOS

Open `ios/PortalEU.xcodeproj` in Xcode, select the G&F team, then archive to TestFlight. See `ios/README.md`.
