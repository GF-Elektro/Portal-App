// ─────────────────────────────────────────────────────────────
// G&F Elektro Portal – Toast Preload Script
// ─────────────────────────────────────────────────────────────
// Isolated click bridge for the custom macOS toast window.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('toastBridge', {
  clicked: () => ipcRenderer.send('toast-clicked'),
});
