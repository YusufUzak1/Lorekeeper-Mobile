import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { BookOpen, Trash2, Edit3, X, Check } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { EmptyState } from '../components/EmptyState';

export function NotesScreen() {
  const { getNotesForCurrentUniverse, addNote, updateNote, deleteNote, currentUniverseId } = useUniverseStore();
  const notes = getNotesForCurrentUniverse();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;
    addNote({ title: title.trim(), content: content.trim(), universeId: currentUniverseId || undefined });
    setTitle(''); setContent(''); setIsAdding(false);
  };

  const startEdit = (id: string, t: string, c: string) => { setEditingId(id); setTitle(t); setContent(c); };
  const saveEdit = () => {
    if (!editingId || !title.trim()) return;
    updateNote(editingId, { title: title.trim(), content: content.trim() });
    setEditingId(null); setTitle(''); setContent('');
  };
  const cancelEdit = () => { setEditingId(null); setTitle(''); setContent(''); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Notu Sil', `"${name}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteNote(id) },
    ]);
  };

  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-mythos-text text-3xl font-bold">Lore Notları</Text>
        <TouchableOpacity onPress={() => { setIsAdding(!isAdding); setTitle(''); setContent(''); }} className="bg-mythos-accent/20 px-4 py-2 rounded-lg border border-mythos-accent/40">
          <Text className="text-mythos-accent font-bold">{isAdding ? 'İptal' : 'Yeni Not'}</Text>
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/30 mb-6">
          <TextInput className="text-white text-lg font-bold mb-3 border-b border-white/10 pb-3" placeholder="Not Başlığı..." placeholderTextColor="#8A8A8E" value={title} onChangeText={setTitle} />
          <TextInput className="text-white/80 h-28" placeholder="Aklındakileri yaz..." placeholderTextColor="#8A8A8E" multiline textAlignVertical="top" value={content} onChangeText={setContent} />
          <TouchableOpacity className="bg-mythos-accent/80 p-3 rounded-xl items-center mt-4" onPress={handleAdd}>
            <Text className="text-black font-bold uppercase">Kaydet</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          if (editingId === item.id) {
            return (
              <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/30 mb-4">
                <TextInput className="text-white text-lg font-bold mb-3 border-b border-white/10 pb-3" value={title} onChangeText={setTitle} />
                <TextInput className="text-white/80 h-24" multiline textAlignVertical="top" value={content} onChangeText={setContent} />
                <View className="flex-row justify-end gap-3 mt-3">
                  <TouchableOpacity onPress={cancelEdit} className="p-2"><X color="#8A8A8E" size={22} /></TouchableOpacity>
                  <TouchableOpacity onPress={saveEdit} className="p-2"><Check color="#C6A052" size={22} /></TouchableOpacity>
                </View>
              </View>
            );
          }
          return (
            <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-border mb-4">
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-mythos-accent font-bold text-lg flex-1 mr-2">{item.title}</Text>
                <View className="flex-row gap-1">
                  <TouchableOpacity onPress={() => startEdit(item.id, item.title, item.content)} className="p-1.5"><Edit3 color="#8A8A8E" size={16} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} className="p-1.5"><Trash2 color="#EF4444" size={16} /></TouchableOpacity>
                </View>
              </View>
              <Text className="text-mythos-text/80 leading-5">{item.content}</Text>
              {item.updatedAt && <Text className="text-mythos-muted text-xs mt-3">{fmtDate(item.updatedAt)}</Text>}
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon={BookOpen} title="Henüz Not Yok" subtitle="Evreninin hikayesini yazmaya başlamak için yeni bir not ekle." />}
      />
    </View>
  );
}
