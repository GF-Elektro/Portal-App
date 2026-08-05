// Quick smoke: Electron API must resolve in the main process.
const { app } = require('electron');

if (!app || typeof app.requestSingleInstanceLock !== 'function') {
  console.error('SMOKE_FAIL: electron.app unavailable', {
    type: typeof app,
    processType: process.type,
    electron: process.versions.electron,
    runAsNode: process.env.ELECTRON_RUN_AS_NODE || null,
  });
  process.exit(1);
}

console.log('SMOKE_OK', process.versions.electron, process.type);
app.whenReady().then(() => app.quit());
