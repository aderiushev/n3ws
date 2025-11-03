import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { YStack, Button, H2, Text, ScrollView, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNewsStore } from '../store/newsStore';
import { useSettingsStore } from '../store/settingsStore';
import { NewsList } from '../components/NewsList';
import { CacheStatusIndicator } from '../components/CacheStatusIndicator';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { VersionDisplay } from '../components/VersionDisplay';
import { SettingsScreen } from './SettingsScreen';
import { fetchNews } from '../api/openai';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { newsCache } from '../api/newsCache';
import { notificationService } from '../services/notificationService';

export const HomeScreen: React.FC = () => {
  const { news, isLoading, error, addNews, setLoading, setError } =
    useNewsStore();
  const { categories, notifications, initialize: initializeSettings } = useSettingsStore();

  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [cacheRemaining, setCacheRemaining] = useState<number | null>(null);
  const [isCacheFresh, setIsCacheFresh] = useState(false);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationPermissionRequested, setNotificationPermissionRequested] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cacheInitialized, setCacheInitialized] = useState(false);

  const handleFetchNews = async (triggerHaptics: boolean = true) => {
    // Trigger haptics only for manual button presses (non-blocking)
    if (triggerHaptics && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(err => {
        console.error('❌ Haptic feedback error:', err);
      });
    }

    setLoading(true);
    setError(null);

    try {
      const newsItems = await fetchNews();
      addNews(newsItems);
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    // Check if cache is still fresh
    if (isCacheFresh) {
      console.log('ℹ️ Cache is still fresh, skipping refresh');

      // Trigger light haptic to indicate no refresh needed
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.error('❌ Haptic feedback error:', error);
      }

      // Show brief "already fresh" feedback by setting refreshing state
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 500);
      return;
    }

    // Trigger haptic feedback for refresh start
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('❌ Haptic feedback error:', error);
    }

    setRefreshing(true);

    try {
      const newsItems = await fetchNews();
      addNews(newsItems);

      // Success haptic
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('❌ Haptic feedback error:', error);
      }
    } catch (err) {
      console.error('❌ Error refreshing news:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh news');

      // Error haptic
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.error('❌ Haptic feedback error:', error);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Track previous cache fresh state to detect expiration
  const prevIsCacheFresh = useRef<boolean | null>(null);

  // Detect cache expiration and send notification
  useEffect(() => {
    // Skip on initial mount or if cache not initialized
    if (prevIsCacheFresh.current === null || !cacheInitialized) {
      prevIsCacheFresh.current = isCacheFresh;
      return;
    }

    // Detect transition from fresh to stale (cache just expired)
    if (prevIsCacheFresh.current === true && isCacheFresh === false) {
      console.log('⏰ Cache expired - sending notification');

      // Only send notification if enabled in settings
      if (notifications.enabled) {
        notificationService.sendCacheExpiredNotification();
      }
    }

    // Update previous state
    prevIsCacheFresh.current = isCacheFresh;
  }, [isCacheFresh, cacheInitialized, notifications.enabled]);

  // Update cache status every second - centralized timer logic
  useEffect(() => {
    // Only start updating cache status after cache is initialized
    if (!cacheInitialized) return;

    const updateCacheStatus = () => {
      const age = newsCache.getAge();
      const remaining = newsCache.getRemainingTime();
      const fresh = newsCache.isFresh();
      const timestamp = newsCache.getTimestamp();

      setCacheAge(age);
      setCacheRemaining(remaining);
      setIsCacheFresh(fresh);
      setLastFetchTimestamp(timestamp);
    };

    // Initial update
    updateCacheStatus();

    // Update every second
    const interval = setInterval(updateCacheStatus, 1000);

    return () => clearInterval(interval);
  }, [news, cacheInitialized]); // Update when news changes or cache is initialized

  // Load cached news and initialize settings on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize settings from AsyncStorage
      await initializeSettings();

      // Initialize cache from AsyncStorage
      await newsCache.initialize();

      // Mark cache as initialized to enable cache status updates
      setCacheInitialized(true);

      // Load cached news (even if stale) for immediate display
      const cachedNews = await newsCache.getStale();
      if (cachedNews && cachedNews.length > 0) {
        addNews(cachedNews);
      } else {
        // No cached news - first-time app launch or cache cleared
        // Automatically fetch fresh news
        console.log('🚀 First-time launch detected - fetching fresh news automatically');
        await handleFetchNews(false); // Don't trigger haptics for auto-fetch
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request notification permissions when notifications are enabled
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      if (notifications.enabled && !notificationPermissionRequested) {
        const granted = await notificationService.requestPermissions();
        setNotificationPermissionRequested(true);

        if (granted) {
          console.log('✅ Notification permissions granted');
        } else {
          console.warn('⚠️ Notification permissions denied by user');
        }
      }
    };

    requestNotificationPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.enabled]);



  const insets = useSafeAreaInsets()

  // Format time remaining for countdown
  const formatTimeRemaining = (ms: number | null): string => {
    if (ms === null || ms <= 0) return '';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format based on time remaining
    if (hours > 0) {
      // Show hours and minutes when 1+ hours remaining
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      // Show minutes and seconds when less than 1 hour
      return `${minutes}m ${seconds}s`;
    } else {
      // Show only seconds when less than 1 minute
      return `${seconds}s`;
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const isButtonDisabled = isLoading || isCacheFresh;

  const handleOpenSettings = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('❌ Haptic feedback error:', error);
    }
    setSettingsVisible(true);
  };

  return (
    <YStack flex={1} pt={insets.top}>
      {/* Header with Settings Button */}
      <YStack bg="$background" px="$3" py="$2">
        <XStack items="center" justify="space-between">
          <YStack flex={1} items="center" gap="$1">
            <Text fontSize="$8" fontWeight="800" color="$blue10">
              N3WS
            </Text>
            <Text fontSize="$2" color="$gray11">
              3-word news
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={handleOpenSettings}
            style={{ position: 'absolute', right: 0, padding: 8 }}
          >
            <Ionicons name="settings-outline" size={24} color="#b0b0b0" />
          </TouchableOpacity>
        </XStack>
      </YStack>

      {/* Offline/Cached content indicator */}
      <OfflineIndicator cacheAge={cacheAge} isCacheFresh={isCacheFresh} />

      {/* Date indicator - fixed at top */}
      {lastFetchTimestamp && (
        <YStack bg="$background" px="$3" py="$3" items="center">
          <Text fontSize="$3" color="$gray11" fontWeight="500">
            {formatDate(lastFetchTimestamp)}
          </Text>
        </YStack>
      )}

      {/* Scrollable content area */}
      <ScrollView
        flex={1}
        bg="$background"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0a7ea4"
            colors={['#0a7ea4']}
            progressBackgroundColor="#1a1a1a"
          />
        }
      >
        <YStack px="$3" pb="$6">
          {/* News content - only show enabled categories */}
          <YStack space="$2" gap="$2">
            {categories.Russia && (
              <NewsList category="Russia" items={news.Russia} isLoading={isLoading} />
            )}
            {categories.Spain && (
              <NewsList category="Spain" items={news.Spain} isLoading={isLoading} />
            )}
            {/* World is always visible (mandatory) */}
            <NewsList category="World" items={news.World} isLoading={isLoading} />
          </YStack>

          {/* Error message */}
          {error && (
            <YStack
              p="$2"
              bg="$red3"
              rounded="$3"
              mb="$2"
            >
              <Text color="$red11" text="center" fontSize="$2">
                {error}
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Version display - fixed at bottom */}
      <VersionDisplay />

      {/* Cache status indicator */}
      <CacheStatusIndicator cacheAge={cacheAge} />

      {/* Button - fixed at bottom */}
      <TouchableOpacity
        onPress={() => {
          if (isButtonDisabled) return;
          handleFetchNews(true);
        }}
        disabled={isButtonDisabled}
        style={{
          width: '100%',
          backgroundColor: isButtonDisabled ? '#666666' : '#0066cc',
          paddingVertical: 20,
          paddingBottom: 20 + insets.bottom,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isButtonDisabled ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : isCacheFresh && cacheRemaining !== null ? (
          <YStack items="center" gap="$1">
            <Text fontSize="$6" fontWeight="bold" color="$white1">
              Fresh news in {formatTimeRemaining(cacheRemaining)}
            </Text>
            <Text fontSize="$2" color="$gray10">
              But maybe you don't need em huh?
            </Text>
          </YStack>
        ) : (
          <Text fontSize="$8" fontWeight="bold" color="$white1">
            +3
          </Text>
        )}
      </TouchableOpacity>

      {/* Settings Modal */}
      <SettingsScreen
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </YStack>
  );
};

