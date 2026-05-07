import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Ara...' }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-black/30 border border-white/10 rounded-xl px-4 py-3 mb-4">
      <Search color="#8A8A8E" size={18} />
      <TextInput
        className="flex-1 ml-3 text-white text-base"
        placeholder={placeholder}
        placeholderTextColor="#8A8A8E"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
