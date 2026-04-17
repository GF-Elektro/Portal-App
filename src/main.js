// ─────────────────────────────────────────────────────────────
// G&F Elektro Portal – Electron Main Process
// ─────────────────────────────────────────────────────────────
const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, shell, ipcMain } = require('electron');
const path = require('path');


// ── Constants ───────────────────────────────────────────────
const PORTAL_URL = 'https://portal.gfelektro.com';
const APP_NAME = 'G&F Elektro Portal';

// ── State ───────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let isQuitting = false;
let customToast = null;
let isCreatingToast = false;

// ── Single Instance Lock ────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // If a second instance is launched, focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ── Icon Helper ─────────────────────────────────────────────
function getIconPath() {
  // In packaged app, icons are in the resources directory
  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
  const devPath = path.join(__dirname, '..', 'build', iconName);
  const prodPath = path.join(process.resourcesPath, iconName);

  try {
    require('fs').accessSync(devPath);
    return devPath;
  } catch {
    return prodPath;
  }
}

function getTrayIcon() {
  if (process.platform === 'darwin') {
    // macOS menu bar icons should use the transparent typography template
    const devPath = path.join(__dirname, '..', 'build', 'mac-tray-iconTemplate.png');
    const prodPath = path.join(process.resourcesPath, 'mac-tray-iconTemplate.png');
    let activePath = devPath;
    try { require('fs').accessSync(devPath); } catch { activePath = prodPath; }
    
    const iconBase = nativeImage.createFromPath(activePath);
    // Menu bar icons look best around 18x18
    const resized = iconBase.resize({ width: 18, height: 18 });
    resized.setTemplateImage(true);
    return resized;
  }

  // Windows tray icons should be 16x16
  const iconPath = getIconPath();
  const icon = nativeImage.createFromPath(iconPath);
  return icon.resize({ width: 16, height: 16 });
}

// ── Create Main Window ──────────────────────────────────────
function createWindow() {
  const icon = nativeImage.createFromPath(getIconPath());

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: icon,
    title: APP_NAME,
    show: false, // Don't show until ready
    autoHideMenuBar: true, // Hide menu bar
    backgroundColor: '#1a1a2e', // Dark background while loading
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      // Enable notifications
      notifications: true,
      // Disable timer throttling for background polling
      backgroundThrottling: false,
      // Enable web audio
      webAudio: true,
    },
  });

  // Remove menu bar completely
  mainWindow.setMenu(null);

  // Load the portal URL
  mainWindow.loadURL(PORTAL_URL);

  // Show window when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // ── OAuth / Auth Domain Allowlist ─────────────────────────
  // These domains are required for Google Sign-In / Firebase Auth
  // and must open INSIDE Electron (not in the external browser)
  const AUTH_ALLOWED_DOMAINS = [
    'accounts.google.com',
    'accounts.youtube.com',
    'googleapis.com',
    'gstatic.com',
    'firebaseapp.com',
    'firebaseauth.com',
    '__/auth',
    'portal.gfelektro.com',
    'gfelektro.com',
    'apis.google.com',
    'oauth2',
    'signin',
    'identitytoolkit',
    'securetoken',
    'content-firebaseappcheck',
  ];

  /**
   * Check if a URL belongs to an auth/allowed domain
   */
  function isAuthOrAllowedURL(url) {
    try {
      const parsed = new URL(url);
      return AUTH_ALLOWED_DOMAINS.some(
        (domain) => parsed.hostname.includes(domain) || parsed.pathname.includes(domain)
      );
    } catch {
      return false;
    }
  }

  // ── Handle Popups (Google Auth, etc.) ───────────────────
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow auth popups to open inside Electron
    if (isAuthOrAllowedURL(url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 700,
          autoHideMenuBar: true,
          icon: icon,
          title: 'G&F Elektro – Anmeldung',
          parent: mainWindow,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
          },
        },
      };
    }

    // Everything else → open in system browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // ── Handle navigation in auth child windows ─────────────
  // When a child window (auth popup) navigates back to the portal,
  // close the popup and reload the main window
  app.on('browser-window-created', (event, childWindow) => {
    if (childWindow === mainWindow || isCreatingToast) return;

    childWindow.setMenu(null);

    childWindow.webContents.on('will-navigate', (navEvent, navUrl) => {
      // If the auth popup redirects back to the portal, close it
      if (navUrl.startsWith(PORTAL_URL)) {
        childWindow.close();
        mainWindow.webContents.reload();
      }
    });

    // Also watch for URL changes via did-navigate
    childWindow.webContents.on('did-navigate', (navEvent, navUrl) => {
      if (navUrl.startsWith(PORTAL_URL)) {
        childWindow.close();
        mainWindow.webContents.reload();
      }
    });

    // If the popup is closed manually, reload main window in case auth completed
    childWindow.on('closed', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.reload();
      }
    });
  });

  // ── Handle main window navigation ──────────────────────
  // Only block truly external URLs in the MAIN window
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Allow portal and auth URLs
    if (url.startsWith(PORTAL_URL) || isAuthOrAllowedURL(url)) {
      return; // Allow navigation
    }
    // Block and open externally
    event.preventDefault();
    shell.openExternal(url);
  });

  // ── Minimize to Tray ────────────────────────────────────
  mainWindow.on('minimize', () => {
    mainWindow.hide(); // Hide from taskbar when minimized
    // On macOS, also hide from dock when minimized to tray
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide(); // Hide instead of closing
      // On macOS, also hide from dock when closed to tray
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    }
  });

  // ── Enhanced Notification IPC Handlers ────────────────────
  // Track active notifications for click handling
  const activeNotifications = new Map();
  let notificationIdCounter = 0;

  mainWindow.on('closed', () => {
    // Clean up any active notifications
    activeNotifications.forEach(({ notification }) => {
      notification.close();
    });
    activeNotifications.clear();
    mainWindow = null;
  });

  // Notifications are handled via IPC from the preload script
  ipcMain.on('show-notification', (event, title, options) => {
    const notification = new Notification({
      title: title || 'G&F Elektro Portal',
      body: options?.body || '',
      icon: getIconPath(),
    });
    notification.show();
  });

  // Handle show notification requests from renderer
  ipcMain.on('notification:show', (event, title, options = {}) => {
    const notificationId = ++notificationIdCounter;
    
    // Support unsigned fallback on macOS
    if (process.platform === 'darwin') {
      const { screen } = require('electron');
      const display = screen.getPrimaryDisplay();
      const toastWidth = 320;
      const toastHeight = 85;
      
      if (customToast) {
        customToast.close();
      }
      
      isCreatingToast = true;
      customToast = new BrowserWindow({
        width: toastWidth,
        height: toastHeight,
        x: display.workAreaSize.width - toastWidth - 20,
        y: 20,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focusable: false,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
      });
      isCreatingToast = false;
      
      const safeTitle = (title || 'G&F Elektro Portal').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeMessage = (options.body || options.message || 'Neue Benachrichtigung').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      const html = `<html><body style="margin:0;padding:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:rgba(26,26,46,0.95);color:white;border-radius:12px;border:1px solid rgba(255,255,255,0.15);box-shadow:0 8px 32px rgba(0,0,0,0.5);display:flex;align-items:center;user-select:none;cursor:pointer;-webkit-app-region:no-drag;" onclick="require('electron').ipcRenderer.send('toast-clicked')"><div style="flex:1;overflow:hidden;"><h3 style="margin:0 0 5px;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeTitle}</h3><p style="margin:0;font-size:12px;opacity:0.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;">${safeMessage}</p></div></body></html>`;

      customToast.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      
      const clickHandler = () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          if (!mainWindow.isVisible()) showWindowFromTray();
          mainWindow.focus();
          mainWindow.webContents.send('notification:clicked', { id: options.id, tag: options.tag, data: options.data });
        }
        if (customToast && !customToast.isDestroyed()) customToast.close();
      };
      
      ipcMain.once('toast-clicked', clickHandler);
      
      customToast.once('closed', () => {
        ipcMain.removeListener('toast-clicked', clickHandler);
        customToast = null;
      });
      
      // Auto close after 6 seconds
      setTimeout(() => {
        if (customToast && !customToast.isDestroyed()) customToast.close();
      }, 6000);
      
      return;
    }

    const notificationOptions = {
      title: title || 'G&F Elektro Portal',
      body: options.body || options.message || '',
      icon: getIconPath(),
      silent: options.silent || false,
    };

    // Add actions/buttons if provided and supported
    if (options.actions && Array.isArray(options.actions)) {
      notificationOptions.actions = options.actions;
    }

    // Add tag for notification grouping/replacement
    if (options.tag) {
      notificationOptions.tag = options.tag;
    }

    const notification = new Notification(notificationOptions);
    
    // Store reference with original data for click handling
    activeNotifications.set(notificationId, {
      notification,
      data: options.data || {},
      tag: options.tag,
    });

    // Handle notification click
    notification.on('click', () => {
      // Focus and show the main window
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        if (!mainWindow.isVisible()) {
          showWindowFromTray();
        }
        mainWindow.focus();
        
        // Send click event to renderer
        mainWindow.webContents.send('notification:clicked', {
          id: options.id,
          tag: options.tag,
          data: options.data,
        });
      }
      
      // Clean up
      activeNotifications.delete(notificationId);
      notification.close();
    });

    // Handle notification close
    notification.on('close', () => {
      activeNotifications.delete(notificationId);
    });

    // Auto-close after timeout if specified
    if (options.requireInteraction === false && options.timeout) {
      setTimeout(() => {
        if (activeNotifications.has(notificationId)) {
          notification.close();
        }
      }, options.timeout);
    }

    notification.show();
  });

  // Handle permission check requests
  ipcMain.handle('notification:check-permission', async () => {
    // Check if the Notification API is available
    if (!Notification.isSupported()) {
      return 'denied';
    }
    
    // Return the current permission state
    // Note: Electron's Notification doesn't expose permission state directly
    // We assume granted since we handle it via setPermissionRequestHandler
    return 'granted';
  });

  // Handle permission request
  ipcMain.handle('notification:request-permission', async () => {
    if (!Notification.isSupported()) {
      return 'denied';
    }
    
    // On macOS, the first notification will trigger the permission dialog
    // We create a test notification to trigger the permission request
    try {
      const testNotification = new Notification({
        title: 'G&F Elektro Portal',
        body: 'Notifications enabled',
        icon: getIconPath(),
        silent: true,
      });
      
      // Close it immediately
      setTimeout(() => testNotification.close(), 100);
      
      return 'granted';
    } catch (error) {
      console.error('[Main] Failed to request notification permission:', error);
      return 'denied';
    }
  });
}

// ── Helper: Show window and restore dock on macOS ───────────
function showWindowFromTray() {
  if (mainWindow) {
    // On macOS, show the dock icon again when restoring
    if (process.platform === 'darwin') {
      app.dock.show();
    }
    mainWindow.show();
    mainWindow.focus();
  }
}

function hideWindowToTray() {
  if (mainWindow) {
    mainWindow.hide();
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
  }
}

// ── Create System Tray ──────────────────────────────────────
function createTray() {
  tray = new Tray(getTrayIcon());

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Version ${app.getVersion()}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Portal öffnen',
      click: () => showWindowFromTray(),
    },
    {
      label: 'Neu laden',
      click: () => {
        showWindowFromTray();
        if (mainWindow) {
          mainWindow.webContents.reload();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Beenden',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip(APP_NAME);

  // By NOT using tray.setContextMenu(contextMenu) here, we prevent macOS from 
  // hijacking the left-click to open the menu.
  // Instead, we will manually trigger the context menu on right-click.

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        hideWindowToTray();
      } else {
        showWindowFromTray();
      }
    }
  });

  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });

  // Double-click to always open (Windows)
  tray.on('double-click', () => showWindowFromTray());
}

// ── App Lifecycle ───────────────────────────────────────────
app.on('ready', () => {
  // Set macOS specific dock icon
  if (process.platform === 'darwin') {
    const highResIconPath = path.join(__dirname, '..', 'icon-512.png');
    const prodHighResIconPath = path.join(process.resourcesPath, 'icon-512.png');
    let dockIconPath = getIconPath(); // fallback
    try {
      require('fs').accessSync(highResIconPath);
      dockIconPath = highResIconPath;
    } catch {
      try {
        require('fs').accessSync(prodHighResIconPath);
        dockIconPath = prodHighResIconPath;
      } catch {}
    }
    app.dock.setIcon(dockIconPath);
  }

  createWindow();
  createTray();

  // Set the app user model ID for Windows notifications
  app.setAppUserModelId('com.gfelektro.portal');
});

app.on('window-all-closed', () => {
  // On Windows, only quit when the user explicitly quits via tray
  if (isQuitting) {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create the window when the dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// ── Permission Handling ─────────────────────────────────────
// Grant notification permission requests from the web content
app.on('web-contents-created', (event, contents) => {
  contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['notifications', 'media', 'clipboard-read', 'clipboard-sanitized-write'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Auto-grant notification permission checks
  contents.session.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'notifications') {
      return true;
    }
    return true;
  });
});
