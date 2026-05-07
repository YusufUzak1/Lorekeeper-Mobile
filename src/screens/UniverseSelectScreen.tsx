import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Globe, ChevronRight, Trash2, Sparkles } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { useAuthStore } from '../store/useAuthStore';
import { EmptyState } from '../components/EmptyState';

export function UniverseSelectScreen() {
  const { universes, addUniverse, deleteUniverse, setCurrentUniverseId } = useUniverseStore();
  const { userEmail, isGuest } = useAuthStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newTone, setNewTone] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const universe = addUniverse({
      name: newName.trim(),
      summary: newSummary.trim(),
      tone: newTone.trim() || 'Epik Fantezi',
    });
    setNewName('');
    setNewSummary('');
    setNewTone('');
    setIsCreating(false);
    setCurrentUniverseId(universe.id);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Evreni Sil',
      `"${name}" evreni ve tüm verileri kalıcı olarak silinecek. Emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteUniverse(id),
        },
      ]
    );
  };

  const handleSelect = (id: string) => {
    setCurrentUniverseId(id);
  };

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      {/* Header */}
      <View className="mb-2">
        <Text className="text-mythos-accent text-3xl font-bold">Lorekeeper</Text>
        <Text className="text-mythos-muted text-sm mt-1">
          Hoş geldin, {isGuest ? 'Misafir' : userEmail?.split('@')[0]}
        </Text>
      </View>

      <Text className="text-mythos-text text-xl font-bold mt-6 mb-4">Evrenlerin</Text>

      {/* Yeni Evren Formu */}
      {isCreating && (
        <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/30 mb-6">
          <Text className="text-mythos-accent font-bold text-lg mb-4">Yeni Evren</Text>

          <TextInput
            className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3 text-base"
            placeholder="Evren adı *"
            placeholderTextColor="#8A8A8E"
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3 text-base h-20"
            placeholder="Kısa özet (opsiyonel)"
            placeholderTextColor="#8A8A8E"
            multiline
            textAlignVertical="top"
            value={newSummary}
            onChangeText={setNewSummary}
          />
          <TextInput
            className="bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-4 text-base"
            placeholder="Ton (ör: Karanlık Fantezi, Bilim Kurgu)"
            placeholderTextColor="#8A8A8E"
            value={newTone}
            onChangeText={setNewTone}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 border border-mythos-border p-3 rounded-xl items-center"
              onPress={() => setIsCreating(false)}
            >
              <Text className="text-mythos-muted font-bold">İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-mythos-accent/80 p-3 rounded-xl items-center"
              onPress={handleCreate}
            >
              <Text className="text-black font-bold">Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Evren Listesi */}
      <FlatList
        data={universes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-mythos-panel rounded-2xl border border-mythos-border p-5 mb-3 active:opacity-80"
            onPress={() => handleSelect(item.id)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-1">
                  <Globe color="#C6A052" size={16} />
                  <Text className="text-mythos-accent font-bold text-lg ml-2">{item.name}</Text>
                </View>
                {item.summary ? (
                  <Text className="text-mythos-text/70 text-sm mt-1" numberOfLines={2}>
                    {item.summary}
                  </Text>
                ) : null}
                <View className="flex-row items-center mt-2">
                  <Sparkles color="#8A8A8E" size={12} />
                  <Text className="text-mythos-muted text-xs ml-1">{item.tone || 'Fantezi'}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleDelete(item.id, item.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 color="#EF4444" size={18} />
                </TouchableOpacity>
                <ChevronRight color="#8A8A8E" size={20} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Globe}
            title="Henüz Evren Yok"
            subtitle="İlk evrenini oluşturarak lore'unu inşa etmeye başla."
          />
        }
      />

      {/* FAB — Yeni Evren */}
      {!isCreating && (
        <TouchableOpacity
          className="absolute bottom-8 right-6 w-14 h-14 bg-mythos-accent rounded-full items-center justify-center"
          onPress={() => setIsCreating(true)}
          style={{
            shadowColor: '#C6A052',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Plus color="#000" size={28} />
        </TouchableOpacity>
      )}
    </View>
  );
}
