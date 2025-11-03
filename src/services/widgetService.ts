import { Platform } from 'react-native';
import { NewsItem } from '../types/news';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WIDGET_NEWS_KEY = 'cachedNews';

// Try to import SharedStorage, fall back to AsyncStorage if not available
let SharedStorage: any = null;
try {
  SharedStorage = require('../../modules/shared-storage').SharedStorage;
} catch (error) {
  console.log('⚠️ SharedStorage module not available, using AsyncStorage fallback');
}

interface WidgetHeadline {
  category: string;
  headline: string;
  timestamp: number;
}

/**
 * Service for sharing data with iOS widgets via App Groups
 *
 * Uses the SharedStorage native module to write to UserDefaults
 * with App Group support, allowing widgets to read the data.
 */
export class WidgetService {
  /**
   * Update widget data with latest news headlines
   *
   * @param newsItems - Array of news items to share with widget
   */
  static async updateWidgetData(newsItems: NewsItem[]): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('ℹ️ Widget updates only supported on iOS');
      return;
    }

    try {
      // Take up to 9 headlines (3 per category max)
      const headlines: WidgetHeadline[] = newsItems.slice(0, 9).map(item => ({
        category: item.category,
        headline: item.headline,
        timestamp: item.timestamp,
      }));

      // Serialize for storage
      const data = JSON.stringify(headlines);

      if (SharedStorage) {
        // Use native module to write to shared UserDefaults (App Group)
        await SharedStorage.setItem(WIDGET_NEWS_KEY, data);

        // Reload widget timeline to show new data
        await SharedStorage.reloadWidgets();

        console.log(`✅ Widget data updated (App Group): ${headlines.length} headlines`);
      } else {
        // Fallback: Use AsyncStorage (widget won't be able to read this)
        await AsyncStorage.setItem(`@widget:${WIDGET_NEWS_KEY}`, data);

        console.log(`⚠️ Widget data saved to AsyncStorage (fallback): ${headlines.length} headlines`);
        console.log(`   Note: Widget needs native module to read this data`);
      }

      // Log sample for debugging
      if (headlines.length > 0) {
        console.log(`   First headline: ${headlines[0].category} - ${headlines[0].headline}`);
      }
    } catch (error) {
      console.error('❌ Error updating widget data:', error);
    }
  }

  /**
   * Reload widget timeline to show updated data
   */
  static async reloadWidget(): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    if (!SharedStorage) {
      console.log('⚠️ SharedStorage module not available');
      return;
    }

    try {
      await SharedStorage.reloadWidgets();
      console.log('🔄 Widget timeline reloaded');
    } catch (error) {
      console.error('❌ Error reloading widget:', error);
    }
  }

  /**
   * Get current widget data (for debugging)
   */
  static async getWidgetData(): Promise<WidgetHeadline[] | null> {
    if (Platform.OS !== 'ios') {
      return null;
    }

    try {
      if (SharedStorage) {
        const data = await SharedStorage.getItem(WIDGET_NEWS_KEY);
        if (data) {
          return JSON.parse(data);
        }
      } else {
        const data = await AsyncStorage.getItem(`@widget:${WIDGET_NEWS_KEY}`);
        if (data) {
          return JSON.parse(data);
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error reading widget data:', error);
      return null;
    }
  }

  /**
   * Clear widget data
   */
  static async clearWidgetData(): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      if (SharedStorage) {
        await SharedStorage.removeItem(WIDGET_NEWS_KEY);
        console.log('✅ Widget data cleared (App Group)');
      } else {
        await AsyncStorage.removeItem(`@widget:${WIDGET_NEWS_KEY}`);
        console.log('✅ Widget data cleared (AsyncStorage)');
      }
    } catch (error) {
      console.error('❌ Error clearing widget data:', error);
    }
  }
}

