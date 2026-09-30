/// URL policy aligned with ios/PortalEU/PortalWebView.swift and src/main.js.
class PortalHosts {
  static const portalUrl = 'https://portal.gfelektro.com';

  static const portalHosts = {'portal.gfelektro.com', 'gfelektro.com'};

  static const authHosts = {
    'accounts.google.com',
    'accounts.youtube.com',
    'apis.google.com',
  };

  static const authSuffixes = [
    '.googleapis.com',
    '.gstatic.com',
    '.firebaseapp.com',
    '.firebaseauth.com',
  ];

  static bool shouldKeepInApp(Uri url) {
    final scheme = url.scheme.toLowerCase();
    if (scheme == 'about' || scheme == 'blob') return true;
    if (scheme != 'https') return false;
    final host = url.host.toLowerCase();
    if (portalHosts.contains(host) || authHosts.contains(host)) return true;
    return authSuffixes.any(host.endsWith);
  }
}
