import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Clock, Trash2 } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { EmptyState } from '../components/EmptyState';

export function TimelineScreen() {
  const { getTimelineForCurrentUniverse, addTimelineEvent, deleteTimelineEvent, currentUniverseId } = useUniverseStore();
  const timeline = getTimelineForCurrentUniverse();
  const sorted = useMemo(() => [...timeline].sort((a, b) => a.position - b.position), [timeline]);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [era, setEra] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addTimelineEvent({
      name: name.trim(), year: year.trim(), era: era.trim() || 'Bilinmeyen Çağ',
      description: desc.trim(), color: '#C6A052', position: timeline.length,
      side: timeline.length % 2 === 0 ? 'above' : 'below',
      universeId: currentUniverseId || undefined,
    });
    setName(''); setYear(''); setEra(''); setDesc(''); setIsAdding(false);
  };

  const handleDelete = (id: string, n: string) => {
    Alert.alert('Sil', `"${n}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteTimelineEvent(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-mythos-text text-3xl font-bold">Zaman Çizelgesi</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} className="bg-mythos-accent/20 px-4 py-2 rounded-lg border border-mythos-accent/40">
          <Text className="text-mythos-accent font-bold">{isAdding ? 'İptal' : 'Ekle'}</Text>
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/30 mb-5">
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3" placeholder="Olay adı *" placeholderTextColor="#8A8A8E" value={name} onChangeText={setName} />
          <View className="flex-row gap-3 mb-3">
            <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white flex-1" placeholder="Yıl" placeholderTextColor="#8A8A8E" value={year} onChangeText={setYear} />
            <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white flex-1" placeholder="Çağ" placeholderTextColor="#8A8A8E" value={era} onChangeText={setEra} />
          </View>
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-4 h-20" placeholder="Açıklama" placeholderTextColor="#8A8A8E" multiline textAlignVertical="top" value={desc} onChangeText={setDesc} />
          <TouchableOpacity className="bg-mythos-accent/80 p-3 rounded-xl items-center" onPress={handleAdd}>
            <Text className="text-black font-bold uppercase">Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item, index }) => {
          const showEra = index === 0 || sorted[index - 1]?.era !== item.era;
          return (
            <View>
              {showEra && (
                <View className="flex-row items-center mb-3 mt-2">
                  <View className="w-3 h-3 rounded-full bg-mythos-accent mr-2" />
                  <Text className="text-mythos-text font-bold">{item.era}</Text>
                </View>
              )}
              <View className="flex-row mb-3">
                <View className="items-center mr-4" style={{ width: 24 }}>
                  <View className="w-2.5 h-2.5 rounded-full border-2 border-mythos-accent bg-mythos-accent/30" />
                  <View className="w-0.5 flex-1 bg-mythos-border" />
                </View>
                <View className="flex-1 bg-mythos-panel rounded-xl border border-mythos-border p-4">
                  <View className="flex-row justify-between">
                    <View className="flex-1 mr-2">
                      <Text className="text-white font-bold">{item.name}</Text>
                      {item.year ? <Text className="text-mythos-accent text-xs mt-0.5">{item.year}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}><Trash2 color="#EF4444" size={14} /></TouchableOpacity>
                  </View>
                  {item.description ? <Text className="text-mythos-text/70 text-sm mt-2">{item.description}</Text> : null}
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon={Clock} title="Zaman Çizelgesi Boş" subtitle="Evreninin tarihini yazmaya başla." />}
      />
    </View>
  );
}
