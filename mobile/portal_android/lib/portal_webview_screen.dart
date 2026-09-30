import 'package:file_picker/file_picker.dart' as fp;
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'portal_hosts.dart';

class PortalWebViewScreen extends StatefulWidget {
  const PortalWebViewScreen({super.key});

  @override
  State<PortalWebViewScreen> createState() => _PortalWebViewScreenState();
}

class _PortalWebViewScreenState extends State<PortalWebViewScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            final uri = Uri.tryParse(request.url);
            if (uri == null) return NavigationDecision.prevent;
            if (PortalHosts.shouldKeepInApp(uri)) {
              return NavigationDecision.navigate;
            }
            if (uri.scheme == 'http' || uri.scheme == 'https') {
              launchUrl(uri, mode: LaunchMode.externalApplication);
            }
            return NavigationDecision.prevent;
          },
        ),
      )
      ..loadRequest(Uri.parse(PortalHosts.portalUrl));

    _configureAndroid();
  }

  Future<void> _configureAndroid() async {
    final webPlatform = _controller.platform;
    if (webPlatform is AndroidWebViewController) {
      await webPlatform.setMediaPlaybackRequiresUserGesture(false);
      await webPlatform.setOnPlatformPermissionRequest((request) async {
        await request.grant();
      });
      await webPlatform.setOnShowFileSelector((params) async {
        final files = await fp.FilePicker.pickFiles(
          type: fp.FileType.image,
        );
        return files
            .map((file) => file.path)
            .whereType<String>()
            .toList();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: _controller)),
    );
  }
}
