import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { YStack, Button, H2, Text, ScrollView, XStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { useNewsStore } from '../store/newsStore';
import { NewsList } from '../components/NewsList';
import { CacheStatusIndicator } from '../components/CacheStatusIndicator';
import { VersionDisplay } from '../components/VersionDisplay';
import { fetchNews } from '../api/openai';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { newsCache } from '../api/newsCache';

export const HomeScreen: React.FC = () => {
  const { news, isLoading, error, addNews, setLoading, setError } =
    useNewsStore();

  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [cacheRemaining, setCacheRemaining] = useState<number | null>(null);
  const [isCacheFresh, setIsCacheFresh] = useState(false);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number | null>(null);

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

  // Update cache status every second - centralized timer logic
  useEffect(() => {
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

    updateCacheStatus();
    const interval = setInterval(updateCacheStatus, 1000);

    return () => clearInterval(interval);
  }, [news]); // Update when news changes

  // Load cached news on mount (no automatic fetching)
  useEffect(() => {
    const initializeAndLoadCachedNews = async () => {
      // Initialize cache from AsyncStorage first
      await newsCache.initialize();

      // Load cached news (even if stale) for immediate display
      const cachedNews = await newsCache.getStale();
      if (cachedNews && cachedNews.length > 0) {
        addNews(cachedNews);
      }
    };

    initializeAndLoadCachedNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insets = useSafeAreaInsets()

  // Format time remaining for countdown
  const formatTimeRemaining = (ms: number | null): string => {
    if (ms === null || ms <= 0) return '';

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
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

  return (
    <YStack flex={1} pt={insets.top}>
      <YStack bg="$background" px="$3">
        <YStack items="center" gap="$1">
          <Text fontSize="$8" fontWeight="800" color="$blue10">
            N3WS
          </Text>
          <Text fontSize="$2" color="$gray11">
            3-word news
          </Text>
        </YStack>
      </YStack>

      {/* Date indicator - fixed at top */}
      {lastFetchTimestamp && (
        <YStack bg="$background" px="$3" py="$3" items="center">
          <Text fontSize="$3" color="$gray11" fontWeight="500">
            {formatDate(lastFetchTimestamp)}
          </Text>
        </YStack>
      )}

      {/* Scrollable content area */}
      <ScrollView flex={1} bg="$background">
        <YStack px="$3" pb="$6">
          {/* News content */}
          <YStack space="$2" gap="$2">
            <NewsList category="Russia" items={news.Russia} isLoading={isLoading} />
            <NewsList category="Spain" items={news.Spain} isLoading={isLoading} />
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
    </YStack>
  );
};

