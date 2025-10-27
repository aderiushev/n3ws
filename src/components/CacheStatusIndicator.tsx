import React from 'react';
import { YStack, Text } from 'tamagui';

interface CacheStatusIndicatorProps {
  cacheAge: number | null;
}

export const CacheStatusIndicator: React.FC<CacheStatusIndicatorProps> = ({ cacheAge }) => {
  // Format cache age for "Updated X ago"
  const formatCacheAge = (ms: number | null): string => {
    if (ms === null) return '';

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);

    if (minutes === 0) {
      return 'just now';
    } else if (minutes === 1) {
      return '1 minute ago';
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    }
    return 'over an hour ago';
  };

  if (cacheAge === null || cacheAge <= 0) {
    return null;
  }

  return (
    <YStack bg="$gray2" px="$3" py="$2" borderTopWidth={1} borderTopColor="$gray6">
      <Text fontSize="$2" color="$gray11" text="center">
        Updated {formatCacheAge(cacheAge)}
      </Text>
    </YStack>
  );
};

