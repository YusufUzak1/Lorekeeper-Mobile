import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUniverseStore } from '../store/useUniverseStore';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Users, Map, Clock, ArrowLeft, Scroll, Sparkles, ChevronRight, Globe, Compass, Type } from 'lucide-react-native';
import { StatCard } from '../components/StatCard';
import { fetchStateFromCloud } from '../services/syncService';

export function MainScreen() {
  const navigation = useNavigation<any>();
  const { userEmail, isGuest } = useAuthStore();
  const {
    currentUniverseId, universes, setCurrentUniverseId, replaceState,
    getEntitiesForCurrentUniverse, getNotesForCurrentUniverse,
    getMythsForCurrentUniverse, getTimelineForCurrentUniverse,
    getRegionsForCurrentUniverse, getLanguagesForCurrentUniverse,
  } = useUniverseStore();

  const [refreshing, setRefreshing] = useState(false);

  const currentUniverse = useMemo(() => universes.find((u) => u.id === currentUniverseId), [universes, currentUniverseId]);
  const entities = getEntitiesForCurrentUniverse();
  const notes = getNotesForCurrentUniverse();
  const myths = getMythsForCurrentUniverse();
  const timeline = getTimelineForCurrentUniverse();
  const regions = getRegionsForCurrentUniverse();
  const languages = getLanguagesForCurrentUniverse();
  const characters = entities.filter((e) => e.type === 'character');
  const places = entities.filter((e) => e.type === 'place');

  const recentItems = useMemo(() => {
    const items = [
      ...entities.slice(-3).reverse().map((e) => ({ id: e.id, title: e.name, sub: e.type === 'character' ? 'Karakter' : e.type === 'place' ? 'Mekan' : 'Olay' })),
      ...notes.slice(-3).reverse().map((n) => ({ id: n.id, title: n.title, sub: 'Not' })),
    ];
    return items.slice(0, 5);
  }, [entities, notes]);

  const modules = [
    { key: 'myth', label: 'Efsaneler', icon: Scroll, count: myths.length, screen: 'Mythology' },
    { key: 'time', label: 'Zaman Çizelgesi', icon: Clock, count: timeline.length, screen: 'Timeline' },
    { key: 'maps', label: 'Harita', icon: Compass, count: regions.length, screen: 'Maps' },
    { key: 'lang', label: 'Diller', icon: Type, count: languages.length, screen: 'Languages' },
    { key: 'lore', label: 'Lore AI', icon: Sparkles, count: null, screen: 'Lore' },
    { key: 'cosmos', label: 'Kosmos Haritası', icon: Globe, count: entities.length, screen: 'Cosmos' },
  ];

  const onRefresh = useCallback(async () => {
    if (isGuest) return;
    setRefreshing(true);
    try {
      const data = await fetchStateFromCloud();
      if (data) replaceState(data);
    } catch (err: any) {
      Alert.alert('Sync Hatası', err.message || 'Buluttan veri çekilemedi.');
    } finally {
      setRefreshing(false);
    }
  }, [isGuest, replaceState]);

  return (
    <ScrollView
      className="flex-1 bg-mythos-bg pt-14 px-6"
      refreshControl={
        !isGuest ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C6A052"
            colors={['#C6A052']}
            progressBackgroundColor="#1a1a1e"
          />
        ) : undefined
      }
    >
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity onPress={() => setCurrentUniverseId(null)} className="flex-row items-center">
          <ArrowLeft color="#8A8A8E" size={20} />
          <Text className="text-mythos-muted text-sm ml-1">Evrenlere Dön</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-mythos-accent text-2xl font-bold mb-1">{currentUniverse?.name || 'Evren'}</Text>
      <Text className="text-mythos-text/60 text-sm mb-6">Hoş geldin, {isGuest ? 'Misafir' : userEmail?.split('@')[0]}</Text>

      {currentUniverse?.summary ? (
        <View className="bg-mythos-panel/50 border border-mythos-border rounded-xl p-4 mb-6">
          <Text className="text-mythos-text/80 text-sm leading-5">{currentUniverse.summary}</Text>
        </View>
      ) : null}

      {/* Pull hint for non-guest users */}
      {!isGuest && (
        <View className="bg-mythos-accent/5 border border-mythos-accent/10 rounded-lg px-3 py-2 mb-4">
          <Text className="text-mythos-accent/60 text-[10px] text-center">↓ Aşağı çekerek buluttan senkronize et</Text>
        </View>
      )}

      {/* Stats */}
      <Text className="text-mythos-text font-bold text-lg mb-3">Genel Bakış</Text>
      <View className="flex-row justify-between mb-6">
        <StatCard title="Karakterler" count={characters.length} icon={Users} />
        <StatCard title="Mekanlar" count={places.length} icon={Map} />
        <StatCard title="Notlar" count={notes.length} icon={BookOpen} />
      </View>

      {/* Module Links */}
      <Text className="text-mythos-text font-bold text-lg mb-3">Modüller</Text>
      <View className="mb-6">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <TouchableOpacity
              key={m.key}
              className="bg-mythos-panel rounded-xl border border-mythos-border p-4 mb-2 flex-row items-center active:opacity-80"
              onPress={() => navigation.navigate(m.screen)}
            >
              <View className="w-10 h-10 bg-mythos-accent/10 rounded-full items-center justify-center mr-3">
                <Icon color="#C6A052" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{m.label}</Text>
                {m.count !== null && <Text className="text-mythos-muted text-xs">{m.count} öğe</Text>}
              </View>
              <ChevronRight color="#8A8A8E" size={18} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Recent */}
      <Text className="text-mythos-text font-bold text-lg mb-3">Son Eklenenler</Text>
      {recentItems.length > 0 ? (
        <View className="mb-10">
          {recentItems.map((item) => (
            <View key={item.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex-row items-center mb-2">
              <View className="w-2 h-2 rounded-full bg-mythos-accent mr-3" />
              <View><Text className="text-white font-medium">{item.title}</Text><Text className="text-mythos-muted text-xs">{item.sub}</Text></View>
            </View>
          ))}
        </View>
      ) : (
        <View className="py-8 items-center mb-10"><Text className="text-mythos-muted text-sm">Henüz veri yok.</Text></View>
      )}
    </ScrollView>
  );
}
