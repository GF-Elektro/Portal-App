const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 36,
    height: 36,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: { offscreen: true }
  });
  
  // HTML with a transparent background and large GF typography
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html>
      <body style="margin:0; padding:0; background: transparent; display: flex; align-items: center; justify-content: center; height: 100vh; overflow:hidden;">
        <div style="font-family: '-apple-system', sans-serif; font-weight: 900; font-size: 24px; color: black; letter-spacing: -1px;">
          GF
        </div>
      </body>
    </html>
  `));
  
  // Wait a small moment to ensure font rendering
  await new Promise(r => setTimeout(r, 500));
  
  const image = await win.webContents.capturePage();
  const PNGPath = path.join(__dirname, '../build/mac-tray-iconTemplate.png');
  fs.writeFileSync(PNGPath, image.toPNG());
  
  console.log('Successfully generated macOS tray icon template at:', PNGPath);
  app.quit();
});
