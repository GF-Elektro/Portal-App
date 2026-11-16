# G&F Portal EU for HarmonyOS NEXT

Phone shell that loads `https://portal.gfelektro.com`. Bundle name `com.gfelektro.portal`, version `1.0.0` (`versionCode` 1).

Build from the repo root:

```bash
npm run build:harmony
```

That runs `build-app.sh release`. A debug HAP (compile check) is:

```bash
bash harmony/portal_next/build-app.sh debug
```

DevEco Studio must be installed in `/Applications` or `~/Applications`. Release builds read `signing.local.json` (copy `signing.local.example.json`). The `.p12`, `.p7b`, and `.cer` come from AppGallery Connect and are not committed. See `docs/huawei-appgallery.md`.

Google sign-in stays inside the web component. The shell sends a mobile Chrome user agent because ArkWeb's default agent is often blocked by Google.
