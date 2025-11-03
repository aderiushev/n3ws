import ExpoModulesCore
import Foundation
import WidgetKit

/// Expo module for sharing data with iOS widgets using App Groups
public class SharedStorageModule: Module {

    // App Group identifier - must match app.json and widget configuration
    private let appGroupIdentifier = "group.com.aderiushev.n3ws"

    public func definition() -> ModuleDefinition {
        Name("SharedStorage")

        /// Set data in shared UserDefaults (App Group)
        AsyncFunction("setItem") { (key: String, value: String) in
            guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
                throw NSError(
                    domain: "SharedStorage",
                    code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "Failed to access App Group storage"]
                )
            }

            userDefaults.set(value, forKey: key)
            userDefaults.synchronize()
        }

        /// Get data from shared UserDefaults (App Group)
        AsyncFunction("getItem") { (key: String) -> String? in
            guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
                return nil
            }

            return userDefaults.string(forKey: key)
        }

        /// Remove data from shared UserDefaults (App Group)
        AsyncFunction("removeItem") { (key: String) in
            guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
                throw NSError(
                    domain: "SharedStorage",
                    code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "Failed to access App Group storage"]
                )
            }

            userDefaults.removeObject(forKey: key)
            userDefaults.synchronize()
        }

        /// Reload all widget timelines
        AsyncFunction("reloadWidgets") {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}

