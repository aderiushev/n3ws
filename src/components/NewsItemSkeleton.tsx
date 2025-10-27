import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Card, YStack, XStack } from 'tamagui';

export const NewsItemSkeleton: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Card
      elevate
      size="$2"
      bordered
      p="$2"
      my="$1"
      bg="$gray2"
      borderColor="$gray6"
    >
      <XStack items="center" justify="space-between" py="$2">
        <YStack flex={1} mr="$2">
          <Animated.View style={{ opacity }}>
            <YStack bg="$gray6" height={20} rounded="$2" width="80%" />
          </Animated.View>
        </YStack>

        <Animated.View style={{ opacity }}>
          <YStack bg="$gray6" width={18} height={18} rounded="$1" />
        </Animated.View>
      </XStack>
    </Card>
  );
};

