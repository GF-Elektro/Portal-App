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
codesign -dv --verbose=4 "release/mac-arm64/GF Portal EU.app"
spctl -a -vv "release/mac-arm64/GF Portal EU.app"
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
| `APPLE_IOS_CERTIFICATE_BASE64` | (Optional) Base64 of the **Apple Distribution** (iOS) `.p12` for CI archives |
| `APPLE_IOS_CERTIFICATE_PASSWORD` | Password for that `.p12` |

The workflow decodes `APPLE_API_KEY_BASE64` to a temporary file and passes that path as `APPLE_API_KEY`. It never prints the key.

On each `v*` tag, the **`ios-testflight`** job (same workflow) archives `ios/PortalEU.xcodeproj`, sets `MARKETING_VERSION` from the tag and `CURRENT_PROJECT_VERSION` from the GitHub run number, and uploads to TestFlight when `APPLE_API_KEY_BASE64` is set. If the API key secret is missing, that job logs a skip and exits successfully.

Local maintainer setup: copy `.env.local.example` to `.env.local`, store `AuthKey_<KeyID>.p8` under gitignored `_archive/`, then `source scripts/load-apple-env.sh` before `scripts/ios-testflight.sh`. The Mac login keychain must contain **Apple Distribution** (Xcode → Settings → Accounts → Manage Certificates → **+**). A portal-only “Distribution Managed” row without a matching private key in Keychain is not enough for `xcodebuild archive`.

## Mac App Store

`npm run build:mac:mas` is separate from the DMG. It must **not** reuse DMG signing environment variables.

### Certificates and profile

| Item | Purpose |
| --- | --- |
| **Apple Distribution** (Mac) | Signs the `.app` and every nested file (including Electron `locale.pak`) |
| **Mac Installer Distribution** (or legacy Mac App Store installer cert) | Signs the `.pkg` for Transporter |
| **`build/embedded.provisionprofile`** | Mac App Store **Distribution** profile for `com.gfelektro.portal`, tied to the same Apple Distribution certificate (gitignored) |

Create or refresh the profile in [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/profiles/list): **Mac** → **Mac App Store** → App ID `com.gfelektro.portal` → your current **Apple Distribution** certificate → download as `build/embedded.provisionprofile`.

Install the **Apple Distribution** (Mac) and **Mac Installer Distribution** certificates in the login keychain (Xcode → Settings → Accounts → Manage Certificates, or download `.p12` from the developer portal and double-click). `security find-identity -v -p codesigning` must list `Apple Distribution: G&F Elektro s.r.o. (3DKACDD8PH)` before building. With `forceCodeSigning: true` on the MAS target, the build **stops** if that identity is missing instead of signing with **Apple Development** (which causes ITMS-90284 on upload).

[`package.json`](../package.json) pins `build.mas.identity` to the team suffix `G&F Elektro s.r.o. (3DKACDD8PH)` so electron-builder picks **Apple Distribution** for the app and **3rd Party Mac Developer Installer** for the `.pkg` (a full `Apple Distribution: …` string breaks installer lookup). It still avoids falling back to **Apple Development** or **Developer ID** when both exist. `build.mac.executableName` is **GF Portal EU** (no `&`) so electron-builder’s MAS packaging step can run shell commands safely; `CFBundleDisplayName` stays **G&F Portal EU**. The `.app` on disk is `GF Portal EU.app` for both DMG and MAS builds.

### Build (clean shell)

Do **not** export `CSC_NAME`, `CSC_LINK`, or `CSC_KEY_PASSWORD` from a DMG build in the same terminal. They override MAS signing and cause **ITMS-90284** (profile lists Apple Distribution, but inner files were signed with another identity).

```bash
unset CSC_NAME CSC_LINK CSC_KEY_PASSWORD
npm run build:mac:mas
npm run verify:mas-signing
```

Upload `release/*.pkg` with Transporter. App Store builds hide the Homebrew “Check for Update” tray item (`process.mas`).

### ITMS-90284 (`locale.pak` / Invalid Code Signing)

Apple rejects the upload when any signed file uses a certificate **not** listed in `embedded.provisionprofile`. Typical causes:

- MAS build run while `CSC_NAME` points at **Developer ID Application** (DMG).
- Only **Apple Development** is in the keychain, so tooling signs with Development while the store profile embeds **Apple Distribution**.
- A **new Apple Distribution** certificate was created in Xcode but `build/embedded.provisionprofile` still embeds the **previous** distribution certificate (same name, different SHA-1). Transporter reports **90284** on the main binary and helpers, not only `locale.pak`. Run `bash scripts/check-mas-provisionprofile.sh` before building; it compares profile and keychain fingerprints.

Check a built app before upload:

```bash
npm run verify:mas-signing
# or: bash scripts/verify-mas-signing.sh "release/mas-arm64/GF Portal EU.app"
```

Decode the profile certificate:

```bash
security cms -D -i "build/embedded.provisionprofile" | plutil -p - | grep -A1 DeveloperCertificates
```

Compare to a nested file:

```bash
codesign -dv --verbose=4 \
  "release/mas-arm64/GF Portal EU.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/de.lproj/locale.pak" \
  2>&1 | grep Authority
```

Authorities must show **Apple Distribution**, not Apple Development or Developer ID.

## iOS

Open `ios/PortalEU.xcodeproj` in Xcode, select the G&F team, then archive to TestFlight, or run `bash scripts/ios-testflight.sh` after `source scripts/load-apple-env.sh` (see `.env.local.example`). CI uses the same script from the `ios-testflight` job on version tags. See [`ios/README.md`](../ios/README.md).
