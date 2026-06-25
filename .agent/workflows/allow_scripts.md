---
description: Authorized common development scripts
---
// turbo-all

This workflow allows the agent to run common development scripts without asking for permission.

1. Run Development Mode (Electron app)
    `npm start`

2. Build Installers (electron-builder → release/)
    `npm run build`

3. Build Windows Installers (electron-builder → release/)
    `npm run build:win`

4. Build macOS DMG on a Mac (electron-builder → release/)
    `npm run build:mac`
