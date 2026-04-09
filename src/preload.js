// ─────────────────────────────────────────────────────────────
// G&F Elektro Portal – Preload Script
// ─────────────────────────────────────────────────────────────
// This script runs in the renderer process before the web page loads.
// It bridges the gap between the isolated web content and Electron.

const { contextBridge } = require('electron');

// Expose a minimal API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Expose platform info so the web app can detect it's running in Electron
  platform: process.platform,
  isElectron: true,
});

// Override the Notification permission query to always return 'granted'
// This ensures the web app's notification requests work seamlessly
window.addEventListener('DOMContentLoaded', () => {
  // Patch permissions API to always report notifications as granted
  if (navigator.permissions) {
    const originalQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (params) => {
      if (params.name === 'notifications') {
        return Promise.resolve({ state: 'granted', onchange: null });
      }
      return originalQuery(params);
    };
  }
});
