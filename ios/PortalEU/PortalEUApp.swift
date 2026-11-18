import FirebaseCore
import FirebaseMessaging
import SwiftUI
import UserNotifications

final class PortalAppDelegate: NSObject, UIApplicationDelegate, MessagingDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        UNUserNotificationCenter.current().delegate = PortalNativeBridge.shared
        guard Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else {
            return true
        }
        FirebaseApp.configure()
        Messaging.messaging().delegate = self
        application.registerForRemoteNotifications()
        return true
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Messaging.messaging().apnsToken = deviceToken
    }
}

@main
struct PortalEUApp: App {
    @UIApplicationDelegateAdaptor(PortalAppDelegate.self) private var appDelegate

    init() {
        UNUserNotificationCenter.current().delegate = PortalNativeBridge.shared
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
