import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsItem } from '../types/news';

interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
}

const CACHE_KEY = '@n3ws:newsCache';

class NewsCache {
  private cache: CacheEntry | null = null;
  private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  private initialized = false;

  // Initialize cache from AsyncStorage on app startup
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached) as CacheEntry;

        // Validate cache structure
        if (parsed.data && Array.isArray(parsed.data) && typeof parsed.timestamp === 'number') {
          this.cache = parsed;
          const age = Date.now() - parsed.timestamp;
          const ageMinutes = Math.round(age / 60000);
        } else {
          await AsyncStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('❌ Error loading cache from AsyncStorage:', error);
      // Continue without cache if AsyncStorage fails
    } finally {
      this.initialized = true;
    }
  }

  async set(data: NewsItem[]): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };

    this.cache = entry;

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch (error) {
      console.error('❌ Error saving cache to AsyncStorage:', error);
      // Continue with in-memory cache even if AsyncStorage fails
    }
  }

  async get(): Promise<NewsItem[] | null> {
    // Ensure cache is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.cache) {
      return null;
    }

    const age = Date.now() - this.cache.timestamp;
    const isExpired = age > this.CACHE_DURATION_MS;

    if (isExpired) {
      await this.clear();
      return null;
    }

    const remainingSeconds = Math.round((this.CACHE_DURATION_MS - age) / 1000);
    return this.cache.data;
  }

  // Get cached data even if expired (for initial app load)
  async getStale(): Promise<NewsItem[] | null> {
    // Ensure cache is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.cache) {
      return null;
    }

    const age = Date.now() - this.cache.timestamp;
    const ageMinutes = Math.round(age / 60000);
    return this.cache.data;
  }

  async clear(): Promise<void> {
    this.cache = null;

    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('❌ Error clearing cache from AsyncStorage:', error);
    }
  }

  getAge(): number | null {
    if (!this.cache) return null;
    return Date.now() - this.cache.timestamp;
  }

  getRemainingTime(): number | null {
    if (!this.cache) return null;
    const age = Date.now() - this.cache.timestamp;
    const remaining = this.CACHE_DURATION_MS - age;
    return remaining > 0 ? remaining : 0;
  }

  isFresh(): boolean {
    if (!this.cache) return false;
    const age = Date.now() - this.cache.timestamp;
    return age < this.CACHE_DURATION_MS;
  }

  getCacheDuration(): number {
    return this.CACHE_DURATION_MS;
  }

  getTimestamp(): number | null {
    if (!this.cache) return null;
    return this.cache.timestamp;
  }
}

export const newsCache = new NewsCache();

