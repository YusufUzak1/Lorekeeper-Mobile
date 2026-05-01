import './global.css';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

// Koyu tema navigasyon ayarları
const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#C6A052', // mythos-accent
    background: '#0F0F11', // mythos-bg
    card: '#1A1A1D', // mythos-panel
    text: '#E5E5E5', // mythos-text
    border: '#2A2A2E', // mythos-border
    notification: '#C6A052',
  },
  fonts: {
    regular: {
      fontFamily: '',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: '',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: '',
      fontWeight: 'bold',
    },
    heavy: {
      fontFamily: '',
      fontWeight: 'bold',
    },
  }
};

function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-mythos-bg">
      <Text className="text-mythos-accent text-2xl font-bold mb-4">Lorekeeper</Text>
      <Text className="text-mythos-text">Evrenlerin Cebinde.</Text>
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
