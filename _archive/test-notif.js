const { app, Notification } = require('electron');
app.whenReady().then(() => {
  console.log("Is supported?", Notification.isSupported());
  const notif = new Notification({ title: 'Test', body: 'Works' });
  notif.on('show', () => console.log('Shown'));
  notif.on('failed', (e, err) => console.log('Failed', err));
  notif.show();
  setTimeout(() => app.quit(), 2000);
});
