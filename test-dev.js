const { app, BrowserWindow, nativeImage } = require('electron');
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
  win.webContents.openDevTools();
  win.loadURL('https://portal.gfelektro.com');
  setTimeout(() => app.quit(), 15000); // quit after 15s to check console
});
