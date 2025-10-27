import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from 'tamagui';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { HomeScreen } from './src/screens/HomeScreen';
import { tamaguiConfig } from './tamagui.config';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      setAppIsReady(true);
    }
  }, [loaded]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <HomeScreen />
        <StatusBar style="light" />
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
