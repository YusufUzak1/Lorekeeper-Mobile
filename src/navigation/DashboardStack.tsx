import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainScreen } from '../screens/MainScreen';
import { MythologyScreen } from '../screens/MythologyScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { LoreScreen } from '../screens/LoreScreen';
import { CosmosScreen } from '../screens/CosmosScreen';
import { MapsScreen } from '../screens/MapsScreen';
import { LanguagesScreen } from '../screens/LanguagesScreen';

const Stack = createNativeStackNavigator();

export function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={MainScreen} />
      <Stack.Screen name="Mythology" component={MythologyScreen} />
      <Stack.Screen name="Timeline" component={TimelineScreen} />
      <Stack.Screen name="Lore" component={LoreScreen} />
      <Stack.Screen name="Cosmos" component={CosmosScreen} />
      <Stack.Screen name="Maps" component={MapsScreen} />
      <Stack.Screen name="Languages" component={LanguagesScreen} />
    </Stack.Navigator>
  );
}
