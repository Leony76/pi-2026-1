import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  visible : boolean; 
  message : string; 
  onClose : () => void
}

const Toast = ({ 
  visible, 
  message, 
  onClose 
}:Props): React.JSX.Element | null => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={{ opacity }}
      className="absolute top-14 left-4 right-4 z-[999]"
    >
      <View className="bg-white flex-row items-center p-4 rounded-xl shadow-2xl border-l-4 border-medroom-primary">
        <Feather name="info" size={20} color="#1AAFB4" />
        
        <Text className="flex-1 text-medroom-primary font-nunito-bold ml-3">
          {message || 'Operação concluída'}
        </Text>

        <TouchableOpacity onPress={handleClose} className="ml-2">
          <Feather 
            name="x" 
            size={18} 
            color="#9ca3af" 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default Toast;