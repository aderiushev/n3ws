import React from 'react';
import {YStack, H3, Text} from 'tamagui';
import { NewsItem } from './NewsItem';
import { NewsItemSkeleton } from './NewsItemSkeleton';
import { NewsItem as NewsItemType, NewsCategory } from '../types/news';

interface NewsListProps {
  category: NewsCategory;
  items: NewsItemType[];
  isLoading?: boolean;
}

export const NewsList: React.FC<NewsListProps> = ({ category, items, isLoading = false }) => {
  return (
    <YStack space="$1.5" gap="$1">
      <Text fontSize="$6" fontWeight="700" color="$blue9">
        {category}
      </Text>

      <YStack gap="$2">
        {isLoading ? (
          <>
            <NewsItemSkeleton />
            <NewsItemSkeleton />
            <NewsItemSkeleton />
          </>
        ) : items.length === 0 ? (
          <YStack p="$2" items="center">
            <Text fontSize="$4" color="$gray10">
              No news yet
            </Text>
          </YStack>
        ) : (
          items.map((item) => <NewsItem key={item.id} item={item} />)
        )}
      </YStack>
    </YStack>
  );
};

