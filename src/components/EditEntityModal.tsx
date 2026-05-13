/* ─────────────────────────────────────────────
 * EditEntityModal — Varlık Düzenleme Modal'ı
 * EntityDetailScreen üzerinden açılır.
 * Web'deki EditEntityModal ile birebir uyumlu alanlar.
 * ───────────────────────────────────────────── */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import type { Entity } from '../types';

const STATUS_OPTIONS = [
  { value: 'Aktif', label: 'Aktif / Yaşıyor' },
  { value: 'Ölü', label: 'Ölü' },
  { value: 'Yıkık', label: 'Yıkık' },
  { value: 'Yok', label: 'Yok Edilmiş' },
  { value: 'Terk', label: 'Terk Edilmiş' },
  { value: 'Bitti', label: 'Bitti / Geçmiş' },
  { value: 'Soluk', label: 'Soluk / Efsanevi' },
  { value: 'Bilinmiyor', label: 'Bilinmiyor' },
];

interface EditEntityModalProps {
  visible: boolean;
  onClose: () => void;
  entity: Entity;
}

export function EditEntityModal({ visible, onClose, entity }: EditEntityModalProps) {
  const { updateEntity } = useUniverseStore();

  const [name, setName] = useState(entity.name);
  const [era, setEra] = useState(entity.era);
  const [status, setStatus] = useState(entity.status);
  const [tagsInput, setTagsInput] = useState(entity.domains?.join(', ') || '');
  const [description, setDescription] = useState(entity.description || '');

  // Entity değişirse formu güncelle
  useEffect(() => {
    setName(entity.name);
    setEra(entity.era);
    setStatus(entity.status);
    setTagsInput(entity.domains?.join(', ') || '');
    setDescription(entity.description || '');
  }, [entity]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const domains = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateEntity(entity.id, {
      name: name.trim(),
      era: era.trim() || 'Bilinmiyor',
      status,
      domains,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1 bg-black/70"
        />

        {/* Modal Content */}
        <View className="bg-[#0e0e10] border-t border-mythos-accent/20 rounded-t-3xl max-h-[85%]">
          {/* Drag indicator */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
            <View>
              <Text className="text-mythos-accent font-bold text-lg tracking-wider uppercase">
                Varlığı Düzenle
              </Text>
              <Text className="text-white/30 text-xs mt-0.5">
                {entity.name} bilgilerini güncelle
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-white/5 rounded-lg">
              <X color="#8A8A8E" size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6 pb-8" showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View className="mb-4">
              <Text className="text-white/40 text-[10px] uppercase tracking-[3px] mb-1.5 font-bold">
                İsim / Başlık *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                placeholderTextColor="#ffffff25"
              />
            </View>

            {/* Era + Status grid */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-white/40 text-[10px] uppercase tracking-[3px] mb-1.5 font-bold">
                  Çağ / Dönem
                </Text>
                <TextInput
                  value={era}
                  onChangeText={setEra}
                  placeholder="Birinci Çağ"
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  placeholderTextColor="#ffffff25"
                />
              </View>
            </View>

            {/* Status Selector */}
            <View className="mb-4">
              <Text className="text-white/40 text-[10px] uppercase tracking-[3px] mb-1.5 font-bold">
                Durum
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setStatus(opt.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      status === opt.value
                        ? 'bg-mythos-accent/20 border-mythos-accent/50'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        status === opt.value ? 'text-mythos-accent font-bold' : 'text-white/60'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags */}
            <View className="mb-4">
              <Text className="text-white/40 text-[10px] uppercase tracking-[3px] mb-1.5 font-bold">
                Etiketler / Alanlar
              </Text>
              <TextInput
                value={tagsInput}
                onChangeText={setTagsInput}
                placeholder="savaşçı, kral, kudretli (virgülle ayır)"
                className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                placeholderTextColor="#ffffff25"
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-white/40 text-[10px] uppercase tracking-[3px] mb-1.5 font-bold">
                Detaylı Açıklama
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Bu varlık hakkında bilinmesi gerekenleri anlatın..."
                multiline
                textAlignVertical="top"
                numberOfLines={5}
                className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm min-h-[120px]"
                placeholderTextColor="#ffffff25"
              />
            </View>

            {/* Actions */}
            <View className="flex-row gap-3 pb-8">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3.5 items-center rounded-xl border border-white/10"
              >
                <Text className="text-white/40 text-xs uppercase tracking-wider font-semibold">
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!name.trim()}
                className={`flex-1 py-3.5 items-center rounded-xl flex-row justify-center gap-2 ${
                  name.trim()
                    ? 'bg-mythos-accent/90'
                    : 'bg-mythos-accent/30'
                }`}
              >
                <Save color="#000" size={14} />
                <Text className="text-black text-xs uppercase tracking-wider font-bold">
                  Kaydet
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
