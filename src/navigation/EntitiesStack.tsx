import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EntitiesScreen } from '../screens/EntitiesScreen';
import { EntityDetailScreen } from '../screens/EntityDetailScreen';

const Stack = createNativeStackNavigator();

export function EntitiesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EntitiesList" component={EntitiesScreen} />
      <Stack.Screen name="EntityDetail" component={EntityDetailScreen} />
    </Stack.Navigator>
  );
}
