// ─────────────────────────────────────────────────────────────
// G&F Elektro Portal – Preload Script
// ─────────────────────────────────────────────────────────────
// This script runs in the renderer process before the web page loads.
// It bridges the gap between the isolated web content and Electron.

const { contextBridge, ipcRenderer, webFrame } = require('electron');

// Expose a minimal API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Expose platform info so the web app can detect it's running in Electron
  platform: process.platform,
  isElectron: true,
});

// Create a bridge specifically for notifications
contextBridge.exposeInMainWorld('desktopNotificationBridge', {
  send: (title, options) => ipcRenderer.send('show-notification', title, options)
});

// Override window.Notification in the Main World so the isolated web app natively uses our bridge
webFrame.executeJavaScript(`
  class DesktopNotification {
    constructor(title, options) {
      window.desktopNotificationBridge.send(title, options);
    }
    static get permission() { return 'granted'; }
    static requestPermission() { return Promise.resolve('granted'); }
  }
  window.Notification = DesktopNotification;
`);
