import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { auth } from './firebaseConfig'; // 確保路徑與截圖一致

// 匯入字體
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { CormorantGaramond_400Regular, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { ZenKurenaido_400Regular } from '@expo-google-fonts/zen-kurenaido';

// 匯入你的組件
import AuthScreen from './AuthScreen';
import BottomTabNavigator from './BottomTabNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  const [fontsLoaded] = useFonts({
    'Zen': ZenKurenaido_400Regular,
    'CormorantGaramond': CormorantGaramond_400Regular,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
    'GreatVibes': GreatVibes_400Regular,
    'Caveat': Caveat_400Regular,
    'Caveat-Bold': Caveat_700Bold,
  });

  // 監聽 Firebase 登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !initializing) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initializing]);

  if (!fontsLoaded || initializing) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {/* 核心邏輯：根據 user 是否有值來決定顯示內容 */}
      {user ? (
        <BottomTabNavigator />
      ) : (
        <AuthScreen />
      )}
    </View>
  );
}