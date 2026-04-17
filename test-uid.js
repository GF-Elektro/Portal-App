const { app, BrowserWindow } = require('electron');
const path = require('path');
app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      notifications: true,
    }
  });
  
  win.webContents.on('console-message', (e, level, msg) => console.log('UI:', msg));
  
  win.loadURL('data:text/html,<html><body><h1>Test</h1><script>setTimeout(async () => { try { ServiceWorkerRegistration.prototype.showNotification("Title"); console.log("Did Notif"); } catch(e) { console.log("Notif error", e); } }, 1000);</script></body></html>');
  setTimeout(() => app.quit(), 3000);
});
