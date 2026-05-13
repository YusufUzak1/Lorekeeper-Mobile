import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible, title, message, confirmLabel = 'Onayla', cancelLabel = 'İptal',
  destructive = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/70 justify-center items-center px-8">
        <View className="bg-[#0e0e10] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden">
          {/* Icon */}
          <View className="items-center pt-6 pb-2">
            <View className={`w-14 h-14 rounded-full items-center justify-center ${destructive ? 'bg-red-500/15' : 'bg-mythos-accent/15'}`}>
              <AlertTriangle color={destructive ? '#EF4444' : '#C6A052'} size={28} />
            </View>
          </View>

          {/* Content */}
          <View className="px-6 pb-4 items-center">
            <Text className="text-white font-bold text-lg text-center mb-2">{title}</Text>
            <Text className="text-white/50 text-sm text-center leading-5">{message}</Text>
          </View>

          {/* Actions */}
          <View className="flex-row border-t border-white/10">
            <TouchableOpacity onPress={onCancel} className="flex-1 py-4 items-center border-r border-white/10">
              <Text className="text-white/50 font-semibold">{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} className="flex-1 py-4 items-center">
              <Text className={`font-bold ${destructive ? 'text-red-500' : 'text-mythos-accent'}`}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
