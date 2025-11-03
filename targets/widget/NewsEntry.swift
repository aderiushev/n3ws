import WidgetKit
import SwiftUI

/// Timeline entry for the N3WS widget
struct NewsEntry: TimelineEntry {
    let date: Date
    let headlines: [NewsHeadline]
}

/// Individual news headline model
struct NewsHeadline: Codable {
    let category: String
    let headline: String
    let timestamp: Double
}

