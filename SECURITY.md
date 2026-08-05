# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | ✅ Yes             |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in the **G&F Portal EU** desktop application, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Send an email to **security@gfelektro.com** with the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within **48 hours**
- **Assessment**: We will assess the vulnerability and determine its severity within **5 business days**
- **Resolution**: Critical vulnerabilities will be patched as soon as possible; non-critical issues will be addressed in the next release cycle
- **Disclosure**: We will coordinate with you on public disclosure after a fix has been released

### Scope

The following areas are in scope:

- Electron main process security (IPC, permissions, sandboxing)
- Preload script vulnerabilities
- Insecure content loading or injection
- Notification system abuse
- Data exposure through webview configuration

### Out of Scope

- Vulnerabilities in the web portal itself (report to the web team separately)
- Social engineering attacks
- Denial of service attacks
- Issues in third-party dependencies (report to the upstream project)

## Security Measures

This application implements the following security practices:

### Electron Security Best Practices

- ✅ **Context Isolation** enabled — web content cannot access Node.js APIs
- ✅ **Sandbox mode** enabled — renderer processes run in a sandboxed environment
- ✅ **Node Integration** disabled — `require()` is not available in the renderer
- ✅ **Preload script isolation** — only minimal, safe APIs exposed via `contextBridge`
- ✅ **Navigation restrictions** — prevents navigating to untrusted origins
- ✅ **External link handling** — non-portal URLs open in the system default browser
- ✅ **Single instance lock** — prevents multiple instances from running

### Permissions

The application grants the following permissions to web content:

| Permission | Granted | Reason |
|------------|---------|--------|
| Notifications | ✅ | Required for real-time project updates |
| Media | ✅ | Required for file upload previews |
| Clipboard Read | ✅ | Required for paste functionality |
| Clipboard Write | ✅ | Required for copy functionality |
| Geolocation | ❌ | Not required |
| Camera | ❌ | Not required |
| Microphone | ❌ | Not required |

### Content Security

- The application only loads content from `https://portal.gfelektro.com`
- All communication is over HTTPS
- No local file access is granted to web content

### Release integrity

- Primary GitHub Release installers (Windows **Setup.exe**, macOS **.dmg**, Linux **.AppImage** / **.deb**) are uploaded to [VirusTotal](https://www.virustotal.com) when a release is published
- Scan report links and SHA256 hashes are appended to the release notes by the [`VirusTotal scan`](.github/workflows/virustotal.yml) workflow
- **Maintainers:** repository secret `VT_API_KEY` from [VirusTotal → API key](https://www.virustotal.com/gui/my-apikey)

#### VirusTotal API quota (free tier)

We intentionally stay within the **standard free public API** limits:

| Limit | Value | How we comply |
| ----- | ----- | ------------- |
| Request rate | **4 / minute** | Workflow `rate_limit: 4` |
| Daily quota | **500 / day** | Only runs on release publish (or manual re-scan) |
| Monthly quota | **~15.5 K / month** | ~4 files × 1–2 calls each per release |
| Files scanned | 4 primary installers | Skips `.blockmap`, `latest*.yml`, portable `.exe` duplicate |
| Calls per release | **~8** (typical) | Each installer is **>32 MB** → 2 VT API calls per file (upload URL + submit) |

- Unsigned builds may occasionally trigger heuristic detections on one engine; compare full VirusTotal reports and SHA256 hashes before treating a hit as malware
- To re-scan an existing release: **Actions → VirusTotal scan → Run workflow** (enter tag, e.g. `v1.0.12`)

---

<p align="center">
  <sub><strong>G&F Portal EU</strong> — where electricians and opportunity meet</sub><br />
  <sub>G&F Elektro s.r.o. — <a href="https://www.gfelektro.com">www.gfelektro.com</a></sub>
</p>
