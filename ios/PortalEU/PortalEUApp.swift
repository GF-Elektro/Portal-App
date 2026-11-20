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
        let apply = {
            Messaging.messaging().setAPNSToken(deviceToken, type: .prod)
            // The token saved before this callback is not bound to APNs.
            // Drop it and mint a new one now that the device token is set.
            Messaging.messaging().deleteToken { deleteError in
                if let deleteError {
                    print("[push] deleteToken: \(deleteError.localizedDescription)")
                }
                Messaging.messaging().token { token, error in
                    if let token, !token.isEmpty {
                        PortalNativeBridge.shared.notePushToken(token)
                    } else {
                        print("[push] FCM token after APNs: \(error?.localizedDescription ?? "empty")")
                    }
                }
            }
        }
        if Thread.isMainThread {
            apply()
        } else {
            DispatchQueue.main.async(execute: apply)
        }
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("[push] APNs registration failed: \(error.localizedDescription)")
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        PortalNativeBridge.shared.presentRemoteNotification(userInfo)
        completionHandler(.newData)
    }

    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let fcmToken, !fcmToken.isEmpty else { return }
        PortalNativeBridge.shared.notePushToken(fcmToken)
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
