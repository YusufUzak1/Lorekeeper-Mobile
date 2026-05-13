import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import './global.css';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Amplify } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { View, ActivityIndicator } from 'react-native';

import { AuthScreen } from './src/screens/AuthScreen';
import { UniverseSelectScreen } from './src/screens/UniverseSelectScreen';
import { MainNavigator } from './src/navigation/MainNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { useUniverseStore } from './src/store/useUniverseStore';
import { fetchStateFromCloud } from './src/services/syncService';

const userPoolId = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || '';
const userPoolClientId = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '';

console.log('[Amplify Config] Pool ID:', userPoolId ? 'Yüklendi' : 'Eksik!');
console.log('[Amplify Config] Client ID:', userPoolClientId ? 'Yüklendi' : 'Eksik!');

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
    },
  },
});

const Stack = createNativeStackNavigator();

// Koyu tema navigasyon ayarları
const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#C6A052',
    background: '#0F0F11',
    card: '#1A1A1D',
    text: '#E5E5E5',
    border: '#2A2A2E',
    notification: '#C6A052',
  },
  fonts: {
    regular: { fontFamily: '', fontWeight: 'normal' },
    medium: { fontFamily: '', fontWeight: 'normal' },
    bold: { fontFamily: '', fontWeight: 'bold' },
    heavy: { fontFamily: '', fontWeight: 'bold' },
  }
};

export default function App() {
  const { isAuthenticated, isGuest, login, logout } = useAuthStore();
  const { currentUniverseId, replaceState } = useUniverseStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const syncAuthSession = async () => {
      try {
        const user = await getCurrentUser();
        const email = user.signInDetails?.loginId ?? user.username;
        login(email);

        // Giriş başarılı — buluttan otomatik veri çek
        try {
          const cloudData = await fetchStateFromCloud();
          if (cloudData) {
            replaceState(cloudData);
            console.log('[AutoSync] Buluttan veri başarıyla çekildi.');
          }
        } catch (syncErr) {
          console.warn('[AutoSync] Bulut senkronizasyonu başarısız:', syncErr);
          // Sync hatası login'i engellemez — yerel veriyle devam
        }
      } catch {
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    syncAuthSession();
  }, [login, logout, replaceState]);

  if (isInitializing) {
    return (
      <View className="flex-1 justify-center items-center bg-mythos-bg">
        <ActivityIndicator size="large" color="#C6A052" />
        <StatusBar style="light" />
      </View>
    );
  }

  // Akış: Auth → Evren Seçimi → Dashboard
  const getActiveScreen = () => {
    if (!isAuthenticated) return 'Auth';
    if (!currentUniverseId) return 'UniverseSelect';
    return 'Main';
  };

  const activeScreen = getActiveScreen();

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {activeScreen === 'Auth' && (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
        {activeScreen === 'UniverseSelect' && (
          <Stack.Screen name="UniverseSelect" component={UniverseSelectScreen} />
        )}
        {activeScreen === 'Main' && (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
