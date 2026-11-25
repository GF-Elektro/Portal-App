import 'dart:async';
import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:file_picker/file_picker.dart' as fp;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher_string.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'portal_hosts.dart';

const portalAlertChannelId = 'gf_portal_alerts';
const portalAlertChannelName = 'G&F Portal EU';

Future<void> ensurePortalAlertChannel() async {
  final plugin = FlutterLocalNotificationsPlugin();
  const android = AndroidInitializationSettings('@mipmap/ic_launcher');
  await plugin.initialize(const InitializationSettings(android: android));
  final androidPlugin = plugin.resolvePlatformSpecificImplementation<
      AndroidFlutterLocalNotificationsPlugin>();
  await androidPlugin?.createNotificationChannel(
    const AndroidNotificationChannel(
      portalAlertChannelId,
      portalAlertChannelName,
      description: 'Chat and portal alerts',
      importance: Importance.high,
    ),
  );
}

class PortalWebViewScreen extends StatefulWidget {
  const PortalWebViewScreen({super.key});

  @override
  State<PortalWebViewScreen> createState() => _PortalWebViewScreenState();
}

class _PortalWebViewScreenState extends State<PortalWebViewScreen> {
  late final WebViewController _controller;
  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();
  String? _fcmToken;
  StreamSubscription<String>? _tokenRefreshSub;
  StreamSubscription<RemoteMessage>? _openedSub;
  Future<void>? _messagingInit;
  String? _pendingClickPayload;
  bool _pageReady = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) => unawaited(_leaveWebViewIfExternal(url)),
          onPageFinished: (_) => unawaited(_onPageFinished()),
        ),
      )
      ..addJavaScriptChannel(
        'portalNative',
        onMessageReceived: _onPortalNativeMessage,
      );
    unawaited(_startPortal());
  }

  @override
  void dispose() {
    _tokenRefreshSub?.cancel();
    _openedSub?.cancel();
    super.dispose();
  }

  Future<void> _startPortal() async {
    await _initNotifications();
    await _initFirebaseMessaging();
    try {
      final current = await _controller.getUserAgent();
      final base = current ?? '';
      if (!base.contains('GFPortalShell/')) {
        await _controller.setUserAgent('$base GFPortalShell/android');
      }
    } catch (_) {}
    await _configureAndroid();
    await _controller.loadRequest(Uri.parse(PortalHosts.portalUrl));
  }

  Future<void> _initFirebaseMessaging() {
    return _messagingInit ??= _initFirebaseMessagingOnce();
  }

  Future<void> _initFirebaseMessagingOnce() async {
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp();
      }
      await Permission.notification.request();
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();
      _fcmToken = await messaging.getToken();
      _tokenRefreshSub ??= messaging.onTokenRefresh.listen((token) {
        _fcmToken = token;
        unawaited(_signalPushReady());
      });
      final initial = await messaging.getInitialMessage();
      if (initial != null) _queueRemoteMessage(initial);
      _openedSub ??= FirebaseMessaging.onMessageOpenedApp.listen(_queueRemoteMessage);
    } catch (_) {
      _fcmToken = null;
      _messagingInit = null;
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
        portalAlertChannelId,
        portalAlertChannelName,
        description: 'Chat and portal alerts',
        importance: Importance.high,
      ),
    );
    final launch = await _notifications.getNotificationAppLaunchDetails();
    final launchPayload = launch?.notificationResponse?.payload;
    if (launch?.didNotificationLaunchApp == true &&
        launchPayload != null &&
        launchPayload.isNotEmpty) {
      _queueClickPayload(launchPayload);
    }
  }

  void _queueRemoteMessage(RemoteMessage message) {
    final data = message.data;
    if (data.isEmpty) return;
    _queueClickPayload(jsonEncode({
      'id': data['id'] ?? '',
      'tag': data['tag'] ?? '',
      'data': data,
    }));
  }

  void _queueClickPayload(String payload) {
    if (!_pageReady) {
      _pendingClickPayload = payload;
      return;
    }
    unawaited(_runClickPayload(payload));
  }

  Future<void> _runClickPayload(String payload) async {
    final literal = jsonEncode(payload);
    await _controller.runJavaScript('''
      (function(){
        var detail = JSON.parse($literal);
        try { sessionStorage.setItem('gf-pending-notification', JSON.stringify(detail)); } catch (e) {}
        window.dispatchEvent(new CustomEvent('portal-notification-clicked', { detail: detail }));
      })();
    ''');
  }

  void _onNotificationTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload == null || payload.isEmpty) return;
    _queueClickPayload(payload);
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

  Future<void> _signalPushReady() async {
    try {
      await _controller.runJavaScript(
        "window.dispatchEvent(new Event('portal-native-ready'));",
      );
    } catch (_) {}
  }

  /// Opens ordinary links in the system browser without rewriting the URL.
  ///
  /// Google's SetSID redirect carries an encoded `continue` value. Passing
  /// that URL through `Uri.parse().toString()` (which `onNavigationRequest`
  /// does on Android) decodes `%26` into `&` and Chrome answers with HTTP 400.
  /// In-app pages, including `accounts.google.<country>`, load untouched.
  Future<void> _leaveWebViewIfExternal(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null || PortalHosts.shouldKeepInApp(uri)) return;
    if (uri.scheme != 'http' && uri.scheme != 'https') return;
    if (await _controller.canGoBack()) {
      await _controller.goBack();
    }
    await launchUrlString(url, mode: LaunchMode.externalApplication);
  }

  Future<void> _onPageFinished() async {
    await _injectScripts();
    _pageReady = true;
    final pending = _pendingClickPayload;
    _pendingClickPayload = null;
    if (pending != null && pending.isNotEmpty) {
      await _runClickPayload(pending);
    }
  }

  Future<void> _injectScripts() async {
    final bridge = await rootBundle.loadString('assets/portal-native-bridge.js');
    await _controller.runJavaScript(_portalApiPrelude());
    await _controller.runJavaScript(bridge);
    await _signalPushReady();
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
    final request = jsonEncode(requestId);
    final value = jsonEncode(status);
    await _controller.runJavaScript(
      '(function(){var resolvers=window.__portalNativeResolvers||{};var resolve=resolvers[$request];if(resolve){resolve($value);delete resolvers[$request];}})();',
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
            portalAlertChannelId,
            portalAlertChannelName,
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
