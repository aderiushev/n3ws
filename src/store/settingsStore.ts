import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@n3ws:settings';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:mm" (e.g., "09:00")
  categories: {
    Russia: boolean;
    Spain: boolean;
    World: boolean;
  };
}

export interface CategorySettings {
  Russia: boolean; // Optional category
  Spain: boolean;  // Optional category
  World: boolean;  // Mandatory - always true
}

interface SettingsState {
  // Category preferences
  categories: CategorySettings;
  
  // Notification preferences
  notifications: NotificationSettings;
  
  // Initialization flag
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  toggleCategory: (category: keyof CategorySettings) => Promise<void>;
  setNotificationTime: (time: string) => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleCategoryNotification: (category: keyof NotificationSettings['categories']) => Promise<void>;
}

// Default settings
const DEFAULT_SETTINGS: Omit<SettingsState, 'initialized' | 'initialize' | 'toggleCategory' | 'setNotificationTime' | 'toggleNotifications' | 'toggleCategoryNotification'> = {
  categories: {
    Russia: true,
    Spain: true,
    World: true, // Always true (mandatory)
  },
  notifications: {
    enabled: true,
    time: '09:00', // Default to 9:00 AM
    categories: {
      Russia: true,
      Spain: true,
      World: true,
    },
  },
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  initialized: false,

  // Load settings from AsyncStorage on app startup
  initialize: async () => {
    if (get().initialized) return;

    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate and merge with defaults
        const settings = {
          categories: {
            ...DEFAULT_SETTINGS.categories,
            ...parsed.categories,
            World: true, // Force World to always be true
          },
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...parsed.notifications,
          },
        };
        
        set({ ...settings, initialized: true });
        console.log('✅ Settings loaded from storage:', settings);
      } else {
        // First time - save defaults
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        set({ initialized: true });
        console.log('✅ Default settings initialized');
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      set({ initialized: true }); // Continue with defaults
    }
  },

  // Toggle category visibility (Russia/Spain only - World is mandatory)
  toggleCategory: async (category: keyof CategorySettings) => {
    if (category === 'World') {
      console.warn('⚠️ Cannot toggle World category - it is mandatory');
      return;
    }

    const currentValue = get().categories[category];
    const newCategories = {
      ...get().categories,
      [category]: !currentValue,
    };

    set({ categories: newCategories });

    // Persist to AsyncStorage
    try {
      const settings = {
        categories: newCategories,
        notifications: get().notifications,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      console.log(`✅ Category ${category} toggled to ${!currentValue}`);
    } catch (error) {
      console.error('❌ Error saving category settings:', error);
    }
  },

  // Set notification time
  setNotificationTime: async (time: string) => {
    const newNotifications = {
      ...get().notifications,
      time,
    };

    set({ notifications: newNotifications });

    // Persist to AsyncStorage
    try {
      const settings = {
        categories: get().categories,
        notifications: newNotifications,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      console.log(`✅ Notification time set to ${time}`);
    } catch (error) {
      console.error('❌ Error saving notification time:', error);
    }
  },

  // Toggle notifications on/off
  toggleNotifications: async () => {
    const currentValue = get().notifications.enabled;
    const newNotifications = {
      ...get().notifications,
      enabled: !currentValue,
    };

    set({ notifications: newNotifications });

    // Persist to AsyncStorage
    try {
      const settings = {
        categories: get().categories,
        notifications: newNotifications,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      console.log(`✅ Notifications toggled to ${!currentValue}`);
    } catch (error) {
      console.error('❌ Error saving notification settings:', error);
    }
  },

  // Toggle per-category notifications
  toggleCategoryNotification: async (category: keyof NotificationSettings['categories']) => {
    const currentValue = get().notifications.categories[category];
    const newNotifications = {
      ...get().notifications,
      categories: {
        ...get().notifications.categories,
        [category]: !currentValue,
      },
    };

    set({ notifications: newNotifications });

    // Persist to AsyncStorage
    try {
      const settings = {
        categories: get().categories,
        notifications: newNotifications,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      console.log(`✅ ${category} notifications toggled to ${!currentValue}`);
    } catch (error) {
      console.error('❌ Error saving category notification settings:', error);
    }
  },
}));

