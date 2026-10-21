# Windows signing (maintainers)

G&F Portal EU Windows installers are **NSIS Setup.exe** and **portable .exe** from [GitHub Releases](https://github.com/GF-Elektro/Portal-App/releases) and [docs.gfelektro.com](https://docs.gfelektro.com). **Authenticode** signing reduces SmartScreen warnings and matches what users expect from a “proper” desktop installer. This is separate from **Microsoft Store** (MSIX), which Microsoft signs after Partner Center submission ([docs/microsoft-store.md](microsoft-store.md)).

Do **not** commit or publish `.pfx`, `.p12`, or private keys. Keep them in gitignored `.env.local` or GitHub Actions secrets only.

## Live signing identity

These resources exist in the **G&F Elektro s.r.o.** Azure tenant (`meetgfelektro.com`). Do not put tenant secrets, client secrets, or access tokens in the repo.

| Resource | Value |
| --- | --- |
| Subscription | Azure subscription |
| Resource group | `rg-gfe-signing` |
| Account | `gfelektro-signing` (Basic, East US) |
| Endpoint | `https://eus.codesigning.azure.net` |
| Public identity | **G&F Elektro s. r. o.**, completed, valid until 16 January 2029 (`ddceef00-cc85-40ec-b657-df51d7f6dc7e`) |
| Certificate profile | `portal-eu-public` (Public Trust, active) |
| Subject | `CN=G&F Elektro s. r. o.`, `O=G&F Elektro s. r. o.`, `L=Stropkov`, `S=Prešovský`, `C=SK` |

The profile issues a short-lived certificate and replaces it automatically. A signature made with a timestamp stays valid after that certificate expires. The identity itself lasts until 16 January 2029. Street address and postal code are not included.

Signing needs the **Artifact Signing Certificate Profile Signer** role on `gfelektro-signing`. Azure does not export a `.pfx` for this profile, so `CSC_LINK` stays unused until a separate PKCS#12 certificate exists. Sign the NSIS `Setup.exe` and the portable `.exe` with [jsign](https://ebourg.github.io/jsign/) (`--storetype TRUSTEDSIGNING`) or `signtool` on Windows, using alias `gfelektro-signing/portal-eu-public`.

Release `v1.0.59` ships signed `GFElektroPortal-1.0.59-Setup.exe` and `GFElektroPortal-1.0.59.exe` (subject **G&F Elektro s. r. o.**, Stropkov, timestamped). The `v1.0.58` Windows assets were signed in place as well. [docs.gfelektro.com](https://docs.gfelektro.com) links to the current Setup.exe on GitHub. Firebase Hosting serves the current files under `https://gfe-portal-packages.web.app/windows/`.

## Get a code signing certificate

electron-builder expects a **PKCS#12** file (`.pfx`) plus its password via `CSC_LINK` and `CSC_KEY_PASSWORD`. Artifact Signing does not provide that file.

| Option | Register / buy | Notes |
| --- | --- | --- |
| **Azure Trusted Signing** (Microsoft) | [Product overview](https://azure.microsoft.com/products/trusted-signing) → create resource in [Azure Portal](https://portal.azure.com) | Organization verification; good for CI. Confirm your subscription can export or use credentials that electron-builder accepts (PFX or documented Trusted Signing + `signtool` flow). |
| **Public CA (OV / EV)** | e.g. [DigiCert Code Signing](https://www.digicert.com/signing/code-signing-certificates), [Sectigo Code Signing](https://www.sectigo.com/ssl-certificates-tls/code-signing) | Classic path: receive `.pfx` after identity verification. **EV** builds SmartScreen reputation faster than **OV**. |

Partner Center / Microsoft Store registration does **not** replace this certificate for the GitHub **Setup.exe**.

## Local signed build

On a machine with Node.js (Windows recommended; macOS/Linux can sign Windows targets when `CSC_LINK` points at the `.pfx`):

```bash
# Path to .pfx, or base64 of the file (electron-builder accepts both on CI)
export CSC_LINK="/absolute/path/to/gfelektro-codesign.pfx"
export CSC_KEY_PASSWORD="your-pfx-password"
npm run build:win
```

Artifacts land in `release/` (`GFElektroPortal-*-Setup.exe`, portable exe).

Verify on Windows (PowerShell):

```powershell
Get-AuthenticodeSignature "release\GFElektroPortal-*-Setup.exe" | Format-List
```

## GitHub Actions secrets

Add these on **GF-Elektro/Portal-App** → [Settings → Secrets and variables → Actions](https://github.com/GF-Elektro/Portal-App/settings/secrets/actions). The Windows release job reads them on each `v*` tag. If they are empty, the job still publishes **unsigned** installers (same as today).

| Secret | Value |
| --- | --- |
| `WINDOWS_CERTIFICATE_BASE64` | Base64 of the code signing `.pfx` (on macOS: `base64 -i cert.pfx \| pbcopy`; on Windows: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('cert.pfx'))`) |
| `WINDOWS_CERTIFICATE_PASSWORD` | Password for that `.pfx` |

The workflow maps these to electron-builder’s `CSC_LINK` / `CSC_KEY_PASSWORD` only on `windows-latest`. macOS continues to use `APPLE_CERTIFICATE_*` in a separate job so Apple and Windows certs are never mixed.

Optional in gitignored `.env.local` for local maintainer builds (see `.env.local.example`):

```bash
CSC_LINK=/absolute/path/to/cert.pfx
CSC_KEY_PASSWORD=...
```

Then `source scripts/load-apple-env.sh` (loads all of `.env.local`) and `npm run build:win`.

## SmartScreen

A valid signature does not remove every warning on day one. **EV** certificates and consistent publisher identity improve reputation over time. Publish SHA256 hashes and VirusTotal links on each release ([SECURITY.md](../SECURITY.md)).
