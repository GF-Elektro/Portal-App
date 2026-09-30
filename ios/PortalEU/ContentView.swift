import SwiftUI

struct ContentView: View {
    private let portalURL = URL(string: "https://portal.gfelektro.com")!

    var body: some View {
        PortalWebView(url: portalURL)
            .ignoresSafeArea()
    }
}
