import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { Compass, Trash2, MapPin, ArrowLeft } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { EmptyState } from '../components/EmptyState';

const COLORS = ['#C6A052','#22C55E','#3B82F6','#8B5CF6','#EF4444','#06B6D4','#F97316','#EC4899','#84CC16','#F59E0B'];
const TYPES = ['Kıta','Krallık','Şehir','Köy','Dağ','Orman','Deniz','Çöl','Ada','Mağara','Tapınak','Harabe','Diğer'];

export function MapsScreen({ navigation }: any) {
  const { regions, currentUniverseId, addRegion, deleteRegion } = useUniverseStore();
  const currentRegions = useMemo(() => regions.filter(r => r.universeId === currentUniverseId), [regions, currentUniverseId]);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Krallık');
  const [color, setColor] = useState('#C6A052');
  const [desc, setDesc] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim()) return;
    addRegion({ name: name.trim(), type, color, opacity: 0.15, svgPath: '', description: desc.trim(), universeId: currentUniverseId || undefined });
    setName(''); setDesc(''); setIsAdding(false);
  };

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      <View className="flex-row items-center mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3"><ArrowLeft color="#8A8A8E" size={20} /></TouchableOpacity>
        <Compass color="#C6A052" size={22} />
        <Text className="text-mythos-text text-3xl font-bold ml-2 flex-1">Harita</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} className="bg-mythos-accent/20 px-4 py-2 rounded-lg border border-mythos-accent/40">
          <Text className="text-mythos-accent font-bold">{isAdding ? 'İptal' : 'Ekle'}</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-mythos-muted text-xs mb-5">Kıtalar, Diyarlar ve Denizler</Text>

      {isAdding && (
        <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/30 mb-5">
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3" placeholder="Bölge adı *" placeholderTextColor="#8A8A8E" value={name} onChangeText={setName} />
          <Text className="text-white/40 text-[10px] uppercase tracking-[2px] mb-2 font-bold">Tür</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row gap-2">
              {TYPES.map(t => (
                <TouchableOpacity key={t} onPress={() => setType(t)} className={`px-3 py-2 rounded-lg border ${type === t ? 'bg-mythos-accent/20 border-mythos-accent/50' : 'bg-black/20 border-white/10'}`}>
                  <Text className={`text-xs ${type === t ? 'text-mythos-accent font-bold' : 'text-white/60'}`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text className="text-white/40 text-[10px] uppercase tracking-[2px] mb-2 font-bold">Renk</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {COLORS.map(c => (
              <TouchableOpacity key={c} onPress={() => setColor(c)} className={`w-8 h-8 rounded-full ${color === c ? 'border-2 border-white' : 'border border-white/20'}`} style={{ backgroundColor: c }} />
            ))}
          </View>
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-4 h-20" placeholder="Açıklama" placeholderTextColor="#8A8A8E" multiline textAlignVertical="top" value={desc} onChangeText={setDesc} />
          <TouchableOpacity className="bg-mythos-accent/80 p-3 rounded-xl items-center" onPress={handleAdd}>
            <Text className="text-black font-bold uppercase">Bölge Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={currentRegions}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-mythos-panel rounded-2xl border border-mythos-border mb-3 overflow-hidden" onPress={() => setExpanded(expanded === item.id ? null : item.id)} activeOpacity={0.8}>
            <View className="h-1" style={{ backgroundColor: item.color }} />
            <View className="p-4">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">{item.name}</Text>
                  <Text className="text-mythos-muted text-xs">{item.type}</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Sil', `"${item.name}" silinsin mi?`, [{ text: 'İptal', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => deleteRegion(item.id) }])} className="p-1">
                  <Trash2 color="#EF4444" size={14} />
                </TouchableOpacity>
              </View>
              {expanded === item.id && item.description ? <Text className="text-mythos-text/70 text-sm mt-3 leading-5 pl-7">{item.description}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon={MapPin} title="Henüz Bölge Yok" subtitle="Evreninin coğrafyasını oluşturmaya başla." />}
      />
    </View>
  );
}
