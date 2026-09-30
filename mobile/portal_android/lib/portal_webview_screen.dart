import 'dart:convert';

import 'package:file_picker/file_picker.dart' as fp;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
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
  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();
  static const _channelId = 'gf_portal_alerts';
  static const _channelName = 'G&F Portal EU';
  bool _scriptsInjected = false;

  @override
  void initState() {
    super.initState();
    _initNotifications();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) => _injectScriptsOnce(),
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
      ..addJavaScriptChannel(
        'portalNative',
        onMessageReceived: _onPortalNativeMessage,
      )
      ..loadRequest(Uri.parse(PortalHosts.portalUrl));

    _configureAndroid();
  }

  Future<void> _initNotifications() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    await _notifications.initialize(
      const InitializationSettings(android: android),
      onDidReceiveNotificationResponse: _onNotificationTap,
    );
    final plugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await plugin?.createNotificationChannel(
      const AndroidNotificationChannel(
        _channelId,
        _channelName,
        description: 'Chat and portal alerts',
        importance: Importance.high,
      ),
    );
  }

  void _onNotificationTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload == null || payload.isEmpty) return;
    _controller.runJavaScript(
      "window.dispatchEvent(new CustomEvent('portal-notification-clicked', { detail: JSON.parse(${jsonEncode(payload)}) }));",
    );
  }

  Future<void> _configureAndroid() async {
    final webPlatform = _controller.platform;
    if (webPlatform is AndroidWebViewController) {
      await webPlatform.setMediaPlaybackRequiresUserGesture(false);
      await webPlatform.setOnPlatformPermissionRequest((request) async {
        await request.grant();
      });
      await webPlatform.setOnShowFileSelector((params) async {
        final files = await fp.FilePicker.pickFiles(type: fp.FileType.image);
        return files.map((file) => file.path).whereType<String>().toList();
      });
    }
  }

  String _portalApiPrelude() {
    return '''
(function() {
  function post(action, payload) {
    if (!window.portalNative || !window.portalNative.postMessage) return;
    window.portalNative.postMessage(JSON.stringify(Object.assign({ action: action }, payload || {})));
  }
  window.portalNativeAPI = {
    platform: 'android',
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
''';
  }

  Future<void> _injectScriptsOnce() async {
    if (_scriptsInjected) return;
    _scriptsInjected = true;
    final bridge = await rootBundle.loadString('assets/portal-native-bridge.js');
    await _controller.runJavaScript(_portalApiPrelude());
    await _controller.runJavaScript(bridge);
  }

  void _onPortalNativeMessage(JavaScriptMessage message) {
    final dynamic decoded = jsonDecode(message.message);
    if (decoded is! Map) return;
    final action = decoded['action'] as String?;
    switch (action) {
      case 'show':
        _showNotification(
          decoded['title'] as String? ?? 'G&F Portal EU',
          Map<String, dynamic>.from(decoded['options'] as Map? ?? {}),
        );
      case 'requestPermission':
      case 'checkPermission':
        _resolvePermission(
          decoded['requestId'] as String? ?? '',
          status: 'granted',
        );
    }
  }

  Future<void> _resolvePermission(String requestId, {required String status}) async {
    if (requestId.isEmpty) return;
    await _controller.runJavaScript(
      "window.__portalNativeResolvers && window.__portalNativeResolvers['$requestId'] && window.__portalNativeResolvers['$requestId']('$status'); delete window.__portalNativeResolvers['$requestId'];",
    );
  }

  Future<void> _showNotification(String title, Map<String, dynamic> options) async {
    final body = (options['body'] ?? options['message'] ?? '') as String;
    final id = (options['id'] as String?) ?? DateTime.now().millisecondsSinceEpoch.toString();
    final tag = options['tag'] as String?;
    final payload = jsonEncode({
      'id': id,
      'tag': tag,
      'data': options['data'],
    });
    await _notifications.show(
      id.hashCode,
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          _channelId,
          _channelName,
          channelDescription: 'Portal alerts',
          importance: Importance.high,
          priority: Priority.high,
        ),
      ),
      payload: payload,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: _controller)),
    );
  }
}
