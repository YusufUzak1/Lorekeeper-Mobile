import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Yükleniyor...' }: LoadingOverlayProps) {
  return (
    <View className="flex-1 justify-center items-center bg-mythos-bg">
      <View className="bg-mythos-panel p-8 rounded-2xl border border-mythos-border items-center">
        <ActivityIndicator size="large" color="#C6A052" />
        <Text className="text-mythos-muted mt-4 text-sm">{message}</Text>
      </View>
    </View>
  );
}
