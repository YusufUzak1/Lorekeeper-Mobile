import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { signOut } from 'aws-amplify/auth';

export function MainScreen() {
  const { logout, userEmail } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      logout();
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-mythos-bg">
      <Text className="text-mythos-accent text-2xl font-bold mb-4">Lorekeeper Dashboard</Text>
      <Text className="text-mythos-text mb-8">Hoş geldiniz, {userEmail}</Text>
      
      <TouchableOpacity 
        className="border border-white/20 bg-white/5 px-6 py-3 rounded-md"
        onPress={handleLogout}
      >
        <Text className="text-white/80 uppercase text-xs tracking-widest">Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}
