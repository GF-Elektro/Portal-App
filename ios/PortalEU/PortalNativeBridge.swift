import FirebaseCore
import FirebaseMessaging
import Foundation
import UserNotifications
import WebKit

/// Bridges `window.portalNativeAPI` in the WKWebView to UNUserNotificationCenter.
final class PortalNativeBridge: NSObject, UNUserNotificationCenterDelegate, WKScriptMessageHandler {
    static let shared = PortalNativeBridge()

    private weak var webView: WKWebView?
    private let handlerName = "portalNative"

    private override init() {
        super.init()
    }

    func attach(to webView: WKWebView, userContentController: WKUserContentController) {
        self.webView = webView
        userContentController.removeScriptMessageHandler(forName: handlerName)
        userContentController.add(self, name: handlerName)
    }

    static func portalAPIPreludeScript() -> String {
        """
        (function() {
          function post(action, payload) {
            if (!window.webkit || !window.webkit.messageHandlers.portalNative) return;
            window.webkit.messageHandlers.portalNative.postMessage(Object.assign({ action: action }, payload || {}));
          }
          window.portalNativeAPI = {
            platform: 'ios',
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
                  window.__portalNativeResolvers[id] = function(value) { resolve(value ? value : null); };
                  post('getNativeToken', { requestId: id });
                });
              }
            }
          };

          // Forward web console and uncaught errors to native logs
          var _origLog = console.log, _origWarn = console.warn, _origError = console.error;
          function formatArg(x) {
            if (x instanceof Error) return (x.stack || x.message);
            if (typeof x === 'object' && x !== null) {
              try { return JSON.stringify(x); } catch(e) { return String(x); }
            }
            return String(x);
          }
          console.log = function() {
            var str = Array.prototype.slice.call(arguments).map(formatArg).join(' ');
            post('log', { level: 'LOG', message: str, url: location.href });
            _origLog.apply(console, arguments);
          };
          console.warn = function() {
            var str = Array.prototype.slice.call(arguments).map(formatArg).join(' ');
            post('log', { level: 'WARN', message: str, url: location.href });
            _origWarn.apply(console, arguments);
          };
          console.error = function() {
            var str = Array.prototype.slice.call(arguments).map(formatArg).join(' ');
            post('log', { level: 'ERROR', message: str, url: location.href });
            _origError.apply(console, arguments);
          };
          window.addEventListener('error', function(e) {
            post('log', { level: 'UNCAUGHT', message: e.message + ' at ' + e.filename + ':' + e.lineno, url: location.href });
          });
          window.addEventListener('unhandledrejection', function(e) {
            var r = e.reason;
            post('log', { level: 'UNHANDLED_REJECTION', message: r ? (r.stack || r.message || String(r)) : 'unknown', url: location.href });
          });
        })();
        """
    }

    static func loadBridgeScript() -> String? {
        let candidates = [
            Bundle.main.url(forResource: "portal-native-bridge", withExtension: "js"),
            Bundle.main.url(forResource: "portal-native-bridge", withExtension: "js", subdirectory: "PortalEU"),
        ]
        for url in candidates {
            if let url, let data = try? Data(contentsOf: url), let text = String(data: data, encoding: .utf8) {
                return text
            }
        }
        return nil
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == handlerName,
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }

        switch action {
        case "show":
            let title = body["title"] as? String ?? "G&F Portal EU"
            let options = body["options"] as? [String: Any] ?? [:]
            let requestId = body["requestId"] as? String ?? ""
            showLocalNotification(title: title, options: options, requestId: requestId)
        case "requestPermission":
            let requestId = body["requestId"] as? String ?? ""
            requestAuthorization(requestId: requestId)
        case "checkPermission":
            let requestId = body["requestId"] as? String ?? ""
            resolvePermissionStatus(requestId: requestId)
        case "getNativeToken":
            let requestId = body["requestId"] as? String ?? ""
            resolveNativeToken(requestId: requestId)
        case "log":
            let level = body["level"] as? String ?? "LOG"
            let message = body["message"] as? String ?? ""
            let url = body["url"] as? String ?? ""
            print("[PORTAL-WEB][\(level)][\(url)] \(message)")
        default:
            break
        }
    }

    private func resolveNativeToken(requestId: String) {
        guard FirebaseApp.app() != nil else {
            completeResolver(requestId: requestId, value: "")
            return
        }
        Messaging.messaging().token { token, _ in
            self.completeResolver(requestId: requestId, value: token ?? "")
        }
    }

    private func requestAuthorization(requestId: String) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            let status = granted ? "granted" : "denied"
            self.completeResolver(requestId: requestId, value: status)
        }
    }

    private func resolvePermissionStatus(requestId: String) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let status: String
            switch settings.authorizationStatus {
            case .authorized, .provisional, .ephemeral:
                status = "granted"
            case .denied:
                status = "denied"
            default:
                status = "default"
            }
            self.completeResolver(requestId: requestId, value: status)
        }
    }

    private func completeResolver(requestId: String, value: String) {
        guard !requestId.isEmpty, let webView else { return }
        let requestLiteral = jsonLiteral(requestId)
        let valueLiteral = jsonLiteral(value)
        let script = """
        (function() {
          var resolvers = window.__portalNativeResolvers || {};
          var resolve = resolvers[\(requestLiteral)];
          if (resolve) { resolve(\(valueLiteral)); delete resolvers[\(requestLiteral)]; }
        })();
        """
        DispatchQueue.main.async {
            webView.evaluateJavaScript(script, completionHandler: nil)
        }
    }

    private func jsonLiteral(_ value: String) -> String {
        guard let data = try? JSONEncoder().encode(value),
              let text = String(data: data, encoding: .utf8) else {
            return "\"\""
        }
        return text
    }

    private func showLocalNotification(title: String, options: [String: Any], requestId: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        if let body = options["body"] as? String {
            content.body = body
        } else if let message = options["message"] as? String {
            content.body = message
        }
        content.sound = .default
        if let tag = options["tag"] as? String {
            content.threadIdentifier = tag
        }
        let notificationId = (options["id"] as? String) ?? UUID().uuidString
        var userInfo: [AnyHashable: Any] = ["id": notificationId]
        if let tag = options["tag"] as? String { userInfo["tag"] = tag }
        if let data = options["data"] as? [String: Any] {
            userInfo["data"] = data
        }
        content.userInfo = userInfo

        let request = UNNotificationRequest(identifier: notificationId, content: content, trigger: nil)
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let allowed: Bool
            switch settings.authorizationStatus {
            case .authorized, .provisional, .ephemeral:
                allowed = true
            default:
                allowed = false
            }
            if !allowed {
                self.completeResolver(requestId: requestId, value: "rejected")
                return
            }
            UNUserNotificationCenter.current().add(request) { error in
                let value = error == nil ? "accepted" : "rejected"
                self.completeResolver(requestId: requestId, value: value)
            }
        }
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound, .badge])
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        let id = userInfo["id"] as? String ?? ""
        let tag = userInfo["tag"] as? String ?? ""
        let data = userInfo["data"] ?? [:]
        forwardClickToWeb(id: id, tag: tag, data: data)
        completionHandler()
    }

    private func forwardClickToWeb(id: String, tag: String, data: Any) {
        guard let webView else { return }
        let payload: [String: Any] = ["id": id, "tag": tag, "data": data]
        guard let jsonData = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: jsonData, encoding: .utf8) else { return }
        let script = "window.dispatchEvent(new CustomEvent('portal-notification-clicked', { detail: \(json) }));"
        DispatchQueue.main.async {
            webView.evaluateJavaScript(script, completionHandler: nil)
        }
    }
}
