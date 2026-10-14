# Windows signing (maintainers)

G&F Portal EU Windows installers are **NSIS Setup.exe** and **portable .exe** from [GitHub Releases](https://github.com/GF-Elektro/Portal-App/releases) and [docs.gfelektro.com](https://docs.gfelektro.com). **Authenticode** signing reduces SmartScreen warnings and matches what users expect from a “proper” desktop installer. This is separate from **Microsoft Store** (MSIX), which Microsoft signs after Partner Center submission ([docs/microsoft-store.md](microsoft-store.md)).

Do **not** commit or publish `.pfx`, `.p12`, or private keys. Keep them in gitignored `.env.local` or GitHub Actions secrets only.

## Get a code signing certificate

electron-builder expects a **PKCS#12** file (`.pfx`) plus its password via `CSC_LINK` and `CSC_KEY_PASSWORD`.

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
