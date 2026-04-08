import React from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';

type ErrorModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  isLoading?: boolean;
};

export function ErrorModal({
  visible,
  title = 'Erro',
  message,
  onClose,
  isLoading = false,
}: ErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/50 justify-center items-center px-4"
        android_ripple={{ radius: 0, color: 'transparent' }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl px-6 py-8 w-full max-w-sm shadow-lg"
        >
          {/* Error Icon */}
          <View className="items-center mb-4">
            <View className="bg-red-100 rounded-full p-3 w-16 h-16 items-center justify-center">
              <Text className="text-3xl font-bold text-red-600">!</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-nunito-bold text-slate-900 text-center mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-sm font-nunito text-slate-600 text-center mb-6 leading-5">
            {message}
          </Text>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            disabled={isLoading}
            className="bg-medroom-primary rounded-lg py-3 items-center"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-nunito-bold text-white text-base">
                Entendi
              </Text>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
