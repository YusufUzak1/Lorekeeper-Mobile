import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useUniverseStore } from '../store/useUniverseStore';
import { signOut } from 'aws-amplify/auth';
import { LogOut, User, Cloud, Globe, RefreshCw } from 'lucide-react-native';
import { fetchStateFromCloud, syncStateToCloud } from '../services/syncService';

export function SettingsScreen() {
  const { logout, userEmail, isGuest } = useAuthStore();
  const store = useUniverseStore();
  const { universes, currentUniverseId, setCurrentUniverseId, replaceState } = store;
  const [syncing, setSyncing] = useState(false);

  const currentUniverse = useMemo(
    () => universes.find((u) => u.id === currentUniverseId),
    [universes, currentUniverseId]
  );

  const handleLogout = async () => {
    try {
      if (!isGuest) await signOut();
    } finally {
      logout();
    }
  };

  const handlePull = async () => {
    if (isGuest) { Alert.alert('Uyarı', 'Misafir hesapla bulut senkronizasyonu yapılamaz.'); return; }
    setSyncing(true);
    try {
      const data = await fetchStateFromCloud();
      if (data) {
        replaceState(data);
        Alert.alert('Başarılı', 'Veriler buluttan çekildi.');
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Buluttan veri çekilemedi.');
    } finally { setSyncing(false); }
  };

  const handlePush = async () => {
    if (isGuest) { Alert.alert('Uyarı', 'Misafir hesapla bulut senkronizasyonu yapılamaz.'); return; }
    setSyncing(true);
    try {
      const { universes, entities, connections, myths, timeline, regions, languages, notes } = store;
      await syncStateToCloud({ universes, entities, connections, myths, timeline, regions, languages, notes });
      Alert.alert('Başarılı', 'Veriler buluta kaydedildi.');
    } catch (err: any) {
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
            <View className="ml-3">
              <Text className="text-mythos-text font-medium">{currentUniverse.name}</Text>
              <Text className="text-mythos-muted text-xs">Aktif Evren</Text>
            </View>
          </View>
        )}

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

          <TouchableOpacity className="p-4 flex-row items-center border-b border-mythos-border" onPress={handlePull} disabled={syncing}>
            {syncing ? <ActivityIndicator size="small" color="#C6A052" /> : <Cloud color="#8A8A8E" size={18} />}
            <Text className="text-mythos-text font-medium ml-3">Buluttan Çek</Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4 flex-row items-center" onPress={handlePush} disabled={syncing}>
            {syncing ? <ActivityIndicator size="small" color="#C6A052" /> : <Cloud color="#8A8A8E" size={18} />}
            <Text className="text-mythos-text font-medium ml-3">Buluta Gönder</Text>
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
