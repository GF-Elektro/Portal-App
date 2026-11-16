import 'package:flutter_test/flutter_test.dart';
import 'package:portal_android/portal_hosts.dart';

void main() {
  test('portal shell loads the hosted portal', () {
    expect(PortalHosts.portalUrl, 'https://portal.gfelektro.com');
    expect(
      PortalHosts.shouldKeepInApp(Uri.parse('https://portal.gfelektro.com/app')),
      isTrue,
    );
    expect(
      PortalHosts.shouldKeepInApp(Uri.parse('https://example.com')),
      isFalse,
    );
  });
}
