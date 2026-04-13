import React from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Button } from '../button';

type ErrorModalProps = {
  visible    : boolean;
  title?     : string;
  message    : string;
  onClose    : () => void;
  isLoading? : boolean;
};

export function ErrorModal({
  visible,
  title = 'Erro',
  message,
  onClose,
  isLoading = false,
}: ErrorModalProps): React.JSX.Element {
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
        className="bg-white rounded-2xl px-6 py-8 w-full max-w-sm"
        >
          <View className="items-center mb-4">
            <View className="bg-red-100 rounded-full p-3 w-16 h-16 items-center justify-center">
              <Text className="text-3xl font-bold text-red-600">
                !
              </Text>
            </View>
          </View>

          <Text className="text-xl font-nunito-bold text-medroom-primary text-center mb-2">
            {title}
          </Text>

          <Text className="text-sm font-nunito text-medroom-secondary text-center mb-6 leading-5">
            {message}
          </Text>

          <Button.Default
            label='Entendi'
            filled
            onTouch={onClose}
            disable={isLoading}
            loading={false}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
