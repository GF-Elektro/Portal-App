import SwiftUI
import WebKit

/// WKWebView shell for the hosted portal. Auth and Google hosts stay inside the view;
/// other links open in Safari. Non-previewable responses (for example PDFs) download
/// into the app Documents directory.
struct PortalWebView: UIViewRepresentable {
    let url: URL

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true

        let userContent = configuration.userContentController
        let prelude = WKUserScript(
            source: PortalNativeBridge.portalAPIPreludeScript(),
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        userContent.addUserScript(prelude)
        if let bridgeSource = PortalNativeBridge.loadBridgeScript() {
            let bridge = WKUserScript(
                source: bridgeSource,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true
            )
            userContent.addUserScript(bridge)
        }

        let webView = WKWebView(frame: .zero, configuration: configuration)
        PortalNativeBridge.shared.attach(to: webView, userContentController: userContent)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate {
        private let portalHosts: Set<String> = [
            "portal.gfelektro.com",
            "gfelektro.com",
        ]
        private let authHosts: Set<String> = [
            "accounts.google.com",
            "accounts.youtube.com",
            "apis.google.com",
        ]
        private let authSuffixes = [
            ".googleapis.com",
            ".gstatic.com",
            ".firebaseapp.com",
            ".firebaseauth.com",
        ]

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            preferences: WKWebpagePreferences,
            decisionHandler: @escaping (WKNavigationActionPolicy, WKWebpagePreferences) -> Void
        ) {
            guard let target = navigationAction.request.url else {
                decisionHandler(.cancel, preferences)
                return
            }
            if shouldKeepInApp(target) {
                decisionHandler(.allow, preferences)
                return
            }
            if navigationAction.navigationType == .linkActivated || navigationAction.targetFrame == nil {
                UIApplication.shared.open(target)
            }
            decisionHandler(.cancel, preferences)
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationResponse: WKNavigationResponse,
            decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void
        ) {
            if navigationResponse.canShowMIMEType {
                decisionHandler(.allow)
            } else {
                decisionHandler(.download)
            }
        }

        func webView(
            _ webView: WKWebView,
            navigationAction: WKNavigationAction,
            didBecome download: WKDownload
        ) {
            download.delegate = self
        }

        func webView(
            _ webView: WKWebView,
            navigationResponse: WKNavigationResponse,
            didBecome download: WKDownload
        ) {
            download.delegate = self
        }

        func download(
            _ download: WKDownload,
            decideDestinationUsing response: URLResponse,
            suggestedFilename: String,
            completionHandler: @escaping (URL?) -> Void
        ) {
            let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
            let safeName = suggestedFilename.isEmpty ? "download.bin" : suggestedFilename
            completionHandler(documents?.appendingPathComponent(safeName))
        }

        @available(iOS 15.0, *)
        func webView(
            _ webView: WKWebView,
            requestMediaCapturePermissionFor origin: WKSecurityOrigin,
            initiatedByFrame frame: WKFrameInfo,
            type: WKMediaCaptureType,
            decisionHandler: @escaping (WKPermissionDecision) -> Void
        ) {
            let originURL = URL(string: "\(origin.protocol)://\(origin.host)")
            if let originURL, shouldKeepInApp(originURL) {
                decisionHandler(.grant)
            } else {
                decisionHandler(.deny)
            }
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            guard let target = navigationAction.request.url else { return nil }
            if shouldKeepInApp(target) {
                webView.load(URLRequest(url: target))
            } else {
                UIApplication.shared.open(target)
            }
            return nil
        }

        private func shouldKeepInApp(_ url: URL) -> Bool {
            guard let scheme = url.scheme?.lowercased() else { return false }
            if scheme == "about" || scheme == "blob" { return true }
            guard scheme == "https", let host = url.host?.lowercased() else { return false }
            if portalHosts.contains(host) || authHosts.contains(host) { return true }
            return authSuffixes.contains { host.hasSuffix($0) }
        }
    }
}
