import React from 'react';
import { Linking, Alert } from 'react-native';
import { Card, Text, YStack, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NewsItem as NewsItemType } from '../types/news';

interface NewsItemProps {
  item: NewsItemType;
}

export const NewsItem: React.FC<NewsItemProps> = ({ item }) => {
  const handlePress = async () => {
    if (!item.source) {
      return;
    }

    // Trigger haptic feedback before opening URL
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('❌ Haptic feedback error:', error);
    }

    try {
      const canOpen = await Linking.canOpenURL(item.source);

      if (canOpen) {
        await Linking.openURL(item.source);
      } else {
        console.error('❌ Cannot open URL:', item.source);
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      console.error('❌ Error opening URL:', error);
      Alert.alert('Error', 'Failed to open the news source');
    }
  };

  return (
    <Card
      elevate
      size="$2"
      bordered
      p="$2"
      bg="$gray2"
      borderColor="$gray6"
      pressStyle={{ scale: 0.98, opacity: 0.8 }}
      onPress={item.source ? handlePress : undefined}
      cursor={item.source ? 'pointer' : 'default'}
    >
      <XStack items="center" justify="space-between" py="$2">
        <YStack flex={1} mr="$2">
          <Text fontSize="$3" fontWeight="500" color="$gray12">
            {item.headline}
          </Text>
        </YStack>

        {item.source && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#b0b0b0"
            style={{ opacity: 0.7 }}
          />
        )}
      </XStack>
    </Card>
  );
};

