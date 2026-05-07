import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Scroll, Trash2, Plus, Sparkles } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { EmptyState } from '../components/EmptyState';

const TIER_COLORS: Record<string, string> = {
  Titan: '#C6A052', Major: '#8B5CF6', Minor: '#3B82F6', Spirit: '#06B6D4',
};

export function MythologyScreen() {
  const { getMythsForCurrentUniverse, addMyth, deleteMyth, currentUniverseId } = useUniverseStore();
  const myths = getMythsForCurrentUniverse();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [epithet, setEpithet] = useState('');
  const [tier, setTier] = useState('Major');
  const [glyph, setGlyph] = useState('⚡');
  const [desc, setDesc] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addMyth({
      name: name.trim(), epithet: epithet.trim(), tier, glyph: glyph.trim() || '✦',
      color: TIER_COLORS[tier] || '#C6A052', description: desc.trim(),
      domains: [], universeId: currentUniverseId || undefined,
    });
    setName(''); setEpithet(''); setDesc(''); setGlyph('⚡'); setIsAdding(false);
  };

  const handleDelete = (id: string, n: string) => {
    Alert.alert('Efsaneyi Sil', `"${n}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteMyth(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-mythos-text text-3xl font-bold">Efsaneler</Text>
        <TouchableOpacity onPress={() => { setIsAdding(!isAdding); setName(''); }} className="bg-mythos-accent/20 px-4 py-2 rounded-lg border border-mythos-accent/40">
          <Text className="text-mythos-accent font-bold">{isAdding ? 'İptal' : 'Ekle'}</Text>
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/30 mb-5">
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3" placeholder="İsim *" placeholderTextColor="#8A8A8E" value={name} onChangeText={setName} />
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3" placeholder="Lakap (ör: Fırtına Tanrısı)" placeholderTextColor="#8A8A8E" value={epithet} onChangeText={setEpithet} />
          <View className="flex-row bg-black/25 rounded-xl border border-white/10 p-1 mb-3">
            {['Titan', 'Major', 'Minor', 'Spirit'].map((t) => (
              <TouchableOpacity key={t} className={`flex-1 py-2 items-center rounded-lg ${tier === t ? 'bg-mythos-accent/20 border border-mythos-accent/40' : ''}`} onPress={() => setTier(t)}>
                <Text className={tier === t ? 'text-mythos-accent font-bold text-xs' : 'text-white/60 text-xs'}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3" placeholder="Sembol (emoji: ⚡🔥🌊)" placeholderTextColor="#8A8A8E" value={glyph} onChangeText={setGlyph} />
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-4 h-20" placeholder="Açıklama" placeholderTextColor="#8A8A8E" multiline textAlignVertical="top" value={desc} onChangeText={setDesc} />
          <TouchableOpacity className="bg-mythos-accent/80 p-3 rounded-xl items-center" onPress={handleAdd}>
            <Text className="text-black font-bold uppercase">Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={myths}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          const tierColor = TIER_COLORS[item.tier] || '#C6A052';
          return (
            <View className="bg-mythos-panel rounded-2xl border border-mythos-border mb-3 overflow-hidden">
              <View className="h-1" style={{ backgroundColor: tierColor }} />
              <View className="p-5">
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center flex-1 mr-2">
                    <Text className="text-3xl mr-3">{item.glyph}</Text>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">{item.name}</Text>
                      {item.epithet ? <Text className="text-mythos-muted text-sm italic">{item.epithet}</Text> : null}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="px-2 py-1 rounded-full" style={{ backgroundColor: tierColor + '20' }}>
                      <Text style={{ color: tierColor, fontSize: 11, fontWeight: '700' }}>{item.tier}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-1"><Trash2 color="#EF4444" size={16} /></TouchableOpacity>
                  </View>
                </View>
                {item.description ? <Text className="text-mythos-text/70 text-sm mt-3 leading-5">{item.description}</Text> : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon={Scroll} title="Henüz Efsane Yok" subtitle="Evreninin mitolojisini oluşturmaya başla." />}
      />
    </View>
  );
}
