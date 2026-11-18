import 'dart:async';
import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:file_picker/file_picker.dart' as fp;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
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
  String? _fcmToken;

  @override
  void initState() {
    super.initState();
    _initNotifications();
    unawaited(_initFirebaseMessaging());
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

  Future<void> _initFirebaseMessaging() async {
    try {
      await Firebase.initializeApp();
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();
      _fcmToken = await messaging.getToken();
    } catch (_) {
      _fcmToken = null;
    }
  }

  Future<void> _resolveNativeToken(String requestId) async {
    if (_fcmToken == null) {
      await _initFirebaseMessaging();
    }
    await _resolvePermission(requestId, status: _fcmToken ?? '');
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
      await webPlatform.setGeolocationEnabled(true);
      await webPlatform.setOnPlatformPermissionRequest((request) {
        unawaited(_onPlatformPermissionRequest(request));
      });
      await webPlatform.setGeolocationPermissionsPromptCallbacks(
        onShowPrompt: _onGeolocationPrompt,
      );
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
        return new Promise(function(resolve) {
          var id = 's' + Math.random().toString(36).slice(2);
          window.__portalNativeResolvers = window.__portalNativeResolvers || {};
          window.__portalNativeResolvers[id] = resolve;
          post('show', { title: title || '', options: options || {}, requestId: id });
        });
      }
    },
    push: {
      getNativeToken: function() {
        return new Promise(function(resolve) {
          var id = 't' + Math.random().toString(36).slice(2);
          window.__portalNativeResolvers = window.__portalNativeResolvers || {};
          window.__portalNativeResolvers[id] = function(value) { resolve(value || null); };
          post('getNativeToken', { requestId: id });
        });
      }
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
        unawaited(_showNotification(
          decoded['title'] as String? ?? 'G&F Portal EU',
          Map<String, dynamic>.from(decoded['options'] as Map? ?? {}),
          decoded['requestId'] as String? ?? '',
        ));
      case 'requestPermission':
        unawaited(_resolveNotificationPermission(
          decoded['requestId'] as String? ?? '',
          request: true,
        ));
      case 'checkPermission':
        unawaited(_resolveNotificationPermission(
          decoded['requestId'] as String? ?? '',
          request: false,
        ));
      case 'getNativeToken':
        unawaited(_resolveNativeToken(decoded['requestId'] as String? ?? ''));
    }
  }

  Future<void> _onPlatformPermissionRequest(
    PlatformWebViewPermissionRequest request,
  ) async {
    final current = await _controller.currentUrl();
    final uri = current == null ? null : Uri.tryParse(current);
    if (uri == null || !PortalHosts.shouldKeepInApp(uri)) {
      await request.deny();
      return;
    }
    final needed = <Permission>[];
    for (final type in request.types) {
      if (type == WebViewPermissionResourceType.camera) {
        needed.add(Permission.camera);
      } else if (type == WebViewPermissionResourceType.microphone) {
        needed.add(Permission.microphone);
      } else {
        await request.deny();
        return;
      }
    }
    for (final permission in needed) {
      final status = await permission.request();
      if (!status.isGranted) {
        await request.deny();
        return;
      }
    }
    await request.grant();
  }

  Future<GeolocationPermissionsResponse> _onGeolocationPrompt(
    GeolocationPermissionsRequestParams request,
  ) async {
    final uri = Uri.tryParse(request.origin);
    if (uri == null || !PortalHosts.shouldKeepInApp(uri)) {
      return const GeolocationPermissionsResponse(allow: false, retain: false);
    }
    final status = await Permission.location.request();
    final granted = status.isGranted;
    return GeolocationPermissionsResponse(allow: granted, retain: granted);
  }

  Future<void> _resolveNotificationPermission(
    String requestId, {
    required bool request,
  }) async {
    final status = request
        ? await Permission.notification.request()
        : await Permission.notification.status;
    await _resolvePermission(
      requestId,
      status: status.isGranted ? 'granted' : 'denied',
    );
  }

  Future<void> _resolvePermission(String requestId, {required String status}) async {
    if (requestId.isEmpty) return;
    await _controller.runJavaScript(
      "window.__portalNativeResolvers && window.__portalNativeResolvers['$requestId'] && window.__portalNativeResolvers['$requestId']('$status'); delete window.__portalNativeResolvers['$requestId'];",
    );
  }

  Future<void> _showNotification(
    String title,
    Map<String, dynamic> options,
    String requestId,
  ) async {
    final status = await Permission.notification.status;
    if (!status.isGranted) {
      await _resolvePermission(requestId, status: 'rejected');
      return;
    }
    final body = (options['body'] ?? options['message'] ?? '') as String;
    final id = (options['id'] as String?) ?? DateTime.now().millisecondsSinceEpoch.toString();
    final tag = options['tag'] as String?;
    final payload = jsonEncode({
      'id': id,
      'tag': tag,
      'data': options['data'],
    });
    try {
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
      await _resolvePermission(requestId, status: 'accepted');
    } catch (_) {
      await _resolvePermission(requestId, status: 'rejected');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: _controller)),
    );
  }
}
