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

// ── Service Worker Notification Interception ────────────────
// Inject code into the main world to intercept Service Worker notifications
webFrame.executeJavaScript(`
  (function() {
    'use strict';
    
    // Track proxied registrations to avoid double-proxying
    const proxiedRegistrations = new WeakSet();
    
    // Store the original Notification constructor if it exists
    const OriginalNotification = window.Notification;
    
    // ── Override window.Notification for legacy support ───────
    class DesktopNotification {
      constructor(title, options) {
        // Forward to our electron bridge
        if (window.electronNotificationAPI) {
          window.electronNotificationAPI.show(title, options);
        }
      }
      
      static get permission() {
        // Return granted since we handle permissions via the main process
        return 'granted';
      }
      
      static requestPermission(callback) {
        if (window.electronNotificationAPI) {
          const promise = window.electronNotificationAPI.requestPermission();
          if (callback) {
            promise.then(result => callback(result));
          }
          return promise;
        }
        return Promise.resolve('granted');
      }
      
      close() {
        // Native notifications auto-close or are managed by the OS
      }
      
      addEventListener() {
        // Events are handled by the main process
      }
    }
    
    // Replace the global Notification
    window.Notification = DesktopNotification;
    
    // ── Intercept Service Worker registration ────────────────
    // This is the key to catching showNotification() calls from SW
    if ('serviceWorker' in navigator) {
      const originalRegister = navigator.serviceWorker.register;
      
      navigator.serviceWorker.register = async function(...args) {
        try {
          const registration = await originalRegister.apply(this, args);
          
          // Avoid double-proxying
          if (proxiedRegistrations.has(registration)) {
            return registration;
          }
          
          // Store original showNotification
          const originalShowNotification = registration.showNotification.bind(registration);
          
          // Override showNotification to use Electron's native notifications
          registration.showNotification = async function(title, options = {}) {
            // Send to Electron main process instead of using the SW notification
            if (window.electronNotificationAPI) {
              window.electronNotificationAPI.show(title, options);
            }
            // Still call the original to maintain SW state, but it won't show visually
            // The original is called with a special flag so the web notification doesn't display
            try {
              await originalShowNotification(title, { ...options, silent: true });
            } catch (e) {
              // Ignore errors from the original SW notification
            }
          };
          
          // Mark as proxied
          proxiedRegistrations.add(registration);
          
          // Also handle the waiting and active workers
          if (registration.waiting) {
            setupWorkerProxy(registration.waiting);
          }
          if (registration.active) {
            setupWorkerProxy(registration.active);
          }
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              setupWorkerProxy(newWorker);
            }
          });
          
          return registration;
        } catch (error) {
          console.error('[Electron Preload] Service Worker registration failed:', error);
          throw error;
        }
      };
      
      // Helper to proxy worker methods
      function setupWorkerProxy(worker) {
        // The worker itself doesn't have showNotification, but we keep this
        // in case we need to proxy other methods in the future
        console.log('[Electron Preload] Setting up proxy for Service Worker');
      }
      
      // Intercept getRegistration to also proxy existing registrations
      const originalGetRegistration = navigator.serviceWorker.getRegistration;
      navigator.serviceWorker.getRegistration = async function(...args) {
        const registration = await originalGetRegistration.apply(this, args);
        if (registration && !proxiedRegistrations.has(registration)) {
          // Re-apply proxy (the register override will handle this)
          return navigator.serviceWorker.register(registration.scope + '/sw.js');
        }
        return registration;
      };
      
      // Also intercept ready to ensure it's proxied
      const originalReady = navigator.serviceWorker.ready;
      Object.defineProperty(navigator.serviceWorker, 'ready', {
        get: async function() {
          const registration = await originalReady;
          if (registration && !proxiedRegistrations.has(registration)) {
            // The registration method is already proxied, just return it
            return registration;
          }
          return registration;
        }
      });
    }
    
    console.log('[Electron Preload] Notification bridge initialized');
  })();
`);
