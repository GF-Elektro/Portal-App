/** Same contract as the Android shell, with platform set to harmony. */
export const PORTAL_API_PRELUDE: string = `
(function() {
  function post(action, payload) {
    if (!window.portalNative || !window.portalNative.postMessage) return;
    window.portalNative.postMessage(JSON.stringify(Object.assign({ action: action }, payload || {})));
  }
  window.portalNativeAPI = {
    platform: 'harmony',
    isNativeShell: true,
    notifications: {
      requestPermission: function() {
        return new Promise(function(resolve) {
          var id = 'p' + Math.random().toString(36).slice(2);
          window.__portalNativeResolvers = window.__portalNativeResolvers || {};
          window.__portalNativeResolvers[id] = resolve;
          post('requestPermission', { requestId: id });
        });
      },
      checkPermission: function() {
        return new Promise(function(resolve) {
          var id = 'c' + Math.random().toString(36).slice(2);
          window.__portalNativeResolvers = window.__portalNativeResolvers || {};
          window.__portalNativeResolvers[id] = resolve;
          post('checkPermission', { requestId: id });
        });
      },
      show: function(title, options) {
        post('show', { title: title || '', options: options || {} });
      }
    },
    push: {
      getNativeToken: function() { return Promise.resolve(null); }
    }
  };
})();
`;
