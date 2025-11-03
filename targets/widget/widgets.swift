import WidgetKit
import SwiftUI

/// N3WS Widget - Displays 3-word news headlines
struct widget: Widget {
    let kind: String = "N3WSWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NewsProvider()) { entry in
            if #available(iOS 17.0, *) {
                NewsWidgetView(entry: entry)
                    .containerBackground(.black, for: .widget)
            } else {
                NewsWidgetView(entry: entry)
                    .padding()
                    .background(Color.black)
            }
        }
        .configurationDisplayName("N3WS Headlines")
        .description("Latest 3-word news headlines")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
