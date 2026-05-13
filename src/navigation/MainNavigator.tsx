import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, Users, Settings, Search } from 'lucide-react-native';

import { DashboardStack } from './DashboardStack';
import { EntitiesStack } from './EntitiesStack';
import { NotesScreen } from '../screens/NotesScreen';
import { GlobalSearchScreen } from '../screens/GlobalSearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

type TabParamList = {
  DashboardTab: undefined;
  EntitiesTab: undefined;
  Notes: undefined;
  SearchTab: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function MainNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A1D',
          borderTopWidth: 1,
          borderTopColor: '#2A2A2E',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C6A052',
        tabBarInactiveTintColor: '#8A8A8E',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home color={color} size={size} />
          ),
          tabBarLabel: 'Evren',
        }}
      />
      <Tab.Screen
        name="EntitiesTab"
        component={EntitiesStack}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Users color={color} size={size} />
          ),
          tabBarLabel: 'Varlıklar',
        }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <BookOpen color={color} size={size} />
          ),
          tabBarLabel: 'Notlar',
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={GlobalSearchScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Search color={color} size={size} />
          ),
          tabBarLabel: 'Ara',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Settings color={color} size={size} />
          ),
          tabBarLabel: 'Ayarlar',
        }}
      />
    </Tab.Navigator>
  );
}
