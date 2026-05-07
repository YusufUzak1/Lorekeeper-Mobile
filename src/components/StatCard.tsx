import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  onPress?: () => void;
}

export function StatCard({ title, count, icon: Icon, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      className="bg-mythos-panel border border-mythos-border rounded-xl p-4 flex-1 mx-1 items-center active:opacity-80"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 bg-mythos-accent/15 rounded-full items-center justify-center mb-2">
        <Icon color="#C6A052" size={20} />
      </View>
      <Text className="text-white font-bold text-xl">{count}</Text>
      <Text className="text-mythos-muted text-xs mt-1 text-center">{title}</Text>
    </TouchableOpacity>
  );
}
