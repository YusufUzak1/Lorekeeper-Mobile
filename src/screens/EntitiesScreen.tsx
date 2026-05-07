import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users, Map, Zap, Plus, Trash2, ChevronRight } from 'lucide-react-native';
import { useUniverseStore, type EntityFilterType } from '../store/useUniverseStore';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import type { EntityType } from '../types';

const FILTER_TABS: { key: EntityFilterType; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'character', label: 'Karakterler' },
  { key: 'place', label: 'Mekanlar' },
  { key: 'event', label: 'Olaylar' },
];

const TYPE_ICONS = { character: Users, place: Map, event: Zap };
const TYPE_LABELS = { character: 'Karakter', place: 'Mekan', event: 'Olay' };

export function EntitiesScreen() {
  const navigation = useNavigation<any>();
  const { getEntitiesForCurrentUniverse, addEntity, deleteEntity, currentUniverseId } = useUniverseStore();
  const entities = getEntitiesForCurrentUniverse();

  const [filter, setFilter] = useState<EntityFilterType>('all');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<EntityType>('character');
  const [newDesc, setNewDesc] = useState('');

  const filtered = useMemo(() => {
    let list = filter === 'all' ? entities : entities.filter((e) => e.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }
    return list;
  }, [entities, filter, search]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addEntity({ name: newName.trim(), type: newType, description: newDesc.trim(), era: '', status: 'active', domains: [], universeId: currentUniverseId || undefined });
    setNewName(''); setNewDesc(''); setIsAdding(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Varlığı Sil', `"${name}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteEntity(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-mythos-text text-3xl font-bold">Varlıklar</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} className="bg-mythos-accent/20 px-4 py-2 rounded-lg border border-mythos-accent/40">
          <Text className="text-mythos-accent font-bold">{isAdding ? 'İptal' : 'Ekle'}</Text>
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Varlık ara..." />

      {/* Filter Tabs */}
      <View className="flex-row bg-black/25 rounded-xl border border-white/10 p-1 mb-5">
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-2 items-center rounded-lg ${filter === tab.key ? 'bg-mythos-accent/20 border border-mythos-accent/40' : ''}`}
            onPress={() => setFilter(tab.key)}
          >
            <Text className={filter === tab.key ? 'text-mythos-accent font-bold text-xs' : 'text-white/60 text-xs'}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Form */}
      {isAdding && (
        <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/30 mb-5">
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3" placeholder="Varlık adı *" placeholderTextColor="#8A8A8E" value={newName} onChangeText={setNewName} />
          <View className="flex-row bg-black/25 rounded-xl border border-white/10 p-1 mb-3">
            {(['character', 'place', 'event'] as EntityType[]).map((t) => (
              <TouchableOpacity key={t} className={`flex-1 py-2 items-center rounded-lg ${newType === t ? 'bg-mythos-accent/20 border border-mythos-accent/40' : ''}`} onPress={() => setNewType(t)}>
                <Text className={newType === t ? 'text-mythos-accent font-bold text-xs' : 'text-white/60 text-xs'}>{TYPE_LABELS[t]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-4 h-20" placeholder="Açıklama (opsiyonel)" placeholderTextColor="#8A8A8E" multiline textAlignVertical="top" value={newDesc} onChangeText={setNewDesc} />
          <TouchableOpacity className="bg-mythos-accent/80 p-3 rounded-xl items-center" onPress={handleAdd}>
            <Text className="text-black font-bold uppercase">Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Entity List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          const Icon = TYPE_ICONS[item.type] || Users;
          return (
            <TouchableOpacity
              className="bg-mythos-panel p-4 rounded-2xl border border-mythos-border mb-3 flex-row items-center active:opacity-80"
              onPress={() => navigation.navigate('EntityDetail', { entityId: item.id })}
            >
              <View className="w-10 h-10 bg-mythos-accent/10 rounded-full items-center justify-center mr-3">
                <Icon color="#C6A052" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">{item.name}</Text>
                <Text className="text-mythos-muted text-xs mt-0.5">{TYPE_LABELS[item.type]}{item.era ? ` · ${item.era}` : ''}</Text>
                {item.description ? <Text className="text-mythos-text/60 text-sm mt-1" numberOfLines={2}>{item.description}</Text> : null}
              </View>
              <View className="flex-row items-center gap-1">
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2" hitSlop={{top:8,bottom:8,left:8,right:8}}><Trash2 color="#EF4444" size={16} /></TouchableOpacity>
                <ChevronRight color="#8A8A8E" size={16} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<EmptyState icon={Users} title="Varlık Bulunamadı" subtitle={search ? 'Arama kriterlerini değiştirmeyi dene.' : 'Evrenine karakter, mekan veya olay ekle.'} />}
      />
    </View>
  );
}
