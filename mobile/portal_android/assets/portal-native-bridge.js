/**
 * Injected at document start in iOS/Android WKWebView shells.
 * Requires window.portalNativeAPI (defined by native code before this runs).
 * No-op when portalNativeAPI is missing.
 */
(function () {
  'use strict';

  if (!window.portalNativeAPI || !window.portalNativeAPI.notifications) {
    return;
  }

  const native = window.portalNativeAPI.notifications;
  const activeNotifications = new Map();
  let cachedPermission = 'default';

  function syncPermissionFromNative() {
    if (typeof native.checkPermission === 'function') {
      return Promise.resolve(native.checkPermission()).then((result) => {
        cachedPermission = result || 'default';
        return cachedPermission;
      });
    }
    return Promise.resolve(cachedPermission);
  }

  class NativeShellNotification extends window.EventTarget {
    constructor(title, options) {
      super();
      this.id = Math.random().toString(36).substr(2, 9);
      this.title = title;
      this.options = options || {};
      this.onclick = null;
      this.onclose = null;
      this.onerror = null;
      this.onshow = null;

      activeNotifications.set(this.id, this);
      native.show(title, { ...this.options, id: this.id });

      setTimeout(() => {
        this.dispatchEvent(new Event('show'));
        if (typeof this.onshow === 'function') this.onshow(new Event('show'));
      }, 50);
    }

    static get permission() {
      return cachedPermission === 'granted' ? 'granted' : cachedPermission;
    }

    static requestPermission(callback) {
      const promise = typeof native.requestPermission === 'function'
        ? Promise.resolve(native.requestPermission())
        : Promise.resolve('denied');
      promise.then((result) => {
        cachedPermission = result || 'denied';
        return cachedPermission;
      });
      if (callback) promise.then((result) => callback(result));
      return promise;
    }

    close() {
      activeNotifications.delete(this.id);
      this.dispatchEvent(new Event('close'));
      if (typeof this.onclose === 'function') this.onclose(new Event('close'));
    }
  }

  window.Notification = NativeShellNotification;
  void syncPermissionFromNative();

  window.addEventListener('portal-notification-clicked', (event) => {
    const data = event.detail;
    if (data && data.id) {
      const notif = activeNotifications.get(data.id);
      if (notif) {
        const clickEvent = new Event('click');
        notif.dispatchEvent(clickEvent);
        if (typeof notif.onclick === 'function') notif.onclick(clickEvent);
        activeNotifications.delete(data.id);
      }
    }
  });

  if ('ServiceWorkerRegistration' in window) {
    ServiceWorkerRegistration.prototype.showNotification = async function (title, options = {}) {
      const id = Math.random().toString(36).substr(2, 9);
      native.show(title, { ...options, id });
    };
  }
})();
