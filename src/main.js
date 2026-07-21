// ─────────────────────────────────────────────────────────────
// G&F Elektro Portal – Electron Main Process
// ─────────────────────────────────────────────────────────────
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  Notification,
  shell,
  ipcMain,
  systemPreferences,
  dialog,
  session,
} = require('electron');
const fs = require('fs');
const path = require('path');

// Windows toast association must be set before app ready
if (process.platform === 'win32') {
  app.setAppUserModelId('com.gfelektro.portal');
}

// ── Constants ───────────────────────────────────────────────
const PORTAL_URL = 'https://portal.gfelektro.com';
const APP_NAME = 'G&F Elektro Portal';
const PORTAL_ORIGIN = new URL(PORTAL_URL).origin;
const ALLOWED_PERMISSIONS = ['notifications', 'media', 'clipboard-read', 'clipboard-sanitized-write'];
const AUTH_EXACT_HOSTS = new Set([
  'portal.gfelektro.com',
  'gfelektro.com',
  'accounts.google.com',
  'accounts.youtube.com',
  'apis.google.com',
]);
const AUTH_HOST_SUFFIXES = [
  '.googleapis.com',
  '.gstatic.com',
  '.firebaseapp.com',
  '.firebaseauth.com',
];
const PORTAL_AUTH_PATH_PREFIXES = [
  '/__/auth',
];
const DOWNLOAD_HOSTS = new Set([
  'firebasestorage.googleapis.com',
]);

// ── State ───────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let isQuitting = false;
let customToast = null;
let isCreatingToast = false;
let customToastClickData = null;
let notificationIdCounter = 0;
let ipcHandlersRegistered = false;
let downloadHandlerRegistered = false;
let micDeniedDialogShown = false;
const activeNotifications = new Map();

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

/**
 * Normalizes a parsed URL hostname for exact and suffix allowlist checks.
 *
 * @param {URL} parsedUrl - Parsed URL instance
 * @returns {string} Lowercase hostname without a trailing dot
 */
function normalizeHostname(parsedUrl) {
  return parsedUrl.hostname.toLowerCase().replace(/\.$/, '');
}

/**
 * Checks whether a parsed URL uses a host required for portal auth flows.
 *
 * @param {URL} parsedUrl - Parsed URL instance
 * @returns {boolean} True when the host is explicitly trusted
 */
function hasAllowedAuthHost(parsedUrl) {
  const hostname = normalizeHostname(parsedUrl);
  return AUTH_EXACT_HOSTS.has(hostname)
    || AUTH_HOST_SUFFIXES.some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix));
}

/**
 * Checks whether a URL points at the trusted portal origin.
 *
 * @param {string} url - Candidate URL
 * @returns {boolean} True when the URL is the configured portal origin
 */
function isPortalURL(url) {
  try {
    return new URL(url).origin === PORTAL_ORIGIN;
  } catch {
    return false;
  }
}

/**
 * Checks if a URL belongs to a trusted portal or OAuth/Firebase auth endpoint.
 *
 * @param {string} url - Candidate URL
 * @returns {boolean} True when Electron should keep the URL inside the app
 */
function isAuthOrAllowedURL(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    if (hasAllowedAuthHost(parsed)) return true;

    const hostname = normalizeHostname(parsed);
    const isPortalHost = hostname === 'portal.gfelektro.com' || hostname === 'gfelektro.com';
    return isPortalHost && PORTAL_AUTH_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix));
  } catch {
    return false;
  }
}

/**
 * Checks whether a URL is a genuine OAuth/Firebase auth popup target.
 * Unlike isAuthOrAllowedURL, this excludes broad portal hosts so PDF/storage
 * links are not treated as auth windows.
 *
 * @param {string} url - Candidate URL
 * @returns {boolean} True when close/reload auth handlers should attach
 */
function isGenuineAuthURL(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;

    const hostname = normalizeHostname(parsed);
    if (hostname === 'portal.gfelektro.com' || hostname === 'gfelektro.com') {
      return PORTAL_AUTH_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix));
    }

    const authOnlyHosts = new Set([
      'accounts.google.com',
      'accounts.youtube.com',
      'apis.google.com',
    ]);
    if (authOnlyHosts.has(hostname)) return true;

    const authOnlySuffixes = [
      '.firebaseapp.com',
      '.firebaseauth.com',
      '.gstatic.com',
    ];
    return authOnlySuffixes.some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

/**
 * Checks whether a URL should be saved as a file download instead of a popup.
 *
 * @param {string} url - Candidate URL
 * @returns {boolean} True when the URL should trigger a download
 */
function isFileDownloadURL(url) {
  try {
    if (url.startsWith('blob:')) return true;

    const parsed = new URL(url);
    const hostname = normalizeHostname(parsed);
    if (DOWNLOAD_HOSTS.has(hostname)) return true;

    const pathname = decodeURIComponent(parsed.pathname).toLowerCase();
    return pathname.endsWith('.pdf');
  } catch {
    return false;
  }
}

/**
 * Builds a unique save path under the Downloads folder.
 *
 * @param {string} suggestedName - Preferred file name
 * @returns {string} Absolute path that does not collide with an existing file
 */
function getUniqueDownloadPath(suggestedName) {
  const downloadsDir = app.getPath('downloads');
  const safeName = path.basename(suggestedName || 'download.bin') || 'download.bin';
  const ext = path.extname(safeName);
  const base = path.basename(safeName, ext) || 'download';

  let candidate = path.join(downloadsDir, safeName);
  let counter = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(downloadsDir, `${base} (${counter})${ext}`);
    counter += 1;
  }
  return candidate;
}

/**
 * Registers a single session-level download handler for the app lifetime.
 */
function registerDownloadHandler() {
  if (downloadHandlerRegistered) return;
  downloadHandlerRegistered = true;

  session.defaultSession.on('will-download', (event, item) => {
    const savePath = getUniqueDownloadPath(item.getFilename());
    item.setSavePath(savePath);

    item.once('done', (doneEvent, state) => {
      const fileName = path.basename(savePath);

      if (state === 'completed') {
        if (!Notification.isSupported()) return;

        const notification = new Notification({
          title: APP_NAME,
          body: `Download abgeschlossen – ${fileName}`,
          icon: getIconPath(),
        });
        notification.on('click', () => {
          shell.showItemInFolder(savePath);
        });
        notification.show();
        return;
      }

      if (state === 'cancelled') return;

      if (Notification.isSupported()) {
        const notification = new Notification({
          title: APP_NAME,
          body: `Download fehlgeschlagen – ${fileName}`,
          icon: getIconPath(),
        });
        notification.show();
      }
    });
  });
}

/**
 * Extracts the renderer URL that sent an IPC event.
 *
 * @param {Electron.IpcMainEvent} event - IPC event
 * @returns {string} Sender URL or an empty string
 */
function getSenderURL(event) {
  return event.senderFrame?.url || event.sender.getURL() || '';
}

/**
 * Allows notification IPC only from the main portal window.
 *
 * @param {Electron.IpcMainEvent | Electron.IpcMainInvokeEvent} event - IPC event
 * @returns {boolean} True when the event came from the trusted portal renderer
 */
function isTrustedNotificationSender(event) {
  return Boolean(mainWindow)
    && !mainWindow.isDestroyed()
    && event.sender === mainWindow.webContents
    && isPortalURL(getSenderURL(event));
}

/**
 * Escapes text before embedding it into the custom toast document.
 *
 * @param {unknown} value - Raw value
 * @param {string} fallback - Fallback value
 * @returns {string} Escaped text
 */
function escapeHtml(value, fallback = '') {
  const text = String(value || fallback);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds the isolated HTML document used for unsigned macOS toast fallback.
 *
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {string} HTML document
 */
function createToastHtml(title, message) {
  const safeTitle = escapeHtml(title, 'G&F Elektro Portal');
  const safeMessage = escapeHtml(message, 'Neue Benachrichtigung');

  return `<!doctype html>
<html>
<body style="margin:0;padding:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:rgba(26,26,46,0.95);color:white;border-radius:12px;border:1px solid rgba(255,255,255,0.15);box-shadow:0 8px 32px rgba(0,0,0,0.5);display:flex;align-items:center;user-select:none;cursor:pointer;-webkit-app-region:no-drag;">
  <div style="flex:1;overflow:hidden;">
    <h3 style="margin:0 0 5px;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeTitle}</h3>
    <p style="margin:0;font-size:12px;opacity:0.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;">${safeMessage}</p>
  </div>
  <script>
    document.body.addEventListener('click', () => {
      window.toastBridge?.clicked();
    });
  </script>
</body>
</html>`;
}

/**
 * Sends a notification click event back to the portal renderer.
 *
 * @param {object} data - Click payload
 */
function sendNotificationClicked(data) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  if (!mainWindow.isVisible()) showWindowFromTray();
  mainWindow.focus();
  mainWindow.webContents.send('notification:clicked', data);
}

/**
 * Closes the active custom toast window if it exists.
 */
function closeCustomToast() {
  if (customToast && !customToast.isDestroyed()) {
    customToast.close();
  }
}

/**
 * Handles click IPC from the isolated custom toast window.
 *
 * @param {Electron.IpcMainEvent} event - IPC event
 */
function handleToastClicked(event) {
  if (!customToast || customToast.isDestroyed() || event.sender !== customToast.webContents) {
    return;
  }
  sendNotificationClicked(customToastClickData || {});
  closeCustomToast();
}

/**
 * Shows the macOS unsigned-build toast fallback.
 *
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
function showMacToastNotification(title, options = {}) {
  const { screen } = require('electron');
  const display = screen.getPrimaryDisplay();
  const toastWidth = 320;
  const toastHeight = 85;

  closeCustomToast();
  customToastClickData = { id: options.id, tag: options.tag, data: options.data };

  isCreatingToast = true;
  try {
    customToast = new BrowserWindow({
      width: toastWidth,
      height: toastHeight,
      x: display.workArea.x + display.workArea.width - toastWidth - 20,
      y: display.workArea.y + 20,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      focusable: false,
      webPreferences: {
        preload: path.join(__dirname, 'toast-preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });
  } finally {
    isCreatingToast = false;
  }

  customToast.once('closed', () => {
    customToast = null;
    customToastClickData = null;
  });

  customToast.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createToastHtml(
    title || APP_NAME,
    options.body || options.message || 'Neue Benachrichtigung'
  ))}`);

  setTimeout(closeCustomToast, 6000);
}

/**
 * Shows a native notification and forwards click events to the portal.
 *
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
function showNativeNotification(title, options = {}) {
  const notificationId = ++notificationIdCounter;
  const notificationOptions = {
    title: title || APP_NAME,
    body: options.body || options.message || '',
    icon: getIconPath(),
    silent: Boolean(options.silent),
  };

  if (Array.isArray(options.actions)) {
    notificationOptions.actions = options.actions;
  }
  if (options.tag) {
    notificationOptions.tag = options.tag;
  }

  const notification = new Notification(notificationOptions);
  activeNotifications.set(notificationId, { notification, data: options.data || {}, tag: options.tag });

  notification.on('click', () => {
    sendNotificationClicked({ id: options.id, tag: options.tag, data: options.data });
    activeNotifications.delete(notificationId);
    notification.close();
  });

  notification.on('close', () => {
    activeNotifications.delete(notificationId);
  });

  if (options.requireInteraction === false && options.timeout) {
    setTimeout(() => {
      if (activeNotifications.has(notificationId)) notification.close();
    }, options.timeout);
  }

  notification.show();
}

/**
 * Registers IPC handlers once for the application lifetime.
 */
function registerIpcHandlers() {
  if (ipcHandlersRegistered) return;
  ipcHandlersRegistered = true;

  ipcMain.on('show-notification', (event, title, options = {}) => {
    if (!isTrustedNotificationSender(event)) return;
    showNativeNotification(title, options);
  });

  ipcMain.on('notification:show', (event, title, options = {}) => {
    if (!isTrustedNotificationSender(event)) return;
    if (process.platform === 'darwin') {
      showMacToastNotification(title, options);
      return;
    }
    showNativeNotification(title, options);
  });

  ipcMain.on('toast-clicked', handleToastClicked);

  ipcMain.handle('notification:check-permission', async (event) => {
    if (!isTrustedNotificationSender(event) || !Notification.isSupported()) {
      return 'denied';
    }
    return 'granted';
  });

  ipcMain.handle('notification:request-permission', async (event) => {
    if (!isTrustedNotificationSender(event) || !Notification.isSupported()) {
      return 'denied';
    }

    try {
      const testNotification = new Notification({
        title: APP_NAME,
        body: 'Notifications enabled',
        icon: getIconPath(),
        silent: true,
      });
      setTimeout(() => testNotification.close(), 100);
      return 'granted';
    } catch (error) {
      console.error('[Main] Failed to request notification permission:', error);
      return 'denied';
    }
  });
}

/**
 * Adds navigation/close handlers used by genuine OAuth/Firebase auth popups.
 *
 * @param {Electron.BrowserWindow} childWindow - Auth popup window
 */
function attachAuthPopupHandlers(childWindow) {
  if (childWindow === mainWindow || childWindow === customToast || isCreatingToast) return;

  childWindow.setMenu(null);

  const closeOnPortalRedirect = (navUrl) => {
    if (!isPortalURL(navUrl)) return;
    // Keep the popup open while Firebase handler routes are still running
    try {
      const parsed = new URL(navUrl);
      if (PORTAL_AUTH_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix))) {
        return;
      }
    } catch {
      return;
    }

    childWindow.close();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.reload();
    }
  };

  childWindow.webContents.on('will-navigate', (navEvent, navUrl) => {
    closeOnPortalRedirect(navUrl);
  });

  childWindow.webContents.on('did-navigate', (navEvent, navUrl) => {
    closeOnPortalRedirect(navUrl);
  });

  childWindow.on('closed', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.reload();
    }
  });
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

  // ── Handle Popups (Google Auth, downloads, etc.) ────────
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Certificate PDFs / storage blobs → save to Downloads (no popup)
    if (isFileDownloadURL(url)) {
      mainWindow.webContents.downloadURL(url);
      return { action: 'deny' };
    }

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

  // Attach close/reload handlers only to genuine auth popups
  mainWindow.webContents.on('did-create-window', (childWindow, details) => {
    if (childWindow === customToast || isCreatingToast) return;
    childWindow.setMenu(null);

    if (isGenuineAuthURL(details.url)) {
      attachAuthPopupHandlers(childWindow);
    }
  });

  // ── Handle main window navigation ──────────────────────
  // Only block truly external URLs in the MAIN window
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Allow portal and auth URLs
    if (isPortalURL(url) || isAuthOrAllowedURL(url)) {
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

  mainWindow.on('closed', () => {
    // Clean up any active notifications
    activeNotifications.forEach(({ notification }) => {
      notification.close();
    });
    activeNotifications.clear();
    closeCustomToast();
    mainWindow = null;
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

/**
 * Fires a native test notification, or offers Windows settings when blocked.
 */
async function showTestNotification() {
  if (!Notification.isSupported()) {
    if (process.platform === 'win32') {
      const result = await dialog.showMessageBox(mainWindow || undefined, {
        type: 'warning',
        title: APP_NAME,
        message: 'Benachrichtigungen nicht verfügbar',
        detail: 'Windows blockiert Benachrichtigungen für diese App. Öffnen Sie die Benachrichtigungseinstellungen, um sie zu aktivieren.',
        buttons: ['Einstellungen öffnen', 'Abbrechen'],
        defaultId: 0,
        cancelId: 1,
      });
      if (result.response === 0) {
        shell.openExternal('ms-settings:notifications');
      }
    }
    return;
  }

  try {
    const notification = new Notification({
      title: APP_NAME,
      body: 'Benachrichtigungen funktionieren.',
      icon: getIconPath(),
    });
    notification.on('click', () => showWindowFromTray());
    notification.show();
  } catch (error) {
    console.error('[Main] Failed to show test notification:', error);
    if (process.platform === 'win32') {
      const result = await dialog.showMessageBox(mainWindow || undefined, {
        type: 'warning',
        title: APP_NAME,
        message: 'Benachrichtigungen blockiert',
        detail: 'Die Test-Benachrichtigung konnte nicht angezeigt werden. Prüfen Sie die Windows-Benachrichtigungseinstellungen.',
        buttons: ['Einstellungen öffnen', 'Abbrechen'],
        defaultId: 0,
        cancelId: 1,
      });
      if (result.response === 0) {
        shell.openExternal('ms-settings:notifications');
      }
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
    {
      label: 'Benachrichtigung testen',
      click: () => showTestNotification(),
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

  registerIpcHandlers();
  registerDownloadHandler();
  createWindow();
  createTray();
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

app.on('browser-window-created', (event, childWindow) => {
  // Guard toast windows; auth close/reload is attached via did-create-window
  if (childWindow === mainWindow || childWindow === customToast || isCreatingToast) return;
  childWindow.setMenu(null);
});

/**
 * Shows a one-time Windows dialog when microphone access is denied at the OS level.
 */
async function showMicDeniedHintIfNeeded() {
  if (micDeniedDialogShown || process.platform !== 'win32') return;
  micDeniedDialogShown = true;

  const result = await dialog.showMessageBox(mainWindow || undefined, {
    type: 'warning',
    title: APP_NAME,
    message: 'Mikrofonzugriff ist blockiert',
    detail: 'Windows hat den Mikrofonzugriff für diese App verweigert. Öffnen Sie die Datenschutzeinstellungen, um den Zugriff zu erlauben.',
    buttons: ['Einstellungen öffnen', 'Abbrechen'],
    defaultId: 0,
    cancelId: 1,
  });

  if (result.response === 0) {
    shell.openExternal('ms-settings:privacy-microphone');
  }
}

/**
 * Resolves OS-level microphone access before granting the web media permission.
 *
 * @returns {Promise<boolean>} True when media access should be granted to the page
 */
async function resolveMicrophoneAccess() {
  try {
    if (process.platform === 'darwin') {
      const status = systemPreferences.getMediaAccessStatus('microphone');
      if (status === 'granted') return true;
      return systemPreferences.askForMediaAccess('microphone');
    }

    if (process.platform === 'win32') {
      const status = systemPreferences.getMediaAccessStatus('microphone');
      if (status === 'denied') {
        await showMicDeniedHintIfNeeded();
        return false;
      }
      return true;
    }
  } catch (error) {
    console.error('[Main] Failed to resolve microphone access:', error);
  }

  return true;
}

// ── Permission Handling ─────────────────────────────────────
// Grant notification / media permission requests from the web content
app.on('web-contents-created', (event, contents) => {
  contents.session.setPermissionRequestHandler(async (webContents, permission, callback) => {
    if (!ALLOWED_PERMISSIONS.includes(permission)) {
      callback(false);
      return;
    }

    if (permission === 'media') {
      const granted = await resolveMicrophoneAccess();
      callback(granted);
      return;
    }

    callback(true);
  });

  // Auto-grant notification permission checks
  contents.session.setPermissionCheckHandler((webContents, permission) => {
    return ALLOWED_PERMISSIONS.includes(permission);
  });
});
