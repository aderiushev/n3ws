import WidgetKit
import SwiftUI

/// Timeline provider for the N3WS widget
/// Loads news data from shared App Group storage and provides timeline entries
struct NewsProvider: TimelineProvider {
    
    // MARK: - TimelineProvider Protocol
    
    /// Provides a placeholder entry for the widget gallery
    func placeholder(in context: Context) -> NewsEntry {
        NewsEntry(
            date: Date(),
            headlines: [
                NewsHeadline(
                    category: "World",
                    headline: "Loading news...",
                    timestamp: Date().timeIntervalSince1970
                )
            ]
        )
    }
    
    /// Provides a snapshot for the widget gallery and widget configuration
    func getSnapshot(in context: Context, completion: @escaping (NewsEntry) -> Void) {
        let entry = loadNewsFromCache()
        completion(entry)
    }
    
    /// Provides the timeline of entries for the widget
    func getTimeline(in context: Context, completion: @escaping (Timeline<NewsEntry>) -> Void) {
        let entry = loadNewsFromCache()
        
        // Update widget every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
    
    // MARK: - Data Loading
    
    /// Load news headlines from shared App Group storage
    private func loadNewsFromCache() -> NewsEntry {
        // Access shared UserDefaults using App Group
        let userDefaults = UserDefaults(suiteName: "group.com.aderiushev.n3ws")
        
        // Try to read cached news from shared storage
        if let newsData = userDefaults?.data(forKey: "cachedNews"),
           let headlines = try? JSONDecoder().decode([NewsHeadline].self, from: newsData) {
            
            // Return up to 3 headlines for the widget
            return NewsEntry(
                date: Date(),
                headlines: Array(headlines.prefix(3))
            )
        }
        
        // Fallback if no cache is available
        return NewsEntry(
            date: Date(),
            headlines: [
                NewsHeadline(
                    category: "World",
                    headline: "Open app for news",
                    timestamp: Date().timeIntervalSince1970
                )
            ]
        )
    }
}

