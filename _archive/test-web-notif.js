const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => callback(true));

  win.loadURL('data:text/html,<html><body><script>new Notification("Web Notif Test", { body: "from web page" });</script></body></html>');
  
  setTimeout(() => app.quit(), 3000);
});
