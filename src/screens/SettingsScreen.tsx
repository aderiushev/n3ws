import React from 'react';
import { Modal, Switch } from 'react-native';
import { YStack, XStack, Text, ScrollView } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../store/settingsStore';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const {
    categories,
    notifications,
    toggleCategory,
    toggleNotifications,
  } = useSettingsStore();

  const handleToggleCategory = async (category: 'Russia' | 'Spain' | 'World') => {
    await toggleCategory(category);
    
    // Trigger haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('❌ Haptic feedback error:', error);
    }
  };

  const handleToggleNotifications = async () => {
    await toggleNotifications();
    
    // Trigger haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('❌ Haptic feedback error:', error);
    }
  };

  const handleClose = async () => {
    // Trigger haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('❌ Haptic feedback error:', error);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <YStack flex={1} bg="$background" pt={insets.top}>
        {/* Header */}
        <XStack
          px="$4"
          py="$3"
          items="center"
          justify="space-between"
          borderBottomWidth={1}
          borderBottomColor="$gray6"
        >
          <Text fontSize="$7" fontWeight="bold" color="$gray12">
            Settings
          </Text>
          <Button
            size="$3"
            chromeless
            onPress={handleClose}
            icon={<Ionicons name="close" size={24} color="#b0b0b0" />}
          />
        </XStack>

        <ScrollView flex={1}>
          <YStack px="$4" py="$4" gap="$6">
            {/* Categories Section */}
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="bold" color="$blue10">
                News Categories
              </Text>
              <Text fontSize="$3" color="$gray11">
                Choose which categories to display
              </Text>

              {/* World - Mandatory */}
              <XStack
                items="center"
                justify="space-between"
                p="$3"
                bg="$gray2"
                rounded="$3"
                borderWidth={1}
                borderColor="$gray6"
              >
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" color="$gray12">
                    World
                  </Text>
                  <Text fontSize="$2" color="$gray11">
                    Always visible (mandatory)
                  </Text>
                </YStack>
                <Switch
                  value={true}
                  disabled={true}
                  trackColor={{ false: '#3a3a3a', true: '#0a7ea4' }}
                  thumbColor="#fff"
                />
              </XStack>

              {/* Russia - Optional */}
              <XStack
                items="center"
                justify="space-between"
                p="$3"
                bg="$gray2"
                rounded="$3"
                borderWidth={1}
                borderColor="$gray6"
              >
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" color="$gray12">
                    Russia
                  </Text>
                  <Text fontSize="$2" color="$gray11">
                    Optional category
                  </Text>
                </YStack>
                <Switch
                  value={categories.Russia}
                  onValueChange={() => handleToggleCategory('Russia')}
                  trackColor={{ false: '#3a3a3a', true: '#0a7ea4' }}
                  thumbColor="#fff"
                />
              </XStack>

              {/* Spain - Optional */}
              <XStack
                items="center"
                justify="space-between"
                p="$3"
                bg="$gray2"
                rounded="$3"
                borderWidth={1}
                borderColor="$gray6"
              >
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" color="$gray12">
                    Spain
                  </Text>
                  <Text fontSize="$2" color="$gray11">
                    Optional category
                  </Text>
                </YStack>
                <Switch
                  value={categories.Spain}
                  onValueChange={() => handleToggleCategory('Spain')}
                  trackColor={{ false: '#3a3a3a', true: '#0a7ea4' }}
                  thumbColor="#fff"
                />
              </XStack>
            </YStack>

            {/* Notifications Section */}
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="bold" color="$blue10">
                Notifications
              </Text>
              <Text fontSize="$2" color="$gray11">
                You can fetch news once every 24 hours. Get notified when fresh news becomes available.
              </Text>

              {/* Enable/Disable Notifications */}
              <XStack
                items="center"
                justify="space-between"
                p="$3"
                bg="$gray2"
                rounded="$3"
                borderWidth={1}
                borderColor="$gray6"
              >
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" color="$gray12">
                    Cache Expiration Alerts
                  </Text>
                  <Text fontSize="$2" color="$gray11">
                    Get notified when 24 hours have passed
                  </Text>
                </YStack>
                <Switch
                  value={notifications.enabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: '#3a3a3a', true: '#0a7ea4' }}
                  thumbColor="#fff"
                />
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </Modal>
  );
};

