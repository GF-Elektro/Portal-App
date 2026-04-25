---
description: Authorized common development scripts
---
// turbo-all

This workflow allows the agent to run common development scripts without asking for permission.

1. Run Development Mode (Electron app)
    `npm start`

2. Build Installers (electron-builder → release/)
    `npm run build`

3. Build macOS DMG (electron-forge + create-dmg → out/make/)
    `npm run make-dmg`
