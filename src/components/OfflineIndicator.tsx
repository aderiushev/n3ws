import React from 'react';
import { XStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface OfflineIndicatorProps {
  cacheAge: number | null;
  isCacheFresh: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  cacheAge, 
  isCacheFresh 
}) => {
  // Format cache age for human-readable display
  const formatCacheAge = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'yesterday';
    } else {
      return `${days}d ago`;
    }
  };

  // Don't show indicator if:
  // 1. No cache exists (cacheAge is null or 0)
  // 2. Cache is fresh (< 24 hours and recently fetched)
  if (cacheAge === null || cacheAge <= 0) {
    return null;
  }

  // Determine if content is stale (> 1 hour old)
  const isStale = cacheAge > 60 * 60 * 1000; // 1 hour in milliseconds
  
  // Show indicator if content is stale or cache is not fresh
  if (!isStale && isCacheFresh) {
    return null;
  }

  const ageText = formatCacheAge(cacheAge);
  const statusText = isCacheFresh ? 'Cached' : 'Offline';
  const iconColor = isCacheFresh ? '#ffa500' : '#ff6b6b'; // Orange for cached, red for offline
  const bgColor = isCacheFresh ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 107, 107, 0.1)';
  const borderColor = isCacheFresh ? 'rgba(255, 165, 0, 0.3)' : 'rgba(255, 107, 107, 0.3)';

  return (
    <XStack
      bg={bgColor}
      px="$3"
      py="$2.5"
      borderBottomWidth={1}
      borderBottomColor={borderColor}
      alignItems="center"
      justifyContent="center"
      gap="$2"
    >
      <Ionicons 
        name={isCacheFresh ? "cloud-offline-outline" : "cloud-offline"} 
        size={16} 
        color={iconColor} 
      />
      <Text fontSize="$2" color={iconColor} fontWeight="600">
        {statusText}
      </Text>
      <Text fontSize="$2" color="$gray11">
        •
      </Text>
      <Text fontSize="$2" color="$gray11">
        Updated {ageText}
      </Text>
    </XStack>
  );
};

