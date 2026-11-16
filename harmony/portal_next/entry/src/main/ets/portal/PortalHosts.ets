/**
 * URL policy aligned with mobile/portal_android/lib/portal_hosts.dart and src/main.js.
 */
export class PortalHosts {
  static readonly portalUrl: string = 'https://portal.gfelektro.com';
  // ArkWeb's default UA is often rejected by Google sign-in. Use a mobile Chrome UA.
  static readonly userAgent: string =
    'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';

  private static readonly hosts: string[] = [
    'portal.gfelektro.com',
    'gfelektro.com',
    'accounts.google.com',
    'accounts.youtube.com',
    'apis.google.com'
  ];

  private static readonly suffixes: string[] = [
    '.googleapis.com',
    '.gstatic.com',
    '.firebaseapp.com',
    '.firebaseauth.com'
  ];

  static shouldKeepInApp(raw: string): boolean {
    const scheme = PortalHosts.schemeOf(raw);
    if (scheme === 'about' || scheme === 'blob') {
      return true;
    }
    if (scheme !== 'https') {
      return false;
    }
    const host = PortalHosts.hostOf(raw);
    for (let i = 0; i < PortalHosts.hosts.length; i++) {
      if (host === PortalHosts.hosts[i]) {
        return true;
      }
    }
    for (let i = 0; i < PortalHosts.suffixes.length; i++) {
      if (host.endsWith(PortalHosts.suffixes[i])) {
        return true;
      }
    }
    return false;
  }

  static isWebScheme(raw: string): boolean {
    const scheme = PortalHosts.schemeOf(raw);
    return scheme === 'http' || scheme === 'https';
  }

  private static schemeOf(raw: string): string {
    const lower = raw.toLowerCase();
    const end = lower.indexOf(':');
    if (end <= 0) {
      return '';
    }
    return lower.substring(0, end);
  }

  private static hostOf(raw: string): string {
    const lower = raw.toLowerCase();
    const schemeEnd = lower.indexOf('://');
    if (schemeEnd < 0) {
      return '';
    }
    let start = schemeEnd + 3;
    let end = lower.length;
    const slash = lower.indexOf('/', start);
    if (slash >= 0) {
      end = slash;
    }
    let host = lower.substring(start, end);
    const at = host.indexOf('@');
    if (at >= 0) {
      host = host.substring(at + 1);
    }
    const colon = host.indexOf(':');
    if (colon >= 0) {
      host = host.substring(0, colon);
    }
    return host;
  }
}
