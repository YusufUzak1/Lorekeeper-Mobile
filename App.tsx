import './global.css';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Amplify } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { View, ActivityIndicator } from 'react-native';

import { AuthScreen } from './src/screens/AuthScreen';
import { MainScreen } from './src/screens/MainScreen';
import { useAuthStore } from './src/store/useAuthStore';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '',
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
  const { isAuthenticated, login, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const syncAuthSession = async () => {
      try {
        const user = await getCurrentUser();
        const email = user.signInDetails?.loginId ?? user.username;
        login(email);
      } catch {
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    syncAuthSession();
  }, [login, logout]);

  if (isInitializing) {
    return (
      <View className="flex-1 justify-center items-center bg-mythos-bg">
        <ActivityIndicator size="large" color="#C6A052" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainScreen} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
