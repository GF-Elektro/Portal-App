---
trigger: always_on
---

All async operations and IPC handlers must be wrapped in try-catch.

**Rules:**
1. Log errors with `console.error('[ContextName] description:', err)` — this is the only logging mechanism in this project.
2. **Never show raw error strings or stack traces to the user.** Instead, send an IPC notification to surface a friendly error message inside the renderer (the portal web app). Use `mainWindow.webContents.send('app-error', { title, message })` for errors the user needs to see.
3. For non-critical failures (e.g., tray icon update failed, analytics write failed), log silently via `console.error` and continue — do not crash the app.
4. In `src/preload.js`, errors in `contextBridge`-exposed functions should be caught and re-thrown as plain `Error` objects (never expose Electron internals to the renderer world).

**Example:**
```javascript
ipcMain.on('notification:show', (event, { title, body }) => {
  try {
    new Notification({ title, body }).show();
  } catch (err) {
    console.error('[Notifications] Failed to show native notification:', err);
    // Fall back silently — toast window will handle it
  }
});
```
