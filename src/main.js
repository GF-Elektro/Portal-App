// ─────────────────────────────────────────────────────────────
// G&F Portal EU – Electron Main Process
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
  screen,
} = require('electron');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { execFile } = require('child_process');

// Windows toast association must be set before app ready.
// NSIS/portable shortcuts use com.gfelektro.portal. Microsoft Store AppX toasts
// only appear when the id matches Package Family Name!Application Id.
const WINDOWS_NSIS_APP_USER_MODEL_ID = 'com.gfelektro.portal';
const WINDOWS_STORE_APP_USER_MODEL_ID = 'GFElektro.GFPortalEU_bmafrkax0y7g8!GFPortalEU';
if (process.platform === 'win32') {
  app.setAppUserModelId(
    process.windowsStore ? WINDOWS_STORE_APP_USER_MODEL_ID : WINDOWS_NSIS_APP_USER_MODEL_ID,
  );
}

// ── Constants ───────────────────────────────────────────────
const PORTAL_URL = 'https://portal.gfelektro.com';
const APP_NAME = 'G&F Portal EU';
const PORTAL_ORIGIN = new URL(PORTAL_URL).origin;
// `fullscreen` is required for HTML5 / <video> Fullscreen API (course lessons, etc.).
// Without it, Chromium denies requestFullscreen() even on a user click.
const ALLOWED_PERMISSIONS = [
  'notifications',
  'media',
  'geolocation',
  'clipboard-read',
  'clipboard-sanitized-write',
  'fullscreen',
];
const AUTH_EXACT_HOSTS = new Set([
  'portal.gfelektro.com',
  'gfelektro.com',
  'accounts.google.com',
  'accounts.youtube.com',
  'apis.google.com',
  'appleid.apple.com',
  'idmsa.apple.com',
  'appleid.cdn-apple.com',
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
const PREFERRED_WINDOW = { width: 1024, height: 598 };
const WINDOW_ASPECT = PREFERRED_WINDOW.width / PREFERRED_WINDOW.height;
const WINDOW_MIN = { width: 640, height: 374 };
const WINDOW_SIZE_PRESETS = [
  { id: 'compact', label: 'Kompakt', scale: 0.75 },
  { id: 'standard', label: 'Standard', scale: 1.0 },
  { id: 'large', label: 'Groß', scale: 1.25 },
  { id: 'max', label: 'Maximal', scale: null },
];
const TRAY_ICON_PRESETS = [
  { id: 'g-and-f' },
  { id: 'gf' },
  { id: 'spark' },
  { id: 'g-bolt-f' },
];
const TRAY_LANGUAGES = [
  { id: 'sk', label: 'Slovenčina' },
  { id: 'cz', label: 'Čeština' },
  { id: 'pl', label: 'Polski' },
  { id: 'hu', label: 'Magyar' },
  { id: 'de', label: 'Deutsch' },
  { id: 'uk', label: 'Українська' },
  { id: 'en', label: 'English' },
];
const TRAY_TRANSLATIONS = {
  de: { open: 'Portal öffnen', reload: 'Neu laden', checkForUpdate: 'Nach Updates suchen', updating: 'Update wird geprüft…', updateDone: 'Update abgeschlossen', updateLatest: 'Bereits auf dem neuesten Stand', updateTapBehind: 'GitHub hat {latest}, das Homebrew-Cask ist noch {cask}. Das Update wird installiert, sobald das Tap diese Version enthält.', updateFailed: 'Update fehlgeschlagen', brewMissing: 'Homebrew nicht gefunden. Bitte Brew installieren und GF-Elektro/tap hinzufügen.', relaunchPrompt: 'Eine neue Version wurde installiert. App jetzt neu starten?', relaunch: 'Neu starten', later: 'Später', trayIcon: 'Tray-Symbol', language: 'Sprache', windowSize: 'Fenstergröße', compact: 'Kompakt', standard: 'Standard', large: 'Groß', max: 'Maximal', testNotification: 'Benachrichtigung testen', notificationBlocked: 'Mitteilungen sind blockiert', notificationBlockedDetail: 'macOS hat die Testmitteilung nicht angenommen. Erlauben Sie Mitteilungen für G&F Portal EU in den Systemeinstellungen.', openSettings: 'Einstellungen öffnen', quit: 'Beenden', bolt: 'Blitz' },
  en: { open: 'Open portal', reload: 'Reload', checkForUpdate: 'Check for Update', updating: 'Checking for updates…', updateDone: 'Update complete', updateLatest: 'Already up to date', updateTapBehind: 'GitHub has {latest}, but the Homebrew cask is still {cask}. The update installs once the tap publishes that version.', updateFailed: 'Update failed', brewMissing: 'Homebrew not found. Install Brew and tap GF-Elektro/tap.', relaunchPrompt: 'A new version was installed. Relaunch the app now?', relaunch: 'Relaunch', later: 'Later', trayIcon: 'Tray icon', language: 'Language', windowSize: 'Window size', compact: 'Compact', standard: 'Standard', large: 'Large', max: 'Maximum', testNotification: 'Test notification', notificationBlocked: 'Notifications are blocked', notificationBlockedDetail: 'macOS did not accept the test notification. Allow notifications for G&F Portal EU in System Settings.', openSettings: 'Open Settings', quit: 'Quit', bolt: 'Lightning bolt' },
  sk: { open: 'Otvoriť portál', reload: 'Obnoviť', checkForUpdate: 'Skontrolovať aktualizácie', updating: 'Kontrolujú sa aktualizácie…', updateDone: 'Aktualizácia dokončená', updateLatest: 'Už máte najnovšiu verziu', updateTapBehind: 'GitHub má {latest}, ale Homebrew cask je stále {cask}. Aktualizácia sa nainštaluje, keď tap túto verziu zverejní.', updateFailed: 'Aktualizácia zlyhala', brewMissing: 'Homebrew sa nenašiel. Nainštalujte Brew a pridajte GF-Elektro/tap.', relaunchPrompt: 'Bola nainštalovaná nová verzia. Reštartovať aplikáciu?', relaunch: 'Reštartovať', later: 'Neskôr', trayIcon: 'Ikona v lište', language: 'Jazyk', windowSize: 'Veľkosť okna', compact: 'Kompaktné', standard: 'Štandardné', large: 'Veľké', max: 'Maximálne', testNotification: 'Otestovať upozornenie', notificationBlocked: 'Upozornenia sú zablokované', notificationBlockedDetail: 'macOS testovacie upozornenie neprijal. Povoľte upozornenia pre G&F Portal EU v Systémových nastaveniach.', openSettings: 'Otvoriť nastavenia', quit: 'Ukončiť', bolt: 'Blesk' },
  cz: { open: 'Otevřít portál', reload: 'Obnovit', checkForUpdate: 'Zkontrolovat aktualizace', updating: 'Kontrola aktualizací…', updateDone: 'Aktualizace dokončena', updateLatest: 'Již máte nejnovější verzi', updateTapBehind: 'GitHub má {latest}, ale Homebrew cask je stále {cask}. Aktualizace se nainstaluje, až tap tuto verzi zveřejní.', updateFailed: 'Aktualizace selhala', brewMissing: 'Homebrew nenalezen. Nainstalujte Brew a přidejte GF-Elektro/tap.', relaunchPrompt: 'Byla nainstalována nová verze. Restartovat aplikaci?', relaunch: 'Restartovat', later: 'Později', trayIcon: 'Ikona v liště', language: 'Jazyk', windowSize: 'Velikost okna', compact: 'Kompaktní', standard: 'Standardní', large: 'Velké', max: 'Maximální', testNotification: 'Otestovat oznámení', notificationBlocked: 'Oznámení jsou zablokována', notificationBlockedDetail: 'macOS testovací oznámení nepřijal. Povolte oznámení pro G&F Portal EU v Nastavení systému.', openSettings: 'Otevřít nastavení', quit: 'Ukončit', bolt: 'Blesk' },
  pl: { open: 'Otwórz portal', reload: 'Odśwież', checkForUpdate: 'Sprawdź aktualizacje', updating: 'Sprawdzanie aktualizacji…', updateDone: 'Aktualizacja zakończona', updateLatest: 'Masz już najnowszą wersję', updateTapBehind: 'GitHub ma {latest}, ale cask Homebrew jest nadal {cask}. Aktualizacja zainstaluje się, gdy tap opublikuje tę wersję.', updateFailed: 'Aktualizacja nie powiodła się', brewMissing: 'Nie znaleziono Homebrew. Zainstaluj Brew i dodaj GF-Elektro/tap.', relaunchPrompt: 'Zainstalowano nową wersję. Uruchomić aplikację ponownie?', relaunch: 'Uruchom ponownie', later: 'Później', trayIcon: 'Ikona w zasobniku', language: 'Język', windowSize: 'Rozmiar okna', compact: 'Kompaktowy', standard: 'Standardowy', large: 'Duży', max: 'Maksymalny', testNotification: 'Test powiadomienia', notificationBlocked: 'Powiadomienia są zablokowane', notificationBlockedDetail: 'macOS nie przyjął powiadomienia testowego. Zezwól na powiadomienia dla G&F Portal EU w Ustawieniach systemu.', openSettings: 'Otwórz ustawienia', quit: 'Zakończ', bolt: 'Błyskawica' },
  hu: { open: 'Portál megnyitása', reload: 'Újratöltés', checkForUpdate: 'Frissítések keresése', updating: 'Frissítések ellenőrzése…', updateDone: 'Frissítés kész', updateLatest: 'Már a legújabb verzió fut', updateTapBehind: 'A GitHubon {latest} van, a Homebrew cask még {cask}. A frissítés akkor települ, ha a tap közzéteszi ezt a verziót.', updateFailed: 'A frissítés sikertelen', brewMissing: 'A Homebrew nem található. Telepítse a Brew-t és adja hozzá a GF-Elektro/tap-et.', relaunchPrompt: 'Új verzió telepítve. Újraindítja az alkalmazást?', relaunch: 'Újraindítás', later: 'Később', trayIcon: 'Tálcaikon', language: 'Nyelv', windowSize: 'Ablakméret', compact: 'Kompakt', standard: 'Normál', large: 'Nagy', max: 'Maximális', testNotification: 'Értesítés tesztelése', notificationBlocked: 'Az értesítések le vannak tiltva', notificationBlockedDetail: 'A macOS nem fogadta el a tesztértesítést. Engedélyezze az értesítéseket a G&F Portal EU számára a Rendszerbeállításokban.', openSettings: 'Beállítások megnyitása', quit: 'Kilépés', bolt: 'Villám' },
  uk: { open: 'Відкрити портал', reload: 'Перезавантажити', checkForUpdate: 'Перевірити оновлення', updating: 'Перевірка оновлень…', updateDone: 'Оновлення завершено', updateLatest: 'Вже найновіша версія', updateTapBehind: 'На GitHub є {latest}, а cask Homebrew досі {cask}. Оновлення встановиться, коли tap опублікує цю версію.', updateFailed: 'Помилка оновлення', brewMissing: 'Homebrew не знайдено. Встановіть Brew і додайте GF-Elektro/tap.', relaunchPrompt: 'Встановлено нову версію. Перезапустити застосунок?', relaunch: 'Перезапустити', later: 'Пізніше', trayIcon: 'Значок у треї', language: 'Мова', windowSize: 'Розмір вікна', compact: 'Компактний', standard: 'Стандартний', large: 'Великий', max: 'Максимальний', testNotification: 'Тест сповіщення', notificationBlocked: 'Сповіщення заблоковані', notificationBlockedDetail: 'macOS не прийняв тестове сповіщення. Дозвольте сповіщення для G&F Portal EU в Системних параметрах.', openSettings: 'Відкрити параметри', quit: 'Вийти', bolt: 'Блискавка' },
};
const DEFAULT_WINDOW_PRESET_ID = 'standard';
const DEFAULT_TRAY_ICON_PRESET_ID = 'g-and-f';
const DEFAULT_TRAY_LANGUAGE_ID = 'de';
const WINDOW_PREFS_FILE = 'window-preferences.json';

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
const mediaDeniedDialogShown = { microphone: false, camera: false };
let activeWindowPresetId = DEFAULT_WINDOW_PRESET_ID;
let activeTrayIconPresetId = DEFAULT_TRAY_ICON_PRESET_ID;
let activeTrayLanguageId = DEFAULT_TRAY_LANGUAGE_ID;
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
  const names = process.platform === 'win32'
    ? ['icon.ico']
    : process.platform === 'darwin'
      ? ['icon.icns', 'AppIcon.icns', 'icon.png']
      : ['icon.png', 'icon-512.png'];
  const roots = [];
  if (process.resourcesPath) roots.push(process.resourcesPath);
  roots.push(path.join(__dirname, '..', 'build'), path.join(__dirname, '..'));
  for (const root of roots) {
    for (const name of names) {
      const candidate = path.join(root, name);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return '';
}

let lastOsNotificationAccepted = null;

/**
 * @param {string} title
 * @param {string} body
 * @param {Electron.Notification[]} history
 * @returns {boolean}
 */
function historyContainsNotification(history, title, body) {
  return history.some((item) => item.title === title && (item.body || '') === body);
}

/**
 * Mac acceptance is a Notification Center list entry.
 * Other platforms accept when the native call does not emit failed.
 *
 * @param {Electron.Notification} notification
 * @param {string} title
 * @param {string} body
 * @returns {Promise<{ accepted: boolean, reason?: string }>}
 */
function waitForOsAcceptance(notification, title, body) {
  const waitMs = 2000;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (accepted, reason) => {
      if (settled) return;
      settled = true;
      lastOsNotificationAccepted = accepted;
      resolve(reason ? { accepted, reason } : { accepted });
    };

    if (process.platform !== 'darwin') {
      const timer = setTimeout(() => finish(true), waitMs);
      notification.once('show', () => {
        clearTimeout(timer);
        finish(true);
      });
      notification.once('failed', (_event, error) => {
        clearTimeout(timer);
        const message = error && error.message ? error.message : String(error || 'failed');
        finish(false, message);
      });
      return;
    }

    notification.once('failed', (_event, error) => {
      const message = error && error.message ? error.message : String(error || 'failed');
      finish(false, message);
    });

    const started = Date.now();
    const poll = async () => {
      if (settled) return;
      try {
        if (typeof Notification.getHistory === 'function') {
          const history = await Notification.getHistory();
          if (historyContainsNotification(history, title, body)) {
            finish(true);
            return;
          }
        }
      } catch (error) {
        console.error('[Main] Notification history check failed:', error);
      }
      if (Date.now() - started >= waitMs) {
        finish(false, 'not-in-notification-center');
        return;
      }
      setTimeout(poll, 200);
    };
    setTimeout(poll, 150);
  });
}

/**
 * Posts a title and body to the OS notification center.
 * An icon attachment is omitted because the Mac App Store build was not
 * reaching Notification Center once Electron converted icon.icns.
 *
 * @param {string} title
 * @param {object} options
 * @param {{ onClick?: () => void }} [hooks]
 * @returns {Promise<{ accepted: boolean, reason?: string, presentedFallback?: boolean }>}
 */
async function postOsNotification(title, options = {}, hooks = {}) {
  const resolvedTitle = title || APP_NAME;
  const body = options.body || options.message || '';

  if (!Notification.isSupported()) {
    return { accepted: false, reason: 'unsupported' };
  }

  if (shouldUseMacToastFallback()) {
    showMacToastNotification(resolvedTitle, options);
    return { accepted: false, reason: 'unsigned-dev', presentedFallback: true };
  }

  const notificationOptions = {
    title: resolvedTitle,
    body,
    silent: Boolean(options.silent),
  };
  if (options.tag) notificationOptions.tag = options.tag;
  if (Array.isArray(options.actions)) notificationOptions.actions = options.actions;

  const notification = new Notification(notificationOptions);
  retainedTestNotification = notification;
  const notificationId = ++notificationIdCounter;
  activeNotifications.set(notificationId, {
    notification,
    data: options.data || {},
    tag: options.tag,
  });

  notification.on('click', () => {
    if (typeof hooks.onClick === 'function') hooks.onClick();
    else if (options.trayTest) showWindowFromTray();
    else sendNotificationClicked({ id: options.id, tag: options.tag, data: options.data });
    activeNotifications.delete(notificationId);
  });

  notification.on('close', () => {
    activeNotifications.delete(notificationId);
    if (retainedTestNotification === notification) retainedTestNotification = null;
  });

  notification.show();
  return waitForOsAcceptance(notification, resolvedTitle, body);
}

/**
 * Resolves a tray icon asset in development or a packaged app.
 *
 * @param {string} fileName - Icon file name within the build directory
 * @returns {string} Absolute icon asset path
 */
function getTrayIconAssetPath(fileName) {
  const devPath = path.join(__dirname, '..', 'build', fileName);
  const prodPath = path.join(app.getAppPath(), 'build', fileName);

  try {
    fs.accessSync(devPath);
    return devPath;
  } catch {
    return prodPath;
  }
}

/**
 * Returns the selected tray icon for the current operating system.
 *
 * @returns {Electron.NativeImage} Current tray icon
 */
function getTrayIcon() {
  const fileName = process.platform === 'darwin'
    ? `mac-tray-${activeTrayIconPresetId}Template.png`
    : `tray-${activeTrayIconPresetId}.png`;
  const icon = nativeImage.createFromPath(getTrayIconAssetPath(fileName));
  const height = process.platform === 'darwin'
    ? (activeTrayIconPresetId === 'spark' ? 18 : 17)
    : 16;
  // Set only height so wide text icons retain their native aspect ratio.
  const resized = icon.resize({ height });

  if (process.platform === 'darwin') {
    // macOS status-bar icons must be monochrome template images.
    resized.setTemplateImage(true);
  }

  return resized;
}

/**
 * Loads a language flag SVG for use in the tray context menu.
 *
 * @param {string} languageId - Language identifier
 * @returns {Electron.NativeImage} Resized flag icon
 */
function getLanguageFlagIcon(languageId) {
  const icon = nativeImage.createFromPath(getTrayIconAssetPath(`flags/${languageId}.svg`));
  return icon.isEmpty() ? icon : icon.resize({ height: 14 });
}

/**
 * Returns the localized labels for the selected tray menu language.
 *
 * @returns {object} Tray menu labels
 */
function getTrayLabels() {
  return TRAY_TRANSLATIONS[activeTrayLanguageId] || TRAY_TRANSLATIONS[DEFAULT_TRAY_LANGUAGE_ID];
}

/**
 * Returns the absolute path for persisted window size preferences.
 *
 * @returns {string} Path to window-preferences.json in userData
 */
function getWindowPrefsPath() {
  return path.join(app.getPath('userData'), WINDOW_PREFS_FILE);
}

/**
 * Loads the saved window size preset from disk.
 *
 * @returns {string} Active preset id
 */
function loadWindowSizePreference() {
  try {
    const raw = fs.readFileSync(getWindowPrefsPath(), 'utf8');
    const data = JSON.parse(raw);
    const isWindowPresetValid = WINDOW_SIZE_PRESETS.some((preset) => preset.id === data.presetId);
    const isTrayIconPresetValid = TRAY_ICON_PRESETS.some((preset) => preset.id === data.trayIconPresetId);
    const isTrayLanguageValid = TRAY_LANGUAGES.some((language) => language.id === data.trayLanguageId);

    if (isTrayIconPresetValid) {
      activeTrayIconPresetId = data.trayIconPresetId;
    }
    if (isTrayLanguageValid) {
      activeTrayLanguageId = data.trayLanguageId;
    }

    if (isWindowPresetValid) {
      activeWindowPresetId = data.presetId;
      return data.presetId;
    }
  } catch {
    // Missing or invalid preferences fall back to the default preset.
  }

  activeWindowPresetId = DEFAULT_WINDOW_PRESET_ID;
  return DEFAULT_WINDOW_PRESET_ID;
}

/**
 * Persists the selected window size preset to disk.
 *
 * @param {string} presetId - Preset identifier
 */
function saveWindowSizePreference(presetId) {
  activeWindowPresetId = presetId;
  saveUserPreferences();
}

/**
 * Persists the selected window, tray icon, and tray language preferences.
 */
function saveUserPreferences() {
  try {
    fs.writeFileSync(getWindowPrefsPath(), JSON.stringify({
      presetId: activeWindowPresetId,
      trayIconPresetId: activeTrayIconPresetId,
      trayLanguageId: activeTrayLanguageId,
    }), 'utf8');
  } catch (error) {
    console.error('[Main] Failed to save window preferences:', error);
  }
}

/**
 * Applies and persists a tray icon preset.
 *
 * @param {string} presetId - Tray icon preset identifier
 */
function applyTrayIcon(presetId) {
  if (!TRAY_ICON_PRESETS.some((preset) => preset.id === presetId)) return;

  activeTrayIconPresetId = presetId;
  saveUserPreferences();

  if (tray) {
    tray.setImage(getTrayIcon());
  }
}

/**
 * Applies and persists the tray context menu language.
 *
 * @param {string} languageId - Tray language identifier
 */
function applyTrayLanguage(languageId) {
  if (!TRAY_LANGUAGES.some((language) => language.id === languageId)) return;

  activeTrayLanguageId = languageId;
  saveUserPreferences();
}

/**
 * Resolves the display that should constrain window sizing.
 *
 * @param {Electron.BrowserWindow | null} browserWindow - Existing window, if any
 * @returns {Electron.Display} Target display
 */
function getTargetDisplay(browserWindow) {
  if (browserWindow && !browserWindow.isDestroyed()) {
    return screen.getDisplayMatching(browserWindow.getBounds());
  }
  return screen.getPrimaryDisplay();
}

/**
 * Scales a window size down to fit within a display work area.
 *
 * @param {number} width - Requested width
 * @param {number} height - Requested height
 * @param {Electron.Rectangle} workArea - Available work area
 * @returns {{ width: number, height: number }} Fitted size
 */
function fitWindowSize(width, height, workArea) {
  if (width <= workArea.width && height <= workArea.height) {
    return { width: Math.round(width), height: Math.round(height) };
  }

  const scale = Math.min(workArea.width / width, workArea.height / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/**
 * Computes the fitted size for a named window preset.
 *
 * @param {string} presetId - Preset identifier
 * @param {Electron.Rectangle} workArea - Available work area
 * @returns {{ width: number, height: number }} Preset size
 */
function computePresetSize(presetId, workArea) {
  const preset = WINDOW_SIZE_PRESETS.find((entry) => entry.id === presetId)
    || WINDOW_SIZE_PRESETS.find((entry) => entry.id === DEFAULT_WINDOW_PRESET_ID);

  let width;
  let height;

  if (preset.scale === null) {
    const maxWidth = workArea.width * 0.9;
    const maxHeight = workArea.height * 0.9;

    if (maxWidth / maxHeight > WINDOW_ASPECT) {
      height = maxHeight;
      width = maxHeight * WINDOW_ASPECT;
    } else {
      width = maxWidth;
      height = maxWidth / WINDOW_ASPECT;
    }
  } else {
    width = PREFERRED_WINDOW.width * preset.scale;
    height = PREFERRED_WINDOW.height * preset.scale;
  }

  return fitWindowSize(width, height, workArea);
}

/**
 * Centers a window within a display work area.
 *
 * @param {Electron.BrowserWindow} browserWindow - Window to reposition
 * @param {Electron.Rectangle} workArea - Available work area
 */
function centerWindowInWorkArea(browserWindow, workArea) {
  const [width, height] = browserWindow.getSize();
  const x = workArea.x + Math.round((workArea.width - width) / 2);
  const y = workArea.y + Math.round((workArea.height - height) / 2);
  browserWindow.setPosition(x, y);
}

/**
 * Applies a window size preset to the main window and persists the choice.
 *
 * @param {string} presetId - Preset identifier
 */
function applyWindowSize(presetId) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  saveWindowSizePreference(presetId);

  const workArea = getTargetDisplay(mainWindow).workArea;
  const { width, height } = computePresetSize(presetId, workArea);
  mainWindow.setSize(width, height);
  centerWindowInWorkArea(mainWindow, workArea);
}

/**
 * Builds the tray label for a window size preset, including fitted dimensions.
 *
 * @param {{ id: string }} preset - Preset definition
 * @param {Electron.Rectangle} workArea - Available work area
 * @param {object} labels - Localized tray menu labels
 * @returns {string} Menu label
 */
function formatPresetMenuLabel(preset, workArea, labels) {
  const { width, height } = computePresetSize(preset.id, workArea);
  return `${labels[preset.id]} (${width} × ${height})`;
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
    if (!url || url === 'about:blank' || url.startsWith('about:')) return true;
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
 * @returns {boolean} True when auth popup handlers should attach
 */
function isGenuineAuthURL(url) {
  try {
    if (!url || url === 'about:blank' || url.startsWith('about:')) return true;
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
      'appleid.apple.com',
      'idmsa.apple.com',
      'appleid.cdn-apple.com',
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
        void postOsNotification(APP_NAME, { body: `Download abgeschlossen – ${fileName}` }, {
          onClick: () => shell.showItemInFolder(savePath),
        });
        return;
      }

      if (state === 'cancelled') return;

      void postOsNotification(APP_NAME, { body: `Download fehlgeschlagen – ${fileName}` });
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
  const safeTitle = escapeHtml(title, 'G&F Portal EU');
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
 * Unsigned dev runs cannot reliably post to Notification Center.
 * Packaged builds (Developer ID or Mac App Store) use the native API.
 *
 * @returns {boolean} True when the in-window toast should be used
 */
function shouldUseMacToastFallback() {
  return process.platform === 'darwin' && !app.isPackaged;
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
 * @returns {Promise<{ accepted: boolean, reason?: string, presentedFallback?: boolean }>}
 */
function showNativeNotification(title, options = {}) {
  return postOsNotification(title, options);
}

/**
 * Registers IPC handlers once for the application lifetime.
 */
function registerIpcHandlers() {
  if (ipcHandlersRegistered) return;
  ipcHandlersRegistered = true;

  ipcMain.on('show-notification', (event, title, options = {}) => {
    if (!isTrustedNotificationSender(event)) return;
    void showNativeNotification(title, options);
  });

  ipcMain.handle('notification:show', async (event, title, options = {}) => {
    if (!isTrustedNotificationSender(event)) return { accepted: false, reason: 'untrusted' };
    return showNativeNotification(title, options);
  });

  ipcMain.on('toast-clicked', handleToastClicked);

  ipcMain.handle('notification:check-permission', async (event) => {
    if (!isTrustedNotificationSender(event) || !Notification.isSupported()) {
      return 'denied';
    }
    if (process.platform === 'darwin' && app.isPackaged && typeof Notification.getHistory === 'function') {
      try {
        const history = await Notification.getHistory();
        if (Array.isArray(history) && history.length > 0) return 'granted';
      } catch (error) {
        console.error('[Main] Notification permission history check failed:', error);
      }
    }
    if (lastOsNotificationAccepted === true) return 'granted';
    return 'default';
  });

  ipcMain.handle('notification:request-permission', async (event) => {
    if (!isTrustedNotificationSender(event) || !Notification.isSupported()) {
      return 'denied';
    }
    if (process.platform === 'darwin' && app.isPackaged && typeof Notification.getHistory === 'function') {
      try {
        const history = await Notification.getHistory();
        if (Array.isArray(history) && history.length > 0) return 'granted';
      } catch (error) {
        console.error('[Main] Notification permission history check failed:', error);
      }
    }
    if (lastOsNotificationAccepted === true) return 'granted';
    return 'default';
  });
}

/**
 * Configures genuine OAuth/Firebase auth popups.
 * Never closes the popup or reloads the main window — force-closing a child
 * BrowserWindow during Google/Firebase navigation can take down the Electron
 * shell, and reloading the main window wipes in-memory MFA challenge state.
 * Firebase delivers the auth result to the opener and closes the popup itself.
 *
 * @param {Electron.BrowserWindow} childWindow - Auth popup window
 */
function attachAuthPopupHandlers(childWindow) {
  if (childWindow === mainWindow || childWindow === customToast || isCreatingToast) return;

  childWindow.setMenu(null);
}

// ── Create Main Window ──────────────────────────────────────
function createWindow() {
  const icon = nativeImage.createFromPath(getIconPath());
  const presetId = loadWindowSizePreference();
  const workArea = getTargetDisplay(null).workArea;
  const { width, height } = computePresetSize(presetId, workArea);

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: WINDOW_MIN.width,
    minHeight: WINDOW_MIN.height,
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
    centerWindowInWorkArea(mainWindow, getTargetDisplay(mainWindow).workArea);
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

    // Allow auth popups to open inside Electron (non-modal — parented modals
    // have crashed the shell when the popup closes mid Google/Firebase auth)
    if (isAuthOrAllowedURL(url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 700,
          autoHideMenuBar: true,
          icon: icon,
          title: 'G&F Elektro – Anmeldung',
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

  // Attach auth popup close handlers only to genuine Google/Firebase popups
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

let retainedTestNotification = null;

function openNotificationSettings() {
  if (process.platform === 'darwin') {
    shell.openExternal('x-apple.systempreferences:com.apple.Notifications-Settings.extension');
    return;
  }
  if (process.platform === 'win32') {
    shell.openExternal('ms-settings:notifications');
  }
}

async function explainNotificationBlocked(detail) {
  const labels = getTrayLabels();
  const result = await dialog.showMessageBox(mainWindow || undefined, {
    type: 'warning',
    title: APP_NAME,
    message: labels.notificationBlocked,
    detail: detail ? `${labels.notificationBlockedDetail}\n\n${detail}` : labels.notificationBlockedDetail,
    buttons: [labels.openSettings, labels.later],
    defaultId: 0,
    cancelId: 1,
  });
  if (result.response === 0) openNotificationSettings();
}

/**
 * Fires a native test notification.
 * The Notification object must stay referenced until Notification Center accepts it.
 * Dropping it immediately lets V8 collect it while the icon attachment is still running,
 * and the banner never appears.
 */
async function showTestNotification() {
  try {
    const result = await postOsNotification(APP_NAME, {
      body: 'Benachrichtigungen funktionieren.',
      trayTest: true,
    });
    if (!result.accepted && !result.presentedFallback) {
      await explainNotificationBlocked(result.reason);
    }
  } catch (error) {
    console.error('[Main] Failed to show test notification:', error);
    await explainNotificationBlocked(error && error.message ? error.message : String(error));
  }
}


function resolveBrewPath() {
  const candidates = ['/opt/homebrew/bin/brew', '/usr/local/bin/brew'];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function getBrewEnv() {
  const pathParts = [
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    process.env.PATH || '',
  ];
  return {
    ...process.env,
    PATH: pathParts.join(':'),
    HOMEBREW_NO_ENV_HINTS: '1',
    HOMEBREW_NO_AUTO_UPDATE: '1',
    HOMEBREW_COLOR: '0',
  };
}

function runBrew(brewPath, args) {
  return new Promise((resolve) => {
    execFile(
      brewPath,
      args,
      { env: getBrewEnv(), timeout: 15 * 60 * 1000 },
      (err, stdout, stderr) => {
        resolve({
          err,
          stdout: `${stdout || ''}`.trim(),
          stderr: `${stderr || ''}`.trim(),
          output: `${stdout || ''}\n${stderr || ''}`.trim(),
        });
      },
    );
  });
}

function parseVersionParts(value) {
  const match = String(value || '').match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersions(left, right) {
  const a = parseVersionParts(left);
  const b = parseVersionParts(right);
  if (!a || !b) return 0;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

/**
 * Homebrew's own "Already up-to-date" line must not hide a cask upgrade.
 *
 * @param {string} output - Combined brew stdout and stderr
 * @returns {'current' | 'upgraded' | 'unknown'}
 */
function classifyCaskUpgradeOutput(output) {
  const caskLines = String(output || '')
    .split('\n')
    .filter((line) => /gfe-portal-eu/i.test(line));
  const caskText = caskLines.join('\n');
  if (/not upgrading gfe-portal-eu|latest version is already installed|already installed and up-to-date/i.test(caskText)) {
    return 'current';
  }
  if (caskLines.some((line) => /->/.test(line) || /upgrading gfe-portal-eu/i.test(line))) {
    return 'upgraded';
  }
  return 'unknown';
}

function fetchLatestReleaseTag() {
  return new Promise((resolve) => {
    const request = https.get(
      'https://api.github.com/repos/GF-Elektro/Portal-App/releases/latest',
      {
        headers: {
          'User-Agent': 'GF-Portal-EU',
          Accept: 'application/vnd.github+json',
        },
      },
      (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(body).tag_name || '');
          } catch {
            resolve('');
          }
        });
      },
    );
    request.on('error', () => resolve(''));
    request.setTimeout(15000, () => {
      request.destroy();
      resolve('');
    });
  });
}

function caskLinesFrom(output) {
  return String(output || '')
    .split('\n')
    .filter((line) => /gfe-portal-eu/i.test(line))
    .join('\n')
    .trim();
}

let isCheckingForUpdate = false;

/**
 * Refreshes the GF-Elektro tap and installs a newer gfe-portal-eu cask.
 * A newer GitHub release that the tap has not published is reported as such.
 */
async function checkForBrewCaskUpdate() {
  const labels = getTrayLabels();
  if (isCheckingForUpdate) return;

  const brewPath = resolveBrewPath();
  if (!brewPath) {
    dialog.showMessageBox({
      type: 'warning',
      title: APP_NAME,
      message: labels.brewMissing,
      buttons: ['OK'],
    });
    return;
  }

  isCheckingForUpdate = true;
  void postOsNotification(APP_NAME, { body: labels.updating });

  try {
    await runBrew(brewPath, ['update', '--quiet']);
    const info = await runBrew(brewPath, ['info', '--cask', '--json=v2', 'gfe-portal-eu']);
    let caskVersion = '';
    try {
      const parsed = JSON.parse(info.stdout);
      caskVersion = parsed?.casks?.[0]?.version || '';
    } catch {
      caskVersion = '';
    }
    const installedVersion = app.getVersion();
    const latestTag = await fetchLatestReleaseTag();
    const releaseIsNewer = latestTag && compareVersions(latestTag, installedVersion) > 0;
    const caskIsNewer = caskVersion && compareVersions(caskVersion, installedVersion) > 0;

    if (!caskIsNewer) {
      if (releaseIsNewer && (!caskVersion || compareVersions(latestTag, caskVersion) > 0)) {
        dialog.showMessageBox({
          type: 'warning',
          title: APP_NAME,
          message: labels.updateFailed,
          detail: labels.updateTapBehind
            .replace('{latest}', latestTag.replace(/^v/, ''))
            .replace('{cask}', caskVersion || installedVersion),
          buttons: ['OK'],
        });
        return;
      }
      dialog.showMessageBox({
        type: 'info',
        title: APP_NAME,
        message: labels.updateLatest,
        detail: `${installedVersion}`,
        buttons: ['OK'],
      });
      return;
    }

    const upgrade = await runBrew(brewPath, ['upgrade', '--cask', 'gfe-portal-eu']);
    const status = classifyCaskUpgradeOutput(upgrade.output);
    if (upgrade.err && status !== 'upgraded') {
      dialog.showMessageBox({
        type: 'error',
        title: APP_NAME,
        message: labels.updateFailed,
        detail: caskLinesFrom(upgrade.output).slice(0, 800) || upgrade.err.message,
        buttons: ['OK'],
      });
      return;
    }

    const { response } = await dialog.showMessageBox({
      type: 'question',
      title: APP_NAME,
      message: labels.updateDone,
      detail: labels.relaunchPrompt,
      buttons: [labels.relaunch, labels.later],
      defaultId: 0,
      cancelId: 1,
    });
    if (response !== 0) return;
    isQuitting = true;
    execFile('/usr/bin/open', ['-a', 'G&F Portal EU'], () => {
      app.quit();
    });
  } finally {
    isCheckingForUpdate = false;
  }
}

// ── Create System Tray ──────────────────────────────────────
function buildTrayContextMenu() {
  const workArea = getTargetDisplay(mainWindow).workArea;
  const labels = getTrayLabels();
  const trayIconLabels = {
    'g-and-f': 'G&&F',
    gf: 'GF',
    spark: labels.bolt,
    'g-bolt-f': 'G⚡F',
  };

  const template = [
    {
      label: `Version ${app.getVersion()}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: labels.open,
      click: () => showWindowFromTray(),
    },
    {
      label: labels.reload,
      click: () => {
        showWindowFromTray();
        if (mainWindow) {
          mainWindow.webContents.reload();
        }
      },
    },
  ];

  if (process.platform === 'darwin' && !process.mas) {
    template.push({
      label: labels.checkForUpdate,
      click: () => checkForBrewCaskUpdate(),
    });
  }

  template.push(
    {
      label: labels.trayIcon,
      submenu: TRAY_ICON_PRESETS.map((preset) => ({
        label: trayIconLabels[preset.id],
        type: 'checkbox',
        checked: activeTrayIconPresetId === preset.id,
        click: () => applyTrayIcon(preset.id),
      })),
    },
    {
      label: labels.testNotification,
      click: () => showTestNotification(),
    },
    {
      label: labels.language,
      submenu: TRAY_LANGUAGES.map((language) => ({
        label: language.label,
        icon: getLanguageFlagIcon(language.id),
        type: 'checkbox',
        checked: activeTrayLanguageId === language.id,
        click: () => applyTrayLanguage(language.id),
      })),
    },
    {
      label: labels.windowSize,
      submenu: WINDOW_SIZE_PRESETS.map((preset) => ({
        label: formatPresetMenuLabel(preset, workArea, labels),
        type: 'checkbox',
        checked: activeWindowPresetId === preset.id,
        click: () => applyWindowSize(preset.id),
      })),
    },
    { type: 'separator' },
    {
      label: labels.quit,
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  );

  return Menu.buildFromTemplate(template);
}

function createTray() {
  tray = new Tray(getTrayIcon());

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
    tray.popUpContextMenu(buildTrayContextMenu());
  });

  // Double-click to always open (Windows)
  tray.on('double-click', () => showWindowFromTray());
}

// ── App Lifecycle ───────────────────────────────────────────
app.on('ready', () => {
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
  // Guard toast windows; auth popup close is attached via did-create-window
  if (childWindow === mainWindow || childWindow === customToast || isCreatingToast) return;
  childWindow.setMenu(null);
});

/**
 * Shows a one-time Windows dialog when microphone or camera access is denied at the OS level.
 *
 * @param {'microphone' | 'camera'} mediaType
 */
async function showMediaDeniedHintIfNeeded(mediaType) {
  if (process.platform !== 'win32') return;
  if (mediaDeniedDialogShown[mediaType]) return;
  mediaDeniedDialogShown[mediaType] = true;

  const isMic = mediaType === 'microphone';
  const result = await dialog.showMessageBox(mainWindow || undefined, {
    type: 'warning',
    title: APP_NAME,
    message: isMic ? 'Mikrofonzugriff ist blockiert' : 'Kamerazugriff ist blockiert',
    detail: isMic
      ? 'Windows hat den Mikrofonzugriff für diese App verweigert. Öffnen Sie die Datenschutzeinstellungen, um den Zugriff zu erlauben.'
      : 'Windows hat den Kamerazugriff für diese App verweigert. Öffnen Sie die Datenschutzeinstellungen, um den Zugriff zu erlauben.',
    buttons: ['Einstellungen öffnen', 'Abbrechen'],
    defaultId: 0,
    cancelId: 1,
  });

  if (result.response === 0) {
    shell.openExternal(isMic ? 'ms-settings:privacy-microphone' : 'ms-settings:privacy-webcam');
  }
}

/**
 * Resolves OS-level access for a single media device type (microphone or camera).
 *
 * @param {'microphone' | 'camera'} mediaType
 * @returns {Promise<boolean>}
 */
async function resolveOsMediaAccess(mediaType) {
  try {
    if (process.platform === 'darwin') {
      const status = systemPreferences.getMediaAccessStatus(mediaType);
      if (status === 'granted') return true;
      return systemPreferences.askForMediaAccess(mediaType);
    }

    if (process.platform === 'win32') {
      const status = systemPreferences.getMediaAccessStatus(mediaType);
      if ((mediaType === 'microphone' || mediaType === 'camera') && status === 'denied') {
        await showMediaDeniedHintIfNeeded(mediaType);
        return false;
      }
      return status !== 'denied';
    }
  } catch (error) {
    console.error(`[Main] Failed to resolve ${mediaType} access:`, error);
  }

  return true;
}

/**
 * Resolves OS-level microphone and camera access before granting Chromium `media`.
 *
 * @returns {Promise<boolean>} True when media access should be granted to the page
 */
async function resolveMediaDeviceAccess() {
  const micOk = await resolveOsMediaAccess('microphone');
  const cameraOk = await resolveOsMediaAccess('camera');
  return micOk && cameraOk;
}

// ── Permission Handling ─────────────────────────────────────
// Grant notification / media / geolocation permission requests from the web content
app.on('web-contents-created', (event, contents) => {
  contents.session.setPermissionRequestHandler(async (webContents, permission, callback) => {
    if (!ALLOWED_PERMISSIONS.includes(permission)) {
      callback(false);
      return;
    }

    if (permission === 'media') {
      const granted = await resolveMediaDeviceAccess();
      callback(granted);
      return;
    }

    callback(true);
  });

  // Auto-grant allowlisted permission checks
  contents.session.setPermissionCheckHandler((webContents, permission) => {
    return ALLOWED_PERMISSIONS.includes(permission);
  });
});
