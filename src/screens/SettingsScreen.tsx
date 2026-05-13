import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useUniverseStore } from '../store/useUniverseStore';
import { signOut } from 'aws-amplify/auth';
import { LogOut, User, Cloud, Globe, RefreshCw, CloudDownload, CloudUpload, CheckCircle, AlertCircle, Clock } from 'lucide-react-native';
import { fetchStateFromCloud, syncStateToCloud } from '../services/syncService';

export function SettingsScreen() {
  const { logout, userEmail, isGuest } = useAuthStore();
  const store = useUniverseStore();
  const { universes, entities, connections, myths, timeline, regions, languages, notes, currentUniverseId, setCurrentUniverseId, replaceState } = store;
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | null>(null);
  const [lastSyncMessage, setLastSyncMessage] = useState<string>('');

  const currentUniverse = useMemo(
    () => universes.find((u) => u.id === currentUniverseId),
    [universes, currentUniverseId]
  );

  // İstatistikler
  const stats = useMemo(() => ({
    universes: universes.length,
    entities: entities.length,
    connections: connections.length,
    myths: myths.length,
    timeline: timeline.length,
    notes: notes.length,
  }), [universes, entities, connections, myths, timeline, notes]);

  const handleLogout = async () => {
    try {
      if (!isGuest) await signOut();
    } finally {
      logout();
    }
  };

  const handlePull = async () => {
    if (isGuest) { Alert.alert('Uyarı', 'Misafir hesapla bulut senkronizasyonu yapılamaz.'); return; }
    
    Alert.alert(
      'Buluttan Çek',
      'Buluttaki veriler yerel verilerin üzerine yazılacak. Devam etmek istiyor musun?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Devam Et', onPress: async () => {
          setSyncing(true);
          try {
            const data = await fetchStateFromCloud();
            if (data) {
              replaceState(data);
              setLastSyncTime(new Date().toLocaleTimeString('tr-TR'));
              setLastSyncStatus('success');
              setLastSyncMessage(`${data.entities?.length || 0} varlık, ${data.notes?.length || 0} not çekildi`);
              Alert.alert('Başarılı ✓', 'Veriler buluttan çekildi.');
            } else {
              setLastSyncStatus('error');
              setLastSyncMessage('Bulutta veri bulunamadı');
              Alert.alert('Bilgi', 'Bulutta henüz kayıtlı veri yok.');
            }
          } catch (err: any) {
            setLastSyncTime(new Date().toLocaleTimeString('tr-TR'));
            setLastSyncStatus('error');
            setLastSyncMessage(err.message || 'Bilinmeyen hata');
            Alert.alert('Hata', err.message || 'Buluttan veri çekilemedi.');
          } finally { setSyncing(false); }
        }},
      ]
    );
  };

  const handlePush = async () => {
    if (isGuest) { Alert.alert('Uyarı', 'Misafir hesapla bulut senkronizasyonu yapılamaz.'); return; }
    setSyncing(true);
    try {
      const payload = { universes, entities, connections, myths, timeline, regions, languages, notes };
      await syncStateToCloud(payload);
      setLastSyncTime(new Date().toLocaleTimeString('tr-TR'));
      setLastSyncStatus('success');
      setLastSyncMessage(`${entities.length} varlık, ${notes.length} not gönderildi`);
      Alert.alert('Başarılı ✓', 'Veriler buluta kaydedildi.');
    } catch (err: any) {
      setLastSyncTime(new Date().toLocaleTimeString('tr-TR'));
      setLastSyncStatus('error');
      setLastSyncMessage(err.message || 'Bilinmeyen hata');
      Alert.alert('Hata', err.message || 'Buluta kayıt başarısız.');
    } finally { setSyncing(false); }
  };

  return (
    <View className="flex-1 bg-mythos-bg pt-14 px-6">
      <Text className="text-mythos-text text-3xl font-bold mb-8">Ayarlar</Text>

      {/* Profil */}
      <View className="bg-mythos-panel rounded-2xl border border-mythos-border overflow-hidden mb-6">
        <View className="p-4 flex-row items-center border-b border-mythos-border">
          <View className="w-12 h-12 bg-mythos-accent/20 rounded-full items-center justify-center mr-4">
            <User color="#C6A052" size={24} />
          </View>
          <View>
            <Text className="text-mythos-text font-bold text-lg">Profil</Text>
            <Text className="text-mythos-muted text-sm">{isGuest ? 'Misafir Kullanıcı' : userEmail}</Text>
          </View>
        </View>

        {currentUniverse && (
          <View className="p-4 flex-row items-center border-b border-mythos-border">
            <Globe color="#C6A052" size={20} />
            <View className="ml-3 flex-1">
              <Text className="text-mythos-text font-medium">{currentUniverse.name}</Text>
              <Text className="text-mythos-muted text-xs">Aktif Evren</Text>
            </View>
          </View>
        )}

        {/* Veri İstatistikleri */}
        <View className="p-4 border-b border-mythos-border">
          <Text className="text-mythos-muted text-[10px] uppercase tracking-[2px] mb-2 font-bold">Yerel Veri Özeti</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-black/20 rounded-lg px-2.5 py-1.5">
              <Text className="text-white/60 text-[10px]">Evren</Text>
              <Text className="text-white font-bold text-sm">{stats.universes}</Text>
            </View>
            <View className="bg-black/20 rounded-lg px-2.5 py-1.5">
              <Text className="text-white/60 text-[10px]">Varlık</Text>
              <Text className="text-white font-bold text-sm">{stats.entities}</Text>
            </View>
            <View className="bg-black/20 rounded-lg px-2.5 py-1.5">
              <Text className="text-white/60 text-[10px]">Bağlantı</Text>
              <Text className="text-white font-bold text-sm">{stats.connections}</Text>
            </View>
            <View className="bg-black/20 rounded-lg px-2.5 py-1.5">
              <Text className="text-white/60 text-[10px]">Efsane</Text>
              <Text className="text-white font-bold text-sm">{stats.myths}</Text>
            </View>
            <View className="bg-black/20 rounded-lg px-2.5 py-1.5">
              <Text className="text-white/60 text-[10px]">Olay</Text>
              <Text className="text-white font-bold text-sm">{stats.timeline}</Text>
            </View>
            <View className="bg-black/20 rounded-lg px-2.5 py-1.5">
              <Text className="text-white/60 text-[10px]">Not</Text>
              <Text className="text-white font-bold text-sm">{stats.notes}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="p-4 flex-row items-center" onPress={() => setCurrentUniverseId(null)}>
          <RefreshCw color="#C6A052" size={20} />
          <Text className="text-mythos-accent font-medium ml-3">Evren Değiştir</Text>
        </TouchableOpacity>
      </View>

      {/* Cloud Sync */}
      {!isGuest && (
        <View className="bg-mythos-panel rounded-2xl border border-mythos-border overflow-hidden mb-6">
          <View className="p-4 border-b border-mythos-border">
            <View className="flex-row items-center mb-1">
              <Cloud color="#C6A052" size={20} />
              <Text className="text-mythos-text font-bold text-lg ml-2">Bulut Senkronizasyonu</Text>
            </View>
            <Text className="text-mythos-muted text-xs">Web ile veri paylaşımı</Text>
          </View>

          {/* Son Sync Durumu */}
          {lastSyncTime && (
            <View className="p-4 border-b border-mythos-border flex-row items-center">
              {lastSyncStatus === 'success' ? (
                <CheckCircle color="#22C55E" size={16} />
              ) : (
                <AlertCircle color="#EF4444" size={16} />
              )}
              <View className="ml-3 flex-1">
                <View className="flex-row items-center gap-2">
                  <Clock color="#8A8A8E" size={12} />
                  <Text className="text-mythos-muted text-xs">{lastSyncTime}</Text>
                </View>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: lastSyncStatus === 'success' ? '#22C55E' : '#EF4444' }}
                >
                  {lastSyncMessage}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            className="p-4 flex-row items-center border-b border-mythos-border"
            onPress={handlePull}
            disabled={syncing}
          >
            {syncing ? <ActivityIndicator size="small" color="#C6A052" /> : <CloudDownload color="#22C55E" size={20} />}
            <View className="ml-3">
              <Text className="text-mythos-text font-medium">Buluttan Çek</Text>
              <Text className="text-mythos-muted text-[10px]">Buluttaki verileri yerel depolamaya indir</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 flex-row items-center"
            onPress={handlePush}
            disabled={syncing}
          >
            {syncing ? <ActivityIndicator size="small" color="#C6A052" /> : <CloudUpload color="#3B82F6" size={20} />}
            <View className="ml-3">
              <Text className="text-mythos-text font-medium">Buluta Gönder</Text>
              <Text className="text-mythos-muted text-[10px]">Yerel verileri buluta yükle</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Çıkış */}
      <View className="bg-mythos-panel rounded-2xl border border-mythos-border overflow-hidden">
        <TouchableOpacity className="p-4 flex-row items-center" onPress={handleLogout}>
          <LogOut color="#EF4444" size={20} />
          <Text className="text-red-500 font-medium ml-3">Oturumu Kapat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
