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
import { pullCloudStateAfterAuth } from './src/services/cloudSyncAfterAuth';

const userPoolId = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ?? '';
const userPoolClientId = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID ?? '';

if (userPoolId && userPoolClientId) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
      },
    },
  });
} else {
  console.warn(
    '[Lorekeeper] EXPO_PUBLIC_COGNITO_USER_POOL_ID ve EXPO_PUBLIC_COGNITO_CLIENT_ID tanımlı değil; kimlik doğrulama çalışmayabilir.'
  );
}

const Stack = createNativeStackNavigator();

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
  },
};

export default function App() {
  const { isAuthenticated, login, logout } = useAuthStore();
  const { currentUniverseId } = useUniverseStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const syncAuthSession = async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled) return;
        const email = user.signInDetails?.loginId ?? user.username;
        login(email);
        void pullCloudStateAfterAuth().catch(() => {});
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    void syncAuthSession();
    return () => {
      cancelled = true;
    };
  }, [login, logout]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F11' }}>
        <ActivityIndicator size="large" color="#C6A052" />
      </View>
    );
  }

  const getActiveScreen = () => {
    if (!isAuthenticated) return 'Auth';
    if (!currentUniverseId) return 'UniverseSelect';
    return 'Main';
  };

  const activeScreen = getActiveScreen();

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {activeScreen === 'Auth' && <Stack.Screen name="Auth" component={AuthScreen} />}
        {activeScreen === 'UniverseSelect' && (
          <Stack.Screen name="UniverseSelect" component={UniverseSelectScreen} />
        )}
        {activeScreen === 'Main' && <Stack.Screen name="Main" component={MainNavigator} />}
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
