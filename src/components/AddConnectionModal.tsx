/* ─────────────────────────────────────────────
 * AddConnectionModal — Varlıklar Arası Bağlantı Ekleme
 * EntityDetailScreen üzerinden açılır.
 * Kaynak varlık sabit, hedef varlık + ilişki tipi seçilir.
 * ───────────────────────────────────────────── */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { X, Link, Users, Map, Zap, Search } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import type { RelationType } from '../types';

const TYPE_ICONS: Record<string, any> = { character: Users, place: Map, event: Zap };
const TYPE_LABELS: Record<string, string> = { character: 'Karakter', place: 'Mekan', event: 'Olay' };

const RELATION_OPTIONS: { value: RelationType; label: string; color: string; emoji: string }[] = [
  { value: 'friend', label: 'Müttefik', color: '#22C55E', emoji: '🤝' },
  { value: 'enemy', label: 'Düşman', color: '#EF4444', emoji: '⚔️' },
  { value: 'neutral', label: 'Nötr', color: '#8A8A8E', emoji: '🔗' },
];

interface AddConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  sourceEntityId: string;
}

export function AddConnectionModal({ visible, onClose, sourceEntityId }: AddConnectionModalProps) {
  const { getEntitiesForCurrentUniverse, getConnectionsForEntity, addConnection } = useUniverseStore();
  const allEntities = getEntitiesForCurrentUniverse();
  const existingConnections = getConnectionsForEntity(sourceEntityId);

  const [search, setSearch] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [relation, setRelation] = useState<RelationType>('neutral');

  // Zaten bağlı olan ve kendisi olan entity'leri filtrele
  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    ids.add(sourceEntityId);
    existingConnections.forEach((c) => {
      ids.add(c.sourceId);
      ids.add(c.targetId);
    });
    return ids;
  }, [existingConnections, sourceEntityId]);

  const availableEntities = useMemo(() => {
    let list = allEntities.filter((e) => !connectedIds.has(e.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [allEntities, connectedIds, search]);

  const handleAdd = () => {
    if (!selectedTargetId) return;
    addConnection(sourceEntityId, selectedTargetId, relation);
    setSelectedTargetId(null);
    setRelation('neutral');
    setSearch('');
    onClose();
  };

  const reset = () => {
    setSelectedTargetId(null);
    setRelation('neutral');
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={reset}
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={reset}
        className="flex-1 bg-black/70"
      />

      {/* Modal Content */}
      <View className="bg-[#0e0e10] border-t border-mythos-accent/20 rounded-t-3xl max-h-[80%]">
        {/* Drag indicator */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 bg-white/20 rounded-full" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
          <View className="flex-row items-center gap-2">
            <Link color="#C6A052" size={20} />
            <View>
              <Text className="text-mythos-accent font-bold text-lg tracking-wider uppercase">
                Bağlantı Ekle
              </Text>
              <Text className="text-white/30 text-xs mt-0.5">
                Hedef varlık ve ilişki tipini seç
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={reset} className="p-2 bg-white/5 rounded-lg">
            <X color="#8A8A8E" size={18} />
          </TouchableOpacity>
        </View>

        {/* Relation Type Selector */}
        <View className="px-6 mb-4">
          <Text className="text-white/40 text-[10px] uppercase tracking-[3px] mb-2 font-bold">
            İlişki Tipi
          </Text>
          <View className="flex-row gap-2">
            {RELATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setRelation(opt.value)}
                className={`flex-1 py-3 items-center rounded-xl border ${
                  relation === opt.value
                    ? 'border-opacity-50'
                    : 'bg-white/[0.03] border-white/10'
                }`}
                style={
                  relation === opt.value
                    ? { backgroundColor: opt.color + '20', borderColor: opt.color + '80' }
                    : undefined
                }
              >
                <Text className="text-base mb-1">{opt.emoji}</Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: relation === opt.value ? opt.color : '#ffffff60' }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search */}
        <View className="px-6 mb-3">
          <View className="bg-white/[0.03] border border-white/10 rounded-xl flex-row items-center px-3">
            <Search color="#8A8A8E" size={16} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Varlık ara..."
              className="flex-1 py-3 px-2 text-white text-sm"
              placeholderTextColor="#ffffff25"
            />
          </View>
        </View>

        {/* Entity List */}
        <FlatList
          data={availableEntities}
          keyExtractor={(item) => item.id}
          className="px-6"
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const Icon = TYPE_ICONS[item.type] || Users;
            const isSelected = selectedTargetId === item.id;
            return (
              <TouchableOpacity
                className={`p-4 rounded-xl border mb-2 flex-row items-center ${
                  isSelected
                    ? 'bg-mythos-accent/15 border-mythos-accent/40'
                    : 'bg-white/[0.02] border-white/10'
                }`}
                onPress={() => setSelectedTargetId(isSelected ? null : item.id)}
              >
                <View className="w-9 h-9 bg-mythos-accent/10 rounded-full items-center justify-center mr-3">
                  <Icon color="#C6A052" size={16} />
                </View>
                <View className="flex-1">
                  <Text className={`font-bold ${isSelected ? 'text-mythos-accent' : 'text-white'}`}>
                    {item.name}
                  </Text>
                  <Text className="text-mythos-muted text-xs">
                    {TYPE_LABELS[item.type]}{item.era ? ` · ${item.era}` : ''}
                  </Text>
                </View>
                {isSelected && (
                  <View className="w-6 h-6 bg-mythos-accent rounded-full items-center justify-center">
                    <Text className="text-black text-xs font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="py-8 items-center">
              <Text className="text-mythos-muted text-sm">
                {search ? 'Eşleşen varlık bulunamadı.' : 'Bağlanabilecek başka varlık yok.'}
              </Text>
            </View>
          }
        />

        {/* Add Button */}
        {selectedTargetId && (
          <View className="px-6 pb-8 pt-2">
            <TouchableOpacity
              onPress={handleAdd}
              className="bg-mythos-accent/90 py-3.5 rounded-xl items-center flex-row justify-center gap-2"
            >
              <Link color="#000" size={16} />
              <Text className="text-black text-sm uppercase tracking-wider font-bold">
                Bağlantıyı Oluştur
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
