import WidgetKit
import SwiftUI

/// SwiftUI view for the N3WS widget
/// Displays news headlines in a dark-themed layout matching the app's design
struct NewsWidgetView: View {
    var entry: NewsEntry
    @Environment(\.widgetFamily) var widgetFamily

    var body: some View {
        ZStack {
            // Dark background matching app theme
            Color.black

            VStack(alignment: .leading, spacing: 8) {
                // Header with app name and timestamp
                headerView

                Divider()
                    .background(Color.gray.opacity(0.3))

                // News headlines
                headlinesView

                Spacer()
            }
            .padding(12)
        }
    }

    // MARK: - Header View

    private var headerView: some View {
        HStack {
            Text("N3WS")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(accentColor)

            Spacer()

            Text(timeAgo(from: entry.date))
                .font(.system(size: 10))
                .foregroundColor(.gray)
        }
    }

    // MARK: - Headlines View

    private var headlinesView: some View {
        VStack(alignment: .leading, spacing: widgetFamily == .systemSmall ? 6 : 8) {
            ForEach(headlinesToShow, id: \.timestamp) { headline in
                headlineRow(headline)
            }
        }
    }

    private func headlineRow(_ headline: NewsHeadline) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            // Category label
            Text(headline.category.uppercased())
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(.gray)

            // Headline text (3 words)
            Text(headline.headline)
                .font(.system(size: widgetFamily == .systemSmall ? 12 : 13, weight: .medium))
                .foregroundColor(.white)
                .lineLimit(1)
        }
    }

    // MARK: - Computed Properties

    /// Number of headlines to show based on widget size
    private var headlinesToShow: [NewsHeadline] {
        switch widgetFamily {
        case .systemSmall:
            // Small widget: show 2 headlines
            return Array(entry.headlines.prefix(2))
        case .systemMedium:
            // Medium widget: show 3 headlines
            return Array(entry.headlines.prefix(3))
        default:
            // Other sizes: show 3 headlines
            return Array(entry.headlines.prefix(3))
        }
    }

    /// Accent color matching app theme (#0a7ea4)
    private var accentColor: Color {
        Color(red: 0.04, green: 0.49, blue: 0.64)
    }

    // MARK: - Helper Functions

    /// Format time difference as human-readable string
    private func timeAgo(from date: Date) -> String {
        let interval = Date().timeIntervalSince(date)
        let hours = Int(interval / 3600)

        if hours < 1 {
            return "Just now"
        } else if hours < 24 {
            return "\(hours)h ago"
        } else {
            let days = hours / 24
            return "\(days)d ago"
        }
    }
}

// MARK: - Preview
// Note: #Preview macro requires iOS 17+, removed for iOS 16 compatibility

