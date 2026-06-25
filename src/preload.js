// ─────────────────────────────────────────────────────────────
// G&F Elektro Portal – Preload Script
// ─────────────────────────────────────────────────────────────
// This script runs in the renderer process before the web page loads.
// It bridges the gap between the isolated web content and Electron.

const { contextBridge, ipcRenderer, webFrame } = require('electron');

// ── Expose minimal API to the renderer ──────────────────────
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
});

// ── Notification Bridge API ─────────────────────────────────
// This bridges page-created notifications into Electron. Real push event
// handlers run inside the service worker context and cannot be patched here.
contextBridge.exposeInMainWorld('electronNotificationAPI', {
  // Request notification permission from the main process
  requestPermission: () => ipcRenderer.invoke('notification:request-permission'),
  
  // Check current permission state
  checkPermission: () => ipcRenderer.invoke('notification:check-permission'),
  
  // Show a notification from trusted portal page code
  show: (title, options) => ipcRenderer.send('notification:show', title, options),
});

// ── Listener for Notification Clicks ────────────────────────
ipcRenderer.on('notification:clicked', (event, data) => {
  // Dispatch a CustomEvent into the web world
  window.dispatchEvent(new CustomEvent('electron-notification-clicked', { detail: data }));
});

// ── Page Notification Interception ──────────────────────────
// Inject code into the main world so normal page notification calls use Electron.
webFrame.executeJavaScript(`
  (function() {
    'use strict';

    const activeNotifications = new Map();

    // ── Override window.Notification for legacy support ───────
    class DesktopNotification extends window.EventTarget {
      constructor(title, options) {
        super();
        this.id = Math.random().toString(36).substr(2, 9);
        this.title = title;
        this.options = options || {};
        
        // Simulate standard properties
        this.onclick = null;
        this.onclose = null;
        this.onerror = null;
        this.onshow = null;

        activeNotifications.set(this.id, this);

        // Forward to our electron bridge
        if (window.electronNotificationAPI) {
          window.electronNotificationAPI.show(title, { ...this.options, id: this.id });
        }

        // Simulate async show event
        setTimeout(() => {
          this.dispatchEvent(new Event('show'));
          if (typeof this.onshow === 'function') this.onshow(new Event('show'));
        }, 50);
      }
      
      static get permission() {
        return 'granted';
      }

      static requestPermission(callback) {
        if (window.electronNotificationAPI) {
          const promise = window.electronNotificationAPI.requestPermission();
          if (callback) promise.then(result => callback(result));
          return promise;
        }
        return Promise.resolve('granted');
      }

      close() {
        activeNotifications.delete(this.id);
        this.dispatchEvent(new Event('close'));
        if (typeof this.onclose === 'function') this.onclose(new Event('close'));
      }
    }

    window.Notification = DesktopNotification;

    // Listen for notification clicks from Electron
    window.addEventListener('electron-notification-clicked', (event) => {
      const data = event.detail;
      if (data && data.id) {
        const notif = activeNotifications.get(data.id);
        if (notif) {
          // Trigger onclick for the web app
          const clickEvent = new Event('click');
          notif.dispatchEvent(clickEvent);
          if (typeof notif.onclick === 'function') notif.onclick(clickEvent);

          // Cleanup
          activeNotifications.delete(data.id);
        }
      }
    });

    // ── Intercept page calls to ServiceWorkerRegistration.showNotification ─
    // This does not patch the service worker global itself; it only handles
    // calls made by portal page code that has a registration object.
    if ('ServiceWorkerRegistration' in window) {
      ServiceWorkerRegistration.prototype.showNotification = async function(title, options = {}) {
        const id = Math.random().toString(36).substr(2, 9);
        if (window.electronNotificationAPI) {
          window.electronNotificationAPI.show(title, { ...options, id });
        }
      };
    }

    console.log('[Electron Preload] Notification bridge initialized');
  })();
`);
