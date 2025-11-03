import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

// Configure notification behavior - only show alerts when app is in background
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const appState = AppState.currentState;
    const isInForeground = appState === 'active';

    return {
      shouldShowAlert: !isInForeground, // Only show alert when app is NOT in foreground
      shouldPlaySound: !isInForeground, // Only play sound when app is NOT in foreground
      shouldSetBadge: true, // Always update badge
    };
  },
});

const NOTIFICATION_IDENTIFIER = 'daily-news-digest';

export class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions from the user
   * Returns true if granted, false otherwise
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If not granted, request permission
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === 'granted';

      if (!this.hasPermission) {
        console.warn('⚠️ Notification permissions denied');
        return false;
      }

      console.log('✅ Notification permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      this.hasPermission = false;
      return false;
    }
  }

  /**
   * Check if we have notification permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('❌ Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Send notification when cache expires
   * This is an informational notification to alert the user that fresh news can be fetched
   */
  async sendCacheExpiredNotification(): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.log('ℹ️ No notification permissions - skipping cache expired notification');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'N3WS Ready',
          body: 'Fresh news is now available to fetch!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          data: {
            action: 'cache_expired',
            timestamp: Date.now(),
          },
        },
        trigger: null, // Send immediately
      });

      console.log('✅ Cache expired notification sent');
    } catch (error) {
      console.error('❌ Error sending cache expired notification:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

