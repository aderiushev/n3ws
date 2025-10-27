import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { YStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';
import * as Updates from 'expo-updates';
import appConfig from '../../app.json';
import packageJson from '../../package.json';

export const VersionDisplay: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const handleCheckForUpdates = async () => {
    try {
      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (err) {
      console.error('❌ Haptic feedback error:', err);
    }

    setIsCheckingUpdate(true);
    setUpdateStatus('Checking for updates...');

    try {
      // Check if running in development mode
      if (__DEV__) {
        setUpdateStatus('Updates disabled in dev mode');
        setTimeout(() => setUpdateStatus(''), 3000);
        return;
      }

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateStatus('Downloading update...');
        await Updates.fetchUpdateAsync();
        setUpdateStatus('Update ready! Reloading...');
        
        // Wait a moment before reloading
        setTimeout(async () => {
          await Updates.reloadAsync();
        }, 1000);
      } else {
        setUpdateStatus('Already up to date!');
        setTimeout(() => setUpdateStatus(''), 3000);
      }
    } catch (err) {
      console.error('❌ Error checking for updates:', err);
      setUpdateStatus('Update check failed');
      setTimeout(() => setUpdateStatus(''), 3000);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  return (
    <Pressable onLongPress={handleCheckForUpdates} delayLongPress={500}>
      <YStack bg="$gray2" px="$3" py="$2" borderTopWidth={1} borderTopColor="$gray6">
        {updateStatus ? (
          <Text fontSize="$2" color="$blue10" text="center" fontWeight="500">
            {updateStatus}
          </Text>
        ) : (
          <Text fontSize="$2" color="$gray10" text="center">
            v{appConfig.expo.version} / v{packageJson.version}
          </Text>
        )}
      </YStack>
    </Pressable>
  );
};

