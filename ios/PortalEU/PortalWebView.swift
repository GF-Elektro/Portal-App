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
        configuration.processPool = Coordinator.sharedProcessPool
        configuration.websiteDataStore = .default()
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
        context.coordinator.mainWebView = webView
        PortalNativeBridge.shared.attach(to: webView, userContentController: userContent)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        // Swiping back to Google/login after OAuth drops Firebase session in the shell.
        webView.allowsBackForwardNavigationGestures = false
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate {
        static let sharedProcessPool = WKProcessPool()

        weak var mainWebView: WKWebView?

        private var auxiliaryWebViews: [WKWebView] = []

        private let portalAuthPathPrefix = "/__/auth"

        private let portalHosts: Set<String> = [
            "portal.gfelektro.com",
            "gfelektro.com",
        ]
        private let authHosts: Set<String> = [
            "accounts.google.com",
            "accounts.youtube.com",
            "apis.google.com",
            "appleid.apple.com",
        ]
        private let authSuffixes = [
            ".google.com",
            ".googleapis.com",
            ".googleusercontent.com",
            ".gstatic.com",
            ".firebaseapp.com",
            ".firebaseauth.com",
            ".linkedin.com",
            ".licdn.com",
        ]

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            print("[PORTAL-NAV] didStart: \(webView.url?.absoluteString ?? "")")
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("[PORTAL-NAV] didFinish: \(webView.url?.absoluteString ?? "")")
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            print("[PORTAL-NAV] didFail: \(error.localizedDescription) url=\(webView.url?.absoluteString ?? "")")
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            print("[PORTAL-NAV] didFailProvisionalNavigation: \(error.localizedDescription) url=\(webView.url?.absoluteString ?? "")")
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            preferences: WKWebpagePreferences,
            decisionHandler: @escaping (WKNavigationActionPolicy, WKWebpagePreferences) -> Void
        ) {
            guard let target = navigationAction.request.url else {
                print("[PORTAL-NAV] decidePolicy: nil url -> cancel")
                decisionHandler(.cancel, preferences)
                return
            }
            let keep = shouldKeepInApp(target)
            print("[PORTAL-NAV] decidePolicy: \(target.absoluteString) [keep=\(keep), navType=\(navigationAction.navigationType.rawValue)]")
            if keep {
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
            let target = navigationAction.request.url
            let isAuth = target == nil || isGenuineAuthPopupURL(target!)
            print("[PORTAL-NAV] createWebViewWith url=\(target?.absoluteString ?? "nil") isAuth=\(isAuth)")
            if isAuth {
                let root = mainWebView ?? webView
                configuration.processPool = root.configuration.processPool
                configuration.websiteDataStore = root.configuration.websiteDataStore
                let popup = WKWebView(frame: webView.bounds, configuration: configuration)
                popup.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                popup.navigationDelegate = self
                popup.uiDelegate = self
                auxiliaryWebViews.append(popup)
                webView.addSubview(popup)
                return popup
            }
            if let target, shouldKeepInApp(target) {
                webView.load(URLRequest(url: target))
                return nil
            }
            if let target {
                UIApplication.shared.open(target)
            }
            return nil
        }

        func webViewDidClose(_ webView: WKWebView) {
            dismissAuxiliaryWebView(webView)
        }

        /// OAuth / Firebase popup targets (aligned with Electron `isGenuineAuthURL`).
        private func isGenuineAuthPopupURL(_ url: URL) -> Bool {
            guard let scheme = url.scheme?.lowercased() else { return false }
            if scheme == "about" || url.absoluteString == "about:blank" { return true }
            guard scheme == "https", let host = url.host?.lowercased() else { return false }
            if portalHosts.contains(host) {
                return url.path.hasPrefix(portalAuthPathPrefix)
            }
            if authHosts.contains(host) { return true }
            return authSuffixes.contains { host.hasSuffix($0) }
        }

        private func dismissAuxiliaryWebView(_ popup: WKWebView) {
            popup.stopLoading()
            popup.removeFromSuperview()
            auxiliaryWebViews.removeAll { $0 === popup }
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
