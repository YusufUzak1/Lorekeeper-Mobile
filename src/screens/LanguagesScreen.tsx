import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { BookOpen, Trash2, ArrowLeft, Plus, Mic, Type } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { EmptyState } from '../components/EmptyState';
import type { Language } from '../types';

type LangTab = 'glyphs' | 'phrases' | 'phonetics' | 'info';

export function LanguagesScreen({ navigation }: any) {
  const { languages, currentUniverseId, addLanguage, deleteLanguage } = useUniverseStore();
  const currentLangs = useMemo(() => languages.filter(l => l.universeId === currentUniverseId), [languages, currentUniverseId]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<LangTab>('glyphs');
  const [isAdding, setIsAdding] = useState(false);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newFamily, setNewFamily] = useState('');
  const [newDir, setNewDir] = useState('Soldan Sağa');
  const [newInfo, setNewInfo] = useState('');

  const selected = useMemo<Language | null>(() => {
    if (selectedId) return currentLangs.find(l => l.id === selectedId) || null;
    return currentLangs.length > 0 ? currentLangs[0] : null;
  }, [currentLangs, selectedId]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addLanguage({
      name: newName.trim(), family: newFamily.trim() || 'Bilinmiyor',
      writingDirection: newDir, info: newInfo.trim(),
      glyphs: [], phrases: [], phonetics: [],
      universeId: currentUniverseId || undefined,
    });
    setNewName(''); setNewFamily(''); setNewInfo(''); setIsAdding(false);
  };

  const TABS: { key: LangTab; label: string }[] = [
    { key: 'glyphs', label: 'Alfabe' },
    { key: 'phrases', label: 'Sözlük' },
    { key: 'phonetics', label: 'Fonetik' },
    { key: 'info', label: 'Bilgi' },
  ];

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3"><ArrowLeft color="#8A8A8E" size={20} /></TouchableOpacity>
        <Type color="#C6A052" size={22} />
        <Text className="text-mythos-text text-3xl font-bold ml-2 flex-1">Diller</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} className="bg-mythos-accent/20 px-4 py-2 rounded-lg border border-mythos-accent/40">
          <Text className="text-mythos-accent font-bold">{isAdding ? 'İptal' : 'Ekle'}</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-mythos-muted text-xs mb-4">Elfçe, Kademli ve Ötesi</Text>

      {/* Add Form */}
      {isAdding && (
        <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/30 mb-5">
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3" placeholder="Dil adı *" placeholderTextColor="#8A8A8E" value={newName} onChangeText={setNewName} />
          <View className="flex-row gap-3 mb-3">
            <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white flex-1" placeholder="Aile (ör: Elfçe)" placeholderTextColor="#8A8A8E" value={newFamily} onChangeText={setNewFamily} />
          </View>
          <View className="flex-row gap-2 mb-3">
            {['Soldan Sağa', 'Sağdan Sola', 'Yukarıdan Aşağı'].map(d => (
              <TouchableOpacity key={d} onPress={() => setNewDir(d)} className={`flex-1 py-2 items-center rounded-lg border ${newDir === d ? 'bg-mythos-accent/20 border-mythos-accent/50' : 'bg-black/20 border-white/10'}`}>
                <Text className={`text-[10px] ${newDir === d ? 'text-mythos-accent font-bold' : 'text-white/60'}`}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-4 h-20" placeholder="Dil hakkında bilgi" placeholderTextColor="#8A8A8E" multiline textAlignVertical="top" value={newInfo} onChangeText={setNewInfo} />
          <TouchableOpacity className="bg-mythos-accent/80 p-3 rounded-xl items-center" onPress={handleAdd}>
            <Text className="text-black font-bold uppercase">Dil Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Language Selector */}
      {currentLangs.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {currentLangs.map(l => (
              <TouchableOpacity key={l.id} onPress={() => { setSelectedId(l.id); setTab('glyphs'); }}
                className={`px-4 py-2.5 rounded-xl border ${selected?.id === l.id ? 'bg-mythos-accent/20 border-mythos-accent/40' : 'bg-black/20 border-white/10'}`}>
                <Text className={`font-bold text-sm ${selected?.id === l.id ? 'text-mythos-accent' : 'text-white/60'}`}>{l.name}</Text>
                <Text className="text-white/30 text-[10px]">{l.family}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {!selected ? (
        <EmptyState icon={BookOpen} title="Henüz Dil Yok" subtitle="Evreninin dillerini oluşturmaya başla." />
      ) : (
        <View className="flex-1">
          {/* Tab bar */}
          <View className="flex-row bg-black/25 rounded-xl border border-white/10 p-1 mb-4">
            {TABS.map(t => (
              <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} className={`flex-1 py-2 items-center rounded-lg ${tab === t.key ? 'bg-mythos-accent/20' : ''}`}>
                <Text className={`text-xs ${tab === t.key ? 'text-mythos-accent font-bold' : 'text-white/50'}`}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Delete button */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-mythos-text font-bold text-lg">{selected.name}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Dili Sil', `"${selected.name}" silinsin mi?`, [{ text: 'İptal', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => { deleteLanguage(selected.id); setSelectedId(null); } }])} className="p-2">
              <Trash2 color="#EF4444" size={16} />
            </TouchableOpacity>
          </View>

          {/* Tab content */}
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
            {tab === 'glyphs' && (
              selected.glyphs.length === 0
                ? <Text className="text-mythos-muted text-sm text-center py-8">Henüz glyph eklenmedi</Text>
                : <View className="flex-row flex-wrap gap-3">
                    {selected.glyphs.map((g, i) => (
                      <View key={i} className="bg-mythos-panel border border-mythos-border rounded-xl p-3 items-center" style={{ width: 64 }}>
                        <Text className="text-mythos-accent text-2xl">{g.char}</Text>
                        <Text className="text-white/30 text-[9px] mt-1 uppercase">{g.label}</Text>
                      </View>
                    ))}
                  </View>
            )}
            {tab === 'phrases' && (
              selected.phrases.length === 0
                ? <Text className="text-mythos-muted text-sm text-center py-8">Henüz sözcük/cümle eklenmedi</Text>
                : <View className="gap-3">
                    {selected.phrases.map((p, i) => (
                      <View key={i} className="bg-mythos-panel border border-mythos-border rounded-xl p-4">
                        <Text className="text-mythos-accent font-bold">{p.original}</Text>
                        <Text className="text-white/60 text-sm italic mt-1">{p.transcription}</Text>
                        <Text className="text-white/90 text-sm mt-1">{p.meaning}</Text>
                      </View>
                    ))}
                  </View>
            )}
            {tab === 'phonetics' && (
              selected.phonetics.length === 0
                ? <Text className="text-mythos-muted text-sm text-center py-8">Henüz fonetik eşdeğer eklenmedi</Text>
                : <View className="flex-row flex-wrap gap-3">
                    {selected.phonetics.map((ph, i) => (
                      <View key={i} className="bg-mythos-panel border border-mythos-border rounded-xl p-3 flex-row items-center gap-2">
                        <Text className="text-mythos-accent text-lg">{ph.source}</Text>
                        <Text className="text-white/20">→</Text>
                        <Text className="text-white/70 text-lg">{ph.equivalent}</Text>
                      </View>
                    ))}
                  </View>
            )}
            {tab === 'info' && (
              <View className="bg-mythos-panel border border-mythos-border rounded-xl p-5">
                <Text className="text-white/70 leading-6 italic">{selected.info || 'Bu dil hakkında henüz bilgi eklenmedi.'}</Text>
                <View className="flex-row gap-4 mt-4 pt-4 border-t border-white/5">
                  <View><Text className="text-white/30 text-[10px] uppercase">Aile</Text><Text className="text-white/80 text-sm">{selected.family}</Text></View>
                  <View><Text className="text-white/30 text-[10px] uppercase">Yazım Yönü</Text><Text className="text-white/80 text-sm">{selected.writingDirection}</Text></View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
