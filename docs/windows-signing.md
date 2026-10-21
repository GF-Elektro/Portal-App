# Windows signing (maintainers)

G&F Portal EU Windows installers are **NSIS Setup.exe** and **portable .exe** from [GitHub Releases](https://github.com/GF-Elektro/Portal-App/releases) and [docs.gfelektro.com](https://docs.gfelektro.com). **Authenticode** signing reduces SmartScreen warnings and matches what users expect from a “proper” desktop installer. This is separate from **Microsoft Store** (MSIX), which Microsoft signs after Partner Center submission ([docs/microsoft-store.md](microsoft-store.md)).

Do **not** commit or publish `.pfx`, `.p12`, client secrets, or private keys. Keep them in gitignored `.env.local` or GitHub Actions secrets only.

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

Signing needs the **Artifact Signing Certificate Profile Signer** role on `gfelektro-signing`. Azure does not export a `.pfx` for this profile, so electron-builder’s `CSC_LINK` / `CSC_KEY_PASSWORD` are **not** used for production signing.

Release `v1.0.59` ships signed `GFElektroPortal-1.0.59-Setup.exe` and `GFElektroPortal-1.0.59.exe` (subject **G&F Elektro s. r. o.**, Stropkov, timestamped). The `v1.0.58` Windows assets were signed in place as well. [docs.gfelektro.com](https://docs.gfelektro.com) links to the current Setup.exe on GitHub. Firebase Hosting serves the current files under `https://gfe-portal-packages.web.app/windows/`.

## GitHub Actions (recommended)

On each `v*` tag, the **Build and Release (Windows)** job in [`.github/workflows/release.yml`](../.github/workflows/release.yml):

1. Builds Windows installers **unsigned** (`electron-builder build --win --publish never`).
2. Signs in with Entra via GitHub OIDC (`azure/login@v2`, no client secret).
3. Signs top-level `release/*.exe` with [Azure Artifact Signing](https://github.com/Azure/trusted-signing-action) (`azure/artifact-signing-action@v2`).
4. Publishes artifacts to the GitHub Release (`electron-builder publish -f …`).

### Entra app + secrets (live)

CI uses app registration **GF-Elektro Portal-App GitHub Signing**. The service principal has **Artifact Signing Certificate Profile Signer** on `gfelektro-signing` and **Reader** on the subscription (needed for `azure/login` to select the subscription). Trust is a **flexible federated credential** (`github-actions-release-tags`) that matches `v*` tags of `.github/workflows/release.yml` only. There is no client secret.

These are set on **GF-Elektro/Portal-App** → [Settings → Secrets and variables → Actions](https://github.com/GF-Elektro/Portal-App/settings/secrets/actions):

| Secret | Value |
| --- | --- |
| `AZURE_CLIENT_ID` | App (client) ID of **GF-Elektro Portal-App GitHub Signing** |
| `AZURE_TENANT_ID` | Directory (tenant) ID |
| `AZURE_SUBSCRIPTION_ID` | Subscription that contains `rg-gfe-signing` |

Do **not** add `AZURE_CLIENT_SECRET`. The workflow requests `id-token: write` so `azure/login@v2` exchanges the GitHub OIDC token.

Signing inputs in the workflow (change only if Azure resources move):

| Input | Value |
| --- | --- |
| Endpoint | `https://eus.codesigning.azure.net/` |
| Signing account | `gfelektro-signing` |
| Certificate profile | `portal-eu-public` |

### Legacy PFX path (optional)

If you later obtain a classic **OV/EV** `.pfx`, local builds can still use `CSC_LINK` / `CSC_KEY_PASSWORD` (see below). GitHub Release signing is Azure OIDC, not `WINDOWS_CERTIFICATE_*`.

## Local signed build (Artifact Signing)

1. Install [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) and Java 11+.
2. `az login` with an account that has **Artifact Signing Certificate Profile Signer** on `gfelektro-signing`.
3. Build unsigned installers:

```bash
npm run build:win
```

4. Sign with jsign via the maintainer script (same alias and endpoint as CI):

```bash
bash scripts/sign-windows-azure.sh
```

The script downloads [jsign](https://ebourg.github.io/jsign/) from Maven on first run. Equivalent manual invocation uses `--storetype TRUSTEDSIGNING`, keystore `https://eus.codesigning.azure.net`, alias `gfelektro-signing/portal-eu-public`, and an access token from:

```bash
az account get-access-token --resource https://codesigning.azure.net --query accessToken -o tsv
```

On Windows you can also use `signtool` with Trusted Signing, or sign in CI only and skip local signing.

Verify on Windows (PowerShell):

```powershell
Get-AuthenticodeSignature "release\GFElektroPortal-*-Setup.exe" | Format-List
```

## Alternative: classic `.pfx` + electron-builder

electron-builder can sign during `npm run build:win` when `CSC_LINK` and `CSC_KEY_PASSWORD` point at a **PKCS#12** file. Artifact Signing does not provide that file.

| Option | Register / buy | Notes |
| --- | --- | --- |
| **Azure Artifact Signing** (Microsoft) | [Product overview](https://azure.microsoft.com/products/trusted-signing) | What G&F uses today; CI + `scripts/sign-windows-azure.sh`. |
| **Public CA (OV / EV)** | e.g. [DigiCert](https://www.digicert.com/signing/code-signing-certificates), [Sectigo](https://www.sectigo.com/ssl-certificates-tls/code-signing) | `.pfx` after verification; **EV** builds SmartScreen reputation faster than **OV**. Use `WINDOWS_CERTIFICATE_*` secrets or `.env.local` below. |

Partner Center / Microsoft Store registration does **not** replace this certificate for the GitHub **Setup.exe**.

Optional in gitignored `.env.local` for local PFX builds (see `.env.local.example`):

```bash
CSC_LINK=/absolute/path/to/cert.pfx
CSC_KEY_PASSWORD=...
```

Then `source scripts/load-apple-env.sh` and `npm run build:win`.

## SmartScreen

A valid signature does not remove every warning on day one. **EV** certificates and consistent publisher identity improve reputation over time. Publish SHA256 hashes and VirusTotal links on each release ([SECURITY.md](../SECURITY.md)).
