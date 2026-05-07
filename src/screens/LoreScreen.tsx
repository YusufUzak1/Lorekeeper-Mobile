import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Sparkles, Send } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { useAuthStore } from '../store/useAuthStore';
import { submitLoreNote } from '../services/loreService';

export function LoreScreen() {
  const { currentUniverseId } = useUniverseStore();
  const { isGuest } = useAuthStore();
  const [noteText, setNoteText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!noteText.trim() || !currentUniverseId) return;
    if (isGuest) { Alert.alert('Uyarı', 'AI özelliği için giriş yapmalısınız.'); return; }
    setSending(true); setResult(null);
    try {
      await submitLoreNote(currentUniverseId, noteText.trim());
      setResult('Not AI işleme kuyruğuna gönderildi! Sonuçlar kısa sürede hazır olacak.');
      setNoteText('');
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Gönderilemedi.');
    } finally { setSending(false); }
  };

  return (
    <ScrollView className="flex-1 bg-mythos-bg pt-14 px-6">
      <View className="flex-row items-center mb-2">
        <Sparkles color="#C6A052" size={28} />
        <Text className="text-mythos-text text-3xl font-bold ml-2">Lore AI</Text>
      </View>
      <Text className="text-mythos-muted text-sm mb-8">
        Notlarını AI'a gönder, karakterler, mekanlar ve ilişkiler otomatik çıkarılsın.
      </Text>

      <View className="bg-mythos-panel p-5 rounded-2xl border border-mythos-border mb-6">
        <Text className="text-mythos-text font-bold text-base mb-3">Lore Notu</Text>
        <TextInput
          className="bg-black/30 border border-white/10 rounded-xl p-4 text-white h-40 text-base"
          placeholder="Evrenindeki bir olayı, karakteri veya yeri anlat..."
          placeholderTextColor="#8A8A8E"
          multiline textAlignVertical="top"
          value={noteText} onChangeText={setNoteText}
        />
        <TouchableOpacity
          className={`flex-row items-center justify-center p-4 rounded-xl mt-4 ${noteText.trim() ? 'bg-mythos-accent/80' : 'bg-mythos-border'}`}
          onPress={handleSubmit} disabled={sending || !noteText.trim()}
        >
          {sending ? <ActivityIndicator color="#000" /> : (
            <>
              <Send color={noteText.trim() ? '#000' : '#8A8A8E'} size={18} />
              <Text className={`font-bold uppercase ml-2 ${noteText.trim() ? 'text-black' : 'text-mythos-muted'}`}>AI'a Gönder</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View className="bg-green-900/30 border border-green-500/30 p-4 rounded-xl mb-6">
          <Text className="text-green-400 text-sm">{result}</Text>
        </View>
      )}

      <View className="bg-mythos-panel/50 border border-mythos-border rounded-xl p-4 mb-10">
        <Text className="text-mythos-accent font-bold mb-2">Nasıl Çalışır?</Text>
        <Text className="text-mythos-muted text-sm leading-5">
          1. Evreninle ilgili bir metin yaz{'\n'}
          2. AI metni analiz eder (Claude 3){'\n'}
          3. Karakterler, mekanlar ve ilişkiler çıkarılır{'\n'}
          4. Otomatik olarak evrenine eklenir
        </Text>
      </View>
    </ScrollView>
  );
}
