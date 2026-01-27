import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback } from 'react';
import { View } from 'react-native';

// 匯入字體
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { CormorantGaramond_400Regular, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { ZenKurenaido_400Regular } from '@expo-google-fonts/zen-kurenaido';

import AuthScreen from './AuthScreen';

// 防止 SplashScreen 自動隱藏
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Zen': ZenKurenaido_400Regular,
    'CormorantGaramond': CormorantGaramond_400Regular,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
    'GreatVibes': GreatVibes_400Regular,
    'Caveat': Caveat_400Regular,
    'Caveat-Bold': Caveat_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthScreen />
    </View>
  );
}