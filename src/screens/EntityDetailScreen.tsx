import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Users, Map, Zap, Link, Trash2, Edit3 } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';

const TYPE_ICONS = { character: Users, place: Map, event: Zap };
const TYPE_LABELS: Record<string, string> = { character: 'Karakter', place: 'Mekan', event: 'Olay' };

export function EntityDetailScreen({ route, navigation }: any) {
  const entityId = route?.params?.entityId as string;
  const { getEntityById, getConnectionsForEntity, entities, deleteEntity } = useUniverseStore();

  const entity = getEntityById(entityId);
  const connections = getConnectionsForEntity(entityId);

  const connectedEntities = useMemo(() => {
    return connections.map((c) => {
      const otherId = c.sourceId === entityId ? c.targetId : c.sourceId;
      const other = entities.find((e) => e.id === otherId);
      return { connection: c, entity: other };
    }).filter((c) => c.entity);
  }, [connections, entities, entityId]);

  if (!entity) {
    return (
      <View className="flex-1 bg-mythos-bg justify-center items-center px-6">
        <Text className="text-mythos-muted text-lg">Varlık bulunamadı.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-mythos-accent">Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Icon = TYPE_ICONS[entity.type] || Users;
  const relColor: Record<string, string> = { friend: '#22C55E', enemy: '#EF4444', neutral: '#8A8A8E' };
  const relLabel: Record<string, string> = { friend: 'Müttefik', enemy: 'Düşman', neutral: 'Nötr' };

  const handleDelete = () => {
    Alert.alert('Sil', `"${entity.name}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => { deleteEntity(entityId); navigation.goBack(); } },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-mythos-bg pt-14 px-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <ArrowLeft color="#8A8A8E" size={20} />
          <Text className="text-mythos-muted ml-1">Geri</Text>
        </TouchableOpacity>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Trash2 color="#EF4444" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Entity Info */}
      <View className="bg-mythos-panel rounded-2xl border border-mythos-border p-6 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-14 h-14 bg-mythos-accent/15 rounded-full items-center justify-center mr-4">
            <Icon color="#C6A052" size={28} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-2xl">{entity.name}</Text>
            <Text className="text-mythos-accent text-sm mt-0.5">{TYPE_LABELS[entity.type]}</Text>
          </View>
        </View>

        {entity.era ? (
          <View className="bg-black/20 rounded-lg px-3 py-2 mb-3">
            <Text className="text-mythos-muted text-xs">Çağ</Text>
            <Text className="text-white text-sm">{entity.era}</Text>
          </View>
        ) : null}

        {entity.status ? (
          <View className="bg-black/20 rounded-lg px-3 py-2 mb-3">
            <Text className="text-mythos-muted text-xs">Durum</Text>
            <Text className="text-white text-sm">{entity.status}</Text>
          </View>
        ) : null}

        {entity.description ? (
          <View className="mt-2">
            <Text className="text-mythos-muted text-xs mb-1">Açıklama</Text>
            <Text className="text-mythos-text/80 leading-5">{entity.description}</Text>
          </View>
        ) : null}

        {entity.domains && entity.domains.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-4">
            {entity.domains.map((d, i) => (
              <View key={i} className="bg-mythos-accent/10 border border-mythos-accent/30 rounded-full px-3 py-1">
                <Text className="text-mythos-accent text-xs">{d}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Connections */}
      <Text className="text-mythos-text font-bold text-lg mb-3">
        <Link color="#C6A052" size={16} /> Bağlantılar ({connectedEntities.length})
      </Text>

      {connectedEntities.length > 0 ? (
        <View className="mb-10">
          {connectedEntities.map(({ connection, entity: other }) => {
            if (!other) return null;
            const OtherIcon = TYPE_ICONS[other.type] || Users;
            return (
              <TouchableOpacity
                key={connection.id}
                className="bg-mythos-panel rounded-xl border border-mythos-border p-4 mb-2 flex-row items-center"
                onPress={() => navigation.push('EntityDetail', { entityId: other.id })}
              >
                <View className="w-8 h-8 bg-mythos-accent/10 rounded-full items-center justify-center mr-3">
                  <OtherIcon color="#C6A052" size={14} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium">{other.name}</Text>
                  <Text className="text-mythos-muted text-xs">{TYPE_LABELS[other.type]}</Text>
                </View>
                <View className="px-2 py-1 rounded-full" style={{ backgroundColor: relColor[connection.relation] + '20' }}>
                  <Text style={{ color: relColor[connection.relation], fontSize: 11, fontWeight: '600' }}>
                    {relLabel[connection.relation] || connection.relation}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View className="py-6 items-center mb-10">
          <Text className="text-mythos-muted text-sm">Henüz bağlantı yok.</Text>
        </View>
      )}
    </ScrollView>
  );
}
