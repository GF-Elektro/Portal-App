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
// This provides a complete notification API that works with Service Workers
contextBridge.exposeInMainWorld('electronNotificationAPI', {
  // Request notification permission from the main process
  requestPermission: () => ipcRenderer.invoke('notification:request-permission'),
  
  // Check current permission state
  checkPermission: () => ipcRenderer.invoke('notification:check-permission'),
  
  // Show a notification (used by Service Worker interceptor)
  show: (title, options) => ipcRenderer.send('notification:show', title, options),
});

// ── Listener for Notification Clicks ────────────────────────
ipcRenderer.on('notification:clicked', (event, data) => {
  // Dispatch a CustomEvent into the web world
  window.dispatchEvent(new CustomEvent('electron-notification-clicked', { detail: data }));
});

// ── Service Worker Notification Interception ────────────────
// Inject code into the main world to intercept Service Worker notifications
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
    
    // ── Intercept globally ServiceWorkerRegistration.showNotification ─
    if ('ServiceWorkerRegistration' in window) {
      const originalShowNotification = ServiceWorkerRegistration.prototype.showNotification;
      
      ServiceWorkerRegistration.prototype.showNotification = async function(title, options = {}) {
        // Send to Electron
        const id = Math.random().toString(36).substr(2, 9);
        if (window.electronNotificationAPI) {
          window.electronNotificationAPI.show(title, { ...options, id });
        }
        
        // Let the Native Web Notification trigger too silently to ensure SW states update if the portal depends on it
        try {
          await originalShowNotification.call(this, title, { ...options, silent: true });
        } catch (e) {
          // Ignore errors
        }
      };
    }
    
    console.log('[Electron Preload] Enhanced Notification bridge initialized');
  })();
`);
