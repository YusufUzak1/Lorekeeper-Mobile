import React from 'react';
import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center py-16 px-8">
      <View className="w-16 h-16 bg-mythos-accent/10 rounded-full items-center justify-center mb-4">
        <Icon color="#C6A052" size={28} />
      </View>
      <Text className="text-mythos-text font-bold text-lg text-center mb-2">{title}</Text>
      {subtitle && (
        <Text className="text-mythos-muted text-sm text-center leading-5">{subtitle}</Text>
      )}
    </View>
  );
}
