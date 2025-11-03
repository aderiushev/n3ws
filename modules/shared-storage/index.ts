import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

// Define the native module interface
interface SharedStorageModule {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  reloadWidgets(): Promise<void>;
}

// Get the native module (iOS only)
const NativeModule: SharedStorageModule | null = 
  Platform.OS === 'ios' 
    ? requireNativeModule('SharedStorage')
    : null;

/**
 * Shared storage for communicating with iOS widgets via App Groups
 * 
 * This module provides access to UserDefaults with App Group support,
 * allowing the React Native app to share data with iOS widgets.
 */
export const SharedStorage = {
  /**
   * Set a value in shared storage
   * @param key - Storage key
   * @param value - String value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    if (!NativeModule) {
      console.warn('SharedStorage is only available on iOS');
      return;
    }
    
    try {
      await NativeModule.setItem(key, value);
    } catch (error) {
      console.error('SharedStorage.setItem error:', error);
      throw error;
    }
  },

  /**
   * Get a value from shared storage
   * @param key - Storage key
   * @returns The stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    if (!NativeModule) {
      console.warn('SharedStorage is only available on iOS');
      return null;
    }
    
    try {
      return await NativeModule.getItem(key);
    } catch (error) {
      console.error('SharedStorage.getItem error:', error);
      return null;
    }
  },

  /**
   * Remove a value from shared storage
   * @param key - Storage key
   */
  async removeItem(key: string): Promise<void> {
    if (!NativeModule) {
      console.warn('SharedStorage is only available on iOS');
      return;
    }
    
    try {
      await NativeModule.removeItem(key);
    } catch (error) {
      console.error('SharedStorage.removeItem error:', error);
      throw error;
    }
  },

  /**
   * Reload all widget timelines to show updated data
   */
  async reloadWidgets(): Promise<void> {
    if (!NativeModule) {
      console.warn('SharedStorage is only available on iOS');
      return;
    }
    
    try {
      await NativeModule.reloadWidgets();
    } catch (error) {
      console.error('SharedStorage.reloadWidgets error:', error);
      throw error;
    }
  },
};

