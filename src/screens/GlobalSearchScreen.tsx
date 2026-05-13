import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Search, Users, Map, Zap, BookOpen, Scroll, Clock, X } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { useNavigation } from '@react-navigation/native';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'entity' | 'note' | 'myth' | 'timeline';
  icon: any;
  color: string;
}

const TYPE_ICONS: Record<string, any> = { character: Users, place: Map, event: Zap };

export function GlobalSearchScreen() {
  const navigation = useNavigation<any>();
  const {
    getEntitiesForCurrentUniverse, getNotesForCurrentUniverse,
    getMythsForCurrentUniverse, getTimelineForCurrentUniverse,
  } = useUniverseStore();

  const [query, setQuery] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const out: SearchResult[] = [];

    // Entities
    getEntitiesForCurrentUniverse().forEach(e => {
      if (e.name.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)) {
        out.push({ id: e.id, title: e.name, subtitle: e.type === 'character' ? 'Karakter' : e.type === 'place' ? 'Mekan' : 'Olay', type: 'entity', icon: TYPE_ICONS[e.type] || Users, color: '#C6A052' });
      }
    });

    // Notes
    getNotesForCurrentUniverse().forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)) {
        out.push({ id: n.id, title: n.title, subtitle: 'Not', type: 'note', icon: BookOpen, color: '#3B82F6' });
      }
    });

    // Myths
    getMythsForCurrentUniverse().forEach(m => {
      if (m.name.toLowerCase().includes(q) || m.epithet?.toLowerCase().includes(q)) {
        out.push({ id: m.id, title: m.name, subtitle: `Efsane · ${m.tier}`, type: 'myth', icon: Scroll, color: '#8B5CF6' });
      }
    });

    // Timeline
    getTimelineForCurrentUniverse().forEach(t => {
      if (t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        out.push({ id: t.id, title: t.name, subtitle: `Olay · ${t.era}`, type: 'timeline', icon: Clock, color: '#F59E0B' });
      }
    });

    return out;
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    if (item.type === 'entity') {
      navigation.navigate('EntitiesTab', { screen: 'EntityDetail', params: { entityId: item.id } });
    }
    // Other types don't have detail screens yet — just close search
  };

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      <Text className="text-mythos-text text-3xl font-bold mb-4">Ara</Text>

      {/* Search Input */}
      <View className="bg-mythos-panel border border-mythos-border rounded-xl flex-row items-center px-4 mb-4">
        <Search color="#C6A052" size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tüm modüllerde ara..."
          className="flex-1 py-3.5 px-3 text-white text-sm"
          placeholderTextColor="#8A8A8E"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <X color="#8A8A8E" size={16} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {query.trim() ? (
        <>
          <Text className="text-mythos-muted text-xs mb-3">{results.length} sonuç bulundu</Text>
          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.type}-${item.id}-${i}`}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  className="bg-mythos-panel rounded-xl border border-mythos-border p-4 mb-2 flex-row items-center"
                  onPress={() => handleSelect(item)}
                >
                  <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: item.color + '20' }}>
                    <Icon color={item.color} size={16} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold">{item.title}</Text>
                    <Text className="text-mythos-muted text-xs">{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View className="py-12 items-center">
                <Search color="#8A8A8E" size={32} />
                <Text className="text-mythos-muted text-sm mt-3">Eşleşen sonuç bulunamadı.</Text>
              </View>
            }
          />
        </>
      ) : (
        <View className="py-16 items-center">
          <Search color="#C6A05240" size={48} />
          <Text className="text-mythos-muted text-sm mt-4">Varlıklar, notlar, efsaneler ve olaylarda ara</Text>
        </View>
      )}
    </View>
  );
}
