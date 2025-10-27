import { createTamagui } from 'tamagui';
import { defaultConfig } from '@tamagui/config/v4';

// Extend the default config with custom gray scale tokens
const customConfig = {
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    dark: {
      ...defaultConfig.themes.dark,
      // Add missing gray scale tokens for dark theme
      gray2: '#1a1a1a',   // Very dark gray for card backgrounds
      gray6: '#3a3a3a',   // Medium-dark gray for borders
      gray10: '#8a8a8a',  // Medium gray for placeholder text
      gray11: '#b0b0b0',  // Light gray for secondary text
      gray12: '#e8e8e8',  // Very light gray for primary text
    },
    light: {
      ...defaultConfig.themes.light,
      // Add matching gray scale tokens for light theme
      gray2: '#f8f8f8',   // Very light gray for card backgrounds
      gray6: '#d0d0d0',   // Medium-light gray for borders
      gray10: '#8a8a8a',  // Medium gray for placeholder text
      gray11: '#5a5a5a',  // Dark gray for secondary text
      gray12: '#1a1a1a',  // Very dark gray for primary text
    },
  },
};

export const tamaguiConfig = createTamagui(customConfig);

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

