import SwiftUI
import UserNotifications

@main
struct PortalEUApp: App {
    init() {
        UNUserNotificationCenter.current().delegate = PortalNativeBridge.shared
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
