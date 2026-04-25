const { app, BrowserWindow } = require('electron');
let win = null;
app.on('browser-window-created', (e, cw) => {
  console.log("created event: win is", win === null ? "null" : typeof win);
});
app.whenReady().then(() => {
  win = new BrowserWindow({width:100, height:100});
  console.log("after constructor: win is", typeof win);
  app.quit();
});
